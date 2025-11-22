// src/pages/api/projects/[id].js
import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  const { id } = req.query;
  const projectId = BigInt(id);

  // PUT: Edit Project
  if (req.method === 'PUT') {
    const { project_name, client_id, category_id, tahun } = req.body;
    try {
      const updated = await prisma.projects.update({
        where: { id: projectId },
        data: {
          project_name,
          tahun: BigInt(tahun),
          client_id: BigInt(client_id),
          category_id: BigInt(category_id)
        }
      });
      return res.status(200).json(serialize(updated));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE: Hapus Project
  if (req.method === 'DELETE') {
    try {
      await prisma.projects.delete({ where: { id: projectId } });
      return res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}