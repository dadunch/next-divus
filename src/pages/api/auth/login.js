// src/pages/api/auth/login.js
import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  // Hanya menerima method POST (kirim data rahasia)
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan Password wajib diisi' });
  }

  try {
    // 1. Cari user di database berdasarkan username
    const user = await prisma.users.findFirst({
      where: { username: username }
    });

    // 2. Jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({ message: 'Username tidak ditemukan' });
    }

    // 3. Cek password (Sesuai kolom di DB Anda)
    // Catatan: Untuk production nanti sebaiknya password di-hash (dienkripsi)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // 4. Login Sukses!
    // Kita kirim data user tapi HAPUS passwordnya agar aman
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({ 
        message: 'Login Berhasil', 
        user: serialize(userWithoutPassword) 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}