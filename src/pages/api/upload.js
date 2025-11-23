import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Penting! Matikan body parser bawaan Next.js
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    
    // Buat folder jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part) => {
        // Nama file unik: timestamp + nama asli
        return `${Date.now()}-${part.originalFilename.replace(/\s+/g, '-')}`;
      }
    });

    // Parsing Form
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // PERBAIKAN UTAMA DISINI:
    // Cek apakah 'files.file' itu array atau object tunggal
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
 
    const fileName = path.basename(uploadedFile.filepath);
    const url = `/uploads/products/${fileName}`;

    console.log('File uploaded successfully:', url);
    return res.status(200).json({ url });

  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: 'Upload handler failed', details: error.message });
  }
}