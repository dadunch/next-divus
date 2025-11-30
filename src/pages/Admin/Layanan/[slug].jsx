import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Upload, Save, Trash2, ArrowLeft, Plus, X, Image as ImageIcon } from "lucide-react"; 
import Swal from "sweetalert2";

const EditLayananPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useSelector((state) => state.auth || {});
  const fileInputRef = useRef(null);

  const [serviceId, setServiceId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE FORM ---
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  
  const [namaLayanan, setNamaLayanan] = useState("");
  const [deskripsiSingkat, setDeskripsiSingkat] = useState(""); 
  const [deskripsi, setDeskripsi] = useState("");
  
  // State List Layanan
  const [inputLayanan, setInputLayanan] = useState("");
  const [layananDitawarkan, setLayananDitawarkan] = useState([]); 
  const [originalLayanan, setOriginalLayanan] = useState([]); // Untuk tracking data awal

  // Icon State
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

  // --- FETCH & PARSE DATA ---
  const fetchData = async () => {
    if (!slug) return;
    
    try {
      const resDetail = await fetch(`/api/services/${slug}`);
      const detail = await resDetail.json();
      
      const resSubLayanan = await fetch(`/api/sub_services/by_services/${slug}`);
      const Subdetail = await resSubLayanan.json();
      
      if (resDetail.ok) {
        setServiceId(detail.id);
        setNamaLayanan(detail.title);
        setDeskripsi(detail.description || "");
        setDeskripsiSingkat(detail.short_description || "");
        
        // Simpan dengan struktur yang konsisten
        const formattedSubLayanan = Subdetail.map(item => ({
          id: item.id,
          sub_services: item.sub_services,
          isNew: false
        }));
        
        setLayananDitawarkan(formattedSubLayanan);
        setOriginalLayanan(formattedSubLayanan);

        // Handle Gambar & Icon
        if (detail.image_url) {
          setFoto(detail.image_url);
          setPreviewFoto(detail.image_url);
        }
        
        if (detail.icon_url) {
          if (detail.icon_url.startsWith('fa-')) {
            setSelectedIcon(detail.icon_url);
          } else if (detail.icon_url.startsWith('data:image') && !detail.image_url) {
            setFoto(detail.icon_url);
            setPreviewFoto(detail.icon_url);
          }
        }
      } else {
        Swal.fire("Error", "Layanan tidak ditemukan", "error")
          .then(() => router.push('/Admin/Dashboard'));
      }
    } catch (error) {
      console.error("Error fetch:", error);
      Swal.fire("Error", "Terjadi kesalahan saat mengambil data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  // Helper Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  // --- HANDLERS ---
  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return Swal.fire("Error", "Max 2MB", "error");
    
    setPreviewFoto(URL.createObjectURL(file));
    try { 
      const base64String = await toBase64(file); 
      setFoto(base64String); 
    } catch (err) { 
      console.error(err); 
    }
  };

  const removeFoto = (e) => {
    e.stopPropagation();
    setFoto(null);
    setPreviewFoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const pilihIcon = (iconName, style = "solid") => {
    const iconClass = `fa-${style} fa-${iconName}`;
    setSelectedIcon(iconClass);
    setShowIconModal(false);
    setFaSearch("");
  };

  const removeIcon = (e) => {
    e.stopPropagation();
    setSelectedIcon("");
  };

  const tambahLayananItem = () => {
    if (!inputLayanan.trim()) return;
    
    setLayananDitawarkan([...layananDitawarkan, { 
      sub_services: inputLayanan.trim(),
      isNew: true
    }]);
    setInputLayanan("");
  };

  const hapusLayananItem = (idx) => {
    setLayananDitawarkan(layananDitawarkan.filter((_, i) => i !== idx));
  };

  // === UPDATE DATA ===
  const handleUpdate = async () => {
    if (!namaLayanan.trim()) {
      return Swal.fire("Error", "Nama wajib diisi", "error");
    }
  
    setIsSubmitting(true);
    
    try {
      // 1. UPDATE SERVICE UTAMA dengan FormData
      const formData = new FormData();
      formData.append('title', namaLayanan);
      formData.append('description', deskripsi || '');
      formData.append('short_description', deskripsiSingkat || '');
      formData.append('icon_url', selectedIcon || '');
      formData.append('userId', user?.id || '');
      
      // Handle Image Upload
      if (foto && foto.startsWith('data:image')) {
        // Jika foto adalah base64 baru, convert ke file
        const response = await fetch(foto);
        const blob = await response.blob();
        const fileName = `service-${Date.now()}.${blob.type.split('/')[1]}`;
        formData.append('image', blob, fileName);
      } else if (foto && foto.startsWith('/uploads/')) {
        // Jika foto adalah path lama, kirim sebagai existing
        formData.append('existingImageUrl', foto);
      }
  
      const resService = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        body: formData // Tidak perlu Content-Type header, browser akan set otomatis
      });
  
      if (!resService.ok) {
        throw new Error("Gagal update layanan utama");
      }
  
      // 2. HANDLE SUB LAYANAN
      // Identifikasi item yang dihapus (ada di original tapi tidak ada di current)
      const itemsToDelete = originalLayanan.filter(original => 
        !layananDitawarkan.some(current => current.id === original.id)
      );
  
      // Identifikasi item baru yang perlu diinsert
      const itemsToInsert = layananDitawarkan.filter(item => item.isNew === true);
  
      console.log("Items to delete:", itemsToDelete);
      console.log("Items to insert:", itemsToInsert);
  
      // 3. DELETE sub layanan yang dihapus
      for (const item of itemsToDelete) {
        if (!item.id) continue; // Skip jika tidak ada id
        
        try {
          const resDelete = await fetch(`/api/sub_services/${item.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id })
          });
          
          if (!resDelete.ok) {
            console.error(`Gagal menghapus sub layanan ID ${item.id}`);
          } else {
            console.log(`Berhasil menghapus sub layanan ID ${item.id}`);
          }
        } catch (error) {
          console.error(`Error deleting sub service ${item.id}:`, error);
        }
      }
  
      // 4. INSERT sub layanan baru
      for (const item of itemsToInsert) {
        try {
          const resInsert = await fetch(`/api/sub_services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              services_id: serviceId,
              sub_services: item.sub_services,
              userId: user?.id
            })
          });
          
          if (!resInsert.ok) {
            console.error(`Gagal menambahkan sub layanan: ${item.sub_services}`);
          } else {
            console.log(`Berhasil menambahkan sub layanan: ${item.sub_services}`);
          }
        } catch (error) {
          console.error(`Error inserting sub service:`, error);
        }
      }
  
      // 5. Refresh data dan tampilkan success
      Swal.fire({
        title: "Berhasil",
        text: "Layanan dan sub layanan berhasil diperbarui!",
        icon: "success"
      }).then(() => {
        // Reload data dari server
        fetchData();
      });
  
    } catch (error) {
      console.error('Update error:', error);
      Swal.fire("Gagal", error.message || "Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    Swal.fire({
      title: 'Hapus Layanan?',
      text: "Data tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/services/${serviceId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id }) 
          });

          if (res.ok) {
            Swal.fire("Terhapus!", "Layanan telah dihapus.", "success")
              .then(() => router.push('/Admin/Dashboard'));
          } else { 
            throw new Error("Gagal menghapus"); 
          }
        } catch (error) { 
          Swal.fire("Error", error.message, "error"); 
        }
      }
    });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      <Head>
        <title>Edit Layanan - Admin</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </Head>

      <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className="text-white font-bold text-lg flex items-center gap-3">
          <button onClick={() => router.back()} className="hover:bg-gray-700 p-2 rounded-full transition">
            <ArrowLeft size={20}/>
          </button>
          Edit Layanan
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white uppercase font-bold border-2 border-gray-400">
          {user?.username ? user.username.charAt(0) : "A"}
        </div>
      </header>

      <div className="px-8 pt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          
          {/* --- AREA MEDIA (GRID 2 KOLOM: FOTO & ICON) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* KIRI: FOTO */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">1. Foto Header</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex items-center justify-center bg-gray-50 relative overflow-hidden group hover:border-blue-400 transition-colors">
                {previewFoto ? (
                  <>
                    <img src={previewFoto} className="w-full h-full object-cover" alt="Preview" />
                    <button onClick={removeFoto} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-all">
                      <X size={14}/>
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

            {/* KANAN: ICON */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">2. Icon Layanan</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex items-center justify-center bg-gray-50 relative overflow-hidden group hover:border-blue-400 transition-colors">
                {selectedIcon ? (
                  <>
                    <i className={`${selectedIcon} text-5xl text-blue-600`}></i>
                    <button onClick={removeIcon} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-all">
                      <X size={14}/>
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

          {/* --- FORM INPUTS --- */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Layanan</label>
              <input 
                type="text" 
                value={namaLayanan} 
                onChange={(e) => setNamaLayanan(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500" 
              />
            </div>

            {/* List Layanan SEJAJAR */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Poin-poin Layanan yang Ditawarkan</label>
              <div>
                <div className="flex gap-0 h-11 mb-4">
                  <input 
                    type="text" 
                    placeholder="Masukkan poin layanan..." 
                    value={inputLayanan} 
                    onChange={(e) => setInputLayanan(e.target.value)} 
                    className="flex-grow border border-gray-300 border-r-0 rounded-l-lg px-4 text-sm focus:ring-0 outline-none"
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
                        <span className="text-sm text-gray-700">
                          • {item.sub_services}
                          {item.isNew && <span className="ml-2 text-xs text-green-600">(Baru)</span>}
                        </span>
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
              <label className="block text-sm font-medium text-gray-800 mb-2">Deskripsi Singkat</label>
              <textarea 
                value={deskripsiSingkat} 
                onChange={(e) => setDeskripsiSingkat(e.target.value)} 
                rows={2} 
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 text-sm resize-none outline-none focus:border-blue-500" 
                placeholder="Ringkasan layanan..." 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Deskripsi Lengkap</label>
              <textarea 
                value={deskripsi} 
                onChange={(e) => setDeskripsi(e.target.value)} 
                rows={10} 
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500" 
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            <button 
              onClick={handleDelete} 
              className="flex items-center gap-2 bg-red-100 text-red-600 hover:bg-red-200 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
            >
              <Trash2 size={18}/> Hapus Layanan
            </button>

            <button 
              onClick={handleUpdate} 
              disabled={isSubmitting} 
              className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-8 py-3 rounded-lg font-medium text-sm transition-all shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : <><Save size={18} /> Simpan Perubahan</>}
            </button>
          </div>
        </div>
      </div>

      {/* Font Awesome Icon Modal */}
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
    </div>
  );
};

export default EditLayananPage;