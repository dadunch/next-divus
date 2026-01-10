import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { setCachePreset } from '../../../lib/cache-headers';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { filter } = req.query; // "Keseluruhan", "Tahun Ini", "Bulan Ini"

  try {
    const now = new Date();
    let whereClause = {};

    // 1. Tentukan Range Tanggal
    if (filter === 'Bulan Ini') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      whereClause = { created_at: { gte: firstDayOfMonth } };
    }
    else if (filter === 'Tahun Ini') {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      whereClause = { created_at: { gte: firstDayOfYear } };
    }
    // "Keseluruhan" tidak perlu whereClause (ambil semua)

    // 2. Fetch Data (Parallel)
    // 2. Fetch Data (Split into batches to avoid connection pool timeout)
    setCachePreset(res, 'DYNAMIC'); // Cache 1 menit agar tidak spam request ke DB

    // Batch 1: Counts & Profile (5 koneksi max)
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

    // Batch 2: Logs & Charts (4 koneksi)
    const [
      recentLogs,
      rawProyek,
      rawMitra,
      rawProduk
    ] = await Promise.all([
      prisma.activity_logs.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        take: 20, // LIMIT LOGS: Hanya ambil 20 log terakhir agar tidak berat
        include: { users: { select: { username: true } } }
      }),
      // Fetch raw dates untuk grafik (Hanya field created_at, cukup ringan)
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
        // Mode Harian (1 - 30/31)
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        // Buat array [ {name: '1', total: 0}, {name: '2', total: 0}, ... ]
        const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
          name: (i + 1).toString(), // Label tanggal 1, 2, 3...
          total: 0
        }));

        rawData.forEach(item => {
          if (item.created_at) {
            const date = new Date(item.created_at);
            const day = date.getDate(); // 1-31
            if (dailyData[day - 1]) dailyData[day - 1].total += 1;
          }
        });
        return dailyData;

      } else {
        // Mode Bulanan (Jan - Des) untuk "Tahun Ini" & "Keseluruhan"
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const monthlyData = monthNames.map(m => ({ name: m, total: 0 }));

        rawData.forEach(item => {
          if (item.created_at) {
            const date = new Date(item.created_at);
            const month = date.getMonth(); // 0-11
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
        // Proses 3 grafik berbeda
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