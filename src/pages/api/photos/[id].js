import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  const { id } = req.query;
  const photoId = BigInt(id);

  if (req.method === 'DELETE') {
    await prisma.company_photos.delete({ where: { id: photoId } });
    return res.status(200).json({ message: 'Photo deleted' });
  }
  
  // Update judul foto jika perlu
  if (req.method === 'PUT') {
     const { title, image_url } = req.body;
     const updated = await prisma.company_photos.update({
        where: { id: photoId },
        data: { title, image_url }
     });
     return res.status(200).json(serialize(updated));
  }
}