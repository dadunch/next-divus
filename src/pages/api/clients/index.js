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
        include: { projects: true },
        orderBy: { id: 'desc' }
      });
      return res.status(200).json(serialize(clients));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // === POST: Tambah Client Baru (Upload File) ===
  if (req.method === 'POST') {
    try {
      // 1. Konfigurasi Upload
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'client');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const form = new IncomingForm({
        uploadDir: uploadDir,      
        keepExtensions: true,     
        maxFileSize: 5 * 1024 * 1024, 
        filename: (name, ext, part, form) => {
          const cleanName = part.originalFilename.replace(/\s+/g, '_');
          return `${Date.now()}_${cleanName}`;
        }
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
        // Jika gagal, hapus file yang terlanjur ter-upload 
        if (file) fs.unlinkSync(file.filepath);
        return res.status(400).json({ message: 'Nama Client dan Logo wajib diisi' });
      }

      // Path yang akan disimpan di DB (URL akses publik)
      const logoPathInDb = `/uploads/client/${file.newFilename}`;

      // 4. Simpan ke Database (Transaction)
      const result = await prisma.$transaction(async (tx) => {
        
        // A. Create Client
        const newClient = await tx.client.create({
          data: { 
            client_name: client_name, 
            client_logo: logoPathInDb 
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