import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  const { id } = req.query;
  const roleId = BigInt(id);

  if (req.method === 'PUT') {
    const { role } = req.body;
    const updated = await prisma.role.update({
      where: { id: roleId },
      data: { role }
    });
    return res.status(200).json(serialize(updated));
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.role.delete({ where: { id: roleId } });
      return res.status(200).json({ message: 'Role deleted' });
    } catch (error) {
      return res.status(500).json({ error: "Gagal hapus (Mungkin role ini masih dipakai user)" });
    }
  }
}