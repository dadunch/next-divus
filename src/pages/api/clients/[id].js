import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  const { id } = req.query;
  const clientId = BigInt(id);

  // --- 1. GET: Ambil Detail Client ---
  if (req.method === 'GET') {
    try {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: { projects: { include: { category: true } } }
      });
      if (!client) return res.status(404).json({ error: "Client tidak ditemukan" });
      return res.status(200).json(serialize(client));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- 2. PUT: Update Client (Dengan Log) ---
  if (req.method === 'PUT') {
    const { client_name, client_logo, userId } = req.body; // Tangkap userId
    try {
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.client.update({
          where: { id: clientId },
          data: { client_name, client_logo }
        });

        if (userId) {
          await tx.activity_logs.create({
            data: {
              user_id: BigInt(userId),
              action: "Edit Client",
              details: `Mengubah data client: ${client_name}`
            }
          });
        }
        return updated;
      });
      return res.status(200).json(serialize(result));
    } catch (error) {
      return res.status(500).json({ error: "Gagal update client" });
    }
  }

  // --- 3. DELETE: Hapus Client (DENGAN LOG BARU) ---
  if (req.method === 'DELETE') {
    const { userId } = req.body; // 1. Tangkap userId dari frontend

    try {
      await prisma.$transaction(async (tx) => {
        // 2. Ambil nama client dulu sebelum dihapus (untuk catatan log)
        const clientToDelete = await tx.client.findUnique({ where: { id: clientId } });
        
        // 3. Hapus Proyek terkait dulu (Bersihkan anak-anaknya)
        await tx.projects.deleteMany({ where: { client_id: clientId } });
        
        // 4. Hapus Client
        await tx.client.delete({ where: { id: clientId } });

        // 5. Catat Log Hapus
        if (userId) {
          await tx.activity_logs.create({
            data: {
              user_id: BigInt(userId),
              action: "Hapus Client",
              details: `Menghapus client: ${clientToDelete?.client_name || 'Unknown'}`
            }
          });
        }
      });

      return res.status(200).json({ message: 'Client deleted' });
    } catch (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ error: "Gagal hapus data" });
    }
  }
}