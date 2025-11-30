
import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
  // GET: Ambil semua data sub_services
    if (req.method === 'GET') {
        try {
        const subServices = await prisma.sub_services.findMany({
            orderBy: { id: 'desc' }
        });
        
        return res.status(200).json(serialize(subServices));
        } catch (error) {
        console.error('Error fetching sub_services:', error);
        return res.status(500).json({ error: "Gagal mengambil data sub layanan" });
        }
    }

    // POST: Tambah sub_services baru
    if (req.method === 'POST') {
        const { services_id, sub_services, userId } = req.body;

        // Validasi input
        if (!sub_services || !sub_services.trim()) {
        return res.status(400).json({ error: "Nama sub layanan harus diisi" });
        }

        try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Buat data baru
            const newSubService = await tx.sub_services.create({
            data: {
                services_id: services_id ? BigInt(services_id) : null,
                sub_services: sub_services.trim()
            }
            });

            // 2. Catat log
            if (userId) {
            await createLog(
                tx,
                userId,
                "Tambah Sub Layanan",
                `Menambahkan sub layanan: ${sub_services}`
            );
            }

            return newSubService;
        });

        return res.status(201).json(serialize(result));
        } catch (error) {
        console.error('Error creating sub_service:', error);
        return res.status(500).json({ error: "Gagal menambahkan sub layanan" });
        }
    }

    return res.status(405).json({ error: "Method tidak diizinkan" });
}