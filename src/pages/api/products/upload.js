// src/pages/api/products/upload.js

import { IncomingForm } from 'formidable';
import { limiter } from '../../../lib/rate-limit'; // Import Rate Limiter

// Konfigurasi wajib: Matikan body parser Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Hanya izinkan method POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasi: Maksimal 2 kali upload per menit per IP.
    // Ini sangat protektif untuk mencegah bot membanjiri storage Supabase Anda.
    await limiter.check(res, 2, ip); 
  } catch {
    return res.status(429).json({ 
      error: 'Terlalu banyak percobaan upload. Silakan tunggu 1 menit untuk mengunggah file kembali.' 
    });
  }

  try {
    // 2. Setup Formidable
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    // 3. Parse Request
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    // 4. Ambil File
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'Tidak ada file yang diupload' });
    }

    // 5. Upload ke Supabase
    const { uploadToSupabase } = await import('../../../lib/upload-service');

    try {
      const url = await uploadToSupabase(uploadedFile, 'uploads', 'products');

      if (!url || !url.startsWith('http')) {
        throw new Error('Upload failed: Invalid URL returned');
      }

      // 6. Kembalikan URL Supabase
      return res.status(200).json({ url });

    } catch (uploadError) {
      console.error('Product upload to Supabase failed:', uploadError);
      return res.status(500).json({ error: `Gagal upload: ${uploadError.message}` });
    }

  } catch (error) {
    console.error('Upload API Error:', error);
    return res.status(500).json({ error: 'Gagal upload file', details: error.message });
  }
}