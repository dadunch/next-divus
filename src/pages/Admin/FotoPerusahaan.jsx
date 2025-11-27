import React, { useState, useEffect } from "react";
import AddFotoModal from "../../components/Modals/addFotoModal";
import Swal from "sweetalert2";
import { Search, Plus, Trash2, Package } from "lucide-react";
import { useSelector } from "react-redux";

const Foto = () => {
  const { user } = useSelector((state) => state.auth);

  const [Foto, setFoto] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchFoto = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/Foto");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setFoto(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFoto();
  }, []);

  const getImage = (foto) => foto || null;

  const handleDelete = async (id, label) => {
    const result = await Swal.fire({
      title: `Hapus data ini?`,
      text: label || "Data hilang permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const currentUserId = user?.id || 1;
        const res = await fetch(`/api/Foto/${id}?userId=${currentUserId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire("Berhasil", "Data dihapus", "success");
          fetchFoto();
        } else {
          throw new Error("Gagal menghapus data");
        }
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const filtered = Foto.filter((p) =>
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins']">
      {/* HEADER */}
      <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        {/* SEARCH DI HEADER */}
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
            placeholder="Cari deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
          />
        </div>

        {/* PROFIL */}
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

      {/* TITLE (dipindahkan ke atas sesuai gambar) */}
      <div className="px-8 pt-8">
        <div className= "flex justify-between items-end mb-8">
            <div>
          <h1 className="text-3xl font-bold text-black mb-1">
            Foto Perusahaan
          </h1>
          <p className="text-gray-600 text-lg italic">
            Masukkan Foto Perusahaan
          </p>
          </div>

          {/* TOMBOL TAMBAH */}
          <button
            className="bg-[#2D2D39] hover:bg-black text-white px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={20} />
            <span>Tambah Foto</span>
          </button>
        </div>
      </div>
      {/* GRID */}
      <div className="px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((item) => {
          const image = getImage(item.image);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group relative flex flex-col h-full"
            >
              <div className="relative h-48 bg-gray-50 overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "radial-gradient(#000 1px, transparent 1px)",
                    backgroundSize: "10px 10px",
                  }}
                ></div>

                {image ? (
                  <img
                    src={image}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) =>
                      (e.target.src = "https://placehold.co/400?text=Error")
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col z-10">
                    <Package size={32} />
                    <span className="text-xs mt-1">No Image</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                  <button
                    onClick={() => handleDelete(item.id, item.description)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-red-200 hover:text-red-600 text-gray-500 transition-colors shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <p className="text-sm text-gray-500 font-normal line-clamp-3 flex-1">
                  {item.description || "Tidak ada deskripsi."}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      <AddFotoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchFoto();
          setShowAddModal(false);
        }}
      />
    </div>
  );
};

export default Foto;
