import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  const { id } = req.query;
  const catId = BigInt(id);

  if (req.method === 'PUT') {
    const { bidang } = req.body;
    const updated = await prisma.category.update({
      where: { id: catId },
      data: { bidang }
    });
    return res.status(200).json(serialize(updated));
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.category.delete({ where: { id: catId } });
      return res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
      return res.status(500).json({ error: "Gagal hapus (Sedang dipakai)" });
    }
  }
}