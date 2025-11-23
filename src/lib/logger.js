// src/lib/logger.js

/**
 * Fungsi untuk mencatat aktivitas ke database
 * @param {Object} tx - Instance Prisma Transaction
 * @param {string} userId - ID User yang melakukan aksi
 * @param {string} action - Jenis aksi (Contoh: "Tambah Produk")
 * @param {string} details - Detail lengkap (Contoh: "Menambahkan produk sepatu")
 */
export const createLog = async (tx, userId, action, details) => {
  if (!userId) return; // Jika tidak ada user, jangan catat (atau catat sebagai System)

  await tx.activity_logs.create({
    data: {
      user_id: BigInt(userId),
      action: action,
      details: details
    }
  });
};