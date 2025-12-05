import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Cropper from "react-easy-crop";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const AddClientModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);

  const [clientName, setClientName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cropModal, setCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef(null);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(new File([blob], "logo.png", { type: "image/png" })),
        "image/png"
      );
    });
  };

  const handleClose = () => {
    setClientName("");
    setLogoFile(null);
    setPreviewUrl(null);
    setCropModal(false);
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit size sebelum crop (misal 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("File Terlalu Besar", "Maksimal 5MB", "warning");
      return;
    }

    setTempImage(URL.createObjectURL(file));
    setCropModal(true);
  };

  const saveCroppedImage = async () => {
    const croppedFile = await getCroppedImg(tempImage, croppedAreaPixels);
    setLogoFile(croppedFile);
    setPreviewUrl(URL.createObjectURL(croppedFile));
    setCropModal(false);
  };

  // UBAH DISINI: Fungsi toBase64 DIHAPUS karena tidak dipakai lagi

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName || !logoFile) {
      Swal.fire(
        "Data Belum Lengkap",
        "Mohon isi nama client & upload logo",
        "warning"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("client_name", clientName);
      formData.append("client_logo", logoFile); // Kirim File Object langsung
      formData.append("userId", user?.id || "");

      const res = await fetch("/api/clients", { // Pastikan path API sesuai
        method: "POST",
        body: formData, 
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.message || "Gagal menyimpan data");
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Client berhasil ditambahkan",
        timer: 1300,
        showConfirmButton: false,
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message || "Gagal menyimpan data", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ================= MODAL ================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-['Poppins']">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-2xl font-bold">Tambah Client Baru</h2>
            <p className="text-gray-500 text-sm">Masukkan informasi client</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* LOGO */}
            <div>
              <label className="text-sm font-bold mb-2 block">
                Logo Perusahaan*
              </label>

              <div
                onClick={() => fileInputRef.current.click()}
                className="relative h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer flex items-center justify-center hover:border-green-500 transition overflow-hidden"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className="w-full h-full object-contain p-2"
                    alt="Preview"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon
                      className="mx-auto text-gray-300 mb-2"
                      size={40}
                    />
                    <p className="text-xs text-gray-400">PNG/JPG • Max 5MB</p>
                  </div>
                )}
              </div>

              {/* Size Chart */}
              <div className="mt-2 mb-4 text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Rasio</span>
                  <span className="font-medium text-gray-700">
                    1 : 1 (Persegi)
                  </span>
                </div>
              
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="font-medium text-gray-700">PNG, JPG</span>
                </div>
                <div className="flex justify-between">
                  <span>Maksimal File</span>
                  <span className="font-medium text-gray-700">5 MB</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="mt-3 w-full py-2.5 border rounded-lg flex justify-center gap-2 hover:bg-gray-50 transition"
              >
                <Upload size={18} /> Upload Logo
              </button>
            </div>

            {/* NAME */}
            <div>
              <label className="text-sm font-bold mb-2 block">Customer*</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                placeholder="Nama Perusahaan"
              />
            </div>

            {/* ACTION */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 transition"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-[#2D2D39] text-white shadow hover:bg-black transition flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                     <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                     Menyimpan...
                  </>
                ) : (
                  "Tambah"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= CROP MODAL ================= */}
      {cropModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
            <h3 className="font-bold text-lg mb-4">Crop Logo</h3>

            <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, a) => setCroppedAreaPixels(a)}
              />
            </div>

            <div className="mt-4">
               <label className="text-xs text-gray-500 mb-1 block">Zoom</label>
               <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setCropModal(false)}
                className="px-5 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={saveCroppedImage}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddClientModal;