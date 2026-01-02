import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { Assets } from '../../assets';
import { motion } from 'framer-motion';
import { serviceCache } from '../../utils/serviceCache';
import { productCache } from '../../utils/productCache';
import { projectCache } from '../../utils/projectCache';
import { clientCache } from '../../utils/clientCache';
import { heroCache } from '../../utils/heroCache';

// ============ SKELETON LOADER COMPONENTS ============
const HeroImageSkeleton = () => (
    <div className="w-full md:w-1/2 relative flex justify-center items-center mt-12 md:mt-0">
        <div className="relative w-full max-w-[550px] aspect-[5/4] sm:aspect-[4/3]">
            {/* Skeleton untuk gambar utama */}
            <div className="aspect-square absolute right-3 top-4 w-[57%] rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse shadow-lg" />
            {/* Skeleton untuk gambar sekunder */}
            <div className="aspect-square absolute bottom-15 left-0 w-[47%] rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse shadow-lg" />
        </div>
    </div>
);

const ServiceCardSkeleton = () => (
    <div className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2.5rem)] max-w-[420px]">
        <div className="bg-white rounded-2xl p-6 md:p-8 w-full min-h-[350px] shadow-sm">
            <div className="animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-tr-3xl rounded-bl-3xl" />
                    <div className="flex-1">
                        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
                    </div>
                </div>
                <div className="space-y-3 mb-8">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                    <div className="h-4 bg-gray-200 rounded w-3/6" />
                </div>
                <div className="h-10 bg-gray-300 rounded-xl w-32" />
            </div>
        </div>
    </div>
);

const ProductCardSkeleton = () => (
    <div className="h-64 rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
);

const AboutImageSkeleton = () => (
    <div className="relative w-full md:w-[635px] h-80 md:h-96 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
    </div>
);

// ============ UTILITY FUNCTIONS ============
const getSummary = (text) => {
    if (!text) return "Layanan profesional dari PT Divus.";
    let cleanText = text.replace(/Layanan\s+Yang\s+Ditawarkan\s*:\s*-?/gi, "").replace(/\*\*/g, "");
    const marker = "Ringkasan:";
    const index = cleanText.indexOf(marker);
    if (index !== -1) cleanText = cleanText.substring(index + marker.length);
    return cleanText.trim().substring(0, 100) + (cleanText.length > 100 ? "..." : "");
};

const reasons = [
    { number: 1, title: 'KONSULTAN BERPENGALAMAN & TERPERCAYA', desc: 'PT Divus diisi oleh para profesional berpengalaman yang memahami kebutuhan bisnis modern. Kami menghadirkan solusi cepat, tepat, dan berorientasi hasil untuk mendukung pertumbuhan perusahaan Anda.' },
    { number: 2, title: 'AHLI PROFESIONAL DI BERBAGAI BIDANG', desc: 'PT Divus diisi oleh para profesional berpengalaman yang memahami kebutuhan bisnis modern. Kami menghadirkan solusi cepat, tepat, dan berorientasi hasil untuk mendukung pertumbuhan perusahaan Anda.' },
    { number: 3, title: 'HASIL TERUKUR, CEPAT, & ANDAL', desc: 'PT Divus berkomitmen memberikan output berkualitas tinggi dengan proses yang efisien. Setiap rekomendasi disusun berbasis data dan insights sehingga menghasilkan keputusan bisnis yang lebih akurat dan efektif.' },
];

const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
    viewport: { once: false, amount: 0.2 }
};

