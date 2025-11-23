import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const products = await prisma.product.findMany({ 
      orderBy: { created_at: 'desc' } 
    });
    return res.status(200).json(serialize(products));
  }

  if (req.method === 'POST') {
    const { nama_produk, foto_produk, tahun, deskripsi } = req.body;
    
    // Log untuk debugging
    console.log('Received data:', { nama_produk, foto_produk, tahun, deskripsi });
    
    // Validasi
    if (!nama_produk || !nama_produk.trim()) {
      return res.status(400).json({ error: 'Nama produk wajib diisi' });
    }

    try {
      const newProduct = await prisma.product.create({
        data: {
          nama_produk: nama_produk.trim(),
          foto_produk: foto_produk || '',
          deskripsi: deskripsi || '',
          tahun: tahun ? BigInt(tahun) : BigInt(new Date().getFullYear()) // FIX: Pastikan ada default value
        }
      });
      
      console.log('Product created successfully:', newProduct.id);
      
      return res.status(201).json(serialize(newProduct));
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}