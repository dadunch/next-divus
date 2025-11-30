// File: src/pages/api/services/upload.js
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

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
    // 1. Tentukan Folder Penyimpanan: public/uploads/services
    // Kita ubah dari 'products' ke 'services' agar rapi
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'services');
    
    // Buat folder jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 2. Konfigurasi Formidable
    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true, // Biarkan ekstensi (.jpg/.png) tetap ada
      maxFileSize: 5 * 1024 * 1024, // Batas 5MB
      filename: (name, ext, part) => {
        // Penamaan file unik: layanan-[timestamp].jpg
        const safeName = part.originalFilename.replace(/[^a-z0-9.]/gi, '-').toLowerCase();
        return `layanan-${Date.now()}-${safeName}`;
      }
    });

    // 3. Proses Upload dengan Promise (Agar server menunggu selesai)
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // 4. Ambil File
    // Formidable v3 bisa mengembalikan array atau object, kita handle keduanya
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 5. Kembalikan URL File untuk disimpan di Database
    const fileName = path.basename(uploadedFile.filepath);
    const url = `/uploads/services/${fileName}`; // URL yang bisa diakses browser

    return res.status(200).json({ url });

  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}