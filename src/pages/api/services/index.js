import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
  
  // 1. GET: Ambil Semua Layanan
  if (req.method === 'GET') {
    try {
      const services = await prisma.services.findMany({
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          icon_url: true,
          image_url: true,
          description: true
        }
      });
      return res.status(200).json(serialize(services));
    } catch (error) {
      return res.status(500).json({ error: "Gagal mengambil data layanan" });
    }
  }

  // 2. POST: Tambah Layanan Baru
  if (req.method === 'POST') {
    const { title, description, icon_class, image_url, userId } = req.body; 

    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

      // === PERUBAHAN DI SINI (MENAMBAHKAN TIMEOUT) ===
      const result = await prisma.$transaction(async (tx) => {
        // Simpan ke Tabel Services
        const newService = await tx.services.create({
          data: { 
            title, 
            slug, 
            description, 
            icon_url: icon_class, 
            image_url: image_url 
          }
        });

        // Catat Log Aktivitas
        await createLog(tx, userId, "Tambah Layanan", `Menambahkan layanan baru: ${title}`);

        return newService;
      }, {
        maxWait: 5000, // Waktu tunggu maksimal untuk dapat koneksi
        timeout: 20000 // Waktu tunggu maksimal untuk proses simpan (20 Detik)
      });
      // ================================================

      return res.status(201).json(serialize(result));
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}