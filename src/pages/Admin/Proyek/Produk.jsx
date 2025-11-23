import React, { useState, useEffect } from "react";
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import Swal from 'sweetalert2'; 
import AddProdukModul from './AddProdukModul';

// Import Modal (sesuaikan dengan struktur project Anda)
import AddProductModul from '../../../components/Modals/AddProductModul';

const ProductPage = () => {
  const router = useRouter();
  
  // Ambil User dari Redux
  const { user } = useSelector((state) => state.auth);

  // State Data & UI
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fungsi Fetch Data
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      
      console.log('Fetch response:', res.ok, data); // Debug log
      
      if (res.ok) {
        setProducts(Array.isArray(data) ? data : []);
      } else {
        console.error('API Error:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetch products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    console.log('Current products state:', products); // Debug log
  }, [products]);

  // Filter Pencarian
  const filteredProducts = products.filter(item => 
    item.nama_produk?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Delete
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Produk?',
      text: "Data produk ini akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      customClass: { popup: 'font-["Poppins"] rounded-xl' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/products/${id}`, { 
            method: 'DELETE', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id }) 
          });
          
          if (res.ok) {
            setProducts(prev => prev.filter(product => product.id !== id));
            Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
          } else {
            throw new Error("Gagal menghapus");
          }
        } catch (error) {
          Swal.fire('Gagal', 'Terjadi kesalahan server.', 'error');
        }
      }
    });
  };

  // Handle Edit (redirect ke halaman edit atau buka modal edit)
  const handleEdit = (id) => {
    // Opsi 1: Redirect ke halaman edit
    router.push(`/Admin/Portofolio/Produk/Edit/${id}`);
    
    // Opsi 2: Atau buka modal edit (sesuaikan dengan kebutuhan)
    // setEditingProduct(id);
    // setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      <Head>
        <title>Produk - Divus Admin</title>
      </Head>

      {/* TOP BAR */}
      <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className="relative w-1/3">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm" 
            placeholder="Cari produk.." 
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">Hi, {user?.username || "Admin"}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold uppercase border-2 border-gray-400">
             {user?.username ? user.username.charAt(0) : "A"}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="px-8 pt-8">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-1">Produk</h1>
            <p className="text-gray-600 text-lg italic">Kelola Daftar Produk Yang sudah Dikerjakan</p>
          </div>
          
          <button 
            className="bg-[#2D2D39] hover:bg-black text-white px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
            <span>Tambah Produk</span>
          </button>
        </div>

        {/* GRID CARD PRODUK */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full py-20 text-center text-gray-500 font-medium">
              Sedang memuat data...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500 font-medium">
              Tidak ada data produk ditemukan.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Gambar Produk */}
                <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                  
                  {/* Tahun Badge */}
                  <div className="absolute top-3 left-3 bg-[#1E1E2D] text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    {product.year ? product.year.toString() : "2023"}
                  </div>

                  {/* Action Icons */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(product.id)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 text-red-500 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Info Produk */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description || "No deskripsi"}
                  </p>
                  
                  {/* Detail Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Partner: {product.partner_name || "-"}</span>
                    <span>Tahun: {product.year ? product.year.toString() : "-"}</span>
                  </div>

                  {/* Tombol Lihat Detail */}
                  <button
                    onClick={() => router.push(`/Admin/Portofolio/Produk/${product.id}`)}
                    className="w-full bg-[#2D2D39] hover:bg-black text-white py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye size={18} />
                    <span>Lihat Detail</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* MODAL TAMBAH PRODUK */}
      {isModalOpen && (
        <AddProductModul
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchProducts} 
        />
      )}

    </div>
  );
};

export default ProductPage;