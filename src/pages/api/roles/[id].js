// src/pages/api/roles/[id].js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

export default async function handler(req, res) {
  const { id } = req.query;

  // ============================================================
  // 1. IMPLEMENTASI THROTTLE (RATE LIMITING)
  // ============================================================
  try {
    // Mengambil IP asli user melalui header Vercel untuk identifikasi unik
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasi: Maksimal 10 request per menit untuk edit/hapus role
    await limiter.check(res, 10, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Aktivitas terlalu cepat. Silakan tunggu 1 menit sebelum mengubah role kembali.' 
    });
  }

  // Validasi ID
  if (!id) return res.status(400).json({ message: "ID Role diperlukan" });
  const roleId = BigInt(id);

  // === PUT: Update Nama Role ===
  if (req.method === 'PUT') {
    const { role } = req.body;
    
    if (!role) return res.status(400).json({ error: "Nama role wajib diisi" });

    try {
      const updated = await prisma.role.update({
        where: { id: roleId },
        data: { role }
      });
      return res.status(200).json(serialize(updated));
    } catch (error) {
      console.error("Update Role Error:", error);
      return res.status(500).json({ error: "Gagal memperbarui role" });
    }
  }

  // === DELETE: Hapus Role ===
  if (req.method === 'DELETE') {
    try {
      await prisma.role.delete({ 
        where: { id: roleId } 
      });
      return res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
      console.error("Delete Role Error:", error);
      // Pesan error informatif jika role masih memiliki relasi ke tabel employee
      return res.status(500).json({ 
        error: "Gagal hapus (Mungkin role ini masih digunakan oleh beberapa pegawai)" 
      });
    }
  }

  // Konfigurasi Header untuk Method yang diizinkan
  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}