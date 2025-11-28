import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import bcrypt from 'bcryptjs';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
  const { method } = req;

  try {
    // === GET: Ambil Daftar Admin ===
    if (method === 'GET') {
      // Kita ambil data dari tabel Employee karena itu tabel pusat relasi
      const employees = await prisma.employee.findMany({
        include: {
          users: true, // Join ke tabel users
          role: true,  // Join ke tabel role
        },
        orderBy: {
          id: 'desc',
        },
      });

      // Mapping data agar formatnya sesuai dengan Frontend (flat object)
      const formattedData = employees.map((emp) => ({
        id: emp.users.id, // Kita gunakan ID User sebagai key utama
        employee_id: emp.id,
        username: emp.users.username,
        role: emp.role.role, // Ambil nama role (string)
        role_id: emp.role.id,
      }));

      return res.status(200).json(serialize(formattedData));
    }

    // === POST: Tambah Admin Baru ===
    if (method === 'POST') {
      const { username, password, role_id, currentUserId } = req.body;

      if (!username || !password || !role_id) {
        return res.status(400).json({ message: 'Mohon lengkapi data' });
      }

      // Cek apakah username sudah ada
      const existingUser = await prisma.users.findFirst({
        where: { username },
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }

      // Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Gunakan Transaksi: Create User -> Create Employee -> Log
      const result = await prisma.$transaction(async (tx) => {
        // 1. Buat User
        const newUser = await tx.users.create({
          data: {
            username,
            password: hashedPassword,
          },
        });

        // 2. Buat Employee (Hubungkan User ke Role)
        await tx.employee.create({
          data: {
            users_id: newUser.id,
            role_id: BigInt(role_id),
          },
        });

        // 3. Log Aktivitas
        await createLog(
            tx, 
            currentUserId, 
            "CREATE_ADMIN", 
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