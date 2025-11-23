import prisma from '../../lib/prisma';
import { serialize } from '../../lib/utils';
import { createLog } from '../../lib/logger'; // Pastikan path ini benar ke helper logger Anda

export default async function handler(req, res) {
  // --- 1. GET: Ambil Data Profile ---
  if (req.method === 'GET') {
    try {
      const profile = await prisma.company_profile.findFirst();
      return res.status(200).json(serialize(profile));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- 2. PUT: Update Data Profile (DENGAN LOG) ---
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
      userId // <--- Tangkap User ID dari Frontend
    } = req.body;

    try {
      // Gunakan Transaction untuk Update + Catat Log sekaligus
      const result = await prisma.$transaction(async (tx) => {
        
        // A. Cari ID Profile yang mau diupdate
        let targetId = id ? BigInt(id) : undefined;
        
        // Jika tidak ada ID dikirim, cari data pertama (fallback)
        if (!targetId) {
            const existing = await tx.company_profile.findFirst();
            if (existing) targetId = existing.id;
        }

        if (!targetId) {
            throw new Error("Data profile belum ada di database");
        }

        // B. Lakukan Update
        const updatedProfile = await tx.company_profile.update({
          where: { id: targetId },
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

        // C. Catat Log Aktivitas
        if (userId) {
            await createLog(
                tx, 
                userId, 
                "Edit Perusahaan", 
                `Memperbarui informasi profil perusahaan: ${company_name}`
            );
        }

        return updatedProfile;
      });

      return res.status(200).json(serialize(result));

    } catch (error) {
      console.error("Update Company Error:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}