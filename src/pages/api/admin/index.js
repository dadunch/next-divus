// src/pages/api/admin/index.js
import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import bcrypt from 'bcryptjs';
import { createLog } from '../../../lib/logger';
import { limiter } from '../../../lib/rate-limit'; // Pastikan utility ini sudah dibuat

export default async function handler(req, res) {
  const { method } = req;

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Memberikan limit sedikit lebih longgar untuk GET (misal 20) 
    // tapi ketat untuk POST (misal 5)
    const limit = method === 'GET' ? 20 : 5;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Terlalu banyak permintaan. Silakan tunggu satu menit sebelum mencoba kembali.' 
    });
  }

  try {
    // === GET: Ambil Daftar Admin ===
    if (method === 'GET') {
      const employees = await prisma.employee.findMany({
        include: {
          users: true,
          roles: true,
        },
        orderBy: {
          id: 'desc',
        },
      });

      const formattedData = employees.map((emp) => {
        const roleNames = emp.roles.map((r) => r.role).join(', ');
        
        return {
          id: emp.users.id,
          employee_id: emp.id,
          username: emp.users.username,
          role: roleNames.length > 0 ? roleNames : '-', 
          roles: emp.roles.map(r => ({ id: r.id, role: r.role })),
          role_ids: emp.roles.map(r => r.id),
        };
      });

      return res.status(200).json(serialize(formattedData));
    }

    // === POST: Tambah Admin Baru ===
    if (method === 'POST') {
      const { username, password, role_ids, currentUserId } = req.body;

      // Validasi input
      if (!username || !password || !role_ids || !Array.isArray(role_ids) || role_ids.length === 0) {
        return res.status(400).json({ message: 'Mohon lengkapi data (Username, Password, dan minimal 1 Role)' });
      }

      // Cek duplikasi username
      const existingUser = await prisma.users.findFirst({
        where: { username },
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }

      // Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Transaksi Database
      const result = await prisma.$transaction(async (tx) => {
        // 1. Buat User
        const newUser = await tx.users.create({
          data: {
            username,
            password: hashedPassword,
          },
        });

        // 2. Buat Employee dengan Multi-Role
        await tx.employee.create({
          data: {
            users_id: newUser.id,
            roles: {
              connect: role_ids.map((id) => ({ id: BigInt(id) })),
            },
          },
        });

        // 3. Log Aktivitas
        await createLog(
            tx, 
            currentUserId ? BigInt(currentUserId) : BigInt(1), 
            "Tambah Admin", 
            `Menambahkan admin baru: ${username}`
        );

        return newUser;
      });

      return res.status(201).json(serialize(result));
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
    
  } catch (error) {
    console.error("API Admin Error:", error);
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
}