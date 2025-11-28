import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger'; // Pastikan path ini sesuai struktur folder Anda

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
        await createLog(
          tx,
          userId,
          "CREATE_PHOTO",
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