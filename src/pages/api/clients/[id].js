import prisma from '../../../lib/prisma';
import { serialize } from '../../../lib/utils';

export default async function handler(req, res) {
  const { id } = req.query;
  const clientId = BigInt(id);

  if (req.method === 'PUT') {
    const { client_name, client_logo } = req.body;
    try {
      const updated = await prisma.client.update({
        where: { id: clientId },
        data: { client_name, client_logo }
      });
      return res.status(200).json(serialize(updated));
    } catch (error) {
      return res.status(500).json({ error: "Gagal update client" });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.client.delete({ where: { id: clientId } });
      return res.status(200).json({ message: 'Client deleted' });
    } catch (error) {
      return res.status(500).json({ error: "Gagal hapus (Mungkin sedang dipakai di project)" });
    }
  }
}