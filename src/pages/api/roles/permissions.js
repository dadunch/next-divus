// src/pages/api/roles/permissions.js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

export default async function handler(req, res) {
  const { method } = req;


  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // GET: 40 kali per menit (Cukup longgar karena sidebar sering fetch ulang)
    // POST: 5 kali per menit (Aksi krusial pengaturan hak akses)
    const limit = method === 'GET' ? 40 : 5;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Aktivitas terlalu padat. Silakan tunggu sebentar sebelum mencoba lagi.' 
    });
  }

  // === GET: Ambil daftar menu yang diizinkan ===
  if (method === 'GET') {
    const { role_id, role_ids } = req.query;

    if (!role_id && !role_ids) {
        return res.status(400).json({ error: "role_id or role_ids required" });
    }

    let targetRoleIds = [];

    try {
        if (role_ids) {
            targetRoleIds = role_ids.split(',').map((id) => BigInt(id.trim()));
        } 
        else if (role_id) {
            targetRoleIds = [BigInt(role_id)];
        }

        const permissions = await prisma.menu_role.findMany({
            where: { 
                role_id: { in: targetRoleIds } 
            },
            include: { menu: true } 
        });
        
        return res.status(200).json(serialize(permissions));

    } catch (error) {
        console.error("Error fetch permissions:", error);
        return res.status(500).json({ error: "Gagal mengambil data permissions" });
    }
  }

  // === POST: Update Hak Akses ===
  if (method === 'POST') {
    const { role_id, menu_ids } = req.body; 
    
    if (!role_id) return res.status(400).json({ error: "role_id required" });

    const roleIdBigInt = BigInt(role_id);

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Hapus semua permission lama untuk role ini
        await tx.menu_role.deleteMany({
          where: { role_id: roleIdBigInt }
        });

        // 2. Insert permission baru jika ada yg dipilih
        if (menu_ids && Array.isArray(menu_ids) && menu_ids.length > 0) {
          const dataToInsert = menu_ids.map((menuId) => ({
            role_id: roleIdBigInt,
            menu_id: BigInt(menuId)
          }));

          await tx.menu_role.createMany({
            data: dataToInsert
          });
        }
      });

      return res.status(200).json({ message: "Hak akses berhasil diupdate" });
    } catch (error) {
      console.error("Error update permissions:", error);
      return res.status(500).json({ error: "Gagal update permission" });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}