import { IncomingForm } from 'formidable';
import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';
import { setCachePreset } from '../../../lib/cache-headers';

// CONFIG: Matikan Body Parser bawaan Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {

  // --- GET: AMBIL DATA ---
  if (req.method === 'GET') {
    try {
      // Set cache: 5 menit fresh, 1 jam stale-while-revalidate
      setCachePreset(res, 'MEDIUM');

      const services = await prisma.services.findMany({
        orderBy: { created_at: 'desc' },
        include: { sub_services: true } // Pastikan relasi ini ada di model services
      });
      return res.status(200).json(serialize(services));
    } catch (error) {
      console.error("Error getting services:", error);
      return res.status(500).json({ error: "Gagal mengambil data layanan" });
    }
  }

  // --- POST: TAMBAH LAYANAN ---
  if (req.method === 'POST') {

    // B. Konfigurasi Formidable
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    try {
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      // 1. AMBIL DATA TEXT
      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const short_description = Array.isArray(fields.short_description) ? fields.short_description[0] : fields.short_description;
      const icon_url = Array.isArray(fields.icon_url) ? fields.icon_url[0] : fields.icon_url;
      const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

      // Ambil string JSON sub services
      const subServicesString = Array.isArray(fields.sub_services_data) ? fields.sub_services_data[0] : fields.sub_services_data;

      // 2. PARSING JSON -> ARRAY
      let subServicesData = [];
      if (subServicesString) {
        try {
          subServicesData = JSON.parse(subServicesString);
        } catch (e) {
          console.error("Gagal parse sub_services:", e);
          subServicesData = [];
        }
      }

      // 3. AMBIL GAMBAR & UPLOAD KE SUPABASE
      let dbImageUrl = null;
      const uploadedFile = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null;

      const { uploadToSupabase } = await import('../../../lib/upload-service');

      if (uploadedFile) {
        dbImageUrl = await uploadToSupabase(uploadedFile, 'uploads', 'services');
      }

      // 4. BUAT SLUG
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

      // === PROSES DATABASE ===
      const result = await prisma.$transaction(async (tx) => {

        const newService = await tx.services.create({
          data: {
            title,
            slug,
            description,
            short_description: short_description || '',
            icon_url: icon_url || '',
            image_url: dbImageUrl,

            // --- PERBAIKAN DI SINI ---
            sub_services: {
              create: subServicesData.map((item) => ({
                // Sesuai schema: sub_services String
                sub_services: item
              }))
            }
          }
        });

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