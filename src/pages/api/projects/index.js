// src/pages/api/projects/index.js
import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  // GET: Ambil Projects + Data Client & Kategori
  if (req.method === 'GET') {
    try {
      const projects = await prisma.projects.findMany({
        include: {
          client: true,   // JOIN ke tabel client
          category: true, // JOIN ke tabel category
        },
        orderBy: { created_at: 'desc' }
      });
      return res.status(200).json(serialize(projects));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST: Tambah Project
  if (req.method === 'POST') {
    const { project_name, client_id, category_id, tahun } = req.body;
    
    try {
      const newProject = await prisma.projects.create({
        data: {
          project_name,
          tahun: BigInt(tahun), // Convert ke BigInt
          client_id: BigInt(client_id), // Convert ID Client ke BigInt
          category_id: BigInt(category_id) // Convert ID Category ke BigInt
        }
      });
      return res.status(201).json(serialize(newProject));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Gagal menambah project. Pastikan Client ID & Category ID valid." });
    }
  }
}