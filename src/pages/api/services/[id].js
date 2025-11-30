import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';
import { IncomingForm } from 'formidable';
import path from 'path';
import fs from 'fs-extra';

// Disable default body parser untuk handle file upload
export const config = {
  api: {
    bodyParser: false, // Matikan default body parser
  },
};

export default async function handler(req, res) {
  const { id } = req.query;
  const serviceId = BigInt(id);

  // --- GET: AMBIL DATA DETAIL LAYANAN ---
  if (req.method === 'GET') {
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

  // PUT (Edit - DENGAN FILE UPLOAD)
  if (req.method === 'PUT') {
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
      const existingImageUrl = Array.isArray(fields.existingImageUrl) ? fields.existingImageUrl[0] : fields.existingImageUrl;

      // Ambil Path Gambar Baru (jika ada upload baru)
      let dbImageUrl = existingImageUrl || null; // Default: gunakan gambar lama
      
      const uploadedFile = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null;

      if (uploadedFile) {
        // Ada file baru yang diupload
        dbImageUrl = `/uploads/products/${uploadedFile.newFilename}`;
        
        // Hapus file lama jika ada dan berbeda
        if (existingImageUrl && existingImageUrl !== dbImageUrl) {
          try {
            const oldFilePath = path.join(process.cwd(), 'public', existingImageUrl);
            if (await fs.pathExists(oldFilePath)) {
              await fs.remove(oldFilePath);
              console.log(`Deleted old image: ${existingImageUrl}`);
            }
          } catch (err) {
            console.error("Error deleting old image:", err);
            // Tidak perlu throw error, lanjut saja
          }
        }
      }

      // === UPDATE DATABASE ===
      const result = await prisma.$transaction(async (tx) => {
        const updateData = { 
          title, 
          description, 
          short_description, 
          icon_url,
          image_url: dbImageUrl
        };

        const updatedService = await tx.services.update({
          where: { id: serviceId },
          data: updateData
        });

        // Catat Log
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

  // DELETE (Hapus - PERLU LOG + HAPUS FILE)
  if (req.method === 'DELETE') {
    // Parse body untuk ambil userId
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString());
    const { userId } = body;

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Ambil data dulu sebelum dihapus
        const serviceToDelete = await tx.services.findUnique({ 
          where: { id: serviceId } 
        });
        
        // 2. Hapus file gambar jika ada
        if (serviceToDelete?.image_url) {
          try {
            const filePath = path.join(process.cwd(), 'public', serviceToDelete.image_url);
            if (await fs.pathExists(filePath)) {
              await fs.remove(filePath);
              console.log(`Deleted image: ${serviceToDelete.image_url}`);
            }
          } catch (err) {
            console.error("Error deleting image file:", err);
          }
        }
        
        // 3. Hapus Data dari Database
        await tx.services.delete({ where: { id: serviceId } });

        // 4. Catat Log
        const detailText = serviceToDelete 
          ? `Menghapus layanan: ${serviceToDelete.title}` 
          : `Menghapus layanan ID: ${id}`;
        
        const uid = userId ? parseInt(userId) : null;
        if (uid) {
          await createLog(tx, uid, "Hapus Layanan", detailText);
        }
      });

      return res.status(200).json({ message: 'Berhasil dihapus' });
      
    } catch (error) {
      console.error("Error deleting service:", error);
      return res.status(500).json({ error: "Gagal menghapus data" });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}