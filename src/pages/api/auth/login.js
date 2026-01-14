// src/pages/api/auth/login.js
import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import bcrypt from 'bcryptjs';
import { limiter } from '../../../lib/rate-limit'; // Import utility rate limit

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasi: Maksimal 5 percobaan login per menit per IP
    await limiter.check(res, 5, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Terlalu banyak percobaan login. Silakan tunggu 1 menit demi keamanan akun Anda.' 
    });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan Password wajib diisi' });
  }

  // Helper: Retry logic untuk mengatasi masalah koneksi "flaky" (Cold Start Supabase)
  const retryQuery = async (operation, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if ((error.code === 'P1001' || error.code === 'P2024') && i < maxRetries - 1) {
          console.warn(`Database connection failed (Attempt ${i + 1}/${maxRetries}). Retrying...`);
          await new Promise(res => setTimeout(res, 1000)); 
          continue;
        }
        throw error;
      }
    }
  };

  try {
    // 1. Cari user di tabel users (Gunakan Retry)
    const user = await retryQuery(() => prisma.users.findFirst({
      where: { username: username }
    }));

    if (!user) {
      return res.status(401).json({ message: 'Username atau Password salah' }); // Pesan disamarkan demi keamanan
    }

    // 2. CEK PASSWORD

    let isPasswordValid = user.password === password;

    if (!isPasswordValid) {
      if (user.password.startsWith('$2')) {
        isPasswordValid = await bcrypt.compare(password, user.password);
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Username atau Password salah' });
    }

    // 3. AMBIL DATA PEGAWAI & ROLES (Multi Role)
    const employee = await prisma.employee.findFirst({
      where: { users_id: user.id },
      include: { roles: true }
    });

    if (!employee) {
      return res.status(403).json({ message: 'Akun ini belum terdaftar sebagai pegawai.' });
    }

    if (!employee.roles || employee.roles.length === 0) {
      return res.status(403).json({ message: 'Akun ini belum memiliki Jabatan/Role apapun.' });
    }

    // 4. Login Sukses & Kirim Data Lengkap
    const { password: _, ...userWithoutPassword } = user;

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
    return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
}