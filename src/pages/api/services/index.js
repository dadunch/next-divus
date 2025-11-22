// src/pages/api/services/index.js
import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  // GET: Ambil Semua Layanan
  if (req.method === 'GET') {
    try {
      const services = await prisma.services.findMany({
        orderBy: { id: 'asc' }
      });
      return res.status(200).json(serialize(services));
    } catch (error) {
      return res.status(500).json({ error: "Gagal mengambil data" });
    }
  }

  // POST: Tambah Layanan Baru
  if (req.method === 'POST') {
    const { title, description, icon_url } = req.body;
    
    // Buat slug sederhana dari title (contoh: "Web Design" -> "web-design")
    const slug = title.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

    try {
      const newService = await prisma.services.create({
        data: {
          title,
          slug,
          description,
          icon_url
        }
      });
      return res.status(201).json(serialize(newService));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}