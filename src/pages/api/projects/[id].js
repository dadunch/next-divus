// src/pages/api/projects/[id].js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

export default async function handler(req, res) {
  const { id } = req.query;


  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasi: Maksimal 10 request per menit untuk aksi modifikasi proyek
    // Aksi PUT dan DELETE cukup berat karena melibatkan relasi database
    await limiter.check(res, 10, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Aktivitas terlalu cepat. Silakan tunggu sebentar sebelum mencoba lagi.' 
    });
  }

  // Validasi ID dari URL
  if (!id) {
    return res.status(400).json({ error: "ID Project tidak ditemukan di URL" });
  }

  const projectId = BigInt(id);

  // ============================================================
  // METHOD: PUT (Update Data Proyek)
  // ============================================================
  if (req.method === 'PUT') {
    const { project_name, client_id, category_id, tahun, userId } = req.body;

    // 1. Validasi Input Wajib
    if (!project_name || !client_id || !category_id || !tahun) {
      return res.status(400).json({ 
        error: "Data tidak lengkap. Pastikan Nama Proyek, Kategori, Client, dan Tahun terisi." 
      });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 2. Update Database
        const updated = await tx.projects.update({
          where: { id: projectId },
          data: { 
            project_name, 
            tahun: Number(tahun), 
            client_id: BigInt(client_id), 
            category_id: BigInt(category_id) 
          }
        });

        // 3. Catat Log Aktivitas
        if (userId) {
          await tx.activity_logs.create({
            data: {
              user_id: BigInt(userId),
              action: "Edit Proyek",
              details: `Update proyek: ${project_name} (Tahun: ${tahun})`
            }
          });
        }
        return updated;
      });

      return res.status(200).json(serialize(result));

    } catch (error) {
      console.error("API PUT Error:", error);
      return res.status(500).json({ error: "Gagal menyimpan perubahan", details: error.message });
    }
  }

  // ============================================================
  // METHOD: DELETE (Hapus Data Proyek)
  // ============================================================
  if (req.method === 'DELETE') {
    const { userId } = req.query; 

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Cek Data Lama
        const projectToDelete = await tx.projects.findUnique({ 
            where: { id: projectId } 
        });

        if (!projectToDelete) {
            throw new Error("Proyek tidak ditemukan");
        }
        
        // 2. Hapus Data
        await tx.projects.delete({ 
            where: { id: projectId } 
        });

        // 3. Catat Log
        if (userId) {
             await tx.activity_logs.create({
                data: {
                    user_id: BigInt(userId),
                    action: "Hapus Proyek",
                    details: `Menghapus proyek: ${projectToDelete.project_name}`
                }
            });
        }
      });

      return res.status(200).json({ message: 'Proyek berhasil dihapus' });

    } catch (error) {
      console.error("API DELETE Error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Method selain PUT dan DELETE tidak diizinkan
  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}