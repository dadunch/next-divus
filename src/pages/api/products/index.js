import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger'; // Import Logger
import { setCacheHeaders } from '../../../lib/cache-headers';

export default async function handler(req, res) {
  const { method } = req;

  // ==========================================
  // GET: Ambil Semua Produk
  // ==========================================
  if (method === 'GET') {
    try {
      // Cache 10 menit fresh, 1 jam stale-while-revalidate
      setCacheHeaders(res, 600, 3600);

      const products = await prisma.product.findMany({
        orderBy: { created_at: 'desc' },
      });
      return res.status(200).json(serialize(products));
    } catch (error) {
      console.error("GET Product Error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  // ==========================================
  // POST: Tambah Produk Baru
  // ==========================================
  if (method === 'POST') {
    try {
      const {
        nama_produk,
        deskripsi,
        tahun,
        foto_produk,
        media_items,
        userId // Pastikan frontend mengirim userId
      } = req.body;

      // Validasi Wajib
      if (!nama_produk) {
        return res.status(400).json({ error: 'Nama produk wajib diisi' });
      }

      // Default userId ke 1 jika tidak dikirim
      const currentUserId = userId ? BigInt(userId) : BigInt(1);

      // 1. Parsing media_items (JSON String -> Object)
      let parsedMediaItems = [];
      if (media_items) {
        try {
          parsedMediaItems = typeof media_items === 'string'
            ? JSON.parse(media_items)
            : media_items;
        } catch (e) {
          console.error("Gagal parsing media_items:", e);
          parsedMediaItems = [];
        }
      }

      // 2. Transaksi Database (Simpan Produk + Log)
      const result = await prisma.$transaction(async (tx) => {

        // A. Create Product
        const newProduct = await tx.product.create({
          data: {
            nama_produk,
            deskripsi,
            // Konversi tahun ke Int (karena schema sudah diubah jadi Int)
            tahun: parseInt(tahun) || new Date().getFullYear(),
            foto_produk: foto_produk,
            media_items: parsedMediaItems,
          },
        });

        // B. Create Log
        await createLog(
          tx,
          currentUserId,
          "Tambah Produk",
          `Menambahkan produk baru: ${nama_produk}`
        );

        return newProduct;
      });

      return res.status(201).json(serialize(result));

    } catch (error) {
      console.error("Create Product Error:", error);
      return res.status(500).json({ error: 'Gagal menyimpan produk', details: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}