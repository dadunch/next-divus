import React, { useState, useEffect } from "react";
import AddProductModal from "../../components/Modals/AddProductModul"; 
import Swal from 'sweetalert2';
import { Search, Plus, Trash2, Eye, Package, X } from 'lucide-react'; 
import { useSelector } from 'react-redux'; 

const Produk = () => {
    // 1. Ambil data User dari Redux
    const { user } = useSelector((state) => state.auth);

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    
    // State Detail Modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Gagal');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const getImages = (fotoString) => {
        if (!fotoString) return [];
        try {
            const parsed = JSON.parse(fotoString);
            return Array.isArray(parsed) ? parsed : [fotoString];
        } catch (e) {
            return [fotoString];
        }
    };

    const handleDelete = async (id, namaProduk) => {
        const result = await Swal.fire({
            title: `Hapus ${namaProduk}?`,
            text: "Data hilang permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                const currentUserId = user?.id || 1;
                const res = await fetch(`/api/products/${id}?userId=${currentUserId}`, { 
                    method: 'DELETE'
                });

                if (res.ok) {
                    Swal.fire('Berhasil', 'Produk dihapus', 'success');
                    fetchProducts();
                } else {
                    throw new Error('Gagal menghapus');
                }
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    const filtered = products.filter(p => p.nama_produk?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#F5F7FB] px-10 py-8 font-['Poppins']">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Produk</h1>
                <button onClick={() => setShowAddModal(true)} className="flex gap-2 px-5 py-2 bg-[#2D2D39] text-white rounded-lg hover:bg-black transition-all shadow-lg">
                    <Plus /> Tambah Produk
                </button>
            </div>

            <div className="bg-white p-2 rounded-xl shadow-sm mb-8 max-w-md border border-gray-100 flex items-center px-4">
                <Search className="text-gray-400 mr-3" size={20} />
                <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full outline-none text-gray-700 h-10"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map((item) => {
                    const images = getImages(item.foto_produk);
                    const coverImage = images.length > 0 ? images[0] : null;

                    return (
                        // --- DESAIN CARD BARU (SESUAI PERMINTAAN) ---
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group relative flex flex-col h-full">
                            
                            {/* AREA GAMBAR */}
                            <div className="relative h-48 bg-gray-50 overflow-hidden flex items-center justify-center">
                                {/* Pola Background Halus */}
                                <div className="absolute inset-0 opacity-[0.03]" 
                                     style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                                </div>

                                {coverImage ? (
                                    <img src={coverImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => e.target.src = "https://placehold.co/400?text=Error"} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col z-10"><Package size={32} /><span className="text-xs mt-1">No Image</span></div>
                                )}

                                {/* TAHUN (KIRI BAWAH - PUTIH TRANSPARAN) */}
                                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm border border-gray-200 z-10">
                                    <span className="text-xs font-bold text-gray-800">
                                        {item.tahun}
                                    </span>
                                </div>

                                {/* TOMBOL HAPUS (KANAN ATAS - MUNCUL SAAT HOVER) */}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                     <button 
                                        onClick={() => handleDelete(item.id, item.nama_produk)} 
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-red-200 hover:text-red-600 text-gray-500 transition-colors shadow-sm"
                                        title="Hapus Produk"
                                     >
                                        <Trash2 size={16} />
                                     </button>
                                </div>

                                {/* JUMLAH FOTO (KANAN BAWAH) */}
                                {images.length > 1 && (
                                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm z-10">
                                        +{images.length - 1}
                                    </div>
                                )}
                            </div>

                            {/* DETAIL TEXT */}
                            <div className="p-5 pt-4 flex-1 flex flex-col">
                                <h3 className="text-base font-bold text-gray-900 mb-1 truncate" title={item.nama_produk}>
                                    {item.nama_produk}
                                </h3>
                                <p className="text-sm text-gray-400 font-normal mb-4 line-clamp-2 flex-1">
                                    {item.deskripsi || "No deskripsi"}
                                </p>
                                
                                <button 
                                    onClick={() => { setDetailData(item); setShowDetailModal(true); }}
                                    className="w-full py-2 bg-[#2D2D39] text-white text-xs font-medium rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 mt-auto"
                                >
                                    <Eye size={14} />
                                    Lihat Detail
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AddProductModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={() => { fetchProducts(); setShowAddModal(false); }} />

            {/* DETAIL MODAL (SLIDE) - SAMA SEPERTI SEBELUMNYA */}
            {showDetailModal && detailData && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex justify-center items-start overflow-y-auto pt-10 pb-10">
                    <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden relative shadow-2xl m-4">
                        <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200 z-50"><X size={24}/></button>
                        <div className="p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{detailData.nama_produk}</h2>
                            <div className="mb-6 border-b pb-4"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">Tahun: {detailData.tahun}</span></div>
                            <p className="text-gray-700 mb-8 whitespace-pre-line">{detailData.deskripsi || "Tidak ada deskripsi."}</p>
                            <h3 className="font-semibold text-lg mb-4">Galeri Foto</h3>
                            <div className="space-y-6">
                                {getImages(detailData.foto_produk).map((imgUrl, idx) => (
                                    <div key={idx} className="rounded-xl overflow-hidden shadow border"><img src={imgUrl} className="w-full h-auto" /></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Produk;