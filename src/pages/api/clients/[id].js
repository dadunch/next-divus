// src/pages/api/clients/[id].js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

export default async function handler(req, res) {
  const { id } = req.query;


  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // GET: 20 kali per menit (untuk view detail)
    // PUT/DELETE: 5 kali per menit (aksi sensitif/berat)
    const limit = req.method === 'GET' ? 20 : 5;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Terlalu banyak permintaan. Silakan tunggu sebentar.' 
    });
  }

  // Validasi ID
  if (!id) return res.status(400).json({ message: "ID Client diperlukan" });
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
    const { client_name, client_logo, userId } = req.body;
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
      console.error("Update client error:", error);
      return res.status(500).json({ error: "Gagal update client" });
    }
  }

  // --- 3. DELETE: Hapus Client (DENGAN LOG BARU) ---
  if (req.method === 'DELETE') {
    const { userId } = req.body; 

    try {
      await prisma.$transaction(async (tx) => {
        // Ambil nama client dulu sebelum dihapus
        const clientToDelete = await tx.client.findUnique({ where: { id: clientId } });
        
        if (!clientToDelete) {
          throw new Error("Client tidak ditemukan");
        }
        
        // Hapus Proyek terkait dulu (Cascading manual)
        await tx.projects.deleteMany({ where: { client_id: clientId } });
        
        // Hapus Client utama
        await tx.client.delete({ where: { id: clientId } });

        // Catat Log
        if (userId) {
          await tx.activity_logs.create({
            data: {
              user_id: BigInt(userId),
              action: "Hapus Client",
              details: `Menghapus client: ${clientToDelete.client_name}`
            }
          });
        }
      });

      return res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ 
        error: error.message === "Client tidak ditemukan" ? error.message : "Gagal hapus data" 
      });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}