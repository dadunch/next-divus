// File: src/pages/api/upload.js (Generic File Upload - Supabase)
import formidable from 'formidable';

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
    // 1. Konfigurasi Formidable (tanpa uploadDir, pakai temp)
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // Batas 5MB
    });

    // 2. Proses Upload dengan Promise
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // 3. Ambil File
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 4. Upload ke Supabase
    const { uploadToSupabase } = await import('../../lib/upload-service');

    const url = await uploadToSupabase(uploadedFile, 'uploads', 'services');

    if (!url || !url.startsWith('http')) {
      throw new Error('Upload failed: Invalid URL returned');
    }

    // 5. Kembalikan URL Supabase
    return res.status(200).json({ url });

  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}