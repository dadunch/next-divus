import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaChevronDown } from 'react-icons/fa';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';
import { Assets } from '../assets';

const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
    viewport: { once: false, amount: 0.2 }
};

const Produk = () => {
    // --- STATE ---
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [company, setCompany] = useState(null);

    // State untuk Modal & Slider
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // State untuk Filter Kategori & Sorting
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [categories, setCategories] = useState(["Semua"]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Sort State
    const [sortBy, setSortBy] = useState('newest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (!res.ok) throw new Error("Gagal mengambil data");
                const data = await res.json();
                setProducts(data);

                // Extract categories if available (Safe check)
                const uniqueCategories = ['Semua', ...new Set(data.map(item => item.category?.bidang).filter(Boolean))];
                if (uniqueCategories.length > 1) {
                    setCategories(uniqueCategories);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
        const fetchCompany = async () => {
            try {
                const res = await fetch('/api/company');
                if (!res.ok) throw new Error("Gagal mengambil data");
                const data = await res.json();
                setCompany(data);
            } catch (error) {
                console.error("Error:", error);
            }
        };
        fetchCompany();
    }, []);

    // --- 2. HELPER PARSE MEDIA ---
    const getMediaItems = (product) => {
        if (!product) return [];

        if (product.media_items) {
            try {
                const items = typeof product.media_items === 'string'
                    ? JSON.parse(product.media_items)
                    : product.media_items;

                return items.map(item => ({
                    type: item.type || 'image',
                    url: item.url || item,
                    videoId: item.videoId,
                    preview: item.type === 'youtube'
                        ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`
                        : (item.url || item)
                }));
            } catch (e) { console.error(e); }
        }

        if (product.foto_produk) {
            try {
                const parsed = JSON.parse(product.foto_produk);
                const urls = Array.isArray(parsed) ? parsed : [product.foto_produk];
                return urls.map(url => ({ type: 'image', url, preview: url }));
            } catch (e) {
                return [{ type: 'image', url: product.foto_produk, preview: product.foto_produk }];
            }
        }
        return [];
    };

    // --- 3. MODAL HANDLERS ---
    const openModal = (product) => {
        setSelectedProduct(product);
        setCurrentImageIndex(0);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        document.body.style.overflow = 'auto';
    };

    // --- 4. SLIDER LOGIC ---
    const nextSlide = (e) => {
        e.stopPropagation();
        const media = getMediaItems(selectedProduct);
        setCurrentImageIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = (e) => {
        e.stopPropagation();
        const media = getMediaItems(selectedProduct);
        setCurrentImageIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    };

    // --- 5. FILTER & SORT LOGIC ---
    const filteredProducts = products.filter((item) => {
        if (selectedCategory === 'Semua') return true;
        // Safe check for category match
        return item.category?.bidang === selectedCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'newest') return (parseInt(b.tahun) || 0) - (parseInt(a.tahun) || 0);
        if (sortBy === 'oldest') return (parseInt(a.tahun) || 0) - (parseInt(b.tahun) || 0);
        if (sortBy === 'a-z') return (a.nama_produk || "").localeCompare(b.nama_produk || "");
        if (sortBy === 'z-a') return (b.nama_produk || "").localeCompare(a.nama_produk || "");
        return 0;
    });

    const sortOptions = [
        { label: 'Tahun Terbaru', value: 'newest' },
        { label: 'Tahun Terlama', value: 'oldest' },
        { label: 'A-Z', value: 'a-z' },
        { label: 'Z-A', value: 'z-a' },
    ];

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            <Head>
                <title>Portofolio Produk - PT Divus Global Mediacomm</title>
            </Head>

            <main>
                <header className="relative w-full">
                    <section className="w-full bg-slate-50 py-14 md:py-2 px-10 md:px-6 border-b border-slate-200">
                        <div className="max-w-4xl mx-auto flex flex-row items-center justify-center gap-6 md:gap-10 mt-12">
                            <div className="flex-shrink-0">
                                <img src={company?.logo_url || Assets.Hero3} alt="Logo Divus" className="w-50 md:w-100 h-50 md:h-100 object-contain" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-zinc-800 text-xl md:text-3xl font-bold leading-tight">{company?.company_name || "PT Divus Global Mediacomm"}</h1>
                                <p className="text-zinc-500 text-base md:text-xl font-medium italic">- Produk</p>
                            </div>
                        </div>
                    </section>

                    <div className="w-full bg-zinc-300 px-6 py-3 mb-4">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-zinc-800 text-base">
                                <Link href="/" className="hover:underline hover:text-green-600 transition-colors">
                                    Beranda
                                </Link>
                                <span className="mx-2 text-zinc-500">{'>'}</span>
                                <span>Portofolio</span>
                                <span className="mx-2 text-zinc-500">{'>'}</span>
                                <span className="text-red-600 font-medium">Produk</span>
                            </p>
                        </div>
                    </div>
                </header>

                <motion.section {...fadeInUp} className="max-w-[1440px] mx-auto px-6 md:px-20 py-8">
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        <div className="w-full">
                            <h2 className="text-zinc-800 text-2xl md:text-4xl font-bold capitalize mb-5 md:mb-10">
                                Produk kami
                            </h2>
                            <p className="text-zinc-800 text-sm md:text-base font-normal leading-loose text-justify">
                                PT Divus menghadirkan beragam produk yang dirancang untuk mendukung kebutuhan bisnis modern.
                            </p>
                        </div>
                    </div>
                </motion.section>
                <div className="max-w-[1440px] mx-auto px-6 md:px-20 mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto z-20">
                            {/* SORT DROPDOWN */}
                            <div className="relative w-full sm:w-72">
                                <button
                                    onClick={() => {
                                        setShowSortDropdown(!showSortDropdown);
                                        setShowCategoryDropdown(false);
                                    }}
                                    className="w-full py-3 px-4 bg-gray-700 rounded-[10px] flex items-center justify-between gap-2 text-sm relative transition-all hover:border-zinc-400"
                                >
                                    <span className="text-white text-base font-medium leading-6">
                                        {sortOptions.find(opt => opt.value === sortBy)?.label || 'Urutkan'}
                                    </span>
                                    <FaChevronDown className="text-zinc-500 w-4 h-4" />
                                </button>

                                <AnimatePresence>
                                    {showSortDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute mt-2 w-full bg-white rounded-xl shadow-xl z-30 border border-zinc-100 overflow-hidden"
                                        >
                                            {sortOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setSortBy(option.value);
                                                        setShowSortDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors border-b border-zinc-50 last:border-0 ${sortBy === option.value ? 'bg-zinc-50 text-green-600' : 'text-zinc-700 hover:bg-zinc-50 hover:text-green-600'
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <p className="text-zinc-500 text-sm">
                            Menampilkan <span className="text-zinc-800 font-medium">{sortedProducts.length}</span> produk
                        </p>
                    </div>
                </div>

                {/* --- PRODUCT GRID SECTION --- */}
                <div {...fadeInUp} className="max-w-[1380px] mx-auto px-6 md:px-12 mb-20 mt-10">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-xl">
                            <p className="text-gray-400">Belum ada produk yang dipublikasikan.</p>
                        </div>
                    ) : (
                        // MASONRY LAYOUT
                        <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
                            {sortedProducts.map((item) => {
                                const media = getMediaItems(item);
                                const coverMedia = media.length > 0 ? media[0] : null;
                                const isYoutube = coverMedia?.type === 'youtube';

                                return (
                                    <motion.div
                                        key={item.id}
                                        whileHover={{ y: -5 }}
                                        // Hapus 'bg-white', 'border', 'shadow' agar terlihat menyatu (gallery style)
                                        // Atau gunakan shadow-sm yang sangat halus
                                        className="break-inside-avoid mb-6 group cursor-pointer relative rounded-xl overflow-hidden w-full shadow-sm hover:shadow-2xl transition-all duration-300"
                                        onClick={() => openModal(item)}
                                    >
                                        <div className={`w-full bg-gray-200 relative overflow-hidden ${isYoutube ? 'aspect-video' : ''}`}>

                                            {coverMedia ? (
                                                <img
                                                    src={coverMedia.preview}
                                                    alt={item.nama_produk}
                                                    // Gunakan block w-full untuk menghilangkan whitespace bawah default img
                                                    className={`w-full block transition-transform duration-700 ease-in-out group-hover:scale-110 ${isYoutube ? 'h-full object-cover' : 'h-auto'}`}
                                                    onError={(e) => {
                                                        if (isYoutube && e.target.src.includes('maxresdefault')) {
                                                            e.target.src = e.target.src.replace('maxresdefault', 'hqdefault');
                                                        } else {
                                                            e.target.src = "https://placehold.co/400x600?text=No+Image";
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full aspect-square flex flex-col items-center justify-center text-gray-400 text-sm p-4 text-center">
                                                    <span>No Image</span>
                                                </div>
                                            )}

                                            {/* OVERLAY HOVER YANG LEBIH CLEAN */}
                                            {/* Gradient halus saat hover agar teks terlihat jelas */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                                                {/* Nama produk dipindah ke Hover Overlay */}
                                                <h3 className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                    {item.nama_produk}
                                                </h3>
                                                <p className="text-gray-300 text-xs translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                                    {item.tahun}
                                                </p>
                                            </div>

                                            {media.length > 1 && (
                                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md">
                                                    +{media.length - 1}
                                                </div>
                                            )}
                                        </div>

                                        {/* BAGIAN BAWAH (Title/Deskripsi) DIHAPUS 
                                            Agar murni hanya gambar gallery
                                        */}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <motion.section {...fadeInUp} className="px-6 md:px-20 py-16 md:py-6 overflow-hidden mb-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="w-full rounded-3xl overflow-hidden relative shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-b from-green-500 to-lime-500">
                                <div
                                    className="absolute inset-0 opacity-10 pointer-events-none"
                                    style={{
                                        backgroundImage: `url(${Assets.Banner1})`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                ></div>
                            </div>
                            <div className="relative px-6 py-16 md:py-20 text-center flex flex-col items-center justify-center gap-6">
                                <h2 className="text-white text-2xl md:text-4xl font-bold capitalize leading-tight z-10 ">
                                    PT Divus Global Medicom siap menjadi solusi <br className="hidden md:block" />
                                    terpercaya untuk bisnis Anda!
                                </h2>
                                <a href="https://wa.me/6285220203453" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex justify-center items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 z-10 group">
                                    <FaWhatsapp className="text-green-600 w-6 h-6 group-hover:scale-110 transition-transform" />
                                    <span className="text-black text-base md:text-lg font-semibold capitalize">
                                        Konsultasi Sekarang
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </main>

            {/* MODAL (Tidak Berubah) */}
            <AnimatePresence>
                {isModalOpen && selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 md:p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-6xl h-full md:h-[85vh] bg-transparent md:rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition backdrop-blur-sm"
                            >
                                <X size={24} />
                            </button>

                            <div className="w-full md:w-3/4 bg-black/40 backdrop-blur-md relative flex items-center justify-center h-[50vh] md:h-full overflow-hidden group">
                                {(() => {
                                    const media = getMediaItems(selectedProduct);
                                    const currentItem = media[currentImageIndex];

                                    return (
                                        <>
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={currentImageIndex}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -50 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="w-full h-full flex items-center justify-center"
                                                >
                                                    {currentItem?.type === 'youtube' ? (
                                                        <iframe
                                                            width="100%"
                                                            height="100%"
                                                            src={`https://www.youtube.com/embed/${currentItem.videoId}?autoplay=1&rel=0`}
                                                            title="YouTube video player"
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                            className="w-full h-full"
                                                        ></iframe>
                                                    ) : (
                                                        <img
                                                            src={currentItem?.url}
                                                            alt={`Slide ${currentImageIndex}`}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => e.target.src = "https://placehold.co/800x600?text=Gagal+Muat"}
                                                        />
                                                    )}
                                                </motion.div>
                                            </AnimatePresence>

                                            {media.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={prevSlide}
                                                        className="absolute left-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/30 transition backdrop-blur-md border border-white/20"
                                                    >
                                                        <ChevronLeft size={28} />
                                                    </button>
                                                    <button
                                                        onClick={nextSlide}
                                                        className="absolute right-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/30 transition backdrop-blur-md border border-white/20"
                                                    >
                                                        <ChevronRight size={28} />
                                                    </button>
                                                    <div className="absolute bottom-6 flex gap-2 justify-center w-full">
                                                        {media.map((_, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => setCurrentImageIndex(idx)}
                                                                className={`cursor-pointer rounded-full transition-all shadow-sm ${idx === currentImageIndex
                                                                    ? 'bg-white w-8 h-2'
                                                                    : 'bg-white/40 w-2 h-2 hover:bg-white/80'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="w-full md:w-1/4 bg-white flex flex-col h-[50vh] md:h-full border-l border-gray-100">
                                <div className="p-6 md:p-8 overflow-y-auto flex-1">
                                    <div className="mb-6">
                                        <span className="inline-block bg-lime-100 text-lime-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
                                            Tahun: {selectedProduct.tahun}
                                        </span>
                                        <h2 className="text-2xl font-bold text-gray-900 leading-snug">
                                            {selectedProduct.nama_produk}
                                        </h2>
                                    </div>

                                    <div className="w-full h-px bg-gray-200 mb-6"></div>

                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">
                                        Deskripsi Produk
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                                        {selectedProduct.deskripsi || "Tidak ada deskripsi detail untuk produk ini."}
                                    </p>
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50">
                                    <a
                                        href="https://wa.me/6285220203453" target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition shadow-lg shadow-green-200"
                                    >
                                        <FaWhatsapp size={18} />
                                        Tanya Produk Ini
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <a
                href="https://wa.me/6285220203453"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl z-40 hover:bg-green-600 transition-colors"
            >
                <FaWhatsapp size={32} className="text-white" />
            </a>
        </div>
    );
};

export default Produk;
