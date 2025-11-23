import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  
  // === GET: AMBIL DATA (TANPA CLIENT) ===
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({ 
        orderBy: { created_at: 'desc' }
        // Kita HAPUS "include: { client: true }" karena tabelnya tidak terhubung
      });

      // Pengaman BigInt (mengubah ID dan Tahun jadi string)
      const safeProducts = JSON.parse(JSON.stringify(products, (key, value) =>
        typeof value === 'bigint'
          ? value.toString() 
          : value
      ));

      return res.status(200).json(safeProducts);
    } catch (error) {
      console.error("GET Error:", error);
      return res.status(500).json({ error: "Gagal mengambil data produk" });
    }
  }

  // === POST: TAMBAH DATA (TANPA CLIENT) ===
  if (req.method === 'POST') {
    // Kita hapus client_id dari sini
    const { nama_produk, foto_produk, tahun, deskripsi } = req.body;

    try {
      const newProduct = await prisma.product.create({
        data: {
          nama_produk,
          foto_produk: foto_produk || '', // Jika kosong, isi string kosong
          deskripsi: deskripsi || '',
          tahun: BigInt(tahun) // Pastikan tahun diubah jadi BigInt
          // client_id SUDAH DIHAPUS
        }
      });
      
      // Serialize respon agar aman
      return res.status(201).json(serialize(newProduct));
    } catch (error) {
      console.error("POST Error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}