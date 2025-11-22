import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  const { id } = req.query;
  const productId = BigInt(id);

  if (req.method === 'PUT') {
    const { nama_produk, foto_produk, tahun, deskripsi } = req.body;
    try {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: {
          nama_produk,
          foto_produk,
          deskripsi,
          tahun: BigInt(tahun)
        }
      });
      return res.status(200).json(serialize(updated));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    await prisma.product.delete({ where: { id: productId } });
    return res.status(200).json({ message: 'Product deleted' });
  }
}