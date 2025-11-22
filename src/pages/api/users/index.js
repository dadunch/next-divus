import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  // GET: Lihat semua admin (kecuali password)
  if (req.method === 'GET') {
    const users = await prisma.users.findMany({
      select: { id: true, username: true, created_at: true } // Jangan select password!
    });
    return res.status(200).json(serialize(users));
  }

  // POST: Tambah Admin Baru
  if (req.method === 'POST') {
    const { username, password } = req.body;
    try {
      const newUser = await prisma.users.create({
        data: { username, password } // Production harus di-hash!
      });
      return res.status(201).json({ message: "Admin created", id: newUser.id.toString() });
    } catch (error) {
      return res.status(500).json({ error: "Username mungkin sudah ada" });
    }
  }
}