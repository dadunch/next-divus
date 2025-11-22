import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  const { id } = req.query;
  const employeeId = BigInt(id);

  // PUT: Ganti Jabatan
  if (req.method === 'PUT') {
    const { role_id } = req.body;
    try {
      const updated = await prisma.employee.update({
        where: { id: employeeId },
        data: { role_id: BigInt(role_id) }
      });
      return res.status(200).json(serialize(updated));
    } catch (error) {
      return res.status(500).json({ error: "Gagal update jabatan" });
    }
  }

  // DELETE: Hapus Jabatan (Usernya tetap ada, tapi tidak punya akses lagi)
  if (req.method === 'DELETE') {
    await prisma.employee.delete({ where: { id: employeeId } });
    return res.status(200).json({ message: 'Employee access revoked' });
  }
}