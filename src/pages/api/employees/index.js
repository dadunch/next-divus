// src/pages/api/employees/index.js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

export default async function handler(req, res) {
  const { method } = req;


  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // GET: 25 kali per menit (karena daftar pegawai sering diakses admin)
    // POST: 5 kali per menit (aksi pembuatan/assign role baru)
    const limit = method === 'GET' ? 25 : 5;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Permintaan terlalu cepat. Silakan tunggu 1 menit untuk melanjutkan.' 
    });
  }

  try {
    // === GET: Lihat daftar pegawai beserta usernamenya dan jabatannya ===
    if (method === 'GET') {
      const employees = await prisma.employee.findMany({
        include: {
          users: { select: { id: true, username: true } }, 
          role: true  
        }
      });
      return res.status(200).json(serialize(employees));
    }

    // === POST: Angkat pegawai baru (Assign User to Role) ===
    if (method === 'POST') {
      const { users_id, role_id } = req.body;

      // Validasi Input Dasar
      if (!users_id || !role_id) {
        return res.status(400).json({ message: 'User ID dan Role ID wajib diisi' });
      }

      try {
        const newEmployee = await prisma.employee.create({
          data: {
            users_id: BigInt(users_id),
            role_id: BigInt(role_id)
          }
        });
        return res.status(201).json(serialize(newEmployee));
      } catch (error) {
        console.error("Assign Role Error:", error);
        return res.status(500).json({ 
          error: "Gagal assign role (Mungkin user sudah memiliki role atau ID tidak valid?)" 
        });
      }
    }

    // Method Not Allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    console.error("API Employees Error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan internal pada server" });
  }
}