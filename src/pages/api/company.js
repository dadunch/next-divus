import prisma from '../../lib/prisma';
import { serialize } from '../../lib/utils';
import { createLog } from '../../lib/logger';

// --- KONFIGURASI LIMIT UKURAN DATA ---
// Tambahkan ini agar bisa upload gambar Base64 yang besar (hingga 10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', 
    },
  },
};

export default async function handler(req, res) {
  // --- 1. GET: Ambil Data Profile ---
  if (req.method === 'GET') {
    try {
      const profile = await prisma.company_profile.findFirst();
      // Return object kosong jika belum ada data, biar frontend tidak error null
      return res.status(200).json(serialize(profile) || {});
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- 2. PUT: Update/Create Data Profile ---
  if (req.method === 'PUT') {
    const { 
      id, 
      company_name, 
      description, 
      address, 
      email, 
      phone, 
      business_field, 
      established_date, 
      logo_url,
      userId 
    } = req.body;

    try {
      const result = await prisma.$transaction(async (tx) => {
        
        // A. Cek apakah data sudah ada?
        const existingData = await tx.company_profile.findFirst();
        
        let updatedProfile;

        if (existingData) {
            // JIKA ADA -> UPDATE
            updatedProfile = await tx.company_profile.update({
                where: { id: existingData.id },
                data: {
                    company_name,
                    description,
                    address,
                    email,
                    phone,
                    business_field,
                    established_date: established_date ? new Date(established_date) : undefined,
                    logo_url
                }
            });
        } else {
            // JIKA KOSONG -> CREATE BARU
            updatedProfile = await tx.company_profile.create({
                data: {
                    company_name: company_name || "Nama Perusahaan",
                    description: description || "",
                    address: address || "",
                    email: email || "",
                    phone: phone || "",
                    business_field: business_field || "",
                    established_date: established_date ? new Date(established_date) : new Date(),
                    logo_url: logo_url || ""
                }
            });
        }

        // B. Catat Log Aktivitas
        if (userId) {
            await createLog(
                tx, 
                userId, 
                "Edit Perusahaan", 
                `Memperbarui informasi profil perusahaan`
            );
        }

        return updatedProfile;
      });

      return res.status(200).json(serialize(result));

    } catch (error) {
      console.error("Update Company Error:", error);
      return res.status(500).json({ error: "Gagal menyimpan data. Pastikan input valid." });
    }
  }
}