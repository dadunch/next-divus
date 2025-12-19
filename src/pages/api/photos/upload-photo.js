import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Wajib false untuk file upload
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. Tentukan folder tujuan
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'company');
  
  // 2. Buat folder jika belum ada
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    filename: (name, ext, part) => {
      const now = new Date();
      // Format: YYYYMMDD (contoh: 20251219)
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); 
      // Format: HHmm (contoh: 2245)
      const timePart = now.getHours().toString().padStart(2, '0') + 
                       now.getMinutes().toString().padStart(2, '0');
      
      // Bersihkan karakter aneh di judul agar nama file aman
      const safeTitle = part.originalFilename.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
      
      return `${safeTitle}-${datePart}-${timePart}${ext}`;
    }
  });

  return new Promise((resolve) => {
    form.parse(req, (err, fields, files) => {
      if (err) return resolve(res.status(500).json({ error: err.message }));
      
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) return resolve(res.status(400).json({ error: "File tidak terdeteksi" }));

      // Ambil nama file akhir untuk dikirim ke DB
      const fileName = path.basename(file.filepath);
      resolve(res.status(200).json({ url: `/uploads/company/${fileName}` }));
    });
  });
}