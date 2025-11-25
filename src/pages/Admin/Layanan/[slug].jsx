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

  // Icon State
  const [showIconModal, setShowIconModal] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const iconList = [
    "fa-solid fa-user", "fa-solid fa-users", "fa-solid fa-gear", "fa-solid fa-cogs",
    "fa-solid fa-chart-line", "fa-solid fa-chart-bar", "fa-solid fa-handshake",
    "fa-solid fa-building", "fa-solid fa-briefcase", "fa-solid fa-lightbulb",
    "fa-solid fa-bullseye", "fa-solid fa-calendar", "fa-solid fa-check",
    "fa-solid fa-circle-info", "fa-solid fa-database", "fa-solid fa-folder",
    "fa-solid fa-phone", "fa-solid fa-envelope", "fa-solid fa-globe",
    "fa-solid fa-shield-halved", "fa-solid fa-building-columns", "fa-solid fa-truck",
    "fa-solid fa-shop", "fa-solid fa-cart-shopping"
  ];

  // --- 1. FETCH & PARSE DATA ---
  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        
        if (res.ok) {
          const found = data.find(item => item.slug === slug);
          if (found) {
            setServiceId(found.id);
            setNamaLayanan(found.title);
            
            // --- LOGIKA PARSING DESKRIPSI ---
            let fullDesc = found.description || "";
            let parsedShort = "";
            let parsedList = [];
            let parsedMain = fullDesc;

            // 1. Ambil Ringkasan
            if (parsedMain.includes("**Ringkasan:**")) {
                const parts = parsedMain.split("\n\n"); 
                const summaryPart = parts.find(p => p.startsWith("**Ringkasan:**"));
                if (summaryPart) {
                    parsedShort = summaryPart.replace("**Ringkasan:** ", "");
                    parsedMain = parsedMain.replace(summaryPart, "").trim(); 
                }
            }

            // 2. Ambil List Layanan
            if (parsedMain.includes("**Layanan yang ditawarkan:**")) {
                const parts = parsedMain.split("**Layanan yang ditawarkan:**");
                parsedMain = parts[0].trim(); 
                
                const listString = parts[1];
                if (listString) {
                    parsedList = listString
                        .split("\n")
                        .map(line => line.replace("- ", "").trim())
                        .filter(line => line !== "");
                }
            }

            setDeskripsiSingkat(parsedShort);
            setLayananDitawarkan(parsedList);
            setDeskripsi(parsedMain);
            
            // Handle Gambar & Icon
            if (found.image_url) {
                setFoto(found.image_url);
                setPreviewFoto(found.image_url);
            }
            
            // Handle Icon (Cek apakah kolom icon_url berisi class fontawesome)
            if (found.icon_url && !found.icon_url.startsWith('data:image')) {
                setSelectedIcon(found.icon_url);
            }
            
          } else {
            Swal.fire("Error", "Layanan tidak ditemukan", "error").then(() => router.push('/Admin/Dashboard'));
          }
        }
      } catch (error) {
        console.error("Error fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

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
    try { const base64String = await toBase64(file); setFoto(base64String); } catch (err) { console.error(err); }
  };

  const removeFoto = (e) => {
    e.stopPropagation();
    setFoto(null);
    setPreviewFoto(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const pilihIcon = (icon) => {
    setSelectedIcon(icon);
    setShowIconModal(false);
    setIconSearch("");
  };

  const removeIcon = (e) => {
    e.stopPropagation();
    setSelectedIcon("");
  };

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

  // === UPDATE DATA ===
  const handleUpdate = async () => {
    if (!namaLayanan.trim()) return Swal.fire("Error", "Nama wajib diisi", "error");

    setIsSubmitting(true);
    try {
        // GABUNGKAN DATA KEMBALI KE STRING
        let finalDescription = deskripsi;
        
        if (deskripsiSingkat) {
            finalDescription = `**Ringkasan:** ${deskripsiSingkat}\n\n${finalDescription}`;
        }

        if (layananDitawarkan.length > 0) {
            finalDescription += `\n\n**Layanan yang ditawarkan:**\n` + layananDitawarkan.map(item => `- ${item}`).join('\n');
        }

        const payload = {
            title: namaLayanan,
            description: finalDescription, 
            icon_class: selectedIcon, // Kirim Icon
            image_url: foto,          // Kirim Foto
            userId: user?.id 
        };

        const res = await fetch(`/api/services/${serviceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            Swal.fire("Berhasil", "Layanan berhasil diperbarui!", "success");
        } else {
            throw new Error("Gagal update");
        }
    } catch (error) {
        Swal.fire("Gagal", error.message, "error");
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
                } else { throw new Error("Gagal menghapus"); }
            } catch (error) { Swal.fire("Error", error.message, "error"); }
        }
    });
  };

  const filteredIcons = iconList.filter((ic) => ic.toLowerCase().includes(iconSearch.toLowerCase()));

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      <Head>
        <title>Edit Layanan - Admin</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </Head>

      <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className="text-white font-bold text-lg flex items-center gap-3">
            <button onClick={() => router.back()} className="hover:bg-gray-700 p-2 rounded-full transition"><ArrowLeft size={20}/></button>
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
                            <button onClick={removeFoto} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-all"><X size={14}/></button>
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
                            <button onClick={removeIcon} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-all"><X size={14}/></button>
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

          {/* --- FORM INPUTS --- */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Layanan</label>
              <input type="text" value={namaLayanan} onChange={(e) => setNamaLayanan(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500" />
            </div>

            {/* List Layanan SEJAJAR */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Poin-poin Layanan yang Ditawarkan</label>
                <div className="">
                    <div className="flex gap-0 h-11 mb-4">
                        <input 
                            type="text" 
                            placeholder="Masukkan poin layanan..." 
                            value={inputLayanan} 
                            onChange={(e) => setInputLayanan(e.target.value)} 
                            className="flex-grow border border-gray-300 border-r-0 rounded-l-lg px-4 text-sm focus:ring-0 outline-none"
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
                                    <button onClick={() => hapusLayananItem(idx)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Deskripsi Singkat</label>
              <textarea value={deskripsiSingkat} onChange={(e) => setDeskripsiSingkat(e.target.value)} rows={2} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 text-sm resize-none outline-none focus:border-blue-500" placeholder="Ringkasan layanan..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Deskripsi Lengkap</label>
              <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={10} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between ">
            <button onClick={handleDelete} className="flex items-center gap-2 bg-red-100 text-red-600 hover:bg-red-200 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors">
                <Trash2 size={18}/> Hapus Layanan
            </button>

            <button onClick={handleUpdate} disabled={isSubmitting} className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-8 py-3 rounded-lg font-medium text-sm transition-all shadow-lg disabled:opacity-50">
                {isSubmitting ? 'Menyimpan...' : <><Save size={18} /> Simpan Perubahan</>}
            </button>
          </div>
        </div>
      </div>

      {/* Icon Modal */}
      {showIconModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-lg">Pilih Icon</h3><button onClick={() => setShowIconModal(false)}><X/></button></div>
            <input type="text" placeholder="Cari icon..." value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} className="w-full border px-4 py-2 mb-4 rounded-lg" />
            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
              {filteredIcons.map((ic) => (
                <button key={ic} onClick={() => pilihIcon(ic)} className={`p-3 border rounded hover:bg-gray-50 flex justify-center ${selectedIcon === ic ? 'bg-blue-50 border-blue-500' : ''}`}><i className={`${ic} text-xl`}></i></button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditLayananPage;