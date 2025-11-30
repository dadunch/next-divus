import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { Assets } from '../../assets';
import { motion } from 'framer-motion';

// --- HELPER: FORMAT DESKRIPSI SINGKAT (DIPERBAIKI) ---
const getSummary = (text) => {
    if (!text) return "Layanan profesional dari PT Divus.";

    // 1. Hapus kalimat "Layanan Yang Ditawarkan: -" (Case Insensitive)
    // Regex ini akan mencari variasi tulisan tersebut dan menghapusnya
    let cleanText = text.replace(/Layanan\s+Yang\s+Ditawarkan\s*:\s*-?/gi, "");

    // 2. Hapus karakter Markdown bintang (**)
    cleanText = cleanText.replace(/\*\*/g, "");

    // 3. Ambil ringkasan jika ada marker khusus, atau potong 100 karakter
    const marker = "Ringkasan:";
    const index = cleanText.indexOf(marker);

    if (index !== -1) {
        // Jika ada kata "Ringkasan:", ambil teks setelahnya
        cleanText = cleanText.substring(index + marker.length);
    }

    // 4. Potong sisa spasi di awal/akhir dan batasi panjang karakter
    return cleanText.trim().substring(0, 100) + (cleanText.length > 100 ? "..." : "");
};

// Data Statis
const statsData = [
    { value: '10 Thn', label: 'Pengalaman' },
    { value: '44+', label: 'Klien Divus' },
    { value: '49+', label: 'Proyek Selesai' },
];

const reasons = [
    { number: 1, title: 'KONSULTAN BERPENGALAMAN', desc: 'PT Divus diisi oleh para profesional berpengalaman.' },
    { number: 2, title: 'AHLI PROFESIONAL', desc: 'Tim ahli dari berbagai bidang dengan pendekatan relevan.' },
    { number: 3, title: 'HASIL TERUKUR & CEPAT', desc: 'Output berkualitas tinggi berdasarkan data dan insight akurat.' },
];

const clientLogos = [
    Assets.Client1, Assets.Client2, Assets.Client3, Assets.Client4,
    Assets.Client5, Assets.Client6, Assets.Client7, Assets.Client8,
    Assets.Client9, Assets.Client10, Assets.Client11, Assets.Client12,
    Assets.Client13,
];

const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
    viewport: { once: false, amount: 0.2 }
};

