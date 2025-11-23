import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger'; // Import Logger

export default async function handler(req, res) {
  // GET
  if (req.method === 'GET') {
    const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
    return res.status(200).json(serialize(categories));
  }

  // POST (Tambah Bidang + Log)
  if (req.method === 'POST') {
    const { bidang, userId } = req.body;
    try {
      const result = await prisma.$transaction(async (tx) => {
        const newCat = await tx.category.create({ data: { bidang } });
        await createLog(tx, userId, "Tambah Kategori", `Menambahkan bidang baru: ${bidang}`);
        return newCat;
      });
      return res.status(201).json(serialize(result));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}