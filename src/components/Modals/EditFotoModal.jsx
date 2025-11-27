import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

const EditFotoModal = ({ isOpen, onClose, onSuccess, data }) => {
  const [deskripsi, setDeskripsi] = useState("");
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset dan isi data ketika modal dibuka
  useEffect(() => {
    if (isOpen && data) {
      setDeskripsi(data.deskripsi || "");
      setPreview(data.foto ? data.foto : null);
      setImageFile(null);
    }
  }, [isOpen, data]);

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
    setPreview(URL.createObjectURL(file)); // preview lokal
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let base64Image = data.foto;

      // Jika user mengganti foto → convert ke base64
      if (imageFile) {
        base64Image = await toBase64(imageFile);
      }

      const payload = {
        id: data.id,
        deskripsi,
        foto: base64Image
      };

      const res = await fetch(`/api/Fotos/${data.id}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Foto berhasil diperbarui", "success");
        onSuccess();
      } else {
        throw new Error("Gagal memperbarui foto");
      }

    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Edit Foto</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={22} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* PREVIEW */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Preview Foto
            </label>

            <div className="border rounded-xl max-h-[350px] min-h-[150px] flex items-center justify-center bg-gray-100 p-3 overflow-hidden">
              {preview ? (
                <div className="relative w-full flex justify-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-[330px] w-auto object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <ImageIcon size={40} />
                  <span className="text-sm mt-2">Tidak ada foto</span>
                </div>
              )}
            </div>

            {/* INPUT GANTI FOTO */}
            <label className="mt-3 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition">
              <ImageIcon className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-500 font-medium">Ganti Foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* DESKRIPSI */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Deskripsi (opsional)
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              placeholder="Tambahkan deskripsi..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2D2D39] text-white py-3 rounded-lg font-medium hover:bg-black transition disabled:opacity-50"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditFotoModal;
