import React, { useState, useEffect } from 'react'; // <--- Pastikan ada useState
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import { ArrowLeft, Pencil, Trash2, Calendar, User, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import EditProductModal from '../../../components/Modals/EditProductModal';

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useSelector((state) => state.auth);

  // State
  const [productData, setProductData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);

  // Fetch Data Detail Produk
  const fetchProductData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      
      if (!res.ok) {
        throw new Error('Produk tidak ditemukan');
      }
      
      const data = await res.json();
      console.log('Product detail:', data);
      
      setProductData(data);
      
      // Fetch client data jika ada client_id
      if (data.client_id) {
        try {
          const clientRes = await fetch(`/api/clients/${data.client_id}`);
          if (clientRes.ok) {
            const clientData = await clientRes.json();
            console.log('Client data:', clientData);
            setClientData(clientData);
          }
        } catch (clientError) {
          console.warn('Failed to fetch client:', clientError);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Gagal memuat data produk'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      fetchProductData();
    }
  }, [router.isReady, id]);

  // Handle Delete
  const handleDelete = () => {
    Swal.fire({
      title: 'Hapus Produk?',
      text: "Data produk ini akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });

          if (res.ok) {
            Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
            router.push('/Admin/Proyek/Produk');
          } else {
            throw new Error("Gagal menghapus");
          }
        } catch (error) {
          Swal.fire('Gagal', 'Terjadi kesalahan server.', 'error');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      <Head>
        <title>{productData?.nama_produk || "Detail Produk"} - Divus Admin</title>
      </Head>

      {/* TOP BAR */}
      <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h2 className="text-xl font-semibold text-white">Detail Produk</h2>
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
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-500 font-medium">Memuat data produk...</div>
          </div>
        ) : !productData ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-500 font-medium">Produk tidak ditemukan</div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Product Image */}
              <div className="relative">
                {productData.foto_produk && productData.foto_produk.trim() !== '' ? (
                  <div className="relative w-full h-[500px] bg-gray-100">
                    <img
                      src={productData.foto_produk}
                      alt={productData.nama_produk}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-100"><span class="text-gray-400 text-lg">Gambar tidak dapat dimuat</span></div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl text-gray-300 mb-4">📦</div>
                      <p className="text-gray-400 text-lg">Tidak ada gambar</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-8">
                {/* Title & Actions */}
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-800 mb-3">
                      {productData.nama_produk}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span>Tahun: <strong className="text-gray-800">{productData.tahun ? productData.tahun.toString() : "-"}</strong></span>
                      </div>
                      {clientData && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <User size={16} />
                          <span>Client: <strong className="text-gray-800">{clientData.client_name}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleDelete}
                      className="p-3 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                      title="Hapus Produk"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={20} className="text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Deskripsi</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                    {productData.deskripsi || "Tidak ada deskripsi"}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Client</h3>
                    <p className="text-gray-800 font-medium text-lg">
                      {clientData ? clientData.client_name : "-"}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Status</h3>
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                      Selesai
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Dibuat Pada</h3>
                    <p className="text-gray-800 font-medium">
                      {productData.created_at ? new Date(productData.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;