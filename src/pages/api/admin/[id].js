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
      // Ambil currentUserId dari query param (jika dikirim frontend) untuk logger
      // Frontend Anda di atas belum mengirim ?userId=..., sebaiknya ditambahkan nanti.
      
      await prisma.$transaction(async (tx) => {
        // 1. Hapus data di tabel employee dulu (karena foreign key)
        const employeeRecord = await tx.employee.findFirst({
            where: { users_id: userId }
        });

        if (employeeRecord) {
            await tx.employee.delete({
                where: { id: employeeRecord.id }
            });
        }

        // 2. Ambil data user untuk log sebelum dihapus
        const userToDelete = await tx.users.findUnique({ where: { id: userId } });

        // 3. Hapus User
        await tx.users.delete({
          where: { id: userId },
        });

        // 4. Log (Opsional, jika ada currentUserId)
        // await createLog(tx, req.query.currentUserId, "DELETE_ADMIN", `Menghapus admin: ${userToDelete.username}`);
      });

      return res.status(200).json({ message: 'Admin berhasil dihapus' });
    }

    // === PUT: Edit Admin ===
    if (method === 'PUT') {
      const { username, password, role_id, currentUserId } = req.body;

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

        // 2. Update Role di tabel Employee
        // Cari id employee berdasarkan user_id
        const emp = await tx.employee.findFirst({ where: { users_id: userId } });
        
        if (emp && role_id) {
            await tx.employee.update({
                where: { id: emp.id },
                data: { role_id: BigInt(role_id) }
            });
        }

        // 3. Log
        await createLog(
            tx, 
            currentUserId, 
            "UPDATE_ADMIN", 
            `Mengupdate data admin: ${username}`
        );
      });

      return res.status(200).json({ message: 'Data berhasil diupdate' });
    }

    res.setHeader('Allow', ['DELETE', 'PUT']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Gagal memproses data' });
  }
}