import React, { useState, useEffect } from 'react';
import Head from 'next/head'; // WAJIB ADA AGAR ICON MUNCUL
import Link from 'next/link';
import { FaWhatsapp, FaDownload } from 'react-icons/fa';
import { Assets } from '../../assets';
import { motion } from 'framer-motion';

import { serviceCache } from '../../utils/serviceCache';


const fadeInUp = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
  viewport: { once: false, amount: 0.2 }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -50 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
  viewport: { once: false, amount: 0.2 }
};

const fadeInRight = {
  initial: { opacity: 0, x: 50 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
  viewport: { once: false, amount: 0.2 }
};

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

// --- DATA STATIS (Fallback untuk Services) ---
const fallbackSolutions = [
  {
    title: 'Management Consuslting',
    desc: 'Membantu perusahaan dalam menganalisis kelayakan bisnis...',
    icon_url: 'fa-solid fa-briefcase', // Contoh format class icon
  },
  {
    title: 'Research & Survey',
    desc: 'Menyediakan layanan riset pasar dan survei kepuasan pelanggan...',
    icon_url: 'fa-solid fa-magnifying-glass',
  },
  {
    title: 'Corporate Id',
    desc: 'Membangun identitas perusahaan melalui website dan logo...',
    icon_url: 'fa-solid fa-building',
  },
];

export default function TentangKami() {
  const [company, setCompany] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE BARU: Untuk Data Statistik (Dinamis) ---
  const [statsData, setStatsData] = useState([
      { value: "0", label: "Pengalaman" },
      { value: "0+", label: "Klien Divus" },
      { value: "0+", label: "Proyek Selesai" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch Company
        const companyRes = await fetch("/api/company");
        const companyData = await companyRes.json();
        if (companyRes.ok) setCompany(companyData);

        // 2. Fetch Photos
        const photosRes = await fetch("/api/photos");
        const photosData = await photosRes.json();
        if (photosRes.ok) setPhotos(photosData);

        // // 3. Fetch Services
        // const servicesRes = await fetch("/api/services");
        // const servicesData = await servicesRes.json();

        const dataService = await serviceCache.fetch();
              if (Array.isArray(dataService)) {
                  setServices(dataService);
              }


        // if (servicesRes.ok && Array.isArray(servicesData) && servicesData.length > 0) {
        //   setServices(servicesData);
        // } else {
        //   setServices(fallbackSolutions);
        // }

        // 4. Fetch Dashboard Stats (LOGIKA BARU - SEPERTI DI HOME)
        try {
            const resDash = await fetch('/api/dashboard');
            const dataDash = await resDash.json();
            
            if (resDash.ok && dataDash.stats) {
                setStatsData([
                    { value: `${dataDash.stats.years} Thn`, label: 'Pengalaman' }, // Menambah "Thn" agar sesuai konteks
                    { value: `${dataDash.stats.mitra}+`, label: 'Klien Divus' },
                    { value: `${dataDash.stats.proyek}+`, label: 'Proyek Selesai' },
                ]);
            }
        } catch (error) {
            console.warn("Gagal fetch stats dashboard:", error);
        }

      } catch (error) {
        console.error("Error loading data:", error);
        setServices(fallbackSolutions);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getWhatsappLink = (phone) => {
    if (!phone) return "https://wa.me/";
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="relative w-full bg-white overflow-hidden font-['Poppins']">

      {/* --- PENTING: HEAD UNTUK LOAD ICON FONT AWESOME --- */}
      <Head>
        <title>Tentang Kami - PT Divus Global Mediacomm</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </Head>

      <header className="relative w-full">
        {/* Hero Banner */}
        <section className="w-full bg-slate-50 py-14 md:py-2 px-10 md:px-6 border-b border-slate-200">
          <div className="max-w-4xl mx-auto flex flex-row items-center justify-center gap-6 md:gap-10 mt-12">
            <div className="flex-shrink-0">
              <img src={company?.logo_url || Assets.Hero3} alt="Logo Divus" className="w-50 md:w-100 h-50 md:h-100 object-contain" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-zinc-800 text-xl md:text-3xl font-bold leading-tight">{company?.company_name || "PT Divus Global Mediacomm"}</h1>
              <p className="text-zinc-500 text-base md:text-xl font-medium italic">- Tentang Kami</p>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="w-full bg-zinc-300 py-3 px-6 mb-4 ">
          <div className="max-w-7xl mx-auto">
            <p className="text-zinc-800 text-base">
              <Link href="/User/Home" className="hover:underline">Beranda</Link>
              <span className="text-red-600"> {' > '} Tentang Kami</span>
            </p>
          </div>
        </div>
      </header>

      {/* PROFIL PERUSAHAAN */}
      <motion.section {...fadeInUp} className="max-w-7xl mx-auto py-16">
        {isLoading && !company ? (
          <div className="text-center py-10">Memuat Profil...</div>
        ) : (
          <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-16">
            <motion.div {...fadeInLeft} className="w-full lg:w-1/2 relative px-6 md:px-0">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold leading-tight z-10 relative">Profile Perusahaan</h2>
              <p className='text-lg sm:text-xl md:text-2xl font-medium leading-tight mt-4'>{company?.company_name || "PT Divus Global Mediacomm"}</p>

              <div className="mt-6 space-y-4">
                <div>
                  <p className='text-sm text-left leading-relaxed pb-2'>
                    <span className="font-semibold">Nama Perusahaan :</span> {company?.company_name || "-"}
                  </p>
                  <div className="w-full border-b border-gray-200"></div>
                </div>

                <div>
                  <p className='text-sm text-justify leading-relaxed pb-2'>
                    <span className="font-semibold">Bidang Usaha :</span> {company?.business_field || "Jasa Konsultasi"}
                  </p>
                  <div className="w-full border-b border-gray-200"></div>
                </div>

                <div>
                  <p className='text-sm text-justify leading-relaxed pb-2'>
                    <span className="font-semibold">Berdiri Sejak :</span> {formatDate(company?.established_date)}
                  </p>
                  <div className="w-full border-b border-gray-200"></div>
                </div>

                <div>
                  <p className='text-sm text-justify leading-relaxed pb-2'>
                    <span className="font-semibold">Alamat :</span> {company?.address || "-"}
                  </p>
                  <div className="w-full border-b border-gray-200"></div>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeInRight} className="w-full lg:w-5/12 px-6">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold leading-tight z-10 relative">Tentang Perusahaan</h2>
              <p className='text-sm text-justify leading-loose mt-4 whitespace-pre-line text-gray-700'>
                {company?.description || "Deskripsi perusahaan belum tersedia."}
              </p>
            </motion.div>
          </div>
        )}
      </motion.section>

      {/* Floating WA */}
      <a href={getWhatsappLink(company?.phone)} target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-green-600 transition-colors">
        <FaWhatsapp size={32} className="text-white" />
      </a>

      {/* GALERI & STATS SECTION */}
      <motion.section {...fadeInUp} className="w-full py-6 px-6 bg-white">
        <div className="w-[700px] mx-auto flex items-center justify-center outline outline-lime-500 mb-10 hidden md:flex"></div>
        <h2 className='text-zinc-800 text-lg md:text-xl font-semibold text-center leading-tight z-10 relative mb-10'>
          We deliver strategic solutions for your business challenges.
        </h2>

        <div className="max-w-7xl mx-auto">

          {/* --- GALERI GAMBAR (FIXED: CENTER LAYOUT) --- */}
          {isLoading && photos.length === 0 ? (
            <div className="text-center py-10">Memuat Galeri...</div>
          ) : photos.length > 0 ? (
            // Menggunakan Flexbox agar items berada di tengah (bukan kolom kiri)
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
              {photos.map((item) => (
                <div key={item.id} className="w-full rounded-2xl overflow-hidden shadow-sm group relative">
                  <div className="relative pb-[75%] bg-gray-100"> {/* Aspect Ratio Box */}
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => (e.target.src = "https://placehold.co/600x400?text=No+Image")}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 italic mb-20 py-10 border-2 border-dashed rounded-xl">Belum ada foto galeri.</div>
          )}

          {/* STATISTIK */}
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-24">
            {statsData.map((stat, idx) => (
              <div key={idx} className="text-center">
                <span className="block text-black text-2xl md:text-3xl font-semibold mb-2">{stat.value}</span>
                <span className="block text-black/50 text-lg md:text-xl font-normal">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* KEAHLIAN KAMI SECTION (ICONS FIXED) */}
      <motion.section {...fadeInUp} className="w-full md:py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-center items-center gap-10 mb-16">
            <div className="w-full relative text-center">
              <div className="w-[700px] mx-auto flex items-center justify-center outline outline-lime-500 mb-10 hidden md:flex"></div>
              <h2 className="text-zinc-800 text-2xl md:text-3xl text-center font-semibold leading-tight z-10 relative mt-6">
                Keahlian Kami
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 justify-items-center">
            {services.map((item, index) => (
              <div key={index} className="w-full max-w-[420px] flex flex-col items-center">
                <div className="bg-white rounded-2xl p-6 md:p-8 w-full h-full min-h-[350px] flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300 shadow-sm hover:shadow-md border border-gray-100">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      {/* ICON BOX */}
                      <div className="w-20 h-20 flex-shrink-0 bg-lime-500/20 rounded-tr-3xl rounded-bl-3xl flex items-center justify-center p-4">
                        {/* Logika Icon sama dengan Home.jsx */}
                        {item.icon_url ? (
                          <i className={`${item.icon_url} text-4xl text-green-600`}></i>
                        ) : (
                          <i className="fa-solid fa-briefcase text-4xl text-green-600"></i>
                        )}
                      </div>
                      <h3 className="text-zinc-800 text-xl font-semibold leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-zinc-600 text-base font-medium capitalize leading-relaxed text-justify mb-8 line-clamp-4">
                      {getSummary(item.description || item.desc)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA SECTION */}
      <motion.section {...fadeInUp} className="px-6 md:px-20 py-16 md:py-6 overflow-hidden mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="w-full rounded-3xl overflow-hidden relative shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500 to-lime-500">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${Assets.Banner1})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            </div>
            <div className="relative px-6 py-16 md:py-20 text-center flex flex-col items-center justify-center gap-6">
              <h2 className="text-white text-3xl md:text-4xl font-bold capitalize leading-tight z-10 ">Ingin Mengenal jauh Tentang Kami?</h2>
              <p className="text-white text-lg md:text-xl font-normal capitalize leading-snug max-w-4xl z-10">Download Company Profile </p>
              <a href={company?.file_url || "#"} download="Company_Profile.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex justify-center items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 z-10 group">
                <FaDownload className="text-black w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-black text-base md:text-lg font-semibold capitalize">Download</span>
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}