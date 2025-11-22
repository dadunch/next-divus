import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const categories = await prisma.category.findMany();
    return res.status(200).json(serialize(categories));
  }

  if (req.method === 'POST') {
    const { bidang } = req.body;
    try {
      const newCategory = await prisma.category.create({
        data: { bidang }
      });
      return res.status(201).json(serialize(newCategory));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}