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

  /* ================= CROP HELPERS ================= */
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
  /* ================================================ */

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

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("File Terlalu Besar", "Maksimal 2MB", "warning");
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

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName || !logoFile) {
      Swal.fire(
        "Data Belum Lengkap",
        "Mohon isi nama customer & upload logo",
        "warning"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const base64Image = await toBase64(logoFile);

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientName,
          client_logo: base64Image,
          userId: user?.id,
        }),
      });

      if (!res.ok) throw new Error();

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Client berhasil ditambahkan",
        timer: 1300,
        showConfirmButton: false,
      });

      onSuccess();
      handleClose();
    } catch {
      Swal.fire("Error", "Gagal menyimpan data", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ================= MODAL ================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-['Poppins']">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
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
                className="relative h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer flex items-center justify-center hover:border-green-500 transition"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon
                      className="mx-auto text-gray-300 mb-2"
                      size={40}
                    />
                    <p className="text-xs text-gray-400">PNG/JPG • Max 2MB</p>
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
                className="mt-3 w-full py-2.5 border rounded-lg flex justify-center gap-2"
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
                className="px-6 py-2.5 border rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-[#2D2D39] text-white shadow"
              >
                {isSubmitting ? "Menyimpan..." : "Tambah"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= CROP MODAL ================= */}
      {cropModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Crop Logo</h3>

            <div className="relative w-full h-64 bg-black">
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

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              className="w-full mt-4"
            />

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setCropModal(false)}
                className="px-5 py-2 border rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={saveCroppedImage}
                className="px-5 py-2 bg-green-600 text-white rounded-lg"
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
