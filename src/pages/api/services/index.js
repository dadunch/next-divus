import { IncomingForm } from 'formidable';
import path from 'path';
import fs from 'fs-extra'; // Pastikan install: npm install fs-extra
import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';

// 1. CONFIG: Matikan Body Parser bawaan Next.js (WAJIB untuk upload file)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  
  // --- GET: AMBIL DATA (Logika Tetap Sama) ---
  // if (req.method === 'GET') {
  //   try {
  //     const services = await prisma.services.findMany({
  //       orderBy: { created_at: 'desc' }
  //       // select: {
  //       //   id: true,
  //       //   title: true,
  //       //   slug: true,
  //       //   icon_url: true, // Pastikan nama kolom di DB sesuai (icon_url atau icon_class?)
  //       //   image_url: true,
  //       //   description: true
  //       // }
  //     });
  //     return res.status(200).json(serialize(services));
  //   } catch (error) {
  //     return res.status(500).json({ error: "Gagal mengambil data layanan" });
  //   }
  // }

  if (req.method === 'GET') {
    try {
      const services = await prisma.services.findMany({ orderBy: { created_at: 'desc' } });
      return res.status(200).json(serialize(services));
    } catch (error) {
      return res.status(500).json({ error: "Gagal mengambil data layanan" });
    }
  }

  // --- POST: TAMBAH LAYANAN (LOGIKA BARU DENGAN FORMIDABLE) ---
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

      // Ambil Data Text (Formidable v3 mengembalikan array, jadi ambil index 0)
      // Gunakan '||' untuk jaga-jaga jika formatnya string langsung
      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const icon_class = Array.isArray(fields.icon_class) ? fields.icon_class[0] : fields.icon_class;
      const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

      // Ambil Path Gambar
      let dbImageUrl = null;
      // Cek apakah ada file yang diupload dengan key 'image'
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
            icon_url: icon_class, // Sesuaikan dengan nama kolom DB Anda
            image_url: dbImageUrl // Simpan path gambar (/uploads/products/...)
          }
        });

        // Catat Log Aktivitas
        // Konversi userId ke BigInt atau Int sesuai tipe data DB Anda
        const uid = userId ? parseInt(userId) : null; 
        if(uid) {
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