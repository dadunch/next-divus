import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';

export default async function handler(req, res) {
  if (req.method === 'GET') { /* ...kode get lama... */ }

  if (req.method === 'POST') {
    const { project_name, client_id, category_id, tahun, userId } = req.body; // Ambil userId
    
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

        await createLog(tx, userId, "Tambah Proyek", `Menambahkan proyek: ${project_name}`);
        return newProject;
      });

      return res.status(201).json(serialize(result));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}