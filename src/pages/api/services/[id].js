import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
  const { id } = req.query;
  const serviceId = BigInt(id);

  // --- GET: AMBIL DATA DETAIL LAYANAN ---
  if (req.method === 'GET') {
    try {
      const service = await prisma.services.findUnique({
        where: { id: serviceId }
      });
      if (!service) {
        return res.status(404).json({ error: "Layanan tidak ditemukan" });
      }
      return res.status(200).json(serialize(service));
    }
    catch (error) {
      return res.status(500).json({ error: "Gagal mengambil data layanan" });
    }
  }

  // PUT (Edit - PERLU LOG)
  if (req.method === 'PUT') {
    const { title, description, icon_url, userId } = req.body; // Ambil userId

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update Data
        const updatedService = await tx.services.update({
          where: { id: serviceId },
          data: { title, description, icon_url }
        });

        // 2. Catat Log
        await createLog(tx, userId, "Edit Layanan", `Mengubah layanan ID ${id}: ${title}`);

        return updatedService;
      });

      return res.status(200).json(serialize(result));
    } catch (error) {
      return res.status(500).json({ error: "Gagal update data" });
    }
  }

  // DELETE (Hapus - PERLU LOG)
  if (req.method === 'DELETE') {
    const { userId } = req.body; // PENTING: Saat delete, kita juga butuh userId!

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Ambil data dulu sebelum dihapus (untuk detail log)
        const serviceToDelete = await tx.services.findUnique({ where: { id: serviceId } });
        
        // 2. Hapus Data
        await tx.services.delete({ where: { id: serviceId } });

        // 3. Catat Log
        const detailText = serviceToDelete ? `Menghapus layanan: ${serviceToDelete.title}` : `Menghapus layanan ID: ${id}`;
        await createLog(tx, userId, "Hapus Layanan", detailText);
      });

      return res.status(200).json({ message: 'Berhasil dihapus' });
    } catch (error) {
      return res.status(500).json({ error: "Gagal menghapus data" });
    }
  }
}