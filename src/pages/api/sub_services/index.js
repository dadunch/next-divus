// src/pages/api/sub_services/index.js

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
    
    // GET: 40 kali per menit (karena sering diakses untuk list dropdown/tabel)
    // POST: 10 kali per menit (untuk membatasi spam pembuatan sub layanan)
    const limit = method === 'GET' ? 40 : 10;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Permintaan terlalu padat. Silakan tunggu sebentar.' 
    });
  }

  // GET: Ambil semua data sub_services
  if (method === 'GET') {
    try {
      const subServices = await prisma.sub_services.findMany({
        orderBy: { id: 'desc' }
      });
      
      return res.status(200).json(serialize(subServices));
    } catch (error) {
      console.error('Error fetching sub_services:', error);
      return res.status(500).json({ error: "Gagal mengambil data sub layanan" });
    }
  }

  // POST: Tambah sub_services baru
  if (method === 'POST') {
    const { services_id, sub_services, userId } = req.body;

    // Validasi input
    if (!sub_services || !sub_services.trim()) {
      return res.status(400).json({ error: "Nama sub layanan harus diisi" });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Buat data baru
        const newSubService = await tx.sub_services.create({
          data: {
            services_id: services_id ? BigInt(services_id) : null,
            sub_services: sub_services.trim()
          }
        });

        // 2. Catat log (Konversi userId ke BigInt agar konsisten dengan DB)
        if (userId) {
          await createLog(
            tx,
            BigInt(userId),
            "Tambah Sub Layanan",
            `Menambahkan sub layanan: ${sub_services}`
          );
        }

        return newSubService;
      });

      return res.status(201).json(serialize(result));
    } catch (error) {
      console.error('Error creating sub_service:', error);
      return res.status(500).json({ error: "Gagal menambahkan sub layanan" });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${method} tidak diizinkan` });
}