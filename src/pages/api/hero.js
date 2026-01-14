// src/pages/api/hero.js

import { IncomingForm } from 'formidable';
import prisma from '../../lib/prisma';
import { limiter } from '../../lib/rate-limit'; // Import Rate Limiter

// Konfigurasi Upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // GET: 20 kali per menit
    // POST: 2 kali per menit (Sangat ketat karena upload 3 file sekaligus)
    const limit = method === 'GET' ? 20 : 2;
    
    await limiter.check(res, limit, ip); 
  } catch {
    return res.status(429).json({ 
      message: 'Aktivitas upload terlalu cepat. Silakan tunggu 1 menit untuk keamanan server.' 
    });
  }

  try {
    // === GET: Ambil Data ===
    if (method === 'GET') {
      const data = await prisma.menu_foto.findFirst({
        orderBy: { created_at: 'desc' },
      });
      return res.status(200).json(data || {});
    }

    // === POST: Upload & Simpan ===
    if (method === 'POST') {
      // 1. Parse Form
      const form = new IncomingForm({
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB per file
      });

      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

      // 2. Upload ke Supabase
      const { uploadToSupabase } = await import('../../lib/upload-service');

      const uploadImage = async (fileKey) => {
        const file = files[fileKey];
        if (!file) return null;

        const fileObj = Array.isArray(file) ? file[0] : file;
        try {
          const url = await uploadToSupabase(fileObj, 'uploads', 'hero');
          if (!url || !url.startsWith('http')) {
            throw new Error('Invalid URL');
          }
          return url;
        } catch (err) {
          console.error(`Upload ${fileKey} failed:`, err);
          return null;
        }
      };

      // 
      // Melakukan upload parallel untuk efisiensi waktu serverless
      const [newFoto1, newFoto2, newFoto3] = await Promise.all([
        uploadImage('img1'),
        uploadImage('img2'),
        uploadImage('img3'),
      ]);

      // 3. Ambil data lama (Fallback)
      const lastEntry = await prisma.menu_foto.findFirst({
        orderBy: { created_at: 'desc' },
      });

      const finalFoto1 = newFoto1 || lastEntry?.foto1 || null;
      const finalFoto2 = newFoto2 || lastEntry?.foto2 || null;
      const finalFoto3 = newFoto3 || lastEntry?.foto3 || null;

      // 4. Simpan Database
      // Gunakan user_id dari field atau fallback ke System
      const userId = fields.user_id ? fields.user_id[0] : 'System';

      const result = await prisma.menu_foto.create({
        data: {
          user_id: userId,
          foto1: finalFoto1,
          foto2: finalFoto2,
          foto3: finalFoto3,
        },
      });

      return res.status(200).json({ message: 'Sukses', data: result });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    console.error("❌ API ERROR DETAIL:", error);
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
}