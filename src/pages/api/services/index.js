import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
  
  // 1. GET: Ambil Semua Layanan (Wajib ada untuk Sidebar)
  if (req.method === 'GET') {
    try {
      const services = await prisma.services.findMany({
        orderBy: { created_at: 'desc' }, // Urutkan dari yang terbaru
        select: {
          id: true,
          title: true,
          slug: true,
          icon_url: true // Ini kita pakai untuk menyimpan class FontAwesome
        }
      });
      return res.status(200).json(serialize(services));
    } catch (error) {
      return res.status(500).json({ error: "Gagal mengambil data layanan" });
    }
  }

  // 2. POST: Tambah Layanan Baru
  if (req.method === 'POST') {
    // Terima data lengkap dari Frontend
    const { title, description, icon_class, image_url, userId } = req.body; 

    try {
      // Buat slug otomatis (contoh: "Management Consulting" -> "management-consulting-1715...")
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

      const result = await prisma.$transaction(async (tx) => {
        // Simpan ke Tabel Services
        const newService = await tx.services.create({
          data: { 
            title, 
            slug, 
            description, 
            icon_url: icon_class, // Simpan class icon (fa-solid...) di sini
            image_url: image_url  // Simpan Base64 gambar di kolom baru (pastikan kolom ini sudah dibuat di DB)
          }
        });

        // Catat Log Aktivitas
        await createLog(tx, userId, "Tambah Layanan", `Menambahkan layanan baru: ${title}`);

        return newService;
      });

      return res.status(201).json(serialize(result));
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Method lain tidak diizinkan
  return res.status(405).json({ error: 'Method not allowed' });
}