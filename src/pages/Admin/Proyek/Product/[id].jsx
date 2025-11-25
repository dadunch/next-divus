// pages/api/products/[id].js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    // Validate ID
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    switch (method) {
      case 'GET':
        // Get single product with all relations
        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            category: true,
            client: true,
            createdBy: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            // Jika ada relasi gallery/images
            gallery: true
          }
        });

        if (!product) {
          return res.status(404).json({ error: 'Produk tidak ditemukan' });
        }

        return res.status(200).json(product);

      case 'PUT':
        // Update product
        const {
          product_name,
          description,
          product_image,
          tahun,
          category_id,
          client_id,
          status,
          project_value,
          userId // For logging
        } = req.body;

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
          where: { id: productId }
        });

        if (!existingProduct) {
          return res.status(404).json({ error: 'Produk tidak ditemukan' });
        }

        // Update product
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: {
            product_name: product_name || existingProduct.product_name,
            description: description !== undefined ? description : existingProduct.description,
            product_image: product_image !== undefined ? product_image : existingProduct.product_image,
            tahun: tahun || existingProduct.tahun,
            category_id: category_id ? parseInt(category_id) : existingProduct.category_id,
            client_id: client_id ? parseInt(client_id) : existingProduct.client_id,
            status: status || existingProduct.status,
            project_value: project_value ? parseFloat(project_value) : existingProduct.project_value,
            updated_at: new Date()
          },
          include: {
            category: true,
            client: true
          }
        });

        // Log Activity
        if (userId) {
          await prisma.activityLog.create({
            data: {
              user_id: parseInt(userId),
              activity: 'UPDATE',
              entity: 'PRODUCT',
              entity_id: productId,
              details: `Mengupdate produk: ${updatedProduct.product_name}`
            }
          });
        }

        return res.status(200).json(updatedProduct);

      case 'DELETE':
        // Delete product
        const { userId: deleteUserId } = req.body;

        // Check if product exists
        const productToDelete = await prisma.product.findUnique({
          where: { id: productId }
        });

        if (!productToDelete) {
          return res.status(404).json({ error: 'Produk tidak ditemukan' });
        }

        // Delete related data first if needed (cascade delete)
        // Example: Delete gallery images
        if (productToDelete.gallery) {
          await prisma.productGallery.deleteMany({
            where: { product_id: productId }
          });
        }

        // Delete product
        await prisma.product.delete({
          where: { id: productId }
        });

        // Log Activity
        if (deleteUserId) {
          await prisma.activityLog.create({
            data: {
              user_id: parseInt(deleteUserId),
              activity: 'DELETE',
              entity: 'PRODUCT',
              entity_id: productId,
              details: `Menghapus produk: ${productToDelete.product_name}`
            }
          });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Produk berhasil dihapus',
          deletedProduct: productToDelete.product_name
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}