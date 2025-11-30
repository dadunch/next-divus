import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
    const { id } = req.query;

    // Validasi ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID tidak valid" });
    }

    const subServiceId = BigInt(id);

    // GET: Ambil detail sub_services berdasarkan ID
    if (req.method === 'GET') {
        try {
        const subService = await prisma.sub_services.findUnique({
            where: { id: subServiceId }
        });

        if (!subService) {
            return res.status(404).json({ error: "Sub layanan tidak ditemukan" });
        }

        return res.status(200).json(serialize(subService));
        } catch (error) {
        console.error('Error fetching sub_service:', error);
        return res.status(500).json({ error: "Gagal mengambil data sub layanan" });
        }
    }

    // PUT: Update sub_services
    if (req.method === 'PUT') {
        const { services_id, sub_services, userId } = req.body;

        // Validasi input
        if (!sub_services || !sub_services.trim()) {
        return res.status(400).json({ error: "Nama sub layanan harus diisi" });
        }

        try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Cek apakah data ada
            const existing = await tx.sub_services.findUnique({
            where: { id: subServiceId }
            });

            if (!existing) {
            throw new Error("Sub layanan tidak ditemukan");
            }

            // 2. Update data
            const updatedSubService = await tx.sub_services.update({
            where: { id: subServiceId },
            data: {
                services_id: services_id ? BigInt(services_id) : null,
                sub_services: sub_services.trim()
            }
            });

            // 3. Catat log
            if (userId) {
            await createLog(
                tx,
                userId,
                "Edit Sub Layanan",
                `Mengubah sub layanan ID ${id}: ${existing.sub_services} → ${sub_services}`
            );
            }

            return updatedSubService;
        });

        return res.status(200).json(serialize(result));
        } catch (error) {
        console.error('Error updating sub_service:', error);
        
        if (error.message === "Sub layanan tidak ditemukan") {
            return res.status(404).json({ error: error.message });
        }
        
        return res.status(500).json({ error: "Gagal mengubah data sub layanan" });
        }
    }

    // DELETE: Hapus sub_services
    if (req.method === 'DELETE') {
        const { userId } = req.body;

        try {
        await prisma.$transaction(async (tx) => {
            // 1. Ambil data sebelum dihapus
            const subServiceToDelete = await tx.sub_services.findUnique({
            where: { id: subServiceId }
            });

            if (!subServiceToDelete) {
            throw new Error("Sub layanan tidak ditemukan");
            }

            // 2. Hapus data
            await tx.sub_services.delete({
            where: { id: subServiceId }
            });

            // 3. Catat log
            if (userId) {
            await createLog(
                tx,
                userId,
                "Hapus Sub Layanan",
                `Menghapus sub layanan: ${subServiceToDelete.sub_services} (ID: ${id})`
            );
            }
        });

        return res.status(200).json({ 
            success: true,
            message: 'Sub layanan berhasil dihapus' 
        });
        } catch (error) {
        console.error('Error deleting sub_service:', error);
        
        if (error.message === "Sub layanan tidak ditemukan") {
            return res.status(404).json({ error: error.message });
        }
        
        return res.status(500).json({ error: "Gagal menghapus sub layanan" });
        }
    }

    return res.status(405).json({ error: "Method tidak diizinkan" });
}
