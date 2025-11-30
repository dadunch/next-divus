import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { Assets } from '../../assets'; 
import { motion } from 'framer-motion';

// --- HELPER: FORMAT DESKRIPSI SINGKAT ---
const getSummary = (text) => {
    if (!text) return "Layanan profesional dari PT Divus.";
    const marker = "**Ringkasan:**";
    const index = text.indexOf(marker);
    if (index !== -1) {
        let content = text.substring(index + marker.length).trim();
        const endOfSummary = content.indexOf('\n\n');
        if (endOfSummary !== -1) content = content.substring(0, endOfSummary);
        return content.replace(/\*\*/g, '').trim();
    }
    return text.substring(0, 100).replace(/\*\*/g, '') + "...";
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

export default function Home() {
    // State Data
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]); // Data Produk
    const [projects, setProjects] = useState([]); // Data Proyek
    
    // State UI
    const [activePorto, setActivePorto] = useState('produk'); // 'produk' atau 'proyek'
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA (Services, Products, Projects) ---
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Fetch Services (Layanan)
                const resService = await fetch('/api/services');
                const dataService = await resService.json();
                if (resService.ok && Array.isArray(dataService)) {
                    setServices(dataService.slice(0, 3)); 
                }

                // 2. Fetch Products (Produk)
                // Asumsi endpoint api/products ada (dari konteks sebelumnya)
                const resProd = await fetch('/api/products'); 
                const dataProd = await resProd.json();
                if (resProd.ok && Array.isArray(dataProd)) {
                    setProducts(dataProd.slice(0, 3)); // Ambil 3 terbaru
                }

                // 3. Fetch Projects (Proyek)
                const resProj = await fetch('/api/projects');
                const dataProj = await resProj.json();
                if (resProj.ok && Array.isArray(dataProj)) {
                    setProjects(dataProj.slice(0, 3)); // Ambil 3 terbaru
                }

            } catch (error) {
                console.error("Gagal mengambil data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Helper untuk mengambil Gambar Produk (Parse JSON)
    const getProductImage = (jsonString) => {
        try {
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
            return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600"; // Fallback
        } catch (e) {
            return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600";
        }
    };

	return (
		<main className="w-full font-['Poppins']">
            <Head>
                <title>PT Divus Global Mediacomm</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
            </Head>

			<div className="max-w-[1440px] mx-auto">
				
                {/* HERO SECTION */}
								<section className="pt-24 pb-16 px-6 md:px-20 relative overflow-hidden bg-gray-100 md:bg-white">
									<div className="flex flex-col md:flex-row items-center justify-between gap-11">
										{/* Left Content */}
										<div className="w-full md:w-1/2 flex flex-col justify-start items-start gap-8 z-10">
											<p className="text-lime-500 text-xl font-medium font-['Poppins'] mt-20">
												PT Divus Global Mediacomm
											</p>
											<h1 className="text-zinc-800 text-3xl lg:text-4xl font-semibold font-['Poppins'] leading-tight">
												Tingkatkan Strategi dan Solusi Bisnis Anda!
											</h1>
											<p className="text-zinc-800 text-base font-normal font-['Poppins'] leading-6 text-justify">
												PT Divus menyediakan layanan management consulting, riset,
												laporan, corporate identity, serta Report dan jurnal guna
												membantu perusahaan mencapai strategi dan tujuan bisnis secara
												optimal.
											</p>
				
											<Link
												href="/User/Contact"
												className="inline-flex justify-start items-center px-6 py-4 bg-green-500 rounded-xl shadow-lg hover:bg-green-600 transition-colors"
											>
												<FaWhatsapp size={24} className="text-white mr-2" />
												<span className="text-white text-base font-bold font-['Poppins'] leading-6">
													Hubungi Kami
												</span>
											</Link>
				
											{/* Stats */}
											<div className="flex flex-col md:flex-row justify-start items-start md:items-center gap-8 md:gap-16 mb-10">
												<div className="flex gap-6">
													{statsData.map((stat, index) => (
														<div
															key={index}
															className="flex flex-col items-center gap-1"
														>
															<span className="text-green-500 text-2xl md:text-3xl font-semibold font-['Poppins']">
																{stat.value}
															</span>
															<span className="text-green-500 text-sm md:text-normal font-medium font-['Poppins']">
																{stat.label}
															</span>
														</div>
													))}
												</div>
											</div>
										</div>
				
										{/* Right Content - Hero Images */}
										<div className="w-full md:w-1/2 relative flex justify-center items-center">
											<div className="relative w-[320px] sm:w-[420px] md:w-[550px] h-[380px] sm:h-[450px] md:h-[480px]">
												<img
													className="absolute top-[140px] sm:top-[160px] md:top-[185px] left-6 sm:left-12 md:left-16 w-[250px] sm:w-[350px] md:w-[490px] h-[200px] sm:h-[280px] md:h-[360px] rounded-2xl object-cover"
													src={Assets.Hero3}
													alt="Gambar Latar"
												/>
												<img
													className="absolute top-[30px] sm:top-[40px] md:top-[50px] left-2 sm:left-5 w-[480px] sm:w-[650px] md:w-[900px] h-[460px] sm:h-[650px] md:h-[860px] rounded-2xl object-cover"
													src={Assets.Hero1}
													alt="Gambar Tengah"
												/>
												<img
													className="absolute top-[120px] sm:top-[130px] md:top-[160px] right-10 md:right-24 w-[380px] sm:w-[520px] md:w-[700px] h-[350px] sm:h-[480px] md:h-[620px] rounded-2xl object-cover"
													src={Assets.Hero2}
													alt="Gambar Depan"
												/>
											</div>
										</div>
									</div>
								</section>
				
								{/* STATS + CLIENT LOGO SECTION */}
								<section className="px-6 md:px-20 py-12 md:py-16">
									<div className="flex flex-col md:flex-row justify-between items-center gap-8">
										<h2 className="text-zinc-500 text-xl font-semibold font-['Poppins'] leading-6 w-64 text-center md:text-left">
											Dipercaya Oleh Mitra Internasional
										</h2>
				
										<div className="flex gap-8 justify-center">
											<img
												className="w-28 md:w-32 h-auto"
												src={Assets.Client12}
												alt="Mitra A"
											/>
											<img
												className="w-24 md:w-28 h-auto"
												src={Assets.Client13}
												alt="Mitra B"
											/>
										</div>
									</div>
				
									<div className="mt-10 w-full relative flex justify-center">
										<div className="w-full h-12 bg-gradient-to-r from-lime-500 to-green-500 rounded-[20px]"></div>
				
										{/* Floating WhatsApp Button */}
										<a
											href="https://wa.me/62812345678"
											target="_blank"
											rel="noopener noreferrer"
											className="fixed bottom-8 right-10 w-16 h-16 p-3 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors z-10"
										>
											<FaWhatsapp size={32} className="text-white" />
										</a>
									</div>
								</section>
				
								{/* TENTANG KAMI SECTION */}
								<section className="px-6 md:px-20 py-16 md:py-20 flex flex-col lg:flex-row lg:items-center gap-10">
									<div className="w-full lg:w-1/2 flex flex-col justify-start items-start gap-8">
										<h1 className="text-zinc-800 text-2xl lg:text-3xl font-bold font-['Poppins'] leading-tight">
											Apa Itu PT Divus Global Mediacomm?
										</h1>
				
										<p className="text-zinc-800 text-base font-normal font-['Poppins'] leading-6 text-justify">
											PT Divus Global Mediacomm adalah perusahaan konsultan yang
											bergerak di bidang manajemen, komunikasi korporat, dan desain
											grafis. Kami menyediakan layanan mulai dari studi kelayakan,
											perencanaan strategis, riset pasar, hingga identitas korporasi dan
											media promosi. Dengan pengalaman beragam proyek, Divus berkomitmen
											menjadi mitra terpercaya dalam menghadirkan solusi profesional dan
											inovatif.
										</p>
				
										<Link
											href="/User/TentangKami"
											className="inline-flex justify-start items-center px-5 py-3 bg-green-500 rounded-lg shadow-lg hover:bg-green-600 transition-colors"
										>
											<span className="text-white text-base font-semibold font-['Poppins'] leading-6">
												Tentang Kami
											</span>
										</Link>
									</div>
				
									<div className="w-full lg:w-1/2 flex justify-center">
										<div className="relative w-full max-w-[520px] h-[350px] sm:h-[420px] lg:h-[450px] overflow-hidden rounded-2xl">
											<img
												className="absolute inset-0 rounded-2xl object-cover w-full h-full"
												src={Assets.Hero4}
												alt="Tentang Kami"
											/>
										</div>
									</div>
								</section>

				{/* SECTION: Layanan (DINAMIS) */}
				<section className="px-6 md:px-10 py-16 md:py-20 bg-gray-50 overflow-hidden">
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
				</section>

				{/* PORTOFOLIO SECTION (DINAMIS PRODUK & PROYEK) */}
				<section className="px-4 md:px-20 py-20 bg-white">
					<div className="w-full rounded-3xl overflow-hidden relative shadow-lg bg-gradient-to-b from-[#4ade80] to-[#84cc16]">
						<div className="flex flex-col lg:flex-row items-center p-8 md:p-14 gap-10">
							<div className="w-full lg:w-5/12 flex flex-col items-start gap-6 text-white z-10">
								<h2 className="text-3xl md:text-4xl font-bold">Portofolio Kami</h2>
								<p className="text-base md:text-lg font-medium leading-relaxed text-justify lg:text-left opacity-95">
									{activePorto === 'produk' 
                                        ? "Lihat produk-produk unggulan yang telah kami kembangkan untuk mendukung bisnis klien kami."
                                        : "Daftar proyek dan kolaborasi strategis yang telah kami selesaikan dengan berbagai mitra."
                                    }
								</p>
                                {/* TOMBOL SWITCHER */}
								<div className="flex flex-wrap gap-4 mt-2">
									<button 
                                        onClick={() => setActivePorto('produk')}
                                        className={`px-6 py-3 rounded-xl font-bold shadow-md transition-all ${
                                            activePorto === 'produk' 
                                            ? 'bg-white text-green-600' 
                                            : 'border-2 border-white text-white hover:bg-white/10'
                                        }`}
                                    >
                                        Lihat Produk
                                    </button>
									<button 
                                        onClick={() => setActivePorto('proyek')}
                                        className={`px-6 py-3 rounded-xl font-bold shadow-md transition-all ${
                                            activePorto === 'proyek' 
                                            ? 'bg-white text-green-600' 
                                            : 'border-2 border-white text-white hover:bg-white/10'
                                        }`}
                                    >
                                        Lihat Proyek
                                    </button>
								</div>
							</div>

                            {/* GRID GAMBAR (Berubah Sesuai State) */}
							<div className="w-full lg:w-7/12 flex justify-center lg:justify-end items-center">
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full">
									
                                    {/* JIKA PILIH PRODUK */}
                                    {activePorto === 'produk' && products.map((item, idx) => (
										<div key={idx} className="group relative h-64 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 bg-white">
											<div className="w-full h-full">
												<img 
                                                    src={getProductImage(item.foto_produk)} 
                                                    alt={item.nama_produk} 
                                                    className="w-full h-full object-cover" 
                                                />
											</div>
                                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-end p-3">
                                                <span className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                                    {item.nama_produk}
                                                </span>
                                            </div>
										</div>
									))}

                                    {/* JIKA PILIH PROYEK */}
                                    {activePorto === 'proyek' && projects.map((item, idx) => (
										<div key={idx} className="group relative h-64 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 bg-gray-100">
											{/* Placeholder Image karena API Project belum ada image */}
                                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
												<img 
                                                    src={`https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600&random=${idx}`} 
                                                    alt="Project" 
                                                    className="w-full h-full object-cover opacity-80" 
                                                />
											</div>
                                            {/* Overlay Selalu Muncul untuk Proyek (Agar terbaca) */}
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex flex-col justify-end p-4">
                                                <span className="text-white text-xs uppercase tracking-wider mb-1 text-lime-300">
                                                    {item.client?.nama_client || 'Client'}
                                                </span>
                                                <span className="text-white text-sm font-bold leading-tight">
                                                    {item.project_name}
                                                </span>
                                                <span className="text-gray-300 text-xs mt-1">{item.tahun}</span>
                                            </div>
										</div>
									))}

                                    {/* Handle Data Kosong */}
                                    {activePorto === 'produk' && products.length === 0 && (
                                        <div className="col-span-3 text-white text-center italic opacity-80">Belum ada data produk.</div>
                                    )}
                                     {activePorto === 'proyek' && projects.length === 0 && (
                                        <div className="col-span-3 text-white text-center italic opacity-80">Belum ada data proyek.</div>
                                    )}

								</div>
							</div>
						</div>
					</div>
				</section>

				{/* MENGAPA PILIH KAMI (Tetap Sama) */}
				<section className="px-6 md:px-20 py-20 bg-white">
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
				</section>

				{/* CLIENT MARQUEE & CTA (Tetap Sama) */}
				<section className="bg-white relative overflow-hidden border-t border-gray-100">
					<h2 className="text-center text-zinc-800 text-4xl font-semibold mb-8 mt-16">Klien Kami</h2>
					<div className="relative h-48 overflow-hidden mt-10">
						<motion.div className="absolute flex items-center gap-16 w-max" animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: 45, ease: 'linear' }}>
							{Array(2).fill(clientLogos).flat().map((ImgClnt, i) => (
								<motion.img key={i} src={ImgClnt} alt="Client Logo" className="h-20 w-20 md:h-28 md:w-28 opacity-80 hover:opacity-100 transform hover:scale-110 transition-all duration-500 ease-in-out" />
							))}
						</motion.div>
					</div>
				</section>

				<section className="px-4 md:px-20 py-20 bg-white">
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
				</section>
			</div>
		</main>
	);
}