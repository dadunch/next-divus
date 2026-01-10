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
      // B. Konfigurasi Formidable (Default ke Temp Dir OS yang writable di Vercel)
      const form = new IncomingForm({
        keepExtensions: true,
        maxFileSize: 20 * 1024 * 1024, // Limit 20MB
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

      // Helper Imports (Dynamic Import agar tidak error di build time jika file belum ada)
      const { uploadToSupabase, deleteFromSupabase } = await import('../../lib/upload-service');

      // Debug: Log environment status (dihapus setelah confirm jalan)
      console.log('🔍 Supabase Config Check:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      });

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

        // 2. Handle Logo Upload (Supabase)
        if (newLogo) {
          try {
            // Upload ke Supabase
            const logoUrl = await uploadToSupabase(newLogo, 'uploads', 'company');

            // Validasi URL (harus lengkap, bukan hanya nama file)
            if (!logoUrl || !logoUrl.startsWith('http')) {
              throw new Error(`❌ Upload returned invalid URL: ${logoUrl}`);
            }

            dataToSave.logo_url = logoUrl;
            console.log('✅ Logo uploaded successfully:', logoUrl);

            // Hapus logo lama dari Supabase jika ada
            if (existingData?.logo_url && existingData.logo_url.startsWith('http')) {
              await deleteFromSupabase(existingData.logo_url, 'uploads');
            }
          } catch (uploadError) {
            console.error('❌ Logo upload FAILED:', uploadError);
            throw new Error(`Gagal upload logo: ${uploadError.message}`);
          }
        }

        // 3. Handle Document Upload (Supabase)
        if (newDoc) {
          try {
            // Upload ke Supabase
            const docUrl = await uploadToSupabase(newDoc, 'uploads', 'docs');

            // Validasi URL (harus lengkap, bukan hanya nama file)
            if (!docUrl || !docUrl.startsWith('http')) {
              throw new Error(`❌ Upload returned invalid URL: ${docUrl}`);
            }

            dataToSave.file_url = docUrl;
            console.log('✅ Document uploaded successfully:', docUrl);

            // Hapus doc lama
            if (existingData?.file_url && existingData.file_url.startsWith('http')) {
              await deleteFromSupabase(existingData.file_url, 'uploads');
            }
          } catch (uploadError) {
            console.error('❌ Document upload FAILED:', uploadError);
            throw new Error(`Gagal upload dokumen: ${uploadError.message}`);
          }
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