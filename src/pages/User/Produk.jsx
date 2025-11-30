import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { X, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import Navbar from '../../components/navbar';
import Footer from '../../components/Footer';
import { Assets } from '../../assets';

const Produk = () => {
    // --- STATE ---
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State untuk Modal & Slider
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (!res.ok) throw new Error("Gagal mengambil data");
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // --- 2. HELPER PARSE GAMBAR ---
    const getImages = (fotoString) => {
        if (!fotoString) return [];
        try {
            const parsed = JSON.parse(fotoString);
            return Array.isArray(parsed) ? parsed : [fotoString];
        } catch (e) {
            return [fotoString];
        }
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
        const images = getImages(selectedProduct?.foto_produk);
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = (e) => {
        e.stopPropagation();
        const images = getImages(selectedProduct?.foto_produk);
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    return (
        <div className="min-h-screen bg-white font-['Poppins']">
            <Head>
                <title>Portofolio Produk - PT Divus Global Mediacomm</title>
            </Head>

            <Navbar />

            <main className="pt-24 pb-16">
                {/* Header Section Sesuai Permintaan */}
                <header className="relative w-full">
                    {/* Hero Banner */}
                    <section className="w-full bg-slate-50 py-14 md:py-2 px-6 border-b border-slate-200">
                        <div className="max-w-4xl mx-auto flex flex-row items-center justify-center gap-6 md:gap-10 mt-12">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                                <img
                                    src={Assets.Hero3}
                                    alt="Logo Divus"
                                    className="w-100 h-100 object-contain"
                                />
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col justify-center">
                                <h1 className="text-zinc-800 text-xl md:text-3xl font-bold font-['Poppins'] leading-tight">
                                    PT Divus Global Mediacomm
                                </h1>
                                <p className="text-zinc-500 text-base md:text-xl font-medium italic font-['Poppins']">
                                    - Produk
                                </p>
                            </div>
                        </div>
                    </section>


                    {/* Breadcrumb */}
                    <div className="w-full bg-zinc-300 py-3 mb-4">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-zinc-800 text-base">
                                {/* Level 1: Beranda */}
                                <Link href="/User/Home" className="hover:underline hover:text-green-600 transition-colors">
                                    Beranda
                                </Link>

                                {/* Separator */}
                                <span className="mx-2 text-zinc-500">{'>'}</span>

                                {/* Level 2: Kategori (Misal: Layanan) */}
                                <Link href="/User/Portofolio" className="hover:underline hover:text-green-600 transition-colors">
                                    Portofolio
                                </Link>

                                {/* Separator */}
                                <span className="mx-2 text-zinc-500">{'>'}</span>

                                {/* Level 3: Halaman Aktif (Merah) */}
                                <span className="text-red-600 font-medium">
                                    Produk
                                </span>
                            </p>
                        </div>
                    </div>
                </header>


                {/* --- PROFIL SECTION --- */}
                <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-8">
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        <div className="w-full">
                            <h2 className="text-xl md:text-2xl font-bold text-zinc-800 mb-6 capitalize">
                                Lebih dari Puluhan instansi dan perusahaan telah mempercayakan berbagai kebutuhan konsultansi, perencanaan, dan pengembangan solusi kepada kami.
                            </h2>
                            <p className="text-zinc-800 text-base font-normal leading-loose text-justify">
                                Kami telah bekerja sama dalam beragam proyek, mulai dari kajian manajemen, bantuan teknis, perencanaan arsitektur, telematika, hingga penyusunan studi dan laporan resmi di berbagai sektor. Dengan layanan yang profesional dan solusi yang disesuaikan, kami membantu klien meningkatkan efektivitas, akurasi perencanaan, serta kualitas pengambilan keputusan.
                            </p>
                        </div>
                    </div>
                </section>

                {/* --- PRODUCT GRID SECTION --- */}
<div className="max-w-6xl mx-auto px-6 md:px-12 mb-20 mt-10">
    {isLoading ? (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
    ) : products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
            <p className="text-gray-400">Belum ada produk yang dipublikasikan.</p>
        </div>
    ) : (
        // Menggunakan flex-wrap dan justify-center untuk menengahkan grid
        <div className="flex flex-wrap justify-center gap-6">
            {products.map((item) => {
                const images = getImages(item.foto_produk);
                const coverImage = images.length > 0 ? images[0] : null;

                return (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        // Mengatur lebar elemen agar responsif dan turun ke bawah jika tidak muat
                        className="group cursor-pointer relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.33%-16px)] lg:w-[calc(25%-18px)]"
                        onClick={() => openModal(item)}
                    >
                        <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                            {/* GAMBAR UTAMA */}
                            {coverImage ? (
                                <img
                                    src={coverImage}
                                    alt={item.nama_produk}
                                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                                    onError={(e) => e.target.src = "https://placehold.co/400x600?text=No+Image"}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-sm p-4 text-center">
                                    <span>No Image</span>
                                </div>
                            )}

                            {/* OVERLAY HOVER GRID */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 bg-white/95 text-zinc-900 px-5 py-2 rounded-full text-sm font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl tracking-wide">
                                    Lihat Foto
                                </span>
                            </div>

                            {/* INDIKATOR JUMLAH FOTO */}
                            {images.length > 1 && (
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md border border-white/10">
                                    +{images.length - 1}
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    )}
</div>

                {/* CTA SECTION */}
                <section className="px-6 md:px-20 py-16 md:py-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="w-full rounded-3xl overflow-hidden relative shadow-xl">
                            {/* Background layer for gradient and image */}
                            <div className="absolute inset-0 bg-gradient-to-b from-green-500 to-lime-500">
                                {/* Background image 1 with low opacity */}
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
                      
                            {/* Content layer */}
                            <div className="relative px-6 py-16 md:py-20 text-center flex flex-col items-center justify-center gap-6">
                                {/* Judul */}
                                <h2 className="text-white text-3xl md:text-4xl font-bold capitalize leading-tight z-10 ">
                                    PT Divus Global Medicom siap menjadi solusi <br className="hidden md:block" />
                                    terpercaya untuk bisnis Anda!
                                </h2>
                      
                                {/* Subjudul */}
                                <p className="text-white text-lg md:text-xl font-normal capitalize leading-snug max-w-4xl z-10">
                                    Hubungi kami dan dapatkan panduan dari konsultan berpengalaman
                                </p>
                      
                                {/* Tombol CTA */}
                                <a href="https://wa.me/62812345678" className="mt-4 inline-flex justify-center items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 z-10 group">
                                    <FaWhatsapp className="text-green-600 w-6 h-6 group-hover:scale-110 transition-transform" />
                                    <span className="text-black text-base md:text-lg font-semibold font-['Poppins'] capitalize">
                                        Konsultasi Sekarang
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
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
                                    const images = getImages(selectedProduct.foto_produk);
                                    return (
                                        <>
                                            <AnimatePresence mode="wait">
                                                <motion.img
                                                    key={currentImageIndex}
                                                    src={images[currentImageIndex]}
                                                    alt={`Slide ${currentImageIndex}`}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -50 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => e.target.src = "https://placehold.co/800x600?text=Gagal+Muat"}
                                                />
                                            </AnimatePresence>

                                            {/* Navigasi Slider */}
                                            {images.length > 1 && (
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

                                                    {/* Dots */}
                                                    <div className="absolute bottom-6 flex gap-2 justify-center w-full">
                                                        {images.map((_, idx) => (
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

                            {/* === KANAN: DETAIL (PUTIH SOLID) === */}
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
                                        href="https://wa.me/62812345678"
                                        target="_blank"
                                        rel="noopener noreferrer"
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

            {/* Floating WA */}
            <a
                href="https://wa.me/6285220203453"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl z-40 hover:bg-green-600 transition-colors"
            >
                <FaWhatsapp size={32} className="text-white" />
            </a>

            <Footer />
        </div>
    );
};

export default Produk;