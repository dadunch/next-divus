import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const photos = await prisma.company_photos.findMany({ orderBy: { created_at: 'desc' } });
    return res.status(200).json(serialize(photos));
  }

  if (req.method === 'POST') {
    const { title, image_url } = req.body;
    const newPhoto = await prisma.company_photos.create({
      data: { title, image_url }
    });
    return res.status(201).json(serialize(newPhoto));
  }
}