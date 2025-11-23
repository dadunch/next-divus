import prisma from '../../../lib/prisma';
import EditProductModal from '../../../components/Modals/EditProductModal';

// Fungsi helper untuk serialize BigInt
const safeSerialize = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export default async function handler(req, res) {
  const { id } = req.query;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  // === GET: AMBIL DETAIL PRODUK ===
  if (req.method === 'GET') {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return res.status(404).json({ error: 'Produk tidak ditemukan di database' });
      }

      return res.status(200).json(safeSerialize(product));

    } catch (error) {
      console.error('GET product error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // === PUT: UPDATE PRODUK (Ini yang baru) ===
  if (req.method === 'PUT') {
    const { nama_produk, foto_produk, tahun, deskripsi } = req.body;

    try {
      // Cek dulu apakah produknya ada
      const existingProduct = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!existingProduct) {
        return res.status(404).json({ error: 'Produk yang akan diedit tidak ditemukan' });
      }

      // Lakukan Update
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          nama_produk: nama_produk.trim(),
          foto_produk: foto_produk || '', // Gunakan URL baru atau tetap yang lama (dikirim dari frontend)
          deskripsi: deskripsi || '',
          tahun: BigInt(tahun) // Pastikan tahun dikonversi ke BigInt
        }
      });

      console.log('Product updated successfully:', updatedProduct.id);
      return res.status(200).json(safeSerialize(updatedProduct));

    } catch (error) {
      console.error('PUT product error:', error);
      return res.status(500).json({ error: error.message || 'Gagal mengupdate produk' });
    }
  }

  // === DELETE: HAPUS PRODUK ===
  if (req.method === 'DELETE') {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return res.status(404).json({ error: 'Produk tidak ditemukan' });
      }

      await prisma.product.delete({
        where: { id: productId }
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Produk berhasil dihapus' 
      });
    } catch (error) {
      console.error('DELETE product error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}