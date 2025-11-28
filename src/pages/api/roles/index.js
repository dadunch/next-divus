import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger'; // Import logger

export default async function handler(req, res) {
  const { method } = req;

  try {
    // === GET: Ambil semua list jabatan ===
    if (method === 'GET') {
      const roles = await prisma.role.findMany({
        orderBy: { id: 'asc' } // Urutkan biar rapi
      });
      return res.status(200).json(serialize(roles));
    }

    // === POST: Buat jabatan baru ===
    if (method === 'POST') {
      const { role, currentUserId } = req.body; // Ambil currentUserId untuk logs

      // 1. Validasi Input
      if (!role || role.trim() === "") {
        return res.status(400).json({ message: "Nama role tidak boleh kosong" });
      }

      // 2. Cek Duplikat (Opsional, tapi UX lebih bagus daripada nunggu error DB)
      const existing = await prisma.role.findFirst({
        where: { role: { equals: role, mode: 'insensitive' } } // Case insensitive check
      });
      if (existing) {
        return res.status(400).json({ message: `Role "${role}" sudah ada` });
      }

      // 3. Simpan dengan Transaksi & Log
      const result = await prisma.$transaction(async (tx) => {
        const newRole = await tx.role.create({
          data: { role }
        });

        // Catat Log Aktivitas
        await createLog(
            tx, 
            currentUserId, 
            "CREATE_ROLE", 
            `Menambahkan role baru: ${role}`
        );

        return newRole;
      });

      return res.status(201).json(serialize(result));
    }

    // Handle method lain
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    console.error("API Role Error:", error);
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
}