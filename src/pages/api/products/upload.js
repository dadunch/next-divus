import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      multiples: true, // PENTING: Izinkan banyak file
      maxFileSize: 10 * 1024 * 1024, // Naikkan ke 10MB total
      filename: (name, ext, part) => {
        const safeName = part.originalFilename.replace(/[^a-z0-9.]/gi, '-').toLowerCase();
        return `${Date.now()}-${safeName}`;
      }
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Handle single atau multiple files
    const uploadedFiles = files.file ? (Array.isArray(files.file) ? files.file : [files.file]) : [];

    if (uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Buat array URL
    const urls = uploadedFiles.map(file => {
      const fileName = path.basename(file.filepath);
      return `/uploads/products/${fileName}`;
    });

    // Kembalikan dalam bentuk Array URL
    return res.status(200).json({ urls });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}