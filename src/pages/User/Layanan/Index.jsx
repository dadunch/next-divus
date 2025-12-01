import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Assets } from '../../../assets'; // Sesuaikan path assets Anda
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
  viewport: { once: false, amount: 0.2 }
};

export default function DaftarLayanan() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data dari API
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/services'); // Pastikan API ini mereturn array layanan
        const data = await res.json();
        if (res.ok) {
          setServices(data);
        }
      } catch (error) {
        console.error("Gagal ambil data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-['Poppins'] pb-20">
      <Head>
        <title>Layanan Kami - PT Divus</title>
      </Head>

      {/* Hero Section Sederhana */}
      <div className="bg-[#1E1E2D] text-white py-20 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Layanan Kami</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Solusi profesional untuk kebutuhan bisnis Anda.
        </p>
      </div>

      {/* Grid Layanan */}
      <motion.div {...fadeInUp} className="max-w-7xl mx-auto px-6 -mt-10">
        {loading ? (
          <p className="text-center mt-10">Memuat layanan...</p>
        ) : services.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">Belum ada layanan tersedia.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((item) => (
              <Link href={`/User/Layanan/${item.slug}`} key={item.id} className="group">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  {/* Gambar */}
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><i className="fa-solid fa-image text-4xl"></i></div>
                    )}
                    {/* Icon Floating */}
                    {item.icon_url && (
                      <div className="absolute bottom-[-16px] right-6 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg text-white text-xl border-4 border-white">
                        <i className={item.icon_url}></i>
                      </div>
                    )}
                  </div>

                  {/* Konten */}
                  <div className="p-6 pt-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">{item.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
                      {/* Hapus markdown simpel untuk preview */}
                      {item.description.replace(/\*\*.*?\*\*/g, '').replace(/[-•]/g, '').substring(0, 100)}...
                    </p>
                    <span className="text-green-600 font-semibold text-sm flex items-center gap-2">
                      Lihat Detail <i className="fa-solid fa-arrow-right"></i>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}