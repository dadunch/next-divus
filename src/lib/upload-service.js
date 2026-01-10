import { supabase } from './supabase';
import fs from 'fs';

/**
 * Upload file ke Supabase Storage
 * @param {Object} file - Object file dari formidable (harus ada filepath & originalFilename/newFilename)
 * @param {String} bucket - Nama bucket (default: 'uploads')
 * @param {String} folder - Nama folder tujuan (misal: 'company', 'products')
 * @returns {Promise<String>} - URL Public file yang diupload
 */
export async function uploadToSupabase(file, bucket = 'uploads', folder = '') {
    try {
        if (!file || !file.filepath) {
            throw new Error("File invalid atau tidak ditemukan");
        }

        // Baca file buffer dari temporary path
        const fileContent = fs.readFileSync(file.filepath);

        // Bersihkan nama file dan tambahkan timestamp
        const cleanName = (file.originalFilename || file.newFilename || 'file').replace(/[^a-zA-Z0-9.]/g, '_');
        const fileName = folder ? `${folder}/${Date.now()}_${cleanName}` : `${Date.now()}_${cleanName}`;

        // Upload ke Supabase
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, fileContent, {
                contentType: file.mimetype || 'application/octet-stream',
                upsert: false
            });

        if (error) {
            console.error("Supabase Storage Upload Error:", error);
            throw error;
        }

        // Ambil Public URL
        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;

    } catch (error) {
        console.error("Upload Service Error:", error);
        throw error;
    }
}

/**
 * Hapus file dari Supabase Storage berdasarkan URL
 * @param {String} fileUrl - URL lengkap file
 * @param {String} bucket - Nama bucket
 */
export async function deleteFromSupabase(fileUrl, bucket = 'uploads') {
    try {
        if (!fileUrl) return;

        // Extract file path dari URL
        // Contoh URL: https://xyz.supabase.co/storage/v1/object/public/uploads/company/123_logo.png
        // Target Path: company/123_logo.png

        const urlParts = fileUrl.split(`${bucket}/`);
        if (urlParts.length < 2) return; // URL tidak valid atau bukan dari bucket ini

        const filePath = urlParts[1]; // Ambil bagian setelah nama bucket

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error("Supabase File Delete Error:", error);
        }
    } catch (e) {
        console.error("Delete Service Exception:", e);
    }
}
