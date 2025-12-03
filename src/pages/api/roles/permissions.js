import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  
  // === GET: Ambil daftar menu yang diizinkan ===
  // Support Multi-Role: /api/roles/permissions?role_ids=1,2,3
  // Support Single-Role: /api/roles/permissions?role_id=1
  if (req.method === 'GET') {
    const { role_id, role_ids } = req.query;

    if (!role_id && !role_ids) {
        return res.status(400).json({ error: "role_id or role_ids required" });
    }

    let targetRoleIds = [];

    try {
        // Skenario 1: Multi Role (Dikirim dari Sidebar: "1,2,3")
        if (role_ids) {
            targetRoleIds = role_ids.split(',').map((id) => BigInt(id.trim()));
        } 
        // Skenario 2: Single Role (Fallback / Edit Permission page)
        else if (role_id) {
            targetRoleIds = [BigInt(role_id)];
        }

        // Query DB: Ambil semua menu_role dimana role_id ada di dalam daftar targetRoleIds
        const permissions = await prisma.menu_role.findMany({
            where: { 
                role_id: { in: targetRoleIds } 
            },
            include: { menu: true } // Sertakan detail menu
        });

        // Catatan: Jika user punya 2 role dan kedua role punya akses ke menu yg sama,
        // akan ada data duplikat di sini. Frontend (Sidebar) sudah saya buat 
        // untuk menangani deduplikasi tersebut.
        
        return res.status(200).json(serialize(permissions));

    } catch (error) {
        console.error("Error fetch permissions:", error);
        return res.status(500).json({ error: "Gagal mengambil data permissions" });
    }
  }

  // === POST: Update Hak Akses (Biasanya dilakukan per 1 Role) ===
  // Body: { role_id: 1, menu_ids: [1, 2, 5] } 
  if (req.method === 'POST') {
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

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}