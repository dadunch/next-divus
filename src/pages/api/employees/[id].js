// src/pages/api/employees/[id].js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasi: Maksimal 10 request per menit untuk aksi modifikasi akses pegawai
    await limiter.check(res, 10, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Aktivitas terlalu cepat. Silakan tunggu 1 menit untuk melakukan perubahan akses lagi.' 
    });
  }

  // Validasi ID
  if (!id) return res.status(400).json({ message: "ID Pegawai diperlukan" });
  const employeeId = BigInt(id);

  // === PUT: Ganti Jabatan ===
  if (req.method === 'PUT') {
    const { role_id } = req.body;
    
    if (!role_id) {
      return res.status(400).json({ error: "Role ID wajib diisi" });
    }

    try {
      const updated = await prisma.employee.update({
        where: { id: employeeId },
        data: { role_id: BigInt(role_id) }
      });
      return res.status(200).json(serialize(updated));
    } catch (error) {
      console.error("Update Employee Error:", error);
      return res.status(500).json({ error: "Gagal update jabatan" });
    }
  }

  // === DELETE: Hapus Jabatan (Usernya tetap ada, tapi tidak punya akses lagi) ===
  if (req.method === 'DELETE') {
    try {
      await prisma.employee.delete({ 
        where: { id: employeeId } 
      });
      
      // Catatan: Pastikan Anda juga membersihkan session user di frontend 
      // jika akses dicabut agar perubahan langsung terasa.
      
      return res.status(200).json({ message: 'Employee access revoked successfully' });
    } catch (error) {
      console.error("Revoke Access Error:", error);
      return res.status(500).json({ error: "Gagal mencabut akses pegawai" });
    }
  }

  // Jika method bukan PUT atau DELETE
  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}