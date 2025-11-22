import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  // GET: Ambil daftar menu yang diizinkan untuk Role tertentu
  // Contoh panggil: /api/roles/permissions?role_id=1
  if (req.method === 'GET') {
    const { role_id } = req.query;
    if (!role_id) return res.status(400).json({ error: "role_id required" });

    const permissions = await prisma.menu_role.findMany({
      where: { role_id: BigInt(role_id) },
      include: { menu: true } // Sertakan detail menunya
    });
    return res.status(200).json(serialize(permissions));
  }

  // POST: Update Hak Akses (Sync)
  // Body: { role_id: 1, menu_ids: [1, 2, 5] } 
  // Artinya: Role ID 1 sekarang HANYA boleh akses menu 1, 2, dan 5.
  if (req.method === 'POST') {
    const { role_id, menu_ids } = req.body; // menu_ids harus array ID
    const roleIdBigInt = BigInt(role_id);

    try {
      // Kita pakai Transaction agar aman (Hapus dulu semua, baru insert yang baru)
      await prisma.$transaction(async (tx) => {
        // 1. Hapus semua permission lama role ini
        await tx.menu_role.deleteMany({
          where: { role_id: roleIdBigInt }
        });

        // 2. Insert permission baru jika ada yg dipilih
        if (menu_ids && menu_ids.length > 0) {
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
      console.error(error);
      return res.status(500).json({ error: "Gagal update permission" });
    }
  }
}