// src/pages/api/company.js
import prisma from '../../lib/prisma';
import { serialize } from '../../lib/utils';

export default async function handler(req, res) {
  // GET: Ambil Data Profil
  if (req.method === 'GET') {
    const profile = await prisma.company_profile.findFirst();
    return res.status(200).json(serialize(profile));
  }

  // PUT: Update Data Profil
  if (req.method === 'PUT') {
    const { id, company_name, description, address, email, phone, business_field, established_date } = req.body;
    
    try {
      const updated = await prisma.company_profile.update({
        where: { id: BigInt(id) },
        data: { 
            company_name, 
            description, 
            address, 
            email, 
            phone,
            business_field,
            // Pastikan format tanggal sesuai (ISO-8601 String)
            established_date: new Date(established_date) 
        }
      });
      return res.status(200).json(serialize(updated));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}