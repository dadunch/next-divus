// src/pages/api/dashboard/index.js

import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { setCachePreset } from '../../../lib/cache-headers';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();


  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasi: Maksimal 15 request per menit.
    // Dashboard biasanya cukup diakses sesekali, tidak perlu refresh agresif.
    await limiter.check(res, 15, ip); 
  } catch {
    return res.status(429).json({ 
      error: "Terlalu banyak permintaan. Dashboard sedang memproses data, silakan tunggu sebentar." 
    });
  }

  const { filter } = req.query; // "Keseluruhan", "Tahun Ini", "Bulan Ini"

  try {
    const now = new Date();
    let whereClause = {};

    // Tentukan Range Tanggal
    if (filter === 'Bulan Ini') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      whereClause = { created_at: { gte: firstDayOfMonth } };
    }
    else if (filter === 'Tahun Ini') {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      whereClause = { created_at: { gte: firstDayOfYear } };
    }

    // Set Cache Header (SWR/Stale-While-Revalidate)
    setCachePreset(res, 'DYNAMIC'); 

    // 2. Fetch Data Batch 1: Counts & Profile
    const [
      countMitra, countProduk, countProyek, countLayanan,
      companyProfile
    ] = await Promise.all([
      prisma.client.count({ where: whereClause }),
      prisma.product.count({ where: whereClause }),
      prisma.projects.count({ where: whereClause }),
      prisma.services.count({ where: whereClause }),
      prisma.company_profile.findFirst(),
    ]);

    // 2. Fetch Data Batch 2: Logs & Charts
    const [
      recentLogs,
      rawProyek,
      rawMitra,
      rawProduk
    ] = await Promise.all([
      prisma.activity_logs.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        take: 20, 
        include: { users: { select: { username: true } } }
      }),
      prisma.projects.findMany({ where: whereClause, select: { created_at: true } }),
      prisma.client.findMany({ where: whereClause, select: { created_at: true } }),
      prisma.product.findMany({ where: whereClause, select: { created_at: true } }),
    ]);

    // 3. Hitung Umur Perusahaan
    let companyYears = 0;
    if (companyProfile?.established_date) {
      companyYears = now.getFullYear() - new Date(companyProfile.established_date).getFullYear();
    }

    // 4. Helper Fungsi Pengolah Data Grafik
    const processChartData = (rawData, filterMode) => {
      if (filterMode === 'Bulan Ini') {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
          name: (i + 1).toString(),
          total: 0
        }));

        rawData.forEach(item => {
          if (item.created_at) {
            const date = new Date(item.created_at);
            const day = date.getDate();
            if (dailyData[day - 1]) dailyData[day - 1].total += 1;
          }
        });
        return dailyData;
      } else {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const monthlyData = monthNames.map(m => ({ name: m, total: 0 }));

        rawData.forEach(item => {
          if (item.created_at) {
            const date = new Date(item.created_at);
            const month = date.getMonth();
            monthlyData[month].total += 1;
          }
        });
        return monthlyData;
      }
    };

    // 5. Response JSON
    return res.status(200).json({
      stats: {
        years: companyYears,
        mitra: countMitra,
        produk: countProduk,
        proyek: countProyek,
        layanan: countLayanan
      },
      logs: serialize(recentLogs),
      charts: {
        proyek: processChartData(rawProyek, filter),
        mitra: processChartData(rawMitra, filter),
        produk: processChartData(rawProduk, filter),
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return res.status(500).json({ error: "Gagal memuat data dashboard" });
  }
}