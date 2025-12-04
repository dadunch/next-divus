import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import bcrypt from 'bcryptjs'; // Pastikan install: npm install bcryptjs

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan Password wajib diisi' });
  }

  try {
    // 1. Cari user di tabel users
    const user = await prisma.users.findFirst({
      where: { username: username }
    });

    if (!user) {
      return res.status(401).json({ message: 'Username tidak ditemukan' });
    }

    // 2. Cek password (Gunakan bcrypt karena saat register password di-hash)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // 3. AMBIL DATA PEGAWAI & ROLES (Multi Role)
    const employee = await prisma.employee.findFirst({
      where: { users_id: user.id },
      // UBAH: Gunakan 'roles' (jamak)
      include: { roles: true } 
    });

    // Jika user ada tapi belum diset sebagai pegawai
    if (!employee) {
      return res.status(403).json({ message: 'Akun ini belum terdaftar sebagai pegawai.' });
    }

    // Cek apakah punya role (karena sekarang array, cek length-nya)
    if (!employee.roles || employee.roles.length === 0) {
        return res.status(403).json({ message: 'Akun ini belum memiliki Jabatan/Role apapun.' });
    }

    // 4. Login Sukses & Kirim Data Lengkap
    const { password: _, ...userWithoutPassword } = user;
    
    // Ambil semua role untuk dikirim ke frontend
    const userRoles = employee.roles.map(r => ({
        id: r.id.toString(),
        name: r.role
    }));

    return res.status(200).json({ 
        message: 'Login Berhasil', 
        user: {
          ...serialize(userWithoutPassword),
          
          roles: userRoles,
          roleId: userRoles[0]?.id, 
          roleName: userRoles[0]?.name
        }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: error.message });
  }
}