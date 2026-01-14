// src/pages/api/sub_services/by_services/[servicesId].js

import prisma from '../../../../lib/prisma';
import { serialize } from '../../../../lib/utils';
import { limiter } from '../../../../lib/rate-limit'; // Import Rate Limiter

export default async function handler(req, res) {
  // Hanya izinkan method GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method tidak diizinkan" });
  }

  // ============================================================
  // 1. IMPLEMENTASI THROTTLE (RATE LIMITING)
  // ============================================================
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasi: Maksimal 50 request per menit.
    // Diberikan angka agak tinggi karena sering diakses saat perpindahan menu/form.
    await limiter.check(res, 50, ip); 
  } catch {
    return res.status(429).json({ 
      error: 'Terlalu banyak permintaan data. Silakan tunggu sebentar.' 
    });
  }

  const { servicesId } = req.query;

  // 2. Validasi serviceId
  if (!servicesId || isNaN(servicesId)) {
    return res.status(400).json({ 
      error: `Service ID tidak valid: ${servicesId}` 
    });    
  }

  try {
    // 3. Query Database
    const subServices = await prisma.sub_services.findMany({
      where: { 
        services_id: BigInt(servicesId) 
      },
      orderBy: { id: 'asc' }
    });

    // Menangani kasus jika serviceId valid tapi datanya kosong
    if (!subServices || subServices.length === 0) {
        return res.status(200).json([]);
    }

    return res.status(200).json(serialize(subServices));

  } catch (error) {
    console.error('Error fetching sub_services by service:', error);
    
    // Memberikan informasi spesifik jika error terkait BigInt atau koneksi
    return res.status(500).json({ 
      error: "Gagal mengambil data sub layanan dari server" 
    });
  }
}