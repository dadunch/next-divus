import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  const { id } = req.query;
  const projectId = BigInt(id);

  // PUT (Edit)
  if (req.method === 'PUT') {
    const { project_name, client_id, category_id, tahun, userId } = req.body;
    try {
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.projects.update({
          where: { id: projectId },
          data: { project_name, tahun: BigInt(tahun), client_id: BigInt(client_id), category_id: BigInt(category_id) }
        });

        if (userId) {
          await tx.activity_logs.create({
            data: {
              user_id: BigInt(userId),
              action: "Edit Proyek",
              details: `Update proyek: ${project_name}`
            }
          });
        }
        return updated;
      });
      return res.status(200).json(serialize(result));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE (Hapus)
  if (req.method === 'DELETE') {
    const { userId } = req.body; // 1. Tangkap userId

    try {
      await prisma.$transaction(async (tx) => {
        // 2. Cari data dulu
        const projectToDelete = await tx.projects.findUnique({ where: { id: projectId } });
        
        // 3. Hapus
        await tx.projects.delete({ where: { id: projectId } });

        // 4. Catat Log
        if (userId) {
             await tx.activity_logs.create({
                data: {
                    user_id: BigInt(userId),
                    action: "Hapus Proyek",
                    details: `Menghapus proyek: ${projectToDelete?.project_name || 'Unknown'}`
                }
            });
        }
      });
      return res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}