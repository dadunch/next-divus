// src/pages/api/categories/[id].js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';
import { limiter } from '../../../lib/rate-limit'; // Import limiter

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasi: Maksimal 10 request per menit untuk aksi modifikasi kategori
    // Angka 10 cukup aman untuk aktivitas admin normal
    await limiter.check(res, 10, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Aktivitas terlalu cepat. Silakan tunggu sebentar sebelum mencoba lagi.' 
    });
  }

  // Validasi ID
  if (!id) return res.status(400).json({ message: "ID Kategori diperlukan" });
  const catId = BigInt(id);

  // PUT (Edit Bidang + Log)
  if (req.method === 'PUT') {
    const { bidang, userId } = req.body;
    
    if (!bidang) return res.status(400).json({ error: "Nama bidang wajib diisi" });

    try {
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.category.update({
          where: { id: catId },
          data: { bidang }
        });
        
        // Logika Revalidation (Opsional)
        // Jika kategori tampil di halaman publik, panggil revalidate di sini
        
        await createLog(tx, userId ? BigInt(userId) : BigInt(1), "Edit Kategori", `Mengubah nama bidang ID ${id} menjadi: ${bidang}`);
        return updated;
      });
      
      return res.status(200).json(serialize(result));
    } catch (error) {
      console.error("Update Category Error:", error);
      return res.status(500).json({ error: "Gagal update data" });
    }
  }

  // DELETE (Hapus Bidang + Log)
  if (req.method === 'DELETE') {
    // Pastikan userId dikirim dari frontend untuk logging
    const { userId } = req.body; 

    try {
      await prisma.$transaction(async (tx) => {
        const catToDelete = await tx.category.findUnique({ where: { id: catId } });
        
        if (!catToDelete) {
          throw new Error("Kategori tidak ditemukan");
        }

        await tx.category.delete({ where: { id: catId } });
        
        await createLog(tx, userId ? BigInt(userId) : BigInt(1), "Hapus Kategori", `Menghapus bidang: ${catToDelete?.bidang}`);
      });
      
      return res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
      console.error("Delete Category Error:", error);
      return res.status(500).json({ 
        error: error.message === "Kategori tidak ditemukan" 
          ? error.message 
          : "Gagal hapus (Mungkin kategori ini masih digunakan oleh data lain)" 
      });
    }
  }

  // Jika method bukan PUT atau DELETE
  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}