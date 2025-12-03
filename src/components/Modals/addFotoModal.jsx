import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import Cropper from "react-easy-crop";

const AddFotoModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CROP STATE
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  /* ================= RESET STATE ================= */
  const resetState = () => {
    setImageFile(null);
    setPreview(null);
    setTitle("");
    setIsSubmitting(false);
    setCropModalOpen(false);
    setTempImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  /* ================= BASE64 ================= */
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  /* ================= IMAGE PICK ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("File Terlalu Besar", "Maksimal 2MB", "warning");
      return;
    }

    const url = URL.createObjectURL(file);
    setTempImage(url);
    setCropModalOpen(true);
  };

  /* ================= CROP FINISH ================= */
  const selesaiCrop = async () => {
    if (!croppedAreaPixels) return;

    const image = new Image();
    image.src = tempImage;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    canvas.toBlob((blob) => {
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      setImageFile(file);
      setPreview(URL.createObjectURL(blob));
      setCropModalOpen(false);
    }, "image/jpeg");
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      Swal.fire("Error", "Foto wajib diunggah", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const base64image = await toBase64(imageFile);
      const bodyData = {
        title,
        image_url: base64image,
        userId: user?.id || 1,
      };

      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const result = await res.json();

      if (res.ok) {
        Swal.fire("Berhasil", "Foto berhasil ditambahkan", "success");
        resetState();
        onSuccess();
        onClose();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= AUTO RESET SAAT MODAL TUTUP ================= */
  useEffect(() => {
    if (!isOpen) resetState();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Tambah Foto Perusahaan</h2>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">

          {/* PREVIEW */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 relative overflow-hidden group hover:border-green-500 transition">
            {preview ? (
              <>
                <div className="relative w-full aspect-[4/3]">
                  <img
                    src={preview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <p className="text-white">Klik untuk ganti</p>
                </div>
              </>
            ) : (
              <div className="min-h-[200px] flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={48} />
                <span className="text-sm">upload foto</span>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* SIZE INFO */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Rasio</span> <span className="font-medium">4 : 3</span>
            </div>
            <div className="flex justify-between">
              <span>Rekomendasi</span> <span>800 × 600 px</span>
            </div>
            <div className="flex justify-between">
              <span>Minimum</span> <span>400 × 300 px</span>
            </div>
            <div className="flex justify-between">
              <span>Format</span> <span>JPG / PNG</span>
            </div>
            <div className="flex justify-between">
              <span>Maks</span> <span>2 MB</span>
            </div>
          </div>

          {/* TITLE */}
          <input
            type="text"
            placeholder="Judul foto (opsional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none
           focus:ring-1 focus:ring-green-500
           focus:border-green-500" />

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2D2D39] text-white py-3 rounded-xl hover:bg-black"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Foto"}
          </button>
        </form>
      </div>

      {/* CROP MODAL */}
      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-lg h-[80%] flex flex-col">
            <h2 className="text-lg font-semibold mb-3">Crop Foto</h2>

            <div className="relative flex-1">
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) =>
                  setCroppedAreaPixels(pixels)
                }
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              className="mt-4"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={resetState}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={selesaiCrop}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFotoModal;
