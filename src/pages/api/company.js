// src/pages/api/company.js

import prisma from '../../lib/prisma';
import { serialize } from '../../lib/utils';
import { createLog } from '../../lib/logger';
import { IncomingForm } from 'formidable';
import { setCachePreset } from '../../lib/cache-headers';
import { limiter } from '../../lib/rate-limit'; // Import utility rate limit

// === KONFIGURASI WAJIB ===
export const config = {
  api: {
    bodyParser: false, // Matikan body parser agar formidable bekerja
  },
};

export default async function handler(req, res) {
  const { method } = req;

  // ============================================================
  // 1. IMPLEMENTASI THROTTLE (RATE LIMITING)
  // ============================================================
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // GET: 30 kali per menit (Data profil sering diakses publik)
    // PUT: 2 kali per menit (Sangat ketat karena ada proses Upload & Delete Storage)
    const limit = method === 'GET' ? 30 : 2;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Permintaan terlalu cepat. Silakan tunggu 1 menit untuk melakukan perubahan profil lagi.' 
    });
  }

  // --- 1. GET: Ambil Data Profile ---
  if (method === 'GET') {
    try {
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
      const form = new IncomingForm({
        keepExtensions: true,
        maxFileSize: 20 * 1024 * 1024, // Limit 20MB
      });

      const data = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

      const getField = (f) => Array.isArray(f) ? f[0] : f;
      const getFile = (f) => Array.isArray(f) ? f[0] : f;

      const company_name = getField(data.fields.company_name);
      const description = getField(data.fields.description);
      const address = getField(data.fields.address);
      const email = getField(data.fields.email);
      const phone = getField(data.fields.phone);
      const business_field = getField(data.fields.business_field);
      const established_date = getField(data.fields.established_date);
      const userId = getField(data.fields.userId);

      const newLogo = getFile(data.files.logo_url);
      const newDoc = getFile(data.files.file_url);

      const { uploadToSupabase, deleteFromSupabase } = await import('../../lib/upload-service');

      const result = await prisma.$transaction(async (tx) => {
        const existingData = await tx.company_profile.findFirst();

        let dataToSave = {
          company_name: company_name || "",
          description: description || "",
          address: address || "",
          email: email || "",
          phone: phone || "",
          business_field: business_field || "",
          established_date: established_date ? new Date(established_date) : undefined,
        };

        // Handle Logo Upload
        if (newLogo) {
          const logoUrl = await uploadToSupabase(newLogo, 'uploads', 'company');
          if (!logoUrl || !logoUrl.startsWith('http')) {
            throw new Error(`Upload returned invalid URL: ${logoUrl}`);
          }
          dataToSave.logo_url = logoUrl;
          if (existingData?.logo_url && existingData.logo_url.startsWith('http')) {
            await deleteFromSupabase(existingData.logo_url, 'uploads');
          }
        }

        // Handle Document Upload
        if (newDoc) {
          const docUrl = await uploadToSupabase(newDoc, 'uploads', 'docs');
          if (!docUrl || !docUrl.startsWith('http')) {
            throw new Error(`Upload returned invalid URL: ${docUrl}`);
          }
          dataToSave.file_url = docUrl;
          if (existingData?.file_url && existingData.file_url.startsWith('http')) {
            await deleteFromSupabase(existingData.file_url, 'uploads');
          }
        }

        let updatedProfile;
        if (existingData) {
          updatedProfile = await tx.company_profile.update({
            where: { id: existingData.id },
            data: dataToSave
          });
        } else {
          if (!dataToSave.established_date) dataToSave.established_date = new Date();
          updatedProfile = await tx.company_profile.create({
            data: dataToSave
          });
        }

        if (userId) {
          await createLog(tx, BigInt(userId), "Edit Perusahaan", `Memperbarui profil perusahaan`);
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