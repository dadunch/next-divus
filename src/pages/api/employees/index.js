import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  // GET: Lihat daftar pegawai beserta usernamenya dan jabatannya
  if (req.method === 'GET') {
    const employees = await prisma.employee.findMany({
      include: {
        users: { select: { id: true, username: true } }, // Ambil nama user
        role: true  // Ambil nama jabatan
      }
    });
    return res.status(200).json(serialize(employees));
  }

  // POST: Angkat pegawai baru (Assign User to Role)
  if (req.method === 'POST') {
    const { users_id, role_id } = req.body;
    try {
      const newEmployee = await prisma.employee.create({
        data: {
          users_id: BigInt(users_id),
          role_id: BigInt(role_id)
        }
      });
      return res.status(201).json(serialize(newEmployee));
    } catch (error) {
      return res.status(500).json({ error: "Gagal assign role (Mungkin user sudah punya role?)" });
    }
  }
}