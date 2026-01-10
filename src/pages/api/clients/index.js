import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { IncomingForm } from 'formidable'; // Library untuk handle upload
import fs from 'fs';
import path from 'path';

// PENTING: Matikan body parser bawaan Next.js agar formidable bisa bekerja
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // === GET: Ambil Data Client ===
  if (req.method === 'GET') {
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

      // Map result to flatten structure for frontend
      const formattedClients = clients.map(client => ({
        ...client,
        project_count: client._count.projects,
        projects: [] // Keep empty array to preventing strict crashes if accessed elsewhere, or remove if confident
      }));

      return res.status(200).json(serialize(formattedClients));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // === POST: Tambah Client Baru (Upload File) ===
  if (req.method === 'POST') {
    try {
      // 1. Konfigurasi Form (tanpa uploadDir, pakai temp OS)
      const form = new IncomingForm({
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024,
      });

      // 2. Parsing Form Data (Promise Wrapper)
      const data = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

      // 3. Ambil Data dari Formidable
      const getField = (f) => Array.isArray(f) ? f[0] : f;
      const getFile = (f) => Array.isArray(f) ? f[0] : f;

      const client_name = getField(data.fields.client_name);
      const userId = getField(data.fields.userId);
      const file = getFile(data.files.client_logo);

      // Validasi sederhana
      if (!client_name || !file) {
        return res.status(400).json({ message: 'Nama Client dan Logo wajib diisi' });
      }

      // 4. Upload ke Supabase
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

      // 5. Simpan ke Database (Transaction)
      const result = await prisma.$transaction(async (tx) => {

        // A. Create Client
        const newClient = await tx.client.create({
          data: {
            client_name: client_name,
            client_logo: logoUrl
          }
        });

        // B. Buat Log Aktivitas
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

  // Method Not Allowed
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}