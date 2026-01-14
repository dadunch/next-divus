// src/pages/api/services/[id].js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';
import { IncomingForm } from 'formidable';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

// Disable default body parser untuk handle file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // GET: 20 kali per menit (view detail layanan)
    // PUT/DELETE: 3 kali per menit (Sangat ketat karena ada proses Upload/Hapus Storage)
    const limit = method === 'GET' ? 20 : 3;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Terlalu banyak permintaan. Silakan tunggu 1 menit untuk melakukan perubahan lagi.' 
    });
  }

  // Validasi ID
  if (!id) return res.status(400).json({ message: "ID Layanan diperlukan" });
  const serviceId = BigInt(id);

  // --- GET: AMBIL DATA DETAIL LAYANAN ---
  if (method === 'GET') {
    try {
      const service = await prisma.services.findUnique({
        where: { id: serviceId }
      });
      if (!service) {
        return res.status(404).json({ error: "Layanan tidak ditemukan" });
      }
      return res.status(200).json(serialize(service));
    }
    catch (error) {
      console.error("Error getting service:", error);
      return res.status(500).json({ error: "Gagal mengambil data layanan" });
    }
  }

  // --- PUT: EDIT LAYANAN (DENGAN FILE UPLOAD) ---
  if (method === 'PUT') {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
    });

    try {
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const short_description = Array.isArray(fields.short_description) ? fields.short_description[0] : fields.short_description;
      const icon_url = Array.isArray(fields.icon_url) ? fields.icon_url[0] : fields.icon_url;
      const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
      const existingImageUrl = Array.isArray(fields.existingImageUrl) ? fields.existingImageUrl[0] : fields.existingImageUrl;

      let dbImageUrl = existingImageUrl || null;
      const uploadedFile = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null;

      if (uploadedFile) {
        const { uploadToSupabase, deleteFromSupabase } = await import('../../../lib/upload-service');

        try {
          dbImageUrl = await uploadToSupabase(uploadedFile, 'uploads', 'services');

          if (!dbImageUrl || !dbImageUrl.startsWith('http')) {
            throw new Error('Upload failed: Invalid URL');
          }

          if (existingImageUrl && existingImageUrl.startsWith('http') && existingImageUrl !== dbImageUrl) {
            await deleteFromSupabase(existingImageUrl, 'uploads');
          }
        } catch (uploadError) {
          console.error('Service image upload failed:', uploadError);
          return res.status(500).json({ error: `Gagal upload gambar: ${uploadError.message}` });
        }
      }

      const result = await prisma.$transaction(async (tx) => {
        const updateData = {
          title,
          description,
          short_description: short_description || '',
          icon_url: icon_url || '',
          image_url: dbImageUrl
        };

        const updatedService = await tx.services.update({
          where: { id: serviceId },
          data: updateData
        });

        const uid = userId ? parseInt(userId) : null;
        if (uid) {
          await createLog(tx, uid, "Edit Layanan", `Mengubah layanan ID ${id}: ${title}`);
        }

        return updatedService;
      });

      return res.status(200).json(serialize(result));

    } catch (error) {
      console.error("Error updating service:", error);
      return res.status(500).json({ error: error.message || "Gagal update data" });
    }
  }

  // --- DELETE: HAPUS LAYANAN ---
  if (method === 'DELETE') {
    try {
      // Stream helper untuk parsing JSON body karena bodyParser dimatikan
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString();
      const body = rawBody ? JSON.parse(rawBody) : {};
      const { userId } = body;

      await prisma.$transaction(async (tx) => {
        const serviceToDelete = await tx.services.findUnique({
          where: { id: serviceId }
        });

        if (serviceToDelete?.image_url && serviceToDelete.image_url.startsWith('http')) {
          try {
            const { deleteFromSupabase } = await import('../../../lib/upload-service');
            await deleteFromSupabase(serviceToDelete.image_url, 'uploads');
          } catch (err) {
            console.error("Error deleting image from Supabase:", err);
          }
        }

        await tx.services.delete({ where: { id: serviceId } });

        const uid = userId ? parseInt(userId) : null;
        if (uid) {
          await createLog(tx, uid, "Hapus Layanan", `Menghapus layanan: ${serviceToDelete?.title}`);
        }
      });

      return res.status(200).json({ message: 'Berhasil dihapus' });

    } catch (error) {
      console.error("Error deleting service:", error);
      return res.status(500).json({ error: "Gagal menghapus data" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}