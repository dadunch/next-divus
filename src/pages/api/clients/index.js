import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const clients = await prisma.client.findMany({ orderBy: { id: 'desc' } });
    return res.status(200).json(serialize(clients));
  }

  if (req.method === 'POST') {
    const { client_name, client_logo } = req.body;
    try {
      const newClient = await prisma.client.create({
        data: { client_name, client_logo }
      });
      return res.status(201).json(serialize(newClient));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}