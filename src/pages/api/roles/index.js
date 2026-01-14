// src/pages/api/roles/index.js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger'; 
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

export default async function handler(req, res) {
  const { method } = req;

  // ============================================================
  // 1. IMPLEMENTASI THROTTLE (RATE LIMITING)
  // ============================================================
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasan dinamis: 
    // GET: 30 kali per menit (karena role sering di-fetch oleh dropdown/form)
    // POST: 5 kali per menit (aksi pembuatan role baru)
    const limit = method === 'GET' ? 30 : 5;
    
    await limiter.check(res, limit, ip);
  } catch {
    return res.status(429).json({ 
      message: 'Permintaan terlalu padat. Silakan tunggu satu menit sebelum mencoba kembali.'
    });
  }

  try {
    // === GET: Ambil semua list jabatan ===
    if (method === 'GET') {
      const roles = await prisma.role.findMany({
        orderBy: { id: 'asc' } 
      });
      return res.status(200).json(serialize(roles));
    }

    // === POST: Buat jabatan baru ===
    if (method === 'POST') {
      const { role, currentUserId } = req.body; 

      // 1. Validasi Input
      if (!role || role.trim() === "") {
        return res.status(400).json({ message: "Nama role tidak boleh kosong" });
      }

      // 2. Cek Duplikat (Case insensitive check)
      const existing = await prisma.role.findFirst({
        where: { role: { equals: role, mode: 'insensitive' } } 
      });
      
      if (existing) {
        return res.status(400).json({ message: `Role "${role}" sudah ada` });
      }

      // 3. Simpan dengan Transaksi & Log
      const result = await prisma.$transaction(async (tx) => {
        const newRole = await tx.role.create({
          data: { role }
        });

        // Catat Log Aktivitas (Konversi currentUserId ke BigInt agar aman)
        await createLog(
            tx, 
            currentUserId ? BigInt(currentUserId) : BigInt(1), 
            "CREATE_ROLE", 
            `Menambahkan role baru: ${role}`
        );

        return newRole;
      });

      return res.status(201).json(serialize(result));
    }

    // Handle method lain
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    console.error("API Role Error:", error);
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
}