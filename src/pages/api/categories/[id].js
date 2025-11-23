import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
  const { id } = req.query;
  const catId = BigInt(id);

  // PUT (Edit Bidang + Log)
  if (req.method === 'PUT') {
    const { bidang, userId } = req.body;
    try {
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.category.update({
          where: { id: catId },
          data: { bidang }
        });
        await createLog(tx, userId, "Edit Kategori", `Mengubah nama bidang ID ${id} menjadi: ${bidang}`);
        return updated;
      });
      return res.status(200).json(serialize(result));
    } catch (error) {
      return res.status(500).json({ error: "Gagal update" });
    }
  }

  // DELETE (Hapus Bidang + Log)
  if (req.method === 'DELETE') {
    const { userId } = req.body; // Tangkap userId dari body
    try {
      await prisma.$transaction(async (tx) => {
        const catToDelete = await tx.category.findUnique({ where: { id: catId } });
        await tx.category.delete({ where: { id: catId } });
        await createLog(tx, userId, "Hapus Kategori", `Menghapus bidang: ${catToDelete?.bidang}`);
      });
      return res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
      return res.status(500).json({ error: "Gagal hapus (Mungkin sedang dipakai di proyek)" });
    }
  }
}