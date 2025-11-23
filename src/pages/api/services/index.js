import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger'; // Import Logger

export default async function handler(req, res) {
  // GET (Tidak perlu log)
  if (req.method === 'GET') {
    const services = await prisma.services.findMany({ orderBy: { id: 'asc' } });
    return res.status(200).json(serialize(services));
  }

  // POST (Tambah - PERLU LOG)
  if (req.method === 'POST') {
    const { title, description, icon_url, userId } = req.body; // Ambil userId

    try {
      const slug = title.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

      const result = await prisma.$transaction(async (tx) => {
        // 1. Lakukan Aksi Utama
        const newService = await tx.services.create({
          data: { title, slug, description, icon_url }
        });

        // 2. Catat Log
        await createLog(tx, userId, "Tambah Layanan", `Menambahkan layanan baru: ${title}`);

        return newService;
      });

      return res.status(201).json(serialize(result));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}