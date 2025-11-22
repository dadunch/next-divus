import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

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

    // 2. Cek password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // 3. AMBIL ROLE ID DARI TABEL EMPLOYEE
    // Kita cari data pegawai berdasarkan users_id
    const employee = await prisma.employee.findFirst({
      where: { users_id: user.id },
      include: { role: true } // Opsional: ambil nama role juga
    });

    // Jika user ada tapi belum diset sebagai pegawai (belum punya role)
    if (!employee) {
      return res.status(403).json({ message: 'Akun ini belum memiliki Jabatan/Role.' });
    }

    // 4. Login Sukses & Kirim Data Lengkap
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({ 
        message: 'Login Berhasil', 
        user: {
          ...serialize(userWithoutPassword),
          roleId: employee.role_id.toString(), // PENTING: Kirim Role ID ke frontend
          roleName: employee.role?.role
        }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: error.message });
  }
}