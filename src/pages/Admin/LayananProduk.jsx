import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { Upload, Save, Calendar as CalendarIcon } from "lucide-react";
import Swal from "sweetalert2";

const TambahLayananPage = () => {
  const { user } = useSelector((state) => state.auth || {});
  const fileInputRef = useRef(null);

  // Form state
  const [foto, setFoto] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  // Crop modal state
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [namaLayanan, setNamaLayanan] = useState(null);
  const [layananDitawarkan, setLayananDitawarkan] = useState([]);
  const [inputLayanan, setInputLayanan] = useState("");

  const [deskripsiSingkat, setDeskripsiSingkat] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  // Icon picker (grid modal)
  const [showIconModal, setShowIconModal] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(""); // e.g. "fa-solid fa-user"

  // basic icon list (solid) — kamu bisa tambahkan lagi
  const iconList = [
    "fa-solid fa-user",
    "fa-solid fa-users",
    "fa-solid fa-gear",
    "fa-solid fa-cogs",
    "fa-solid fa-chart-line",
    "fa-solid fa-chart-bar",
    "fa-solid fa-chart-pie",
    "fa-solid fa-handshake",
    "fa-solid fa-building",
    "fa-solid fa-briefcase",
    "fa-solid fa-lightbulb",
    "fa-solid fa-brain",
    "fa-solid fa-bullseye",
    "fa-solid fa-calendar",
    "fa-solid fa-check",
    "fa-solid fa-circle-info",
    "fa-solid fa-database",
    "fa-solid fa-file-lines",
    "fa-solid fa-folder",
    "fa-solid fa-phone",
    "fa-solid fa-envelope",
    "fa-solid fa-laptop-code",
    "fa-solid fa-globe",
    "fa-solid fa-shield-halved",
    "fa-solid fa-building-columns",
  ];

  useEffect(() => {
    // cleanup preview URL on unmount
    return () => {
      if (previewFoto) URL.revokeObjectURL(previewFoto);
    };
  }, [previewFoto]);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Error", "Ukuran file maksimal 2MB", "error");
      return;
    }
    
    // Read file and show crop modal
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createCroppedImage = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    const image = new Image();
    image.src = imageToCrop;
    
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

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

    // Apply rounded corners
    const roundedCanvas = document.createElement('canvas');
    const roundedCtx = roundedCanvas.getContext('2d');
    const radius = 16; // rounded-lg equivalent (1rem = 16px)

    roundedCanvas.width = canvas.width;
    roundedCanvas.height = canvas.height;

    // Create rounded rectangle path
    roundedCtx.beginPath();
    roundedCtx.moveTo(radius, 0);
    roundedCtx.lineTo(canvas.width - radius, 0);
    roundedCtx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
    roundedCtx.lineTo(canvas.width, canvas.height - radius);
    roundedCtx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
    roundedCtx.lineTo(radius, canvas.height);
    roundedCtx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
    roundedCtx.lineTo(0, radius);
    roundedCtx.quadraticCurveTo(0, 0, radius, 0);
    roundedCtx.closePath();
    roundedCtx.clip();

    // Draw the cropped image with rounded corners
    roundedCtx.drawImage(canvas, 0, 0);

    return new Promise((resolve) => {
      roundedCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        resolve({ url, blob });
      }, 'image/png', 0.95); // PNG to preserve transparency in corners
    });
  };

  const handleCropSave = async () => {
    try {
      const { url, blob } = await createCroppedImage();
      setPreviewFoto(url);
      setFoto(url);
      
      // Convert blob to file
      const file = new File([blob], 'cropped-image.png', { type: 'image/png' });
      setFotoFile(file);
      
      setShowCropModal(false);
      setImageToCrop(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (error) {
      console.error('Error cropping image:', error);
      Swal.fire("Error", "Gagal memotong gambar", "error");
    }
  };

  const tambahLayanan = () => {
    if (!inputLayanan.trim()) return;
    setLayananDitawarkan((prev) => [...prev, inputLayanan.trim()]);
    setInputLayanan("");
  };

  const hapusLayanan = (index) => {
    setLayananDitawarkan((prev) => prev.filter((_, i) => i !== index));
  };

  const pilihIcon = (icon) => {
    setSelectedIcon(icon);
    setShowIconModal(false);
    setIconSearch("");
  };

  const handleSave = async () => {
    // contoh validasi sederhana
    if (!namaLayanan.trim()) {
      Swal.fire("Error", "Nama layanan wajib diisi", "error");
      return;
    }

    // contoh convert ke base64 bila perlu
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
      });

    let fotoData = foto;
    if (fotoFile) {
      try {
        fotoData = await toBase64(fotoFile);
      } catch (err) {
        console.error(err);
      }
    }

    const payload = {
      namaLayanan,
      layananDitawarkan,
      deskripsiSingkat,
      deskripsi,
      icon: selectedIcon,
      foto: fotoData,
      updatedBy: user?.id || null,
      updatedAt: new Date().toISOString(),
    };

    // contoh simpan: kamu bisa panggil API di sini
    console.log("payload", payload);

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Data layanan berhasil disimpan (contoh).",
      confirmButtonColor: "#1E293B",
    });
  };

  // filter icons for grid by search
  const filteredIcons = iconList.filter((ic) =>
    ic.toLowerCase().includes(iconSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      <Head>
        <title>Kelola Layanan - Admin</title>
        {/* FontAwesome CDN (solid icons) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </Head>

      {/* TOP BAR (sama style dengan PerusahaanPage) */}
      <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className="relative w-1/3">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
            placeholder="Search.."
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">
              Hi, {user?.username || "Admin"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white uppercase font-bold border-2 border-gray-400">
            {user?.username ? user.username.charAt(0) : "A"}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="px-8 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Tambah Layanan Baru
          </h1>
          <p className="text-gray-500 font-medium">
            Kelola Layanan
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5 pb-4 border-b border-gray-200">
            Tambah / Edit Layanan
          </h2>

          {/* Upload Foto & Icon */}
          <div className="flex flex-col gap-6 mb-6">
            {/* Foto Landscape 16:9 - Smaller Preview */}
            <div className="w-full max-w-lg">
              <div className="relative w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden group" style={{ aspectRatio: '16/9' }}>
                {previewFoto ? (
                  <img
                    src={previewFoto}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image (16:9)</span>
                  </div>
                )}

                <div
                  className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <span className="text-white text-sm">Ganti Foto</span>
                </div>
              </div>

              <div className="mt-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFotoChange}
                />
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <Upload size={16} />
                    Upload Foto
                  </button>

                  <p className="text-xs text-gray-500">
                    PNG, JPG hingga 2MB • Ukuran disarankan 16:9 (landscape)
                  </p>
                </div>
              </div>
            </div>

            {/* Icon Picker Section */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-800">Icon:</label>
              <div
                className="flex items-center gap-3 bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => setShowIconModal(true)}
              >
                {selectedIcon ? (
                  <i className={`${selectedIcon} text-xl text-gray-700`}></i>
                ) : (
                  <span className="text-gray-500 text-sm">Pilih Icon</span>
                )}
              </div>

              {selectedIcon && (
                <button
                  onClick={() => setSelectedIcon("")}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* FORM FIELDS */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Nama Layanan
              </label>
              <input
                type="text"
                placeholder="Masukkan Nama Layanan..."
                value={namaLayanan}
                onChange={(e) => setNamaLayanan(e.target.value)}
                className="w-full bg-gray-100 border border-gray-100 focus:bg-white focus:border-gray-300 focus:ring-0 rounded-md px-4 py-2.5 text-gray-800 text-sm transition-colors placeholder:text-gray-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-800">
                  Nama Layanan Yang Di tawarkan
                </label>
                <button
                  onClick={tambahLayanan}
                  className="bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <span className="text-sm">+</span>
                  Tambah Layanan
                </button>
              </div>

              <input
                type="text"
                placeholder="Masukkan Nama Layanan..."
                value={inputLayanan}
                onChange={(e) => setInputLayanan(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    tambahLayanan();
                  }
                }}
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-100 rounded-md text-sm outline-none placeholder:text-gray-400 mb-3"
              />

              <div className="space-y-2">
                {layananDitawarkan.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-100"
                  >
                    <span className="text-gray-700 text-sm">{l}</span>
                    <button
                      onClick={() => hapusLayanan(i)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Deskripsi singkat
              </label>
              <textarea
                value={deskripsiSingkat}
                onChange={(e) => setDeskripsiSingkat(e.target.value)}
                rows={4}
                className="w-full bg-gray-100 border border-gray-100 focus:bg-white focus:border-gray-300 focus:ring-0 rounded-md px-4 py-2.5 text-gray-800 text-sm transition-colors resize-none placeholder:text-gray-400"
                placeholder="Masukkan Deskripsi Singkat..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Deskripsi
              </label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={6}
                className="w-full bg-gray-100 border border-gray-100 focus:bg-white focus:border-gray-300 focus:ring-0 rounded-md px-4 py-2.5 text-gray-800 text-sm transition-colors resize-none placeholder:text-gray-400"
                placeholder="Masukkan Deskripsi..."
              />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-6 py-2.5 rounded-md font-medium text-sm transition-all shadow-sm"
            >
              <Save size={16} />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>

      {/* CROP MODAL */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Crop Image (16:9)</h3>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setImageToCrop(null);
                }}
                className="text-gray-500 hover:text-black text-xl"
              >
                &times;
              </button>
            </div>

            <div className="relative w-full bg-gray-900 overflow-hidden" style={{ height: '500px' }}>
              {imageToCrop && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={imageToCrop}
                      alt="crop"
                      style={{
                        transform: `scale(${zoom})`,
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        transformOrigin: 'center center',
                      }}
                    />
                  </div>
                  
                  {/* Crop overlay - 16:9 box */}
                  <div 
                    className="absolute border-2 border-white shadow-lg pointer-events-none"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '80%',
                      aspectRatio: '16/9',
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                    }}
                  />
                </>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoom: {zoom.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setImageToCrop(null);
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleCropSave}
                  className="px-6 py-2.5 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-md text-sm font-medium transition-colors"
                >
                  Potong & Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ICON PICKER MODAL (Grid) */}
      {showIconModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pilih Icon</h3>
              <button
                onClick={() => {
                  setShowIconModal(false);
                  setIconSearch("");
                }}
                className="text-gray-500 hover:text-black text-xl"
              >
                &times;
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Cari icon..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg bg-gray-100 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-6 gap-3 max-h-72 overflow-y-auto">
              {filteredIcons.length === 0 ? (
                <div className="col-span-6 text-center text-gray-500 py-8">
                  Tidak ada icon
                </div>
              ) : (
                filteredIcons.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => pilihIcon(ic)}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-300"
                  >
                    <i className={`${ic} text-2xl text-gray-700`}></i>
                    <span className="text-xs text-gray-500 mt-2">{ic.replace("fa-solid ", "")}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TambahLayananPage;