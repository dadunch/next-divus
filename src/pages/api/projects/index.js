import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
  
  // === GET METHOD: Untuk Menampilkan Data di Halaman User & Admin ===
  if (req.method === 'GET') {
    try {
      const projects = await prisma.projects.findMany({
        orderBy: { id: 'desc' }, // Urutkan dari yang terbaru
        include: {
          client: true,   // PENTING: Ambil data nama Client
          category: true  // PENTING: Ambil data nama Bidang (Category)
        }
      });

      // Solusi BigInt: Mengubah semua BigInt jadi String agar tidak error di browser
      const safeProjects = JSON.parse(JSON.stringify(projects, (key, value) =>
        typeof value === 'bigint'
          ? value.toString() 
          : value
      ));

      return res.status(200).json(safeProjects);
    } catch (error) {
      console.error("GET Projects Error:", error);
      return res.status(500).json({ error: "Gagal mengambil data proyek" });
    }
  }

  // === POST METHOD: Untuk Admin Menambah Proyek (Kode Asli Kamu) ===
  if (req.method === 'POST') {
    const { project_name, client_id, category_id, tahun, userId } = req.body; 
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        const newProject = await tx.projects.create({
          data: {
            project_name,
            tahun: BigInt(tahun),
            client_id: BigInt(client_id),
            category_id: BigInt(category_id)
          }
        });

        // Catat log aktivitas jika ada userId
        if (userId) {
            await createLog(tx, userId, "Tambah Proyek", `Menambahkan proyek: ${project_name}`);
        }
        
        return newProject;
      });

      return res.status(201).json(serialize(result));
    } catch (error) {
      console.error("POST Project Error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}