import React, { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const AddFotoModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [deskripsi, setDeskripsi] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Convert ke Base64
      const base64image = await toBase64(imageFile);

      // ID user
      const currentUserId = user?.id || 1;

      const bodyData = {
        image: base64image,
        description: deskripsi,
        userId: currentUserId,
      };

      const res = await fetch("/api/Foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Foto berhasil ditambahkan", "success");
        onSuccess();
      } else {
        Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan", "error");
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            Tambah Foto Perusahaan
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Preview */}
          <div className="border rounded-xl max-h-[350px] min-h-[150px] flex items-center justify-center bg-gray-100 p-3 overflow-hidden">
            {preview ? (
              <img
                src={preview}
                className="max-h-[330px] w-auto object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <ImageIcon size={40} />
                <span className="text-sm mt-2">Belum ada foto</span>
              </div>
            )}
          </div>

          {/* Upload */}
          <label className="w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer flex flex-col items-center justify-center py-5 hover:bg-gray-50">
            <ImageIcon className="text-gray-400 mb-2" />
            <span className="text-gray-500 text-sm">Pilih Foto</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>

          {/* Deskripsi */}
          <textarea
            placeholder="Deskripsi (opsional)"
            className="w-full border border-gray-300 px-4 py-3 rounded-xl"
            rows={3}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
          ></textarea>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2D2D39] text-white py-3 rounded-xl hover:bg-black transition disabled:opacity-50"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Foto"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFotoModal;
