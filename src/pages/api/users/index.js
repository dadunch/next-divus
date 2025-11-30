import prisma from '../../../lib/prisma';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
  // 1. GET: Ambil Semua User (Beserta Role-nya)
  if (req.method === 'GET') {
    try {
      const users = await prisma.users.findMany({
        orderBy: { created_at: 'desc' },
        include: {
          employee: {
            include: {
              role: true // Sertakan data Role agar tampil di tabel
            }
          }
        }
      });
      
      // Ratakan struktur data untuk frontend
      const formattedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.employee[0]?.role?.role || 'No Role',
        role_id: user.employee[0]?.role_id,
        created_at: user.created_at
      }));

      return res.status(200).json(formattedUsers);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 2. POST: Tambah User Baru (Pegawai/Admin)
  if (req.method === 'POST') {
    const { username, password, role_id, currentUserId } = req.body;

    // Validasi sederhana
    if (!username || !password || !role_id) {
      return res.status(400).json({ error: "Username, Password, dan Role wajib diisi" });
    }

    try {
      // Cek apakah username sudah ada
      const existingUser = await prisma.users.findFirst({
        where: { username: username }
      });

      if (existingUser) {
        return res.status(400).json({ error: "Username sudah digunakan!" });
      }

      // Gunakan Transaksi: Buat User -> Buat Employee -> Catat Log
      const result = await prisma.$transaction(async (tx) => {
        // A. Buat User
        const newUser = await tx.users.create({
          data: {
            username,
            password, // Catatan: Sebaiknya di-hash (bcrypt) di project nyata
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        // B. Hubungkan ke Employee (Assign Role)
        await tx.employee.create({
          data: {
            users_id: newUser.id,
            role_id: BigInt(role_id) // Pastikan role_id dikonversi ke BigInt
          }
        });

        // C. Catat Log (Jika ada currentUserId pengirim)
        if (currentUserId) {
          await createLog(tx, currentUserId, "Tambah User", `Menambahkan user baru: ${username}`);
        }

        return newUser;
      });

      return res.status(201).json({ message: "User berhasil dibuat", user: result });

    } catch (error) {
      console.error("Create User Error:", error);
      return res.status(500).json({ error: "Gagal membuat user: " + error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}