import prisma from '../../../lib/prisma';
import { createLog } from '../../../lib/logger';

// Helper untuk serialize BigInt agar tidak error saat dikirim JSON
const safeSerialize = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export default async function handler(req, res) {
  const { id } = req.query;

  // Validasi ID sederhana
  if (!id) return res.status(400).json({ error: 'ID required' });

  // Konversi ID ke BigInt sesuai Schema Prisma
  let productId;
  try {
    productId = BigInt(id);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  // ==========================================
  // GET: Ambil Detail Produk
  // ==========================================
  if (req.method === 'GET') {
    try {
      const product = await prisma.product.findUnique({ 
        where: { id: productId } 
      });
      
      if (!product) return res.status(404).json({ error: 'Not found' });
      
      return res.status(200).json(safeSerialize(product));
    } catch (error) { 
      return res.status(500).json({ error: error.message }); 
    }
  }

  // ==========================================
  // PUT: Edit Produk
  // ==========================================
  if (req.method === 'PUT') {
    // Ambil field baru 'media_items'
    const { nama_produk, deskripsi, tahun, foto_produk, media_items, userId } = req.body;
    const currentUserId = userId ? BigInt(userId) : BigInt(1);

    try {
      // Parsing media_items (sama seperti di create)
      // Jaga-jaga jika dikirim sebagai string JSON atau object
      let parsedMediaItems = [];
      if (media_items) {
        try {
          parsedMediaItems = typeof media_items === 'string' 
            ? JSON.parse(media_items) 
            : media_items;
        } catch (e) {
          console.error("Gagal parse media_items:", e);
          parsedMediaItems = []; 
        }
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1. Cek data lama
        const oldProduct = await tx.product.findUnique({ where: { id: productId } });
        if (!oldProduct) throw new Error("Produk tidak ditemukan");

        // 2. Update data
        const updated = await tx.product.update({
          where: { id: productId },
          data: { 
            nama_produk, 
            deskripsi, 
            
            // PERBAIKAN 1: Tahun jadi Int (parseInt), bukan BigInt
            tahun: parseInt(tahun), 
            
            foto_produk, // Tetap simpan (Legacy)
            
            // PERBAIKAN 2: Simpan media_items ke kolom Json
            media_items: parsedMediaItems 
          }
        });

        // 3. Catat Log
        await createLog(
            tx, 
            currentUserId, 
            "Edit Produk", 
            `Memperbarui produk: ${oldProduct.nama_produk}`
        );
        
        return updated;
      });

      return res.status(200).json(safeSerialize(result));
    } catch (error) { 
      console.error("Update Error:", error);
      return res.status(500).json({ error: error.message }); 
    }
  }

  // ==========================================
  // DELETE: Hapus Produk
  // ==========================================
  if (req.method === 'DELETE') {
    const { userId } = req.query; // Biasanya DELETE kirim param di query
    const currentUserId = userId ? BigInt(userId) : BigInt(1);

    try {
      await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) throw new Error("Produk tidak ditemukan");

        await tx.product.delete({ where: { id: productId } });
        
        await createLog(
            tx, 
            currentUserId, 
            "Hapus Produk", 
            `Menghapus produk: ${product.nama_produk}`
        );
      });

      return res.status(200).json({ success: true });
    } catch (error) { 
      return res.status(500).json({ error: error.message }); 
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}