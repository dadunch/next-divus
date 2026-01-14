// src/pages/api/photos/[id].js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

// KONFIGURASI PENTING: Diperlukan juga di sini untuk fitur Edit (PUT)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasi: Maksimal 10 request per menit untuk aksi modifikasi foto
    await limiter.check(res, 10, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Terlalu banyak permintaan. Silakan tunggu sebentar sebelum memodifikasi foto kembali.' 
    });
  }

  // Validasi ID
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  const photoId = BigInt(id);

  try {
    // === DELETE: HAPUS DATA ===
    if (method === 'DELETE') {
      const { userId } = req.query; 

      await prisma.$transaction(async (tx) => {
        // Cek data dulu
        const existing = await tx.company_photos.findUnique({ where: { id: photoId } });
        if (!existing) throw new Error("Foto tidak ditemukan");

        // Hapus
        await tx.company_photos.delete({ where: { id: photoId } });

        // Log
        await createLog(
            tx, 
            userId ? BigInt(userId) : BigInt(1), 
            "Hapus Foto", 
            `Menghapus foto: ${existing.title || 'Tanpa Judul'}`
        );
      });

      return res.status(200).json({ message: 'Foto berhasil dihapus' });
    }

    // === PUT: UPDATE DATA ===
    if (method === 'PUT') {
      const { title, image_url, userId } = req.body;

      const result = await prisma.$transaction(async (tx) => {
        // Cek data
        const existing = await tx.company_photos.findUnique({ where: { id: photoId } });
        if (!existing) throw new Error("Foto tidak ditemukan");

        // Update
        const updated = await tx.company_photos.update({
          where: { id: photoId },
          data: { 
            title, 
            image_url 
          },
        });

        // Log
        await createLog(
            tx, 
            userId ? BigInt(userId) : BigInt(1), 
            "Edit Foto", 
            `Mengupdate foto ID ${id}: ${title || 'Tanpa Judul'}`
        );

        return updated;
      });

      return res.status(200).json(serialize(result));
    }

    // === METHOD NOT ALLOWED ===
    res.setHeader('Allow', ['DELETE', 'PUT']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    console.error("API Error:", error);
    
    if (error.code === 'P2025' || error.message.includes("tidak ditemukan")) {
        return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
}