export default function Home() {
    // State Data
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [projects, setProjects] = useState([]);

    // State UI
    const [activePorto, setActivePorto] = useState('produk');
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch Services
                const resService = await fetch('/api/services');
                const dataService = await resService.json();
                if (resService.ok && Array.isArray(dataService)) {
                    setServices(dataService);
                }

                // 2. Fetch Products
                const resProd = await fetch('/api/products');
                const dataProd = await resProd.json();
                if (resProd.ok && Array.isArray(dataProd)) {
                    setProducts(dataProd.slice(0, 3));
                }

                // 3. Fetch Projects
                const resProj = await fetch('/api/projects');
                const dataProj = await resProj.json();
                if (resProj.ok && Array.isArray(dataProj)) {
                    setProjects(dataProj);
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
            </Head>

            <div className="max-w-[1440px] mx-auto">

                {/* HERO SECTION */}
                <section className="pt-24 pb-16 px-6 md:px-20 relative overflow-hidden bg-gray-100 md:bg-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-11">
                        <motion.div initial={{ opacity: 0, x: -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            viewport={{ once: false, amount: 0.2 }}
                            className="w-full md:w-1/2 flex flex-col justify-start items-start gap-4 z-10">
                            <p className="text-lime-500 text-xl font-medium mt-20">
                                PT Divus Global Mediacomm
                            </p>
                            <h1 className="text-zinc-800 text-3xl lg:text-4xl font-semibold leading-tight">
                                Tingkatkan Strategi dan Solusi Bisnis Anda!
                            </h1>
                            <p className="text-zinc-800 text-base font-normal leading-6 text-justify">
                                PT Divus menyediakan layanan management consulting, riset,
                                laporan, corporate identity, serta Report dan jurnal guna
                                membantu perusahaan mencapai strategi dan tujuan bisnis secara
                                optimal.
                            </p>

                            <Link
                                href="/User/TentangKami"
                                className="inline-flex justify-start items-center px-6 py-4 bg-green-500 rounded-xl shadow-lg hover:bg-green-600 transition-colors mt-10"
                            >
                                <FaWhatsapp size={24} className="text-white mr-2" />
                                <span className="text-white text-base font-bold leading-6">
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

                        <motion.div initial={{ opacity: 0, x: 100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            viewport={{ once: false, amount: 0.2 }}
                            className="w-full md:w-1/2 relative flex justify-center items-center">
                            <div className="relative w-[320px] sm:w-[420px] md:w-[550px] h-[380px] sm:h-[450px] md:h-[480px]">
                                <img className="absolute top-[80px] sm:top-[100px] md:top-[130px] left-6 sm:left-12 md:left-16 w-[250px] sm:w-[350px] md:w-[490px] h-[200px] sm:h-[280px] md:h-[360px] rounded-2xl object-cover" src={Assets.Hero3} alt="Gambar Latar" />
                                <img className="absolute top-[10px] left-2 sm:left-5 w-[480px] sm:w-[650px] md:w-[900px] h-[460px] sm:h-[650px] md:h-[860px] rounded-2xl object-cover" src={Assets.Hero1} alt="Gambar Tengah" />
                                <img className="absolute top-[80px] sm:top-[90px] md:top-[120px] right-10 md:right-24 w-[380px] sm:w-[520px] md:w-[700px] h-[350px] sm:h-[480px] md:h-[620px] rounded-2xl object-cover" src={Assets.Hero2} alt="Gambar Depan" />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* STATS + CLIENT LOGO */}
                <motion.section {...fadeInUp} className="px-6 md:px-20 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <h2 className="text-zinc-500 text-xl font-semibold leading-6 w-64 text-center md:text-left">
                            Dipercaya Oleh Mitra Internasional
                        </h2>
                        <div className="flex gap-8 justify-center">
                            <img className="w-28 md:w-32 h-auto" src={Assets.Client12} alt="Mitra A" />
                            <img className="w-24 md:w-28 h-auto" src={Assets.Client13} alt="Mitra B" />
                        </div>
                    </div>
                    <div className="mt-10 w-full relative flex justify-center">
                        <div className="w-full h-12 bg-gradient-to-r from-lime-500 to-green-500 rounded-[20px]"></div>
                        <a href="https://wa.me/62812345678" target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-10 w-16 h-16 p-3 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors z-10">
                            <FaWhatsapp size={32} className="text-white" />
                        </a>
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
                        <Link href="/User/TentangKami" className="inline-flex justify-start items-center px-5 py-3 bg-green-500 rounded-lg shadow-lg hover:bg-green-600 transition-colors">
                            <span className="text-white text-base font-semibold leading-6">Tentang Kami</span>
                        </Link>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <div className="relative w-full md:w-[635px] h-80 md:h-96 overflow-hidden rounded-2xl">
                            <img className="absolute inset-0 rounded-2xl object-cover w-full h-full" src={Assets.Hero4} alt="Tentang Kami" />
                        </div>
                    </div>
                </motion.section>

                {/* LAYANAN (DENGAN FIX getSummary) */}
                <motion.section {...fadeInUp} className="py-16 md:py-20 w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] bg-gray-50 overflow-hidden">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-10">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-16">
                            <div className="w-full lg:w-1/2 relative">
                                <h2 className="text-zinc-800 text-2xl md:text-3xl font-semibold leading-tight z-10 relative">
                                    Solusi Tepat untuk Bisnis Anda.
                                    <span className="inline-block ml-3 w-32 md:w-48 h-2 bg-gradient-to-r from-lime-500 to-green-500 rounded-full align-middle"></span>
                                </h2>
                            </div>
                            <div className="w-full lg:w-5/12">
                                <p className="text-zinc-600 text-base md:text-lg font-normal leading-relaxed text-justify lg:text-left">
                                    Kami menyediakan layanan profesional mulai dari konsultasi hingga eksekusi strategi.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-13 lg:gap-15">
                            {loading && <p>Memuat layanan...</p>}
                            {!loading && services.map((item, index) => (
                                <div key={index} className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2.5rem)] max-w-[420px] flex flex-col items-start">
                                    <div className="bg-white rounded-2xl p-6 md:p-8 w-full h-full flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300 shadow-sm hover:shadow-md min-h-[350px]">
                                        <div>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-20 h-20 flex-shrink-0 bg-lime-500/20 rounded-tr-3xl rounded-bl-3xl flex items-center justify-center p-4">
                                                    {item.icon_url ? (
                                                        <i className={`${item.icon_url} text-4xl text-green-600`}></i>
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
                                        <Link href={`/User/Layanan/${item.slug}`} className="px-6 py-3 bg-green-500 rounded-xl shadow-[0px_2px_5px_0px_rgba(0,0,0,0.14)] hover:bg-green-600 transition-colors text-white text-sm font-bold self-start">
                                            Detail Layanan
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* PORTOFOLIO SECTION */}
                <motion.section {...fadeInUp} className="px-4 md:px-20 py-20 bg-white">
                    <div className="w-full rounded-3xl overflow-hidden relative shadow-lg bg-gradient-to-b from-[#4ade80] to-[#84cc16]">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start p-8 md:p-14 gap-10">

                            {/* TEXT & BUTTONS */}
                            <div className="w-full lg:w-5/12 flex flex-col items-start gap-6 text-white z-10">
                                <h2 className="text-3xl md:text-4xl font-bold">Portofolio Kami</h2>
                                <p className="text-base md:text-lg font-medium leading-relaxed text-justify lg:text-left opacity-95">
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

                            {/* DISPLAY AREA */}
                            <div className="w-full lg:w-7/12 flex justify-center lg:justify-end items-center">

                                {/* --- PRODUK (GRID) --- */}
                                {activePorto === 'produk' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full">
                                        {products.map((item, idx) => (
                                            <div key={idx} className="group relative h-64 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 bg-white">
                                                <div className="w-full h-full">
                                                    <img src={getProductImage(item.foto_produk)} alt={item.nama_produk} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-end p-3">
                                                    <span className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                                        {item.nama_produk}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* --- PROYEK (TABEL FINAL) --- */}
                                {activePorto === 'proyek' && (
                                    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20">
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
                                                    {projects.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-green-50 transition-colors bg-white/50">

                                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                                {item.client?.client_name || '-'}
                                                            </td>

                                                            <td className="px-4 py-3 text-gray-600">
                                                                {item.project_name || '-'}
                                                            </td>

                                                            <td className="px-4 py-3 text-gray-600">
                                                                {item.category?.bidang || '-'}
                                                            </td>

                                                            <td className="px-4 py-3 text-center text-gray-600">
                                                                {item.tahun || '-'}
                                                            </td>

                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* MENGAPA PILIH KAMI */}
                <motion.section {...fadeInUp} className="px-6 md:px-20 py-20 bg-white">
                    <h2 className="text-center text-3xl md:text-4xl font-bold text-zinc-800 mb-10">
                        Mengapa Memilih PT Divus Global Mediacomm?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                        {reasons.map((item) => (
                            <div key={item.number} className="flex flex-col items-center text-center gap-5">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-4xl font-bold text-green-500">{item.number}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-zinc-800">{item.title}</h3>
                                <p className="text-zinc-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* KLIEN KAMI */}
                <motion.section {...fadeInUp} className="bg-white relative overflow-hidden w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw]">
                    <h2 className="text-center text-zinc-800 text-4xl font-semibold mb-8 mt-12">Klien Kami</h2>
                    <p className="text-center font-medium text-lg text-lime-500 mt-8">Dipercaya oleh 100+ klien dari Nasional Dan Internasional</p>
                    <div className="relative h-48 overflow-hidden mt-10 w-full">
                        <motion.div
                            className="absolute flex items-center gap-16 w-max will-change-transform"
                            animate={{ x: ['0%', '-50%'] }}
                            transition={{ repeat: Infinity, duration: 45, ease: 'linear' }}
                        >
                            {Array(2).fill(clientLogos).flat().map((ImgClnt, i) => (
                                <motion.img
                                    key={i}
                                    src={ImgClnt}
                                    alt="Client Logo"
                                    className="h-20 w-20 md:h-28 md:w-28 opacity-80 hover:opacity-100 transform hover:scale-110 transition-all duration-500 ease-in-out"
                                    loading="lazy"
                                />
                            ))}
                        </motion.div>
                    </div>
                </motion.section>

                <motion.section {...fadeInUp} className="px-4 md:px-20 py-20 bg-white">
                    <div className="w-full rounded-3xl overflow-hidden relative shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-b from-green-500 to-lime-500">
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${Assets.Banner1})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                        </div>
                        <div className="relative px-6 py-16 md:py-20 text-center flex flex-col items-center justify-center gap-6">
                            <h2 className="text-white text-3xl md:text-4xl font-bold capitalize leading-tight z-10 ">PT Divus Global Medicom siap menjadi solusi <br className="hidden md:block" /> terpercaya untuk bisnis Anda!</h2>
                            <p className="text-white text-lg md:text-xl font-normal capitalize leading-snug max-w-4xl z-10">Hubungi kami dan dapatkan panduan dari konsultan berpengalaman</p>
                            <a href="https://wa.me/62812345678" className="mt-4 inline-flex justify-center items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 z-10 group">
                                <FaWhatsapp className="text-green-600 w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-black text-base md:text-lg font-semibold capitalize">Konsultasi Sekarang</span>
                            </a>
                        </div>
                    </div>
                </motion.section>
            </div>
        </main>
    );
}