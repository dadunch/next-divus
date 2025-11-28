import React, { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const AddFotoModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState(""); // Ubah nama state agar sesuai konteks DB
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi convert gambar ke text Base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // VALIDASI UKURAN FILE (Maks 2MB agar server tidak crash)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("File Terlalu Besar", "Maksimal ukuran foto adalah 2MB", "warning");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      Swal.fire("Error", "Foto wajib diunggah", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Convert gambar ke Base64 string
      const base64image = await toBase64(imageFile);

      // 2. Siapkan data sesuai Schema Database (company_photos)
      const currentUserId = user?.id || 1; // Fallback ID jika user logout
      
      const bodyData = {
        title: title,           // Sesuai kolom 'title' di DB
        image_url: base64image, // Sesuai kolom 'image_url' di DB
        userId: currentUserId,  // Untuk Logger
      };

      // 3. Kirim ke Endpoint yang benar (huruf kecil)
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const result = await res.json();

      if (res.ok) {
        Swal.fire("Berhasil", "Foto berhasil ditambahkan", "success");
        // Reset Form
        setImageFile(null);
        setPreview(null);
        setTitle("");
        onSuccess(); // Refresh data di halaman parent
      } else {
        throw new Error(result.message || "Gagal menyimpan data");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* HEADER */}
        <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            Tambah Foto Perusahaan
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Preview Image */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl min-h-[200px] flex items-center justify-center bg-gray-50 relative overflow-hidden group">
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-contain"
                />
                {/* Overlay ganti foto */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium">Klik untuk ganti</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-gray-400 p-6">
                <ImageIcon size={48} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">Preview foto akan muncul di sini</span>
              </div>
            )}
            
            {/* Input file yang menutupi area preview agar bisa diklik di mana saja */}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImageChange}
            />
          </div>

          <div className="text-xs text-gray-500 text-center">
             *Format: JPG/PNG. Maksimal 2MB.
          </div>

          {/* Input Judul / Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Foto</label>
            <input
              type="text"
              placeholder="Contoh: Kegiatan Rapat Tahunan 2024"
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2D2D39] text-white py-3 rounded-xl hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
               <>
                 <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                 Menyimpan...
               </>
            ) : (
               "Simpan Foto"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFotoModal;