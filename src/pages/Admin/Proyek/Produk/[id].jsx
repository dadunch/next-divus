import React, { useState, useEffect } from "react";
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { ArrowLeft, Pencil, Trash2, Calendar, Tag, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useSelector((state) => state.auth);

  // State
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data Detail Produk
  const fetchProductData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (res.ok) {
        setProductData(data);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Swal.fire('Error', 'Gagal memuat data produk', 'error');
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id })
          });

          if (res.ok) {
            Swal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
            router.push('/Admin/Portofolio/Produk');
          } else {
            throw new Error("Gagal menghapus");
          }
        } catch (error) {
          Swal.fire('Gagal', 'Terjadi kesalahan server.', 'error');
        }
      }
    });
  };

  // Handle Edit
  const handleEdit = () => {
    router.push(`/Admin/Portofolio/Produk/Edit/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      <Head>
        <title>{productData?.product_name || "Detail Produk"} - Divus Admin</title>
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
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {productData.product_name}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Tahun: <strong>{productData.tahun || "-"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag size={16} />
                      <span>Kategori: <strong>{productData.category?.bidang || "-"}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleEdit}
                    className="p-3 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit Produk"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-3 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    title="Hapus Produk"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Product Image */}
              {productData.product_image && (
                <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-100 mb-6">
                  <img
                    src={productData.product_image}
                    alt={productData.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={20} className="text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Deskripsi</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {productData.description || "Tidak ada deskripsi"}
                </p>
              </div>

              {/* Additional Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Client</h3>
                  <p className="text-gray-800 font-medium">
                    {productData.client?.client_name || "-"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Status</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    productData.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {productData.status === 'completed' ? 'Selesai' : 'Dalam Proses'}
                  </span>
                </div>
                {productData.project_value && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Nilai Proyek</h3>
                    <p className="text-gray-800 font-medium">
                      Rp {Number(productData.project_value).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Dibuat Pada</h3>
                  <p className="text-gray-800">
                    {new Date(productData.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Sections (Gallery, Documents, etc.) */}
            {productData.gallery && productData.gallery.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Galeri</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productData.gallery.map((image, index) => (
                    <div key={index} className="relative h-40 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.url}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;