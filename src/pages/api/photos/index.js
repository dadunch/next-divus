// src/pages/api/photos/index.js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

// KONFIGURASI PENTING: Menaikkan limit upload agar tidak Error 413
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Izinkan body request hingga 10MB
    },
  },
};

export default async function handler(req, res) {
  const { method } = req;

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // GET: 30 kali per menit (karena galeri sering di-fetch oleh user)
    // POST: 5 kali per menit (untuk membatasi spam input foto baru)
    const limit = method === 'GET' ? 30 : 5;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Aktivitas terlalu cepat. Silakan coba lagi dalam satu menit.' 
    });
  }

  try {
    // === GET: AMBIL DATA ===
    if (method === 'GET') {
      const photos = await prisma.company_photos.findMany({
        orderBy: { created_at: 'desc' },
      });
      return res.status(200).json(serialize(photos));
    }

    // === POST: TAMBAH DATA ===
    if (method === 'POST') {
      const { title, image_url, userId } = req.body;

      // Validasi sederhana
      if (!image_url) {
        return res.status(400).json({ message: 'Image URL/Foto wajib diisi' });
      }

      // Gunakan Transaction agar aman (Create Data + Catat Log)
      const result = await prisma.$transaction(async (tx) => {
        // 1. Simpan Foto
        const newPhoto = await tx.company_photos.create({
          data: {
            title: title || null,
            image_url,
          },
        });

        // 2. Catat Log
        // Mengonversi userId ke BigInt untuk konsistensi skema Supabase
        await createLog(
          tx,
          userId ? BigInt(userId) : BigInt(1),
          "Tambah Foto",
          `Menambahkan foto: ${title || 'Tanpa Judul'}`
        );

        return newPhoto;
      });

      return res.status(201).json(serialize(result));
    }

    // === METHOD NOT ALLOWED ===
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
}