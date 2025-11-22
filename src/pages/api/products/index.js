import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const products = await prisma.product.findMany({ orderBy: { created_at: 'desc' } });
    return res.status(200).json(serialize(products));
  }

  if (req.method === 'POST') {
    const { nama_produk, foto_produk, tahun, deskripsi } = req.body;
    try {
      const newProduct = await prisma.product.create({
        data: {
          nama_produk,
          foto_produk,
          deskripsi,
          tahun: BigInt(tahun) // Convert ke BigInt
        }
      });
      return res.status(201).json(serialize(newProduct));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}