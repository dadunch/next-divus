// src/pages/api/photos/upload-photo.js

import { IncomingForm } from 'formidable';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

export const config = {
  api: {
    bodyParser: false, // Wajib false untuk file upload
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasi: Maksimal 2 upload per menit per IP. 
    // Ini cukup untuk penggunaan manusia normal namun menghentikan bot otomatis.
    await limiter.check(res, 2, ip); 
  } catch {
    return res.status(429).json({ 
      error: 'Terlalu banyak permintaan upload. Silakan tunggu 1 menit untuk mengunggah foto lagi.' 
    });
  }

  // 2. Setup Formidable
  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // Limit 10MB
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: "File tidak terdeteksi" });
    }

    // 3. Upload ke Supabase
    const { uploadToSupabase } = await import('../../../lib/upload-service');

    const url = await uploadToSupabase(file, 'uploads', 'company_photos');

    if (!url || !url.startsWith('http')) {
      throw new Error('Upload failed: Invalid URL returned');
    }

    // 4. Kembalikan URL Supabase
    return res.status(200).json({ url });

  } catch (error) {
    console.error('Company photo upload failed:', error);
    return res.status(500).json({ error: error.message || 'Gagal upload foto' });
  }
}