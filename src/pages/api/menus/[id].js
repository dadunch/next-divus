import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  const { id } = req.query;
  const menuId = BigInt(id);

  if (req.method === 'PUT') {
    const { nama_menu, url, icon, is_parent, parent_id } = req.body;
    const updated = await prisma.menu.update({
      where: { id: menuId },
      data: {
        nama_menu,
        url,
        icon,
        is_parent: parseInt(is_parent),
        parent_id: parent_id ? parseInt(parent_id) : null
      }
    });
    return res.status(200).json(serialize(updated));
  }

  if (req.method === 'DELETE') {
    await prisma.menu.delete({ where: { id: menuId } });
    return res.status(200).json({ message: 'Menu deleted' });
  }
}