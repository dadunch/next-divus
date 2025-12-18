import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

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
    // 1. Siapkan folder penyimpanan
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    
    // Buat folder jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 2. Setup Formidable
    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filename: (name, ext, part, form) => {
        // Generate nama file unik
        const originalName = part.originalFilename || 'produk';
        const nameWithoutExt = path.parse(originalName).name;
        const extension = path.extname(originalName) || '.jpg';
        
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14); 
        const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
        
        return `${safeName}-${timestamp}${extension}`;
      }
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

    // 5. Kembalikan URL File
    const fileName = path.basename(uploadedFile.filepath);
    const url = `/uploads/products/${fileName}`;

    return res.status(200).json({ url });

  } catch (error) {
    console.error('Upload API Error:', error);
    return res.status(500).json({ error: 'Gagal upload file', details: error.message });
  }
}