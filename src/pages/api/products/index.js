// File: src/pages/api/products/index.js
import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';
import { createLog } from '../../../lib/logger';

const safeSerialize = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export default async function handler(req, res) {
  // GET
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({ 
        orderBy: { created_at: 'desc' } 
      });
      return res.status(200).json(safeSerialize(products));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST
  if (req.method === 'POST') {
    const { nama_produk, deskripsi, tahun, foto_produk, userId } = req.body;
    const currentUserId = userId || 1; 

    try {
      const result = await prisma.$transaction(async (tx) => {
        const newProduct = await tx.product.create({
          data: {
            nama_produk: nama_produk.trim(),
            deskripsi: deskripsi || '',
            tahun: BigInt(tahun),
            foto_produk: foto_produk || '[]', // Simpan sebagai JSON string
            created_at: new Date()
          }
        });

        await createLog(tx, currentUserId, "Tambah Produk", `Menambahkan produk: ${newProduct.nama_produk}`);
        return newProduct;
      });
      return res.status(201).json(safeSerialize(result));
    } catch (error) {
      return res.status(500).json({ error: "Gagal menambahkan produk" });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}