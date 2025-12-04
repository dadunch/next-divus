import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import bcrypt from 'bcryptjs';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
  const { method } = req;

  try {
    // === GET: Ambil Daftar Admin ===
    if (method === 'GET') {
      const employees = await prisma.employee.findMany({
        include: {
          users: true, // Join ke tabel users
          roles: true, // UBAH: Join ke tabel 'roles' (jamak/many-to-many)
        },
        orderBy: {
          id: 'desc',
        },
      });

      // Mapping data agar formatnya sesuai dengan Frontend
      const formattedData = employees.map((emp) => {
        // Ambil nama-nama role dan gabungkan dengan koma untuk tampilan tabel
        const roleNames = emp.roles.map((r) => r.role).join(', ');
        
        return {
          id: emp.users.id,
          employee_id: emp.id,
          username: emp.users.username,
          
          // UBAH: Kirim string gabungan untuk tampilan tabel
          role: roleNames.length > 0 ? roleNames : '-', 
          
          // UBAH: Kirim array object asli untuk keperluan Edit Modal (agar tercentang otomatis)
          roles: emp.roles.map(r => ({ id: r.id, role: r.role })),
          
          // Opsional: Kirim array ID saja jika butuh
          role_ids: emp.roles.map(r => r.id),
        };
      });

      return res.status(200).json(serialize(formattedData));
    }

    // === POST: Tambah Admin Baru ===
    if (method === 'POST') {
      // UBAH: Terima 'role_ids' (array), bukan 'role_id'
      const { username, password, role_ids, currentUserId } = req.body;

      // Validasi array role_ids
      if (!username || !password || !role_ids || !Array.isArray(role_ids) || role_ids.length === 0) {
        return res.status(400).json({ message: 'Mohon lengkapi data (Username, Password, dan minimal 1 Role)' });
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

      // Gunakan Transaksi
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
            // UBAH: Gunakan 'connect' untuk menyambungkan banyak role sekaligus
            roles: {
              connect: role_ids.map((id) => ({ id: BigInt(id) })),
            },
          },
        });

        // 3. Log Aktivitas
        await createLog(
            tx, 
            currentUserId, 
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