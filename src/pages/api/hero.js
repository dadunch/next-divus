import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import prisma from '../../lib/prisma'; 

// Konfigurasi Upload
export const config = {
  api: {
    bodyParser: false,
  },
};

// Fungsi helper Formidable
const parseForm = (req, saveLocally) => {
  if (!fs.existsSync(saveLocally)) fs.mkdirSync(saveLocally, { recursive: true });
  
  const form = new IncomingForm({
    uploadDir: saveLocally,
    keepExtensions: true,
    filename: (name, ext, part) => part.originalFilename,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  const { method } = req;

  try {
    // === GET: Ambil Data ===
    if (method === 'GET') {
      const data = await prisma.menu_foto.findFirst({
        orderBy: { created_at: 'desc' },
      });
      return res.status(200).json(data || {});
    }

    // === POST: Upload & Simpan ===
    if (method === 'POST') {
      const uploadDir = path.join(process.cwd(), 'public/uploads');

      // 1. Upload File
      console.log("Mulai proses upload..."); // Cek Terminal VS Code
      const { fields, files } = await parseForm(req, uploadDir);
      console.log("Upload selesai. Files:", Object.keys(files));

      // Helper path file
      const getFilePath = (key) => {
        const file = files[key];
        if (!file) return null;
        const fileObj = Array.isArray(file) ? file[0] : file;
        return `/uploads/${fileObj.newFilename}`;
      };

      // 2. Siapkan Data
      const userId = fields.user_id ? fields.user_id[0] : 'System';
      
      // Ambil data lama (jika ada)
      const lastEntry = await prisma.menu_foto.findFirst({
          orderBy: { created_at: 'desc' },
      });

      const finalFoto1 = getFilePath('img1') || lastEntry?.foto1 || null;
      const finalFoto2 = getFilePath('img2') || lastEntry?.foto2 || null;
      const finalFoto3 = getFilePath('img3') || lastEntry?.foto3 || null;

      // 3. Simpan Database (Tanpa Transaction/Log dulu agar aman)
      console.log("Menyimpan ke database...");
      const result = await prisma.menu_foto.create({
        data: {
          user_id: userId,
          foto1: finalFoto1,
          foto2: finalFoto2,
          foto3: finalFoto3,
        },
      });
      console.log("Berhasil disimpan ID:", result.id);

      return res.status(200).json({ message: 'Sukses', data: result });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    // Error akan muncul detail di Terminal VS Code Anda
    console.error("❌ API ERROR DETAIL:", error);
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
}