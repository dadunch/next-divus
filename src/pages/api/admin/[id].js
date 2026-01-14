// src/pages/api/admin/[id].js
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { createLog } from '../../../lib/logger';
import { limiter } from '../../../lib/rate-limit'; 

export default async function handler(req, res) {
  const { id } = req.query; // Ini adalah User ID
  const { method } = req;


  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasi: Maksimal 10 request per 60 detik per IP untuk endpoint Admin ini
    await limiter.check(res, 5, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Terlalu banyak permintaan. Keamanan sistem membatasi akses Anda, silakan coba lagi dalam 1 menit.' 
    });
  }


  if (!id) return res.status(400).json({ message: "ID User diperlukan" });
  
  let userId;
  try {
    userId = BigInt(id);
  } catch (err) {
    return res.status(400).json({ message: "Format ID tidak valid" });
  }

  try {
    // === DELETE: Hapus Admin ===
    if (method === 'DELETE') {
      const currentUserId = req.query.currentUserId 
        ? BigInt(req.query.currentUserId) 
        : BigInt(0);

      await prisma.$transaction(async (tx) => {
        // 1. Cari data employee (karena foreign key user)
        const employeeRecord = await tx.employee.findFirst({
            where: { users_id: userId }
        });

        // 2. Hapus Employee 
        if (employeeRecord) {
            await tx.employee.delete({
                where: { id: employeeRecord.id }
            });
        }

        const userToDelete = await tx.users.findUnique({ where: { id: userId } });

        // 3. Hapus User
        await tx.users.delete({
          where: { id: userId },
        });

        // 4. Log aksi penghapusan
        if (userToDelete) {
           await createLog(tx, currentUserId, "Hapus Admin", `Menghapus admin: ${userToDelete.username}`);
        }
      });

      return res.status(200).json({ message: 'Admin berhasil dihapus' });
    }

    // === PUT: Edit Admin ===
    if (method === 'PUT') {
      const { username, password, role_ids, currentUserId } = req.body;

      await prisma.$transaction(async (tx) => {
        const updateData = { username };

        // Jika password diisi, hash password baru
        if (password && password.trim() !== "") {
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(password, salt);
        }

        // 1. Update User (Username/Pass)
        await tx.users.update({
          where: { id: userId },
          data: updateData,
        });

        // 2. Update Roles di tabel Employee
        const emp = await tx.employee.findFirst({ where: { users_id: userId } });
        
        if (emp && role_ids && Array.isArray(role_ids)) {
            await tx.employee.update({
                where: { id: emp.id },
                data: {
                    roles: {
                        // Mengganti semua role lama dengan daftar role baru
                        set: role_ids.map((rid) => ({ id: BigInt(rid) }))
                    }
                }
            });
        }

        // 3. Log aksi update
        await createLog(
            tx, 
            BigInt(currentUserId || 1), 
            "UPDATE_ADMIN", 
            `Mengupdate data admin: ${username}`
        );
      });

      return res.status(200).json({ message: 'Data berhasil diupdate' });
    }

    // Jika method bukan DELETE atau PUT
    res.setHeader('Allow', ['DELETE', 'PUT']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      message: 'Gagal memproses data di server', 
      error: error.message 
    });
  }
}