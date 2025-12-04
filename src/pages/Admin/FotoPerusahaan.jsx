import React, { useState, useEffect } from "react";
import AddFotoModal from "../../components/Modals/addFotoModal";
import Swal from "sweetalert2";
import { Search, Plus, Trash2, Package, Image as ImageIcon } from "lucide-react";
import { useSelector } from "react-redux";

const Foto = () => {
  const { user } = useSelector((state) => state.auth);

  // Ubah nama state agar tidak bentrok dengan nama Component
  const [photos, setPhotos] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      // Gunakan endpoint lowercase sesuai standar
      const res = await fetch("/api/photos"); 
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setPhotos(data);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat data foto", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: `Hapus foto "${title || 'ini'}"?`,
      text: "Data akan hilang permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        const currentUserId = user?.id || 0;
        // Endpoint delete sesuai ID
        const res = await fetch(`/api/photos/${id}?userId=${currentUserId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire("Berhasil", "Data dihapus", "success");
          fetchPhotos();
        } else {
          throw new Error("Gagal menghapus data");
        }
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  // Filter berdasarkan Title (sesuai DB)
  const filtered = photos.filter((p) =>
    (p.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins']">
      {/* HEADER */}
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
            placeholder="Cari judul foto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
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

      {/* CONTENT HEADER */}
      <div className="px-8 pt-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-1">
              Foto Perusahaan
            </h1>
            <p className="text-gray-500 italic font-medium">
              Manajemen galeri dan aktivitas perusahaan
            </p>
          </div>

          <button
            className="bg-[#2D2D39] hover:bg-black text-white px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={20} />
            <span>Tambah Foto</span>
          </button>
        </div>
      </div>

      {/* GRID CONTENT */}
      <div className="px-8 pb-10">
        {isLoading ? (
          // LOADING SKELETON
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-200">
                <div className="h-40 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // EMPTY STATE
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <Package size={48} className="mb-2 opacity-50" />
            <p className="font-medium">Tidak ada foto ditemukan</p>
            {searchQuery && <p className="text-sm">Coba kata kunci lain</p>}
          </div>
        ) : (
          // DATA GRID
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group relative flex flex-col h-full"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden flex items-center justify-center group">
                  {/* Pattern Background */}
                  <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                      backgroundSize: "10px 10px",
                    }}
                  ></div>

                  {item.image_url ? (
                    <img
                      src={item.image_url} // Sesuaikan dengan DB: image_url
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) =>
                        (e.target.src = "https://placehold.co/400?text=No+Image")
                      }
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon size={32} />
                      <span className="text-xs mt-1">No Preview</span>
                    </div>
                  )}

                  {/* Delete Button (Hover) */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                      title="Hapus Foto"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Description / Title */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1">
                       {item.title || "Tanpa Judul"} {/* Sesuaikan dengan DB: title */}
                    </h3>
                    <p className="text-xs text-gray-400">
                       {/* Format tanggal jika ada created_at */}
                       {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      <AddFotoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchPhotos();
          setShowAddModal(false);
        }}
      />
    </div>
  );
};

export default Foto;