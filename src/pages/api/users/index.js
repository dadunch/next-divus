// src/pages/api/users/index.js

import prisma from '../../../lib/prisma';
import { createLog } from '../../../lib/logger';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

export default async function handler(req, res) {
  const { method } = req;


  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // GET: 20 kali per menit (Daftar user biasanya hanya diakses admin)
    // POST: 5 kali per menit (Mencegah spam pembuatan akun baru)
    const limit = method === 'GET' ? 20 : 5;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Terlalu banyak permintaan. Silakan tunggu 1 menit untuk melanjutkan.' 
    });
  }

  // 1. GET: Ambil Semua User (Beserta Role-nya)
  if (method === 'GET') {
    try {
      const users = await prisma.users.findMany({
        orderBy: { created_at: 'desc' },
        include: {
          employee: {
            include: {
              role: true 
            }
          }
        }
      });
      
      const formattedUsers = users.map(user => ({
        id: user.id.toString(), // Pastikan ID dikonversi ke string jika BigInt
        username: user.username,
        role: user.employee[0]?.role?.role || 'No Role',
        role_id: user.employee[0]?.role_id?.toString(),
        created_at: user.created_at
      }));

      return res.status(200).json(formattedUsers);
    } catch (error) {
      console.error("Fetch Users Error:", error);
      return res.status(500).json({ error: "Gagal mengambil daftar user" });
    }
  }

  // 2. POST: Tambah User Baru (Pegawai/Admin)
  if (method === 'POST') {
    const { username, password, role_id, currentUserId } = req.body;

    if (!username || !password || !role_id) {
      return res.status(400).json({ error: "Username, Password, dan Role wajib diisi" });
    }

    try {
      const existingUser = await prisma.users.findFirst({
        where: { username: username }
      });

      if (existingUser) {
        return res.status(400).json({ error: "Username sudah digunakan!" });
      }

      // Gunakan Transaksi: Buat User -> Buat Employee -> Catat Log
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.users.create({
          data: {
            username,
            password, // Disarankan melakukan hashing sebelum disimpan
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        await tx.employee.create({
          data: {
            users_id: newUser.id,
            role_id: BigInt(role_id) 
          }
        });

        if (currentUserId) {
          await createLog(tx, BigInt(currentUserId), "Tambah User", `Menambahkan user baru: ${username}`);
        }

        return newUser;
      });

      // Hilangkan password dari response demi keamanan
      const { password: _, ...userSafe } = result;

      return res.status(201).json({ 
        message: "User berhasil dibuat", 
        user: { ...userSafe, id: userSafe.id.toString() } 
      });

    } catch (error) {
      console.error("Create User Error:", error);
      return res.status(500).json({ error: "Gagal membuat user: " + error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${method} not allowed` });
}