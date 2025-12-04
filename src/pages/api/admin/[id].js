import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
  const { id } = req.query; // Ini adalah User ID
  const { method } = req;
  const userId = BigInt(id);

  try {
    // === DELETE: Hapus Admin ===
    if (method === 'DELETE') {
      // Ambil currentUserId dari query param jika dikirim frontend untuk keperluan log
      // const currentUserId = req.query.currentUserId ? BigInt(req.query.currentUserId) : null;

      await prisma.$transaction(async (tx) => {
        // 1. Cari data employee (karena foreign key user)
        const employeeRecord = await tx.employee.findFirst({
            where: { users_id: userId }
        });

        // 2. Hapus Employee 
        // (Jika relasi Many-to-Many roles diatur dengan benar di Prisma, 
        // data di tabel penghubung biasanya akan terhapus otomatis atau via cascade)
        if (employeeRecord) {
            await tx.employee.delete({
                where: { id: employeeRecord.id }
            });
        }

        // 3. Ambil data user untuk log (opsional)
        // const userToDelete = await tx.users.findUnique({ where: { id: userId } });

        // 4. Hapus User
        await tx.users.delete({
          where: { id: userId },
        });

        // 5. Log (Opsional)
        // if (currentUserId && userToDelete) {
        //   await createLog(tx, currentUserId, "DELETE_ADMIN", `Menghapus admin: ${userToDelete.username}`);
        // }
      });

      return res.status(200).json({ message: 'Admin berhasil dihapus' });
    }

    // === PUT: Edit Admin ===
    if (method === 'PUT') {
      // Perhatikan: Frontend sekarang mengirim 'role_ids' (array), bukan 'role_id'
      const { username, password, role_ids, currentUserId } = req.body;

      await prisma.$transaction(async (tx) => {
        const updateData = { username };

        // Jika password diisi, update password baru. Jika kosong, biarkan.
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
        // Cari id employee berdasarkan user_id
        const emp = await tx.employee.findFirst({ where: { users_id: userId } });
        
        // Logika update Multi-Role
        if (emp && role_ids && Array.isArray(role_ids)) {
            await tx.employee.update({
                where: { id: emp.id },
                data: {
                    roles: {
                        // 'set': [] -> Berfungsi untuk menghapus/reset semua role lama
                        set: [], 
                        // 'connect': [...] -> Menghubungkan role-role baru yang dipilih
                        connect: role_ids.map((rid) => ({ id: BigInt(rid) })), 
                    }
                }
            });
        }

        // 3. Log
        await createLog(
            tx, 
            BigInt(currentUserId || 1), // Fallback id 1 jika null
            "UPDATE_ADMIN", 
            `Mengupdate data admin: ${username}`
        );
      });

      return res.status(200).json({ message: 'Data berhasil diupdate' });
    }

    res.setHeader('Allow', ['DELETE', 'PUT']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ message: 'Gagal memproses data', error: error.message });
  }
}