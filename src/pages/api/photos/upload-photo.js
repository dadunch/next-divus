import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false, // Wajib false untuk file upload
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. Setup Formidable (tanpa uploadDir)
  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
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

    // 2. Upload ke Supabase
    const { uploadToSupabase } = await import('../../../lib/upload-service');

    const url = await uploadToSupabase(file, 'uploads', 'company_photos');

    if (!url || !url.startsWith('http')) {
      throw new Error('Upload failed: Invalid URL returned');
    }

    // 3. Kembalikan URL Supabase
    return res.status(200).json({ url });

  } catch (error) {
    console.error('Company photo upload failed:', error);
    return res.status(500).json({ error: error.message || 'Gagal upload foto' });
  }
}