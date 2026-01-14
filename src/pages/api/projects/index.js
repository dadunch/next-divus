// src/pages/api/projects/index.js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';
import { setCacheHeaders } from '../../../lib/cache-headers';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

export default async function handler(req, res) {
  const { method } = req;

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // GET: 30 kali per menit (karena daftar proyek sering diakses pengunjung)
    // POST: 5 kali per menit (untuk membatasi admin/bot menambah data masal)
    const limit = method === 'GET' ? 30 : 5;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Permintaan terlalu padat. Silakan tunggu satu menit sebelum mencoba kembali.' 
    });
  }

  // === GET METHOD: Untuk Menampilkan Data di Halaman User & Admin ===
  if (method === 'GET') {
    try {
      // Cache 10 menit fresh, 1 jam stale-while-revalidate
      setCacheHeaders(res, 600, 3600);

      const { limit } = req.query;

      const queryOptions = {
        orderBy: { id: 'desc' },
        include: {
          client: {
            select: { client_name: true } // Optimize: Only fetch client name
          },
          category: {
            select: { bidang: true }       // Optimize: Only fetch category name
          }
        }
      };

      // Handle limit safely
      if (limit) {
        const parsedLimit = parseInt(limit);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          queryOptions.take = parsedLimit;
        }
      }

      const projects = await prisma.projects.findMany(queryOptions);

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

  // === POST METHOD: Untuk Admin Menambah Proyek ===
  if (method === 'POST') {
    const { project_name, client_id, category_id, tahun, userId } = req.body;

    // Validasi input minimal
    if (!project_name || !client_id || !category_id) {
        return res.status(400).json({ error: "Data proyek tidak lengkap" });
    }

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

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${method} not allowed` });
}