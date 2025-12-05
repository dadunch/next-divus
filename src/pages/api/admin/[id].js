import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
  const { id } = req.query; // Ini adalah User ID
  const { method } = req;
  
  // Validasi ID sebelum convert ke BigInt untuk mencegah error
  if (!id) return res.status(400).json({ message: "ID User diperlukan" });
  const userId = BigInt(id);

  try {
    // === DELETE: Hapus Admin ===
    if (method === 'DELETE') {
      // PERBAIKAN 1: Uncomment & Handle currentUserId dengan aman
      const currentUserId = req.query.currentUserId 
        ? BigInt(req.query.currentUserId) 
        : BigInt(0); // Fallback ke 0 jika tidak ada user yang login

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

        // PERBAIKAN 2: Uncomment user fetch agar bisa dicatat log-nya
        const userToDelete = await tx.users.findUnique({ where: { id: userId } });

        // 3. Hapus User
        await tx.users.delete({
          where: { id: userId },
        });

        // 4. Log 
        if (userToDelete) {
           // Gunakan CODE yang konsisten (misal: DELETE_ADMIN)
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

        // Jika password diisi, update password baru.
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
        
        // Logika update Multi-Role
        if (emp && role_ids && Array.isArray(role_ids)) {
            await tx.employee.update({
                where: { id: emp.id },
                data: {
                    roles: {
                        // PERBAIKAN 3: Gunakan 'set' dengan array objek ID.
                        // Ini artinya: "Ganti semua role saat ini dengan daftar role baru ini".
                        // Prisma otomatis menghapus role lama yang tidak dipilih dan menambah yang baru.
                        set: role_ids.map((rid) => ({ id: BigInt(rid) }))
                    }
                }
            });
        }

        // 3. Log
        await createLog(
            tx, 
            BigInt(currentUserId || 1), 
            "UPDATE_ADMIN", // Gunakan code yang konsisten
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