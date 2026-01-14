// src/pages/api/upload.js 
import formidable from 'formidable';
import { limiter } from '../../lib/rate-limit'; // Import Rate Limiter

// Konfigurasi agar Next.js tidak memproses body (karena ditangani formidable)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Hanya izinkan method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }


  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Batasi: Maksimal 3 upload per menit per IP
    // Angka ini cukup untuk admin manusia, tapi mematikan bagi bot spam
    await limiter.check(res, 3, ip); 
  } catch {
    return res.status(429).json({ 
      error: 'Terlalu banyak permintaan upload. Silakan tunggu 1 menit untuk mengunggah file kembali.' 
    });
  }

  try {
    // 2. Konfigurasi Formidable
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // Batas 5MB
    });

    // 3. Proses Upload dengan Promise
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // 4. Ambil File
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 5. Upload ke Supabase
    const { uploadToSupabase } = await import('../../lib/upload-service');

    const url = await uploadToSupabase(uploadedFile, 'uploads', 'services');

    if (!url || !url.startsWith('http')) {
      throw new Error('Upload failed: Invalid URL returned');
    }

    // 6. Kembalikan URL Supabase
    return res.status(200).json({ url });

  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}