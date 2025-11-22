import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const menus = await prisma.menu.findMany({ orderBy: { id: 'asc' } });
    return res.status(200).json(serialize(menus));
  }

  if (req.method === 'POST') {
    const { nama_menu, url, icon, is_parent, parent_id } = req.body;
    const newMenu = await prisma.menu.create({
      data: {
        nama_menu,
        url,
        icon,
        is_parent: parseInt(is_parent), // Pastikan format angka
        parent_id: parent_id ? parseInt(parent_id) : null
      }
    });
    return res.status(201).json(serialize(newMenu));
  }
}