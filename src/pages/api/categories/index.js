// src/pages/api/categories/index.js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

export default async function handler(req, res) {
  const { method } = req;


  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasan dinamis: 
    // GET: 30 kali per menit (karena kategori sering di-fetch oleh frontend)
    // POST: 5 kali per menit (aksi sensitif penambahan data)
    const limit = method === 'GET' ? 30 : 5;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Permintaan terlalu padat. Silakan coba lagi dalam beberapa saat.' 
    });
  }

  try {
    // === GET: Ambil Semua Kategori ===
    if (method === 'GET') {
      const categories = await prisma.category.findMany({ 
        orderBy: { id: 'asc' } 
      });
      return res.status(200).json(serialize(categories));
    }

    // === POST: Tambah Bidang Baru + Logging ===
    if (method === 'POST') {
      const { bidang, userId } = req.body;

      // Validasi Input
      if (!bidang || bidang.trim() === "") {
        return res.status(400).json({ error: "Nama bidang/kategori wajib diisi" });
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1. Simpan kategori baru
        const newCat = await tx.category.create({ 
          data: { bidang } 
        });

        // 2. Catat Log aktivitas
        // Pastikan userId diconvert ke BigInt agar sesuai skema database
        await createLog(
          tx, 
          userId ? BigInt(userId) : BigInt(1), 
          "Tambah Kategori", 
          `Menambahkan bidang baru: ${bidang}`
        );

        return newCat;
      });

      return res.status(201).json(serialize(result));
    }

    // Jika method bukan GET atau POST
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    console.error("API Category Error:", error);
    return res.status(500).json({ 
      error: "Terjadi kesalahan pada server", 
      details: error.message 
    });
  }
}