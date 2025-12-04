import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import bcrypt from 'bcryptjs'; 

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

    // ============================================================
    // 2. CEK PASSWORD (MODIFIKASI: Support Plain Text)
    // ============================================================
    
    // A. Cek langsung string (untuk akun yang passwordnya belum di-hash)
    let isPasswordValid = user.password === password;

    // B. (Opsional) Jika cek string gagal, coba cek pakai bcrypt 
    // (Jaga-jaga kalau Anda punya campuran akun hash & non-hash)
    if (!isPasswordValid) {
        // Cek apakah string terlihat seperti hash bcrypt (biasanya diawali $2a$ atau $2b$)
        if (user.password.startsWith('$2')) {
            isPasswordValid = await bcrypt.compare(password, user.password);
        }
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password salah' });
    }
    // ============================================================


    // 3. AMBIL DATA PEGAWAI & ROLES (Multi Role)
    const employee = await prisma.employee.findFirst({
      where: { users_id: user.id },
      include: { roles: true } 
    });

    // Jika user ada tapi belum diset sebagai pegawai
    if (!employee) {
      return res.status(403).json({ message: 'Akun ini belum terdaftar sebagai pegawai.' });
    }

    // Cek apakah punya role
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
          // Fallback untuk frontend lama
          roleId: userRoles[0]?.id, 
          roleName: userRoles[0]?.name
        }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: error.message });
  }
}