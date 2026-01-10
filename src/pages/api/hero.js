import { IncomingForm } from 'formidable';
import prisma from '../../lib/prisma';

// Konfigurasi Upload
export const config = {
  api: {
    bodyParser: false,
  },
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
      // 1. Parse Form (tanpa uploadDir)
      const form = new IncomingForm({
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024,
      });

      console.log("Mulai proses upload...");
      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });
      console.log("Form parsed. Files:", Object.keys(files));

      // 2. Upload ke Supabase
      const { uploadToSupabase } = await import('../../lib/upload-service');

      const uploadImage = async (fileKey) => {
        const file = files[fileKey];
        if (!file) return null;

        const fileObj = Array.isArray(file) ? file[0] : file;
        try {
          const url = await uploadToSupabase(fileObj, 'uploads', 'hero');
          if (!url || !url.startsWith('http')) {
            throw new Error('Invalid URL');
          }
          return url;
        } catch (err) {
          console.error(`Upload ${fileKey} failed:`, err);
          return null;
        }
      };

      // Upload 3 gambar secara parallel
      const [newFoto1, newFoto2, newFoto3] = await Promise.all([
        uploadImage('img1'),
        uploadImage('img2'),
        uploadImage('img3'),
      ]);

      // 3. Ambil data lama (untuk fallback jika ada foto yang tidak diupload)
      const lastEntry = await prisma.menu_foto.findFirst({
        orderBy: { created_at: 'desc' },
      });

      const finalFoto1 = newFoto1 || lastEntry?.foto1 || null;
      const finalFoto2 = newFoto2 || lastEntry?.foto2 || null;
      const finalFoto3 = newFoto3 || lastEntry?.foto3 || null;

      // 4. Simpan Database
      const userId = fields.user_id ? fields.user_id[0] : 'System';

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