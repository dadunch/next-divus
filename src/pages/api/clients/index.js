import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  // GET: Ambil Data Client
  if (req.method === 'GET') {
    try {
      const clients = await prisma.client.findMany({
        include: { projects: true }, // Agar bisa hitung jumlah proyek
        orderBy: { id: 'desc' }
      });
      return res.status(200).json(serialize(clients));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST: Tambah Client Baru + CATAT LOG
  if (req.method === 'POST') {
    const { client_name, client_logo, userId } = req.body; // Tangkap userId

    try {
      // Gunakan Transaction agar Client terbuat DAN Log tercatat
      const result = await prisma.$transaction(async (tx) => {
        
        // 1. Buat Client
        const newClient = await tx.client.create({
          data: { client_name, client_logo }
        });

        // 2. Buat Log Aktivitas (Jika userId dikirim)
        if (userId) {
          await tx.activity_logs.create({
            data: {
              user_id: BigInt(userId), // Convert string ID ke BigInt
              action: 'Tambah Client',
              details: `Menambahkan Mitra/Client baru: ${client_name}`
            }
          });
        }

        return newClient;
      });

      return res.status(201).json(serialize(result));

    } catch (error) {
      console.error("Error create client:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}