export default function Home() {
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [projects, setProjects] = useState([]);
    const [clientLogos, setClientLogos] = useState([]);
    const [statsData, setStatsData] = useState([
        { value: '0', label: 'Pengalaman' },
        { value: '0+', label: 'Klien Divus' },
        { value: '0+', label: 'Proyek Selesai' },
    ]);
    const [activePorto, setActivePorto] = useState('produk');
    const [loading, setLoading] = useState(true);

    // State untuk hero images dengan loading state terpisah
    const [heroImages, setHeroImages] = useState({
        img1: null,
        img2: null,
        img3: null
    });
    const [heroLoading, setHeroLoading] = useState({
        img1: true,
        img2: true,
        img3: true
    });

    useEffect(() => {
        // ============ OPTIMIZED IMAGE PRELOADER ============
        const preloadImage = (src, key) => {
            return new Promise((resolve, reject) => {
                if (!src) {
                    reject('No source provided');
                    return;
                }
                
                const img = new Image();
                
                // Set priority untuk hero images
                img.loading = 'eager';
                img.fetchPriority = 'high';
                
                img.onload = () => {
                    setHeroImages(prev => ({ ...prev, [key]: src }));
                    setHeroLoading(prev => ({ ...prev, [key]: false }));
                    resolve();
                };
                
                img.onerror = () => {
                    console.warn(`Failed to load ${key}:`, src);
                    // Gunakan fallback image
                    setHeroImages(prev => ({ ...prev, [key]: Assets.Hero3 }));
                    setHeroLoading(prev => ({ ...prev, [key]: false }));
                    reject();
                };
                
                img.src = src;
            });
        };

        // ============ FETCH HERO IMAGES DENGAN PRIORITY TINGGI ============
        const fetchHeroImagesFirst = async () => {
            try {
                const dataHero = await heroCache.fetch();
                
                if (dataHero) {
                    // Load semua gambar secara paralel untuk kecepatan maksimal
                    const imagePromises = [
                        preloadImage(dataHero.foto1 || Assets.Hero3, 'img1'),
                        preloadImage(dataHero.foto2 || Assets.Hero3, 'img2'),
                        preloadImage(dataHero.foto3 || Assets.Hero3, 'img3')
                    ];
                    
                    // Gunakan Promise.allSettled agar tidak terblokir jika ada yang gagal
                    await Promise.allSettled(imagePromises);
                } else {
                    // Set default images jika tidak ada data
                    setHeroImages({
                        img1: Assets.Hero3,
                        img2: Assets.Hero3,
                        img3: Assets.Hero3
                    });
                    setHeroLoading({
                        img1: false,
                        img2: false,
                        img3: false
                    });
                }
            } catch (e) {
                console.error("Gagal load hero assets:", e);
                // Set default images
                setHeroImages({
                    img1: Assets.Hero3,
                    img2: Assets.Hero3,
                    img3: Assets.Hero3
                });
                setHeroLoading({
                    img1: false,
                    img2: false,
                    img3: false
                });
            }
        };

        // Jalankan fetch hero images SEGERA
        fetchHeroImagesFirst();

        // ============ FETCH DATA LAINNYA (TIDAK BLOCKING) ============
        const fetchAllData = async () => {
            try {
                // Stats Dashboard
                try {
                    const resDash = await fetch('/api/dashboard');
                    const dataDash = await resDash.json();
                    if (resDash.ok && dataDash.stats) {
                        setStatsData([
                            { value: `${dataDash.stats.years} Thn`, label: 'Pengalaman' },
                            { value: `${dataDash.stats.mitra}+`, label: 'Klien Divus' },
                            { value: `${dataDash.stats.proyek}+`, label: 'Proyek Selesai' },
                        ]);
                    }
                } catch (error) {
                    console.warn("Gagal fetch stats dashboard:", error);
                }

                // Services
                const dataService = await serviceCache.fetch();
                if (Array.isArray(dataService)) {
                    setServices(dataService);
                }

                // Products
                const dataProd = await productCache.fetch();
                if (Array.isArray(dataProd)) {
                    setProducts(dataProd.slice(0, 3));
                }

                // Projects
                const dataProj = await projectCache.fetch();
                if (Array.isArray(dataProj)) {
                    setProjects(dataProj);
                }

                // Clients
                try {
                    const dataClients = await clientCache.fetch();
                    if (Array.isArray(dataClients)) {
                        const logos = dataClients
                            .map(client => client.client_logo)
                            .filter(logo => logo !== null && logo !== "");
                        setClientLogos(logos);
                    }
                } catch (e) {
                    console.error("Gagal fetch clients:", e);
                }

            } catch (error) {
                console.error("Gagal mengambil data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const getProductImage = (jsonString) => {
        try {
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
            return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600";
        } catch (e) {
            return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600";
        }
    };

    return (
        <main className="w-full">
            <Head>
                <title>PT Divus Global Mediacomm</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
                {/* Preconnect untuk optimasi */}
                <link rel="preconnect" href="https://images.unsplash.com" />
                <link rel="dns-prefetch" href="https://images.unsplash.com" />
            </Head>

            <div className="max-w-[1440px] mx-auto">

                {/* HERO SECTION */}
                <section className="pt-24 pb-16 px-6 md:px-20 relative overflow-x-hidden bg-gray-100 md:bg-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-11">
                        <motion.div initial={{ opacity: 0, x: -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            viewport={{ once: false, amount: 0.2 }}
                            className="w-full md:w-1/2 flex flex-col justify-start items-start gap-4 z-10">
                            <p className="text-lime-500 text-lg md:text-xl font-medium mt-20">
                                PT Divus Global Mediacomm
                            </p>
                            <h1 className="text-zinc-800 text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight">
                                Tingkatkan Strategi dan Solusi Bisnis Anda!
                            </h1>
                            <p className="text-zinc-800 text-sm md:text-base font-normal leading-6 text-justify">
                                PT Divus menyediakan layanan management consulting, riset,
                                laporan, corporate identity, serta Report dan jurnal guna
                                membantu perusahaan mencapai strategi dan tujuan bisnis secara
                                optimal.
                            </p>

                            <Link
                                href="https://wa.me/6285220203453" target="_blank" rel="noopener noreferrer" 
                                className="inline-flex justify-start items-center px-5 py-3 md:px-6 md:py-4 bg-green-500 rounded-xl shadow-lg hover:bg-green-600 transition-colors mt-10"
                            >
                                <FaWhatsapp size={24} className="text-white mr-2" />
                                <span className="text-white text-sm md:text-base font-bold leading-6">
                                    Hubungi Kami
                                </span>
                            </Link>

                            <div className="flex flex-col md:flex-row justify-start items-start md:items-center gap-8 md:gap-16 mt-10">
                                <div className="flex gap-6">
                                    {statsData.map((stat, index) => (
                                        <div key={index} className="flex flex-col items-center gap-1">
                                            <span className="text-green-500 text-2xl md:text-3xl font-semibold">
                                                {stat.value}
                                            </span>
                                            <span className="text-green-500 text-sm md:text-normal font-medium">
                                                {stat.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* HERO IMAGES DENGAN SKELETON LOADER */}
                        {heroLoading.img1 || heroLoading.img2 ? (
                            <HeroImageSkeleton />
                        ) : (
                            <motion.div initial={{ opacity: 0, x: 100 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                viewport={{ once: false, amount: 0.2 }}
                                className="w-full md:w-1/2 relative flex justify-center items-center mt-12 md:mt-0">
                                <div className="relative w-full max-w-[550px] aspect-[5/4] sm:aspect-[4/3]">
                                    <img className="absolute left-10 top-13 w-[2000px] object-contain z-0 pointer-events-none opacity-90"
                                        src={Assets.Hero3}
                                        alt="Dekorasi"
                                    />
                                    <img 
                                        className="aspect-square object-cover top-4 absolute right-3 w-[57%] rounded-2xl shadow-lg z-10 transition-opacity duration-500"
                                        src={heroImages.img1}
                                        alt="Office Meeting"
                                        loading="eager"
                                        fetchpriority="high"
                                    />
                                    <img 
                                        className="aspect-square object-cover absolute bottom-15 left-0 w-[47%] rounded-2xl z-20 transition-opacity duration-500"
                                        src={heroImages.img2}
                                        alt="Team Discussion"
                                        loading="eager"
                                        fetchpriority="high"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* STATS + CLIENT LOGO */}
                <motion.section {...fadeInUp} className="px-6 md:px-20 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <h2 className="text-zinc-500 text-lg md:text-xl font-semibold leading-6 w-64 text-center md:text-left">
                            Dipercaya Oleh Mitra Internasional
                        </h2>
                        <div className="flex gap-8 justify-center">
                            <img className="w-28 md:w-32 h-auto" src={Assets.Client12} alt="Mitra A" loading="lazy" />
                            <img className="w-24 md:w-28 h-auto" src={Assets.Client13} alt="Mitra B" loading="lazy" />
                        </div>
                    </div>
                    <div className="mt-10 w-full relative flex justify-center">
                        <div className="w-full h-6 md:h-12 bg-gradient-to-r from-lime-500 to-green-500 rounded-[20px]"></div>
                    </div>
                </motion.section>

                {/* TENTANG KAMI */}
                <motion.section {...fadeInUp} className="px-6 md:px-20 py-16 md:py-20 flex flex-col lg:flex-row lg:items-center gap-10">
                    <div className="w-full lg:w-1/2 flex flex-col justify-start items-start gap-8">
                        <h1 className="text-zinc-800 text-2xl lg:text-3xl font-bold leading-tight">
                            Apa Itu PT Divus Global Mediacomm?
                        </h1>
                        <p className="text-zinc-800 text-base font-normal leading-6 text-justify">
                            PT Divus Global Mediacomm adalah perusahaan konsultan yang bergerak di bidang manajemen, komunikasi korporat, dan desain grafis.
                        </p>
                        <Link href="/User/TentangKami" className="inline-flex justify-start items-center px-3 md:px-5 py-2 md:py-3 bg-green-500 rounded-lg shadow-lg hover:bg-green-600 transition-colors">
                            <span className="text-white text-sm md:text-base font-medium leading-6">Tentang Kami</span>
                        </Link>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-center">
                        {heroLoading.img3 ? (
                            <AboutImageSkeleton />
                        ) : (
                            <div className="relative w-full md:w-[635px] h-80 md:h-96 overflow-hidden rounded-2xl">
                                <img 
                                    className="absolute inset-0 rounded-2xl object-cover w-full h-full transition-opacity duration-500" 
                                    src={heroImages.img3} 
                                    alt="Tentang Kami" 
                                    loading="lazy"
                                />
                            </div>
                        )}
                    </div>
                </motion.section>

                {/* LAYANAN */}
                <section className="px-0 md:px-10 py-16 md:py-20 bg-gray-50 overflow-hidden">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-10">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-16">
                            <div className="w-full lg:w-1/2 relative">
                                <h2 className="text-zinc-800 text-2xl md:text-3xl font-semibold leading-tight z-10 relative">
                                    Solusi Tepat untuk Meningkatkan Efektivitas Strategi Bisnis.
                                    <span className="inline-block ml-3 w-32 md:w-48 h-2 bg-gradient-to-r from-lime-500 to-green-500 rounded-full align-middle"></span>
                                </h2>
                            </div>
                            <div className="w-full lg:w-5/12">
                                <p className="text-zinc-600 text-base md:text-lg font-normal leading-relaxed text-justify lg:text-left">
                                    PT Divus menyediakan layanan management consulting, riset, laporan, corporate identity, serta Report dan jurnal guna membantu perusahaan mencapai strategi dan tujuan bisnis secara optimal.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-13 lg:gap-15">
                            {loading ? (
                                <>
                                    <ServiceCardSkeleton />
                                    <ServiceCardSkeleton />
                                    <ServiceCardSkeleton />
                                </>
                            ) : (
                                services.map((item, index) => (
                                    <div key={index} className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2.5rem)] max-w-[420px] flex flex-col items-start">
                                        <div className="bg-white rounded-2xl p-6 md:p-8 w-full h-full flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300 shadow-sm hover:shadow-md min-h-[350px]">
                                            <div>
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-20 h-20 flex-shrink-0 bg-lime-500/20 rounded-tr-3xl rounded-bl-3xl flex items-center justify-center p-4">
                                                        {item.icon_url && item.icon_url.startsWith('fa-') ? (
                                                            <i className={`${item.icon_url} text-4xl text-green-600`}></i>
                                                        ) : item.image_url ? (
                                                            <img src={item.image_url} className="w-10 h-10 object-contain" alt={item.title} loading="lazy" />
                                                        ) : (
                                                            <i className="fa-solid fa-briefcase text-4xl text-green-600"></i>
                                                        )}
                                                    </div>
                                                    <h3 className="text-zinc-800 text-xl font-semibold leading-snug">{item.title}</h3>
                                                </div>
                                                <p className="text-zinc-600 text-base font-medium capitalize leading-relaxed text-justify mb-8 line-clamp-4">
                                                    {getSummary(item.description)}
                                                </p>
                                            </div>
                                            <Link href={`/User/Layanan/${item.id}`} className="px-6 py-3 bg-green-500 rounded-xl shadow-[0px_2px_5px_0px_rgba(0,0,0,0.14)] hover:bg-green-600 transition-colors text-white text-sm font-bold self-start">
                                                Detail Layanan
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* PORTOFOLIO SECTION */}
                <motion.section {...fadeInUp} className="px-6 md:px-20 py-20 bg-white">
                    <div className="w-full rounded-3xl overflow-hidden relative shadow-lg bg-gradient-to-b from-[#4ade80] to-[#84cc16]">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start p-8 md:p-14 gap-10">
                            <div className="w-full lg:w-5/12 flex flex-col items-start gap-6 text-white z-10">
                                <h2 className="text-3xl md:text-4xl font-semibold md:font-bold">Portofolio Kami</h2>
                                <p className="text-base md:text-lg font-normal md:font-medium leading-relaxed text-justify lg:text-left opacity-95">
                                    {activePorto === 'produk'
                                        ? "Lihat produk-produk unggulan yang telah kami kembangkan untuk mendukung bisnis klien kami."
                                        : "Daftar proyek dan kolaborasi strategis yang telah kami selesaikan dengan berbagai mitra."
                                    }
                                </p>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    <button onClick={() => setActivePorto('produk')} className={`px-6 py-3 rounded-xl font-bold shadow-md transition-all ${activePorto === 'produk' ? 'bg-white text-green-600' : 'border-2 border-white text-white hover:bg-white/10'}`}>
                                        Lihat Produk
                                    </button>
                                    <button onClick={() => setActivePorto('proyek')} className={`px-6 py-3 rounded-xl font-bold shadow-md transition-all ${activePorto === 'proyek' ? 'bg-white text-green-600' : 'border-2 border-white text-white hover:bg-white/10'}`}>
                                        Lihat Proyek
                                    </button>
                                </div>
                            </div>

                            <div className="w-full lg:w-7/12 flex justify-center lg:justify-end items-center">
                                {activePorto === 'produk' && (
                                    <a href='/User/Produk' className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full">
                                        {loading ? (
                                            <>
                                                <ProductCardSkeleton />
                                                <ProductCardSkeleton />
                                                <ProductCardSkeleton />
                                            </>
                                        ) : (
                                            products.map((item, idx) => (
                                                <div key={idx} className="group relative h-64 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 bg-white">
                                                    <div className="w-full h-full">
                                                        <img src={getProductImage(item.foto_produk)} alt={item.nama_produk} className="w-full h-full object-cover" loading="lazy" />
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-end p-3">
                                                        <span className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                                            {item.nama_produk}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </a>
                                )}
                                {activePorto === 'proyek' && (
                                    <a href='/User/Proyek' className="w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm text-left">
                                                <thead className="text-xs uppercase bg-[#22c55e] text-white font-bold tracking-wider">
                                                    <tr>
                                                        <th className="px-4 py-4 whitespace-nowrap">Customer</th>
                                                        <th className="px-4 py-4 whitespace-nowrap">Proyek</th>
                                                        <th className="px-4 py-4 whitespace-nowrap">Bidang</th>
                                                        <th className="px-4 py-4 text-center whitespace-nowrap">Tahun</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {projects.slice(0, 3).map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-green-50 transition-colors bg-white/50">
                                                            <td className="px-4 py-3 font-medium text-gray-900">{item.client?.client_name || item.customer || '-'}</td>
                                                            <td className="px-4 py-3 text-gray-600">{item.project_name || item.namaProyek || '-'}</td>
                                                            <td className="px-4 py-3 text-gray-600">{item.category?.bidang || item.bidang || '-'}</td>
                                                            <td className="px-4 py-3 text-center text-gray-600">{item.tahun || '-'}</td>
                                                        </tr>
                                                    ))}
                                                    {projects.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">Belum ada data proyek.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* MENGAPA PILIH KAMI */}
                <motion.section {...fadeInUp} className="px-6 md:px-20 py-20 bg-white">
                    <h2 className="text-center text-2xl md:text-4xl font-semibold md:font-bold text-zinc-800 mb-15">
                        Mengapa Memilih PT Divus Global Mediacomm?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto overflow-x-hidden">
                        {reasons.map((item, index) => (
                            <div key={item.number} className="relative flex flex-col items-center text-center gap-5">
                                {index < reasons.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-1/2 h-0.5 bg-zinc-300 z-0"
                                        style={{ width: '100%', maxWidth: '100%' }}>
                                    </div>
                                )}
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center z-10 border-12 border-white ">
                                    <span className="md:text-4xl text-3xl font-bold text-green-500">{item.number}</span>
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-zinc-800 line-clamp-2 h-14 overflow-hidden">{item.title}</h3>
                                <p className="text-zinc-600 text-sm md:text-base">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

            </div>

            {/* --- KLIEN KAMI (DINAMIS DARI DATABASE) --- */}
            <motion.section {...fadeInUp} className="bg-white relative overflow-hidden w-full">
                <h2 className="text-center text-zinc-800 text-2xl md:text-4xl font-semibold mb-8 mt-12">Klien Kami</h2>
                <p className="text-center font-medium text-base md:text-lg text-lime-500 mt-8">Dipercaya oleh 100+ klien dari Nasional Dan Internasional</p>
                <div className="relative h-48 overflow-hidden mt-10 w-full" >

                    {/* Marquee Animation */}
                    {clientLogos.length > 0 ? (
                        <div className="relative w-full overflow-hidden py-10" >
                            <motion.div
                                className="flex gap-16 w-max"
                                animate={{ x: "-50%" }}
                                transition={{
                                    ease: "linear",
                                    duration: 20,
                                    repeat: Infinity,
                                }}
                            >
                                {[...Array(2)].map((_, groupIndex) => (
                                    <div key={groupIndex} className="flex gap-16 items-center">
                                        {clientLogos.map((logo, i) => (
                                            <motion.img
                                                key={i}
                                                src={logo}
                                                alt="Client Logo"
                                                className="h-20 w-20 md:h-28 md:w-28 object-contain opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300"
                                            />
                                            // loading="lazy"
                                        ))}
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    ) : (
                        <p className="text-center w-full text-gray-400 italic mt-10">
                            Belum ada logo klien di database.
                        </p>
                    )}
                </div>
            </motion.section>

            <div className="max-w-[1440px] mx-auto">
                <motion.section {...fadeInUp} className="px-4 md:px-20 py-20 bg-white">
                    <div className="w-full rounded-3xl overflow-hidden relative shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-b from-green-500 to-lime-500">
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${Assets.Banner1})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                        </div>
                        <div className="relative px-6 py-16 md:py-20 text-center flex flex-col items-center justify-center gap-6">
                            <h2 className="text-white text-2xl md:text-4xl font-semibold md:font-bold capitalize leading-tight z-10 ">PT Divus Global Medicom siap menjadi solusi <br className="hidden md:block" /> terpercaya untuk bisnis Anda!</h2>
                            <p className="text-white text-lg md:text-xl font-normal capitalize leading-snug max-w-4xl z-10">Hubungi kami dan dapatkan panduan dari konsultan berpengalaman</p>
                            <a href="https://wa.me/6285220203453" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex justify-center items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 z-10 group">
                                <FaWhatsapp className="text-green-600 w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-black text-base md:text-lg font-semibold capitalize">
                                    Konsultasi Sekarang
                                </span>
                            </a>
                        </div>
                    </div>
                </motion.section>
                <a href="https://wa.me/6285220203453" target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-green-600 transition-colors">
                    <FaWhatsapp size={32} className="text-white" />
                </a>
            </div>
        </main>
    );
}