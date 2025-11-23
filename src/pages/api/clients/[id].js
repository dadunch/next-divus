import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  const { id } = req.query;
  const clientId = BigInt(id);

  // --- 1. GET: Ambil Detail Client + Proyeknya ---
  if (req.method === 'GET') {
    try {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
          projects: {
            include: { category: true }, // Sertakan nama bidang/kategori
            orderBy: { tahun: 'desc' }   // Urutkan tahun terbaru
          }
        }
      });

      if (!client) return res.status(404).json({ error: "Client tidak ditemukan" });

      return res.status(200).json(serialize(client));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- 2. PUT: Update Client ---
  if (req.method === 'PUT') {
    const { client_name, client_logo } = req.body;
    try {
      const updated = await prisma.client.update({
        where: { id: clientId },
        data: { client_name, client_logo }
      });
      return res.status(200).json(serialize(updated));
    } catch (error) {
      return res.status(500).json({ error: "Gagal update client" });
    }
  }

  // --- 3. DELETE: Hapus Client ---
  if (req.method === 'DELETE') {
    try {
      // Hapus proyek terkait dulu (Optional: tergantung aturan onCascade DB Anda)
      await prisma.projects.deleteMany({ where: { client_id: clientId } });
      
      await prisma.client.delete({ where: { id: clientId } });
      return res.status(200).json({ message: 'Client deleted' });
    } catch (error) {
      return res.status(500).json({ error: "Gagal hapus data" });
    }
  }
}