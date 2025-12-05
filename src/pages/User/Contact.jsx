import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Assets } from '../../assets';
import { motion } from 'framer-motion';

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

export default function Contact() {
    // State Data Perusahaan
    const [company, setCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Data dari API
    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await fetch('/api/company');
                const data = await res.json();
                if (res.ok) {
                    setCompany(data);
                }
            } catch (error) {
                console.error("Gagal mengambil data perusahaan:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompany();
    }, []);

    // Helper untuk link WA dinamis
    const getWhatsappLink = (phone) => {
        if (!phone) return "https://wa.me/";
        // Bersihkan karakter selain angka
        let cleanPhone = phone.replace(/\D/g, '');
        // Ubah 08xx jadi 628xx
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '62' + cleanPhone.slice(1);
        }
        return `https://wa.me/${cleanPhone}`;
    };

    return (
        <div className="relative w-full bg-white overflow-hidden font-['Poppins']">
            <Head>
                <title>Kontak - PT Divus Global Mediacomm</title>
            </Head>

            <header className="relative w-full">
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
                            <h1 className="text-zinc-800 text-xl md:text-3xl font-bold leading-tight">
                                PT Divus Global Mediacomm
                            </h1>
                            <p className="text-zinc-500 text-base md:text-xl font-medium italic">
                                - Kontak
                            </p>
                        </div>
                    </div>
                </section>
                {/* Breadcrumb */}
                <div className="w-full bg-zinc-300 py-3 mb-4">
                    <div className="max-w-7xl mx-auto">
                        <p className="text-zinc-800 text-base">
                            <Link href="/User/Home" className="hover:underline">
                                Beranda
                            </Link>
                            <span className="text-red-600"> {' > '} Kontak</span>
                        </p>
                    </div>
                </div>
            </header>
            <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-16 flex flex-col lg:flex-row gap-12 items-start">
                
                {/* Detail Kontak */}
                <motion.div {...fadeInLeft} className="flex-1 w-full lg:w-2/5">
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-800 mb-8 capitalize">
                        Informasi Detail Kontak
                    </h2>

                    {isLoading ? (
                        <p className="text-gray-500">Memuat informasi...</p>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Alamat */}
                            <div className="flex items-start gap-4 bg-white rounded-lg shadow-lg p-5">
                                <div className="w-12 h-12 bg-gradient-to-b from-lime-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin className="text-white w-6 h-6 " />
                                </div>
                                <div>
                                    <h3 className="text-zinc-800 text-xl font-semibold capitalize">
                                        Alamat
                                    </h3>
                                    <p className="text-black text-base mt-1 leading-relaxed">
                                        {company?.address || "Alamat belum tersedia."}
                                    </p>
                                </div>
                            </div>

                            {/* Telepon */}
                            <div className="flex items-center gap-4 bg-white rounded-lg shadow-lg p-5">
                                <div className="w-12 h-12 bg-gradient-to-b from-lime-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Phone className="text-white w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-zinc-800 text-xl font-semibold capitalize">
                                        Telepon
                                    </h3>
                                    <a
                                        href={company?.phone ? `tel:${company.phone}` : "#"}
                                        className="text-zinc-800 text-lg hover:text-green-600 transition-colors"
                                    >
                                        {company?.phone || "Nomor belum tersedia"}
                                    </a>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-4 bg-white rounded-lg shadow-lg p-5">
                                <div className="w-12 h-12 bg-gradient-to-b from-lime-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Mail className="text-white w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-zinc-800 text-xl font-semibold capitalize">
                                        Email
                                    </h3>
                                    <a
                                        href={company?.email ? `mailto:${company.email}` : "#"}
                                        className="text-zinc-800 text-lg hover:text-green-600 transition-colors"
                                    >
                                        {company?.email || "Email belum tersedia"}
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Map (Tetap Hardcode karena biasanya link map embed jarang berubah/disimpan di DB profil sederhana) */}
                {/* Jika ingin dinamis juga, harus tambah kolom 'map_url' di tabel company_profile */}
                <motion.div {...fadeInRight} className="flex-1 w-full lg:w-3/5 flex justify-center lg:justify-end mt-10 lg:mt-0 rounded-xl overflow-hidden border-r-4 border-b-4 shadow-md border-zinc-300 h-[470px]">
                    {/* <iframe src= width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> */}
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d253661.99642643647!2d107.44769353643915!3d-6.5885159826770785!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e691b42640098b5%3A0xbede1a67bdddbc3e!2sDivus%20Global%20Mediacom!5e0!3m2!1sid!2sid!4v1764955726940!5m2!1sid!2sid"
                        // src="https://maps.app.goo.gl/ytZzs7mnQtp2T8m3A"
                        // Ganti src di atas dengan link embed map asli kantor Anda jika ada
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="Office Location"
                    />
                </motion.div>
            </section>
            
            {/* Wa Floating Button */}
            <a
                href={getWhatsappLink(company?.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-green-600 transition-colors"
            >
                <FaWhatsapp size={32} className="text-white" />
            </a>
        </div>
    );
}