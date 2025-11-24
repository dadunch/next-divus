import prisma from '../../../lib/prisma';
import { createLog } from '../../../lib/logger';

const safeSerialize = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export default async function handler(req, res) {
  const { id } = req.query;
  const productId = parseInt(id);

  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid ID' });

  // GET
  if (req.method === 'GET') {
    try {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(safeSerialize(product));
    } catch (error) { return res.status(500).json({ error: error.message }); }
  }

  // PUT (Edit)
  if (req.method === 'PUT') {
    const { nama_produk, deskripsi, tahun, foto_produk, userId } = req.body;
    const currentUserId = userId || 1;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const oldProduct = await tx.product.findUnique({ where: { id: productId } });
        if (!oldProduct) throw new Error("Produk tidak ditemukan");

        const updated = await tx.product.update({
          where: { id: productId },
          data: { nama_produk, deskripsi, tahun: BigInt(tahun), foto_produk }
        });

        await createLog(tx, currentUserId, "Edit Produk", `Memperbarui produk: ${oldProduct.nama_produk}`);
        return updated;
      });
      return res.status(200).json(safeSerialize(result));
    } catch (error) { return res.status(500).json({ error: error.message }); }
  }

  // DELETE (Hapus)
  if (req.method === 'DELETE') {
    // AMBIL USER ID DARI QUERY PARAMETER (URL)
    const { userId } = req.query; 
    const currentUserId = userId || 1;

    try {
      await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) throw new Error("Produk tidak ditemukan");

        await tx.product.delete({ where: { id: productId } });

        // Log dengan ID yang benar
        await createLog(tx, currentUserId, "Hapus Produk", `Menghapus produk: ${product.nama_produk}`);
      });

      return res.status(200).json({ success: true });
    } catch (error) { return res.status(500).json({ error: error.message }); }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}