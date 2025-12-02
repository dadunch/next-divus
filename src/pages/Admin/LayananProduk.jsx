import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { Upload, Search, Save, Plus, Trash2, Image as ImageIcon, X } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from 'next/router';
import Cropper from "react-easy-crop";

// --- FUNGSI HELPER UTAMA ---

// 1. Crop Image Helper
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

// 2. Base64 to File Helper (PENTING AGAR BISA UPLOAD FILE FISIK)
const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
};


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

  // Icon State (Sesuai dengan EditLayananPage)
  const [showIconModal, setShowIconModal] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Font Awesome Search State
  const [faIcons, setFaIcons] = useState([]);
  const [faSearch, setFaSearch] = useState("");
  const [faLoading, setFaLoading] = useState(false);
  const [faError, setFaError] = useState("");

  // Fetch Font Awesome Icons from CDN metadata
  const fetchFontAwesomeIcons = async (searchQuery = "") => {
    setFaLoading(true);
    setFaError("");
    
    try {
      const response = await fetch('https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/metadata/icons.json');
      const data = await response.json();
      
      const iconsArray = Object.entries(data).map(([key, value]) => ({
        name: key,
        label: value.label || key,
        styles: value.styles || ['solid'],
        search: value.search?.terms || []
      }));

      let filtered = iconsArray;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = iconsArray.filter(icon => 
          icon.name.includes(query) || 
          icon.label.toLowerCase().includes(query) ||
          icon.search.some(term => term.includes(query))
        );
      }

      setFaIcons(filtered.slice(0, 100));
      setFaLoading(false);
    } catch (error) {
      console.error("Error fetching FA icons:", error);
      setFaError("Gagal memuat icon dari Font Awesome");
      setFaLoading(false);
      
      // Fallback ke icon list default
      const defaultIcons = [
        { name: "user", styles: ["solid"] },
        { name: "users", styles: ["solid"] },
        { name: "gear", styles: ["solid"] },
        { name: "cogs", styles: ["solid"] },
        { name: "chart-line", styles: ["solid"] },
        { name: "chart-bar", styles: ["solid"] },
        { name: "handshake", styles: ["solid"] },
        { name: "building", styles: ["solid"] },
        { name: "briefcase", styles: ["solid"] },
        { name: "lightbulb", styles: ["solid"] },
      ];
      setFaIcons(defaultIcons);
    }
  };

  // Load icons saat modal dibuka
  useEffect(() => {
    if (showIconModal) {
      fetchFontAwesomeIcons(faSearch);
    }
  }, [showIconModal]);

  // Search dengan debounce
  useEffect(() => {
    if (!showIconModal) return;
    
    const delayDebounce = setTimeout(() => {
      fetchFontAwesomeIcons(faSearch);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [faSearch]);

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
      setFoto(croppedImg); // Ini masih Base64 String
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

  // Handler Icon (Sesuai dengan EditLayananPage)
  const pilihIcon = (iconName, style = "solid") => {
    const iconClass = `fa-${style} fa-${iconName}`;
    setSelectedIcon(iconClass);
    setShowIconModal(false);
    setFaSearch("");
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

  // --- LOGIKA SIMPAN DATA (UPDATED) ---
  const handleSave = async () => {
    if (!namaLayanan.trim()) return Swal.fire("Error", "Nama layanan wajib diisi", "error");
    if (!deskripsi.trim()) return Swal.fire("Error", "Deskripsi wajib diisi", "error");

    setIsSubmitting(true);

    try {
      // 1. Format Deskripsi
      let finalDescription = deskripsi;
      if (deskripsiSingkat) finalDescription = `**Ringkasan:** ${deskripsiSingkat}\n\n${finalDescription}`;
      if (layananDitawarkan.length > 0) {
        finalDescription += `\n\n**Layanan yang ditawarkan:**\n` + layananDitawarkan.map(item => `- ${item}`).join('\n');
      }

      // 2. Siapkan FormData (Wajib pakai FormData untuk upload file fisik)
      const formData = new FormData();
      formData.append('title', namaLayanan);
      formData.append('description', finalDescription);
      formData.append('short_description', deskripsiSingkat || '');
      formData.append('icon_url', selectedIcon || '');
      formData.append('userId', user?.id || '');

      // 3. Proses File Gambar dengan Nama Custom
      if (foto) {
        // Bersihkan nama layanan dari spasi/simbol untuk jadi nama file
        const cleanName = namaLayanan.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(); 
        
        // Buat Timestamp: TahunBulanTanggal-JamMenit (Contoh: 20231130-1430)
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const timestamp = `${year}${month}${day}-${hours}${minutes}`;
        const newFileName = `${cleanName}-${timestamp}.jpg`;

        // Ubah Base64 crop menjadi File Object
        const fileImage = dataURLtoFile(foto, newFileName);
        
        // Masukkan ke FormData
        formData.append('image', fileImage);
      }

      // 4. Kirim ke API
      // PENTING: Jangan set Content-Type header manual saat pakai FormData
      const res = await fetch('/api/services', {
        method: 'POST',
        body: formData, 
      });

      const result = await res.json();

      if (res.ok) {
        Swal.fire("Berhasil", "Layanan ditambahkan!", "success").then(() => {
          // Kirim sinyal refresh ke Sidebar (Sesuai kode sidebar Anda sebelumnya)
          window.dispatchEvent(new Event('refreshSidebar')); 

          // Reset Form
          setNamaLayanan(""); 
          setDeskripsi(""); 
          setDeskripsiSingkat(""); 
          setLayananDitawarkan([]);
          setFoto(null); 
          setPreviewFoto(null); 
          setSelectedIcon("");
          if (fileInputRef.current) fileInputRef.current.value = "";
          
          // Opsional: Redirect atau tetap di halaman
          // router.push('/Admin/Layanan'); 
        });
      } else {
        throw new Error(result.error || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      <Head>
        <title>Kelola Layanan - Admin</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </Head>

      {/* Header */}
      <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className="text-white font-bold text-lg">Admin Panel</div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">
              Hi, {user?.username || "Admin"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold border-2 border-gray-400 uppercase">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {/* KOTAK KIRI: FOTO */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">1. Foto Header</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl aspect-video flex items-center justify-center bg-gray-50 relative overflow-hidden group hover:border-green-500 transition-colors">
                {previewFoto ? (
                  <>
                    <img src={previewFoto} className="w-full h-full object-cover" alt="Preview" />
                    <button onClick={removeFoto} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-all">
                      <X size={14} />
                    </button>
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
              <div className="border-2 border-dashed border-gray-300 rounded-xl aspect-video flex items-center justify-center bg-gray-50 relative overflow-hidden group hover:border-green-500 transition-colors">
                {selectedIcon ? (
                  <>
                    <i className={`${selectedIcon} text-5xl text-blue-600`}></i>
                    <button onClick={removeIcon} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-all">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4 pointer-events-none">
                    <div className="mx-auto text-gray-400 mb-1 flex justify-center">
                      <i className="fa-solid fa-icons text-2xl"></i>
                    </div>
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
              <input 
                type="text" 
                value={namaLayanan} 
                onChange={(e) => setNamaLayanan(e.target.value)} 
                className="w-full bg-gray-100 border border-transparent outline-none focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-lg px-4 py-3 text-gray-800 transition-all" 
                placeholder="Masukkan nama layanan..." 
              />
            </div>

            {/* List Layanan SEJAJAR */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Poin-poin Layanan yang Ditawarkan</label>
              <div>
                <div className="flex gap-0 h-11 mb-4">
                  <input
                    type="text"
                    value={inputLayanan}
                    onChange={(e) => setInputLayanan(e.target.value)}
                    className="w-full bg-gray-100 border border-transparent outline-none focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-l-lg px-4 py-3 text-gray-800 transition-all"
                    placeholder="Masukkan poin layanan..."
                    onKeyPress={(e) => e.key === 'Enter' && tambahLayananItem()}
                  />
                  <button 
                    onClick={tambahLayananItem} 
                    className="bg-[#1E293B] text-white px-6 text-sm font-medium rounded-r-lg hover:bg-black transition flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={16} /> Tambah Layanan
                  </button>
                </div>
                
                <div className="space-y-2">
                  {layananDitawarkan.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center">Belum ada Layanan.</p>
                  ) : (
                    layananDitawarkan.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white px-4 py-2 rounded border shadow-sm">
                        <span className="text-sm text-gray-700">• {item}</span>
                        <button 
                          onClick={() => hapusLayananItem(idx)} 
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Singkat</label>
              <textarea 
                value={deskripsiSingkat} 
                onChange={(e) => setDeskripsiSingkat(e.target.value)} 
                rows={2} 
                className="w-full bg-gray-100 border border-transparent outline-none focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-lg px-4 py-3 text-gray-800 transition-all" 
                placeholder="Ringkasan layanan..." 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Lengkap</label>
              <textarea 
                value={deskripsi} 
                onChange={(e) => setDeskripsi(e.target.value)} 
                rows={10} 
                className="w-full bg-gray-100 border border-transparent outline-none focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-lg px-4 py-3 text-gray-800 transition-all"
                placeholder="Detail lengkap layanan..."
              />
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button 
              onClick={handleSave} 
              disabled={isSubmitting} 
              className="bg-[#27D14C] text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-[#20b93f] transition disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={18} /> {isSubmitting ? 'Menyimpan...' : 'Simpan Layanan'}
            </button>
          </div>
        </div>
      </div>

      {/* Font Awesome Icon Modal (SAMA DENGAN EDIT PAGE) */}
      {showIconModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-xl">Pilih Icon Font Awesome</h3>
                <p className="text-xs text-gray-500 mt-1">Cari dari 2000+ icon gratis</p>
              </div>
              <button 
                onClick={() => setShowIconModal(false)}
                className="hover:bg-gray-100 p-2 rounded-lg transition"
              >
                <X size={24}/>
              </button>
            </div>
            
            <input 
              type="text" 
              placeholder="Cari icon... (contoh: user, chart, building)" 
              value={faSearch} 
              onChange={(e) => setFaSearch(e.target.value)} 
              className="w-full border-2 border-gray-300 px-4 py-3 mb-4 rounded-lg focus:border-blue-500 outline-none"
              autoFocus
            />

            {faError && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg mb-4 text-sm">
                {faError}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {faLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Memuat icon...</span>
                </div>
              ) : (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {faIcons.map((icon) => (
                    <button 
                      key={icon.name}
                      onClick={() => pilihIcon(icon.name, icon.styles[0])}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 flex flex-col items-center justify-center gap-2 transition-all group"
                      title={icon.label || icon.name}
                    >
                      <i className={`fa-${icon.styles[0]} fa-${icon.name} text-2xl text-gray-700 group-hover:text-blue-600 transition-colors`}></i>
                      <span className="text-[10px] text-gray-500 text-center leading-tight truncate w-full">
                        {icon.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {!faLoading && faIcons.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <i className="fa-solid fa-search text-4xl mb-3 text-gray-300"></i>
                  <p>Tidak ada icon yang ditemukan</p>
                  <p className="text-sm mt-1">Coba kata kunci lain</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
              Menampilkan {faIcons.length} icon • Powered by Font Awesome 6.5
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
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
                className="px-4 py-2 bg-green-600 text-white rounded"
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