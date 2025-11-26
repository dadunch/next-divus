import React, { useState, useRef } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { Upload, Save, Plus, Trash2, Image as ImageIcon, X } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from 'next/router';
import Cropper from "react-easy-crop";


async function getCroppedImg(imageSrc, pixelCrop) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  const ctx = canvas.getContext("2d");

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

  return canvas.toDataURL("image/jpeg");
}


const TambahLayananPage = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth || {});
  const fileInputRef = useRef(null);

  // --- STATE CROP ---
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);


  // --- STATE ---
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [namaLayanan, setNamaLayanan] = useState("");
  const [deskripsiSingkat, setDeskripsiSingkat] = useState("");
  const [inputLayanan, setInputLayanan] = useState("");
  const [layananDitawarkan, setLayananDitawarkan] = useState([]);
  const [deskripsi, setDeskripsi] = useState("");

  // State Icon & UI
  const [showIconModal, setShowIconModal] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Icon List
  const iconList = [
    "fa-solid fa-user", "fa-solid fa-users", "fa-solid fa-gear", "fa-solid fa-cogs",
    "fa-solid fa-chart-line", "fa-solid fa-chart-bar", "fa-solid fa-handshake",
    "fa-solid fa-building", "fa-solid fa-briefcase", "fa-solid fa-lightbulb",
    "fa-solid fa-bullseye", "fa-solid fa-calendar", "fa-solid fa-check",
    "fa-solid fa-circle-info", "fa-solid fa-database", "fa-solid fa-folder",
    "fa-solid fa-phone", "fa-solid fa-envelope", "fa-solid fa-globe",
    "fa-solid fa-shield-halved", "fa-solid fa-building-columns"
  ];



  // Helper Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });



  // Handler Foto
  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    setTempImage(fileURL);
    setCropModalOpen(true);
  };

  const selesaiCrop = async () => {
    try {
      const croppedImg = await getCroppedImg(tempImage, croppedAreaPixels);
      setPreviewFoto(croppedImg);
      setFoto(croppedImg);
      setCropModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFoto = (e) => {
    e.stopPropagation();
    setFoto(null);
    setPreviewFoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Handler Icon
  const pilihIcon = (icon) => {
    setSelectedIcon(icon);
    setShowIconModal(false);
    setIconSearch("");
  };

  const removeIcon = (e) => {
    e.stopPropagation();
    setSelectedIcon("");
  }

  // Handler List
  const tambahLayananItem = () => {
    if (!inputLayanan.trim()) return;
    setLayananDitawarkan([...layananDitawarkan, inputLayanan]);
    setInputLayanan("");
  };

  const hapusLayananItem = (index) => {
    const newList = [...layananDitawarkan];
    newList.splice(index, 1);
    setLayananDitawarkan(newList);
  };

  // Simpan Data
  const handleSave = async () => {
    if (!namaLayanan.trim()) return Swal.fire("Error", "Nama layanan wajib diisi", "error");
    if (!deskripsi.trim()) return Swal.fire("Error", "Deskripsi wajib diisi", "error");

    setIsSubmitting(true);

    try {
      let finalDescription = deskripsi;
      if (deskripsiSingkat) finalDescription = `**Ringkasan:** ${deskripsiSingkat}\n\n${finalDescription}`;
      if (layananDitawarkan.length > 0) {
        finalDescription += `\n\n**Layanan yang ditawarkan:**\n` + layananDitawarkan.map(item => `- ${item}`).join('\n');
      }

      const payload = {
        title: namaLayanan,
        description: finalDescription,
        icon_class: selectedIcon,
        image_url: foto,
        userId: user?.id
      };

      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        Swal.fire("Berhasil", "Layanan ditambahkan!", "success").then(() => {
          setNamaLayanan(""); setDeskripsi(""); setDeskripsiSingkat(""); setLayananDitawarkan([]);
          setFoto(null); setPreviewFoto(null); setSelectedIcon("");
        });
      } else {
        throw new Error(result.error || "Gagal menyimpan data");
      }
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIcons = iconList.filter((ic) => ic.toLowerCase().includes(iconSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      <Head>
        <title>Kelola Layanan - Admin</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </Head>

      {/* Header */}
      <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className="text-white font-bold text-lg">Admin Panel</div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold border-2 border-gray-400">
            {user?.username ? user.username.charAt(0) : "A"}
          </div>
        </div>
      </header>

      <div className="px-8 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Tambah Layanan Baru</h1>
          <p className="text-gray-500 font-medium">Kelola Layanan Perusahaan</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

          {/* --- AREA MEDIA UTAMA (GRID 2 KOLOM) --- */}
          <div className="grid grid-cols-2 gap-6 mb-8">

            {/* KOTAK KIRI: FOTO */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">1. Foto Header</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl aspect-video flex items-center justify-center bg-gray-50 relative overflow-hidden group hover:border-blue-400 transition-colors">
                {previewFoto ? (
                  <>
                    <img src={previewFoto} className="w-full h-full object-cover" alt="Preview" />
                    <button onClick={removeFoto} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:scale-110 transition"><X size={14} /></button>
                  </>
                ) : (
                  <div className="text-center p-4 pointer-events-none">
                    <ImageIcon className="mx-auto text-gray-400 mb-1" size={28} />
                    <span className="text-xs text-gray-500">Belum ada foto</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFotoChange} />
                {!previewFoto && <div className="absolute inset-0 cursor-pointer" onClick={() => fileInputRef.current.click()} />}
              </div>
              <button onClick={() => fileInputRef.current.click()} className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                {previewFoto ? "Ganti Foto" : "Upload Foto"}
              </button>
            </div>

            {/* KOTAK KANAN: ICON */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">2. Icon Layanan</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl aspect-video flex items-center justify-center bg-gray-50 relative overflow-hidden group hover:border-blue-400 transition-colors">

                {selectedIcon ? (
                  <>
                    <i className={`${selectedIcon} text-5xl text-blue-600`}></i>
                    <button onClick={removeIcon} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:scale-110 transition"><X size={14} /></button>
                  </>
                ) : (
                  <div className="text-center p-4 pointer-events-none">
                    <div className="mx-auto text-gray-400 mb-1 flex justify-center"><i className="fa-solid fa-icons text-2xl"></i></div>
                    <span className="text-xs text-gray-500">Belum ada icon</span>
                  </div>
                )}
                {!selectedIcon && <div className="absolute inset-0 cursor-pointer" onClick={() => setShowIconModal(true)} />}
              </div>
              <button onClick={() => setShowIconModal(true)} className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                {selectedIcon ? "Ganti Icon" : "Pilih Icon"}
              </button>
            </div>
          </div>

          {/* --- FORM TEXT --- */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Layanan</label>
              <input type="text" value={namaLayanan} onChange={(e) => setNamaLayanan(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan nama layanan..." />
            </div>

            {/* List Layanan SEJAJAR */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Poin Layanan Ditawarkan</label>
              <div className="">
                <div className="flex gap-0 h-11 mb-4">
                  <input
                    type="text"
                    value={inputLayanan}
                    onChange={(e) => setInputLayanan(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Contoh: Analisis Data"
                    onKeyPress={(e) => e.key === 'Enter' && tambahLayananItem()}
                  />
                  <button onClick={tambahLayananItem} className="bg-[#1E293B] text-white px-6 text-sm font-medium rounded-r-lg hover:bg-black transition flex items-center gap-2 whitespace-nowrap">
                    <Plus size={16} /> Tambah Layanan
                  </button>
                </div>
                <div className="space-y-2">
                  {layananDitawarkan.length === 0 ? <p className="text-xs text-gray-400 italic text-center">Belum ada Layanan.</p> :
                    layananDitawarkan.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white px-4 py-2 rounded border shadow-sm">
                        <span className="text-sm text-gray-700">• {item}</span>
                        <button onClick={() => hapusLayananItem(idx)} className="text-red-500 hover:text-red-800"><Trash2 size={24} /></button>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Singkat</label>
              <textarea value={deskripsiSingkat} onChange={(e) => setDeskripsiSingkat(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Ringkasan..." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Lengkap</label>
              <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={6} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Detail lengkap..." />
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button onClick={handleSave} disabled={isSubmitting} className="bg-[#27D14C] text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-[#20b93f] transition disabled:opacity-50 flex items-center gap-2">
              <Save size={18} /> {isSubmitting ? 'Menyimpan...' : 'Simpan Layanan'}
            </button>
          </div>
        </div>
      </div>

      {/* Icon Modal */}
      {showIconModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-lg">Pilih Icon</h3><button onClick={() => setShowIconModal(false)}><X /></button></div>
            <input type="text" placeholder="Cari icon..." value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} className="w-full border px-4 py-2 mb-4 rounded-lg" />
            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
              {filteredIcons.map((ic) => (
                <button key={ic} onClick={() => pilihIcon(ic)} className={`p-3 border rounded hover:bg-gray-50 flex justify-center ${selectedIcon === ic ? 'bg-blue-50 border-blue-500' : ''}`}><i className={`${ic} text-xl`}></i></button>
              ))}
            </div>
          </div>
        </div>
      )}

      {cropModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 shadow-lg relative w-[90%] h-[80%] max-w-lg flex flex-col">
            <h2 className="text-lg font-semibold mb-3">Crop Gambar</h2>

            <div className="relative flex-1">
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={16/9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(croppedArea, croppedPixels) =>
                  setCroppedAreaPixels(croppedPixels)
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
              className="mt-3"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setCropModalOpen(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={selesaiCrop}
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

export default TambahLayananPage;