import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  // GET: Ambil semua list jabatan
  if (req.method === 'GET') {
    const roles = await prisma.role.findMany();
    return res.status(200).json(serialize(roles));
  }

  // POST: Buat jabatan baru
  if (req.method === 'POST') {
    const { role } = req.body;
    try {
      const newRole = await prisma.role.create({
        data: { role }
      });
      return res.status(201).json(serialize(newRole));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}