import prisma from '../../lib/prisma';
import { serialize } from '../../lib/utils';
import { createLog } from '../../lib/logger';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { setCachePreset } from '../../lib/cache-headers';

// === KONFIGURASI WAJIB ===
export const config = {
  api: {
    bodyParser: false, // Matikan body parser agar formidable bekerja
  },
};

export default async function handler(req, res) {
  const { method } = req;

  // --- 1. GET: Ambil Data Profile ---
  if (method === 'GET') {
    try {
      // Cache 1 jam (data jarang berubah)
      setCachePreset(res, 'STATIC');

      const profile = await prisma.company_profile.findFirst();
      return res.status(200).json(serialize(profile) || {});
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- 2. PUT: Update/Create Data Profile & Upload ---
  if (method === 'PUT') {
    try {
      // A. Siapkan Folder Upload
      const logoDir = path.join(process.cwd(), 'public', 'uploads', 'company');
      const docDir = path.join(process.cwd(), 'public', 'uploads', 'docs');

      if (!fs.existsSync(logoDir)) fs.mkdirSync(logoDir, { recursive: true });
      if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });

      // B. Konfigurasi Formidable
      const form = new IncomingForm({
        uploadDir: logoDir, // Default dir (nanti kita pindah jika itu dokumen)
        keepExtensions: true,
        maxFileSize: 20 * 1024 * 1024, // Limit 20MB (untuk PDF besar)
        filename: (name, ext, part) => {
          const cleanName = part.originalFilename.replace(/\s+/g, '_');
          return `${Date.now()}_${cleanName}`;
        }
      });

      // C. Parse Request
      const data = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

      // Helper function untuk ambil value
      const getField = (f) => Array.isArray(f) ? f[0] : f;
      const getFile = (f) => Array.isArray(f) ? f[0] : f;

      // Ambil Fields Text
      const company_name = getField(data.fields.company_name);
      const description = getField(data.fields.description);
      const address = getField(data.fields.address);
      const email = getField(data.fields.email);
      const phone = getField(data.fields.phone);
      const business_field = getField(data.fields.business_field);
      const established_date = getField(data.fields.established_date);
      const userId = getField(data.fields.userId);

      // Ambil Files
      const newLogo = getFile(data.files.logo_url);
      const newDoc = getFile(data.files.file_url);

      // D. Transaction Database
      const result = await prisma.$transaction(async (tx) => {

        // 1. Cek Data Lama
        const existingData = await tx.company_profile.findFirst();

        // Object data yang akan disimpan
        let dataToSave = {
          company_name: company_name || "",
          description: description || "",
          address: address || "",
          email: email || "",
          phone: phone || "",
          business_field: business_field || "",
          established_date: established_date ? new Date(established_date) : undefined,
        };

        // 2. Handle Logo Upload
        if (newLogo) {
          // Hapus logo lama jika ada
          if (existingData?.logo_url) {
            const oldPath = path.join(process.cwd(), 'public', existingData.logo_url);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          dataToSave.logo_url = `/uploads/company/${newLogo.newFilename}`;
        }

        // 3. Handle Document Upload (Pindahkan ke folder docs)
        if (newDoc) {
          // Pindahkan file dari folder default (company) ke folder docs agar rapi
          const oldPathTemp = newDoc.filepath;
          const newFileName = newDoc.newFilename;
          const newPath = path.join(docDir, newFileName);

          // Rename/Move file
          fs.renameSync(oldPathTemp, newPath);

          // Hapus doc lama jika ada
          if (existingData?.file_url) {
            const oldDocPath = path.join(process.cwd(), 'public', existingData.file_url);
            if (fs.existsSync(oldDocPath)) fs.unlinkSync(oldDocPath);
          }

          dataToSave.file_url = `/uploads/docs/${newFileName}`;
        }

        let updatedProfile;

        // 4. Update atau Create
        if (existingData) {
          updatedProfile = await tx.company_profile.update({
            where: { id: existingData.id },
            data: dataToSave
          });
        } else {
          // Tambahkan field wajib untuk create baru jika kosong
          if (!dataToSave.established_date) dataToSave.established_date = new Date();

          updatedProfile = await tx.company_profile.create({
            data: dataToSave
          });
        }

        // 5. Catat Log
        if (userId) {
          await createLog(
            tx,
            BigInt(userId),
            "Edit Perusahaan",
            `Memperbarui profil perusahaan`
          );
        }

        return updatedProfile;
      });

      return res.status(200).json(serialize(result));

    } catch (error) {
      console.error("Update Profile Error:", error);
      return res.status(500).json({ error: "Gagal menyimpan data", details: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}