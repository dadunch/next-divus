// src/pages/api/clients/index.js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { IncomingForm } from 'formidable';
import { limiter } from '../../../lib/rate-limit'; // Import limiter

// PENTING: Matikan body parser bawaan Next.js agar formidable bisa bekerja
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  // ============================================================
  // 1. IMPLEMENTASI THROTTLE (RATE LIMITING)
  // ============================================================
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // GET: 30 kali per menit (untuk navigasi dashboard)
    // POST: 3 kali per menit (sangat ketat karena melibatkan proses Upload Storage)
    const limit = method === 'GET' ? 30 : 3;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Aktivitas terlalu cepat. Untuk melindungi penyimpanan server, silakan tunggu 1 menit.' 
    });
  }

  // === GET: Ambil Data Client ===
  if (method === 'GET') {
    try {
      const clients = await prisma.client.findMany({
        select: {
          id: true,
          client_name: true,
          client_logo: true,
          _count: {
            select: { projects: true }
          }
        },
        orderBy: { id: 'desc' }
      });

      const formattedClients = clients.map(client => ({
        ...client,
        project_count: client._count.projects,
        projects: [] 
      }));

      return res.status(200).json(serialize(formattedClients));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // === POST: Tambah Client Baru (Upload File) ===
  if (method === 'POST') {
    try {
      // 1. Konfigurasi Form
      const form = new IncomingForm({
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // Limit 5MB
      });

      // 2. Parsing Form Data (Promise Wrapper)
      const data = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

      const getField = (f) => Array.isArray(f) ? f[0] : f;
      const getFile = (f) => Array.isArray(f) ? f[0] : f;

      const client_name = getField(data.fields.client_name);
      const userId = getField(data.fields.userId);
      const file = getFile(data.files.client_logo);

      if (!client_name || !file) {
        return res.status(400).json({ message: 'Nama Client dan Logo wajib diisi' });
      }

      // 3. Upload ke Supabase (Upload Service)
      const { uploadToSupabase } = await import('../../../lib/upload-service');

      let logoUrl;
      try {
        logoUrl = await uploadToSupabase(file, 'uploads', 'client');

        if (!logoUrl || !logoUrl.startsWith('http')) {
          throw new Error('Upload failed: Invalid URL returned');
        }
      } catch (uploadError) {
        console.error('Client logo upload failed:', uploadError);
        return res.status(500).json({ error: `Gagal upload logo: ${uploadError.message}` });
      }

      // 4. Simpan ke Database (Transaction)
      const result = await prisma.$transaction(async (tx) => {
        const newClient = await tx.client.create({
          data: {
            client_name: client_name,
            client_logo: logoUrl
          }
        });

        if (userId) {
          await tx.activity_logs.create({
            data: {
              user_id: BigInt(userId),
              action: 'Tambah Client',
              details: `Menambahkan Mitra/Client baru: ${client_name}`
            }
          });
        }

        return newClient;
      });

      return res.status(201).json(serialize(result));

    } catch (error) {
      console.error("Error create client:", error);
      return res.status(500).json({ error: error.message || "Gagal mengupload data" });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}