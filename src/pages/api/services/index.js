import { IncomingForm } from 'formidable';
import path from 'path';
import fs from 'fs-extra';
import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';

// CONFIG: Matikan Body Parser bawaan Next.js (WAJIB untuk upload file)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  
  // --- GET: AMBIL DATA ---
  if (req.method === 'GET') {
    try {
      const services = await prisma.services.findMany({ 
        orderBy: { created_at: 'desc' } 
      });
      return res.status(200).json(serialize(services));
    } catch (error) {
      console.error("Error getting services:", error);
      return res.status(500).json({ error: "Gagal mengambil data layanan" });
    }
  }

  // --- POST: TAMBAH LAYANAN (DENGAN FILE UPLOAD) ---
  if (req.method === 'POST') {
    
    // Siapkan folder upload
    const uploadDir = path.join(process.cwd(), 'public/uploads/products');
    await fs.ensureDir(uploadDir);

    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      filename: (name, ext, part, form) => {
        return part.originalFilename; // Gunakan nama file custom dari Frontend
      }
    });

    try {
      // Parsing Data FormData
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      // Ambil Data Text (Formidable v3 mengembalikan array)
      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const short_description = Array.isArray(fields.short_description) ? fields.short_description[0] : fields.short_description;
      const icon_url = Array.isArray(fields.icon_url) ? fields.icon_url[0] : fields.icon_url;
      const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

      // Ambil Path Gambar
      let dbImageUrl = null;
      const uploadedFile = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null;

      if (uploadedFile) {
        dbImageUrl = `/uploads/products/${uploadedFile.newFilename}`;
      }

      // Buat Slug
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

      // === PROSES DATABASE (PRISMA TRANSACTION) ===
      const result = await prisma.$transaction(async (tx) => {
        // Simpan ke Tabel Services
        const newService = await tx.services.create({
          data: { 
            title, 
            slug, 
            description, 
            short_description: short_description || '',
            icon_url: icon_url || '', // Simpan class icon (fa-solid fa-user)
            image_url: dbImageUrl // Simpan path gambar (/uploads/products/...)
          }
        });

        // Catat Log Aktivitas
        const uid = userId ? parseInt(userId) : null; 
        if (uid) {
          await createLog(tx, uid, "Tambah Layanan", `Menambahkan layanan baru: ${title}`);
        }

        return newService;
      }, {
        maxWait: 5000,
        timeout: 20000 
      });

      return res.status(201).json(serialize(result));

    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({ error: error.message || "Gagal memproses upload" });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}