// src/pages/api/services/[id].js
import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  const { id } = req.query;
  const serviceId = BigInt(id); // Konversi ID URL ke BigInt

  // PUT: Update Layanan
  if (req.method === 'PUT') {
    const { title, description, icon_url } = req.body;
    try {
      const updatedService = await prisma.services.update({
        where: { id: serviceId },
        data: { title, description, icon_url }
      });
      return res.status(200).json(serialize(updatedService));
    } catch (error) {
      return res.status(500).json({ error: "Gagal update data" });
    }
  }

  // DELETE: Hapus Layanan
  if (req.method === 'DELETE') {
    try {
      await prisma.services.delete({
        where: { id: serviceId }
      });
      return res.status(200).json({ message: 'Berhasil dihapus' });
    } catch (error) {
      return res.status(500).json({ error: "Gagal menghapus data" });
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end();
}