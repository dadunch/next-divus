import React, { useState, useEffect } from "react";
import AddProductModal from "../../../components/Modals/AddProductModul"; 
import Swal from 'sweetalert2';
import { Search, Plus, Trash2, Edit, Package, X } from 'lucide-react'; 
import { useSelector } from 'react-redux'; // 1. Pastikan import ini ada

const Produk = () => {
    // 2. Ambil data User dari Redux
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

    // 3. FUNGSI HAPUS DENGAN QUERY PARAM
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
                // Perbaikan: Kirim userId lewat URL (Query Param) agar terbaca server
                const currentUserId = user?.id || 1; // Fallback di frontend juga
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
                <h1 className="text-3xl font-bold">Produk</h1>
                <button onClick={() => setShowAddModal(true)} className="flex gap-2 px-5 py-2 bg-[#2D2D39] text-white rounded-lg">
                    <Plus /> Tambah
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
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition">
                            <div className="relative h-48 bg-gray-100">
                                <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">{item.tahun}</span>
                                <div className="absolute top-2 right-2 flex gap-1 z-20">
                                     <button onClick={() => handleDelete(item.id, item.nama_produk)} className="bg-white p-1.5 rounded-full text-red-500 shadow hover:bg-red-50"><Trash2 size={14}/></button>
                                </div>
                                {coverImage ? (
                                    <img src={coverImage} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://placehold.co/400?text=Error"} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col"><Package /><span className="text-xs">No Image</span></div>
                                )}
                                {images.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">+{images.length - 1} foto</div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg truncate">{item.nama_produk}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{item.deskripsi}</p>
                                <button 
                                    onClick={() => { setDetailData(item); setShowDetailModal(true); }}
                                    className="w-full py-2 bg-gray-900 text-white rounded hover:bg-black transition"
                                >
                                    Lihat Detail
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AddProductModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={() => { fetchProducts(); setShowAddModal(false); }} />

            {/* DETAIL MODAL (SLIDE) */}
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