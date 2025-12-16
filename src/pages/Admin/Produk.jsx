import React, { useState, useEffect } from "react";
import AddProductModal from "../../components/Modals/AddProductModul";
import EditProductModal from "../../components/Modals/EditProductModal";
import Swal from "sweetalert2";
import { Search, Plus, Trash2, Eye, Package, Pencil, ArrowUpDown, X } from "lucide-react";
import { useSelector } from "react-redux";

const Produk = () => {
  const { user } = useSelector((state) => state.auth || {});

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- STATE BARU UNTUK SORTING ---
  const [sortOrder, setSortOrder] = useState("newest"); // Default: Tahun Terbaru

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(res.ok ? data : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getImages = (fotoString) => {
    if (!fotoString) return [];
    try {
      const parsed = JSON.parse(fotoString);
      return Array.isArray(parsed) ? parsed : [fotoString];
    } catch {
      return [fotoString];
    }
  };

  const handleDelete = async (id, namaProduk) => {
    const result = await Swal.fire({
      title: `Hapus ${namaProduk}?`,
      text: "Data akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/products/${id}?userId=${user?.id || 1}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire("Berhasil", "Produk dihapus", "success");
          fetchProducts();
        } else {
          throw new Error();
        }
      } catch {
        Swal.fire("Error", "Gagal menghapus produk", "error");
      }
    }
  };

  // --- LOGIKA FILTERING ---
  const filteredProducts = products.filter((item) =>
    item.nama_produk?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- LOGIKA SORTING (BARU) ---
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOrder) {
      case "az": // Abjad A-Z
        return a.nama_produk.localeCompare(b.nama_produk);
      case "za": // Abjad Z-A
        return b.nama_produk.localeCompare(a.nama_produk);
      case "newest": // Tahun Terbaru
        return b.tahun - a.tahun;
      case "oldest": // Tahun Terlama
        return a.tahun - b.tahun;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      {/* ================= TOP BAR ================= */}
      <header className="bg-[#1E1E2D] px-4 md:px-8 py-4 flex flex-row justify-between items-center shadow-md sticky top-0 z-30 gap-4">
        <div className="relative flex-1 md:max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
            placeholder="Cari produk..."
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">
              Hi, {user?.username || "Admin"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold uppercase border-2 border-gray-400">
            {user?.username ? user.username.charAt(0) : "A"}
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <div className="px-4 md:px-8 pt-6 md:pt-8 mb-20 lg:mb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">Produk</h1>
            <p className="text-gray-500 italic text-sm md:text-lg font-medium">
              Kelola Daftar Produk Yang Sudah Dikerjakan
            </p>
          </div>

          <div className="flex gap-3">
            {/* --- DROPDOWN SORTING (BARU) --- */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#27D14C] cursor-pointer text-sm font-medium"
              >
                <option value="newest">Tahun Terbaru</option>
                <option value="oldest">Tahun Terlama</option>
                <option value="az">Abjad A-Z</option>
                <option value="za">Abjad Z-A</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ArrowUpDown size={16} />
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#2D2D39] hover:bg-black text-white px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Plus size={20} />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500 py-20">
            Memuat data produk...
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            Produk tidak ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Menggunakan sortedProducts bukan filteredProducts */}
            {sortedProducts.map((item) => {
              const images = getImages(item.foto_produk);
              const cover = images[0];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col"
                >
                  {/* IMAGE */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {cover ? (
                      <img src={cover} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col">
                        <Package size={32} />
                        <span className="text-xs mt-1">No Image</span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                      {item.tahun}
                    </div>

                    {/* TOMBOL EDIT & DELETE */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => {
                          setEditData(item);
                          setShowEditModal(true);
                        }}
                        className="p-2 bg-white rounded-lg shadow hover:bg-blue-50"
                        title="Edit Produk"
                      >
                        <Pencil size={16} className="text-blue-600" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id, item.nama_produk)}
                        className="p-2 bg-white rounded-lg shadow hover:bg-red-50"
                        title="Hapus Produk"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 truncate" title={item.nama_produk}>
                      {item.nama_produk}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                      {item.deskripsi || "Tidak ada deskripsi"}
                    </p>

                    <button
                      onClick={() => {
                        setDetailData(item);
                        setShowDetailModal(true);
                      }}
                      className="w-full bg-[#2D2D39] hover:bg-black text-white py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Eye size={14} />
                      Lihat Detail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL TAMBAH */}
        <AddProductModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchProducts();
            setShowAddModal(false);
          }}
        />

        {/* MODAL EDIT */}
        {editData && (
          <EditProductModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditData(null);
            }}
            onSuccess={() => {
              fetchProducts();
              setShowEditModal(false);
              setEditData(null);
            }}
            productData={editData}
          />
        )}

        {/* DETAIL MODAL */}
        {showDetailModal && detailData && (
          <div
            className="fixed inset-0 bg-black/70 z-[999] flex justify-center items-start overflow-y-auto py-10 px-4"
            onClick={() => setShowDetailModal(false)}
          >
            <div
              className="bg-white max-w-3xl w-full rounded-2xl p-8 relative shadow-xl animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} className="text-gray-500" />
              </button>

              <h2 className="text-3xl font-bold mb-2 text-gray-900">
                {detailData.nama_produk}
              </h2>

              <div className="inline-block bg-gray-100 px-3 py-1 rounded-md text-sm font-semibold text-gray-700 mb-4">
                Tahun: {detailData.tahun}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {detailData.deskripsi || "Tidak ada deskripsi"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getImages(detailData.foto_produk).map((img, i) => (
                  <div
                    key={i}
                    className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden group"
                  >
                    <img
                      src={img}
                      alt={`Detail ${i}`}
                      className="w-full h-full object-contain rounded-xl"
                    />
                    {/* Overlay Zoom Icon (Opsional) */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all pointer-events-none"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Produk;