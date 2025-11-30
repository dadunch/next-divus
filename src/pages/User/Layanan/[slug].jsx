import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Assets } from '../../../assets'; // Sesuaikan path assets
import { FaWhatsapp } from 'react-icons/fa';

// Helper: Parse Deskripsi Kompleks dari Admin
const parseServiceData = (fullDesc) => {
    let summary = "";
    let mainDesc = fullDesc;
    let points = [];

    const markerSummary = "**Ringkasan:**";
    const markerList = "**Layanan yang ditawarkan:**";

    // 1. Ambil List Poin
    if (mainDesc.includes(markerList)) {
        const parts = mainDesc.split(markerList);
        const listContent = parts[1];
        mainDesc = parts[0].trim();
        
        if (listContent) {
            points = listContent.split('\n')
                .map(s => s.replace(/^- /, '').replace(/^• /, '').trim())
                .filter(s => s !== "");
        }
    }

    // 2. Ambil Ringkasan
    if (mainDesc.includes(markerSummary)) {
        const parts = mainDesc.split(markerSummary);
        let restContent = parts[1];
        const splitIndex = restContent.indexOf('\n\n');
        
        if (splitIndex !== -1) {
            summary = restContent.substring(0, splitIndex).trim();
            mainDesc = restContent.substring(splitIndex).trim();
        } else {
            summary = restContent.trim();
            mainDesc = "";
        }
    }

    return { summary, mainDesc, points };
};

// Komponen Highlights (Poin Layanan)
const ServiceHighlights = ({ items }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="w-full mt-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2 justify-center">
                    {items.map((text, idx) => (
                        <div key={idx} className="w-full min-h-[80px] bg-white rounded-2xl shadow-md outline outline-black p-4 flex justify-center items-center transition-transform hover:-translate-y-1">
                            <div className="text-black text-base font-normal text-center capitalize leading-tight">
                                {text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function DetailLayanan() {
    const router = useRouter();
    const { slug } = router.query;
    
    const [service, setService] = useState(null);
    const [parsedData, setParsedData] = useState({ summary: "", mainDesc: "", points: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        async function fetchData() {
            try {
                // Fetch semua data (idealmya fetch by slug endpoint khusus, tapi fetch all lalu filter juga oke untuk skala kecil)
                const res = await fetch('/api/services'); 
                const data = await res.json();
                
                const found = data.find(s => s.slug === slug);
                if (found) {
                    setService(found);
                    setParsedData(parseServiceData(found.description));
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!service) return <div className="min-h-screen flex items-center justify-center">Layanan tidak ditemukan.</div>;

    return (
        <div className="relative w-full bg-white overflow-hidden font-['Poppins']">
            <Head>
                <title>{service.title} - PT Divus</title>
            </Head>

            <header className="relative w-full">
                {/* Hero Banner Dinamis */}
                <section className="w-full bg-slate-50 py-14 md:py-30 px-6 border-b border-slate-200">
                    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-4 mt-20 text-center">
                        {/* Icon Besar */}
                        {service.icon_url && <i className={`${service.icon_url} text-6xl text-green-600 mb-2`}></i>}
                        
                        <h1 className="text-zinc-800 text-2xl md:text-4xl font-bold leading-tight">
                            {service.title}
                        </h1>
                        <p className="text-zinc-500 text-sm md:text-lg font-medium italic max-w-2xl">
                            {parsedData.summary || "Solusi profesional untuk bisnis Anda."}
                        </p>
                    </div>
                </section>

                {/* Breadcrumb */}
                <div className="w-full bg-zinc-300 py-3 mb-4">
                    <div className="max-w-7xl mx-auto px-6">
                        <p className="text-zinc-800 text-base">
                            <Link href="/User/Home" className="hover:underline hover:text-green-600">Beranda</Link>
                            <span className="mx-2 text-zinc-500">{'>'}</span>
                            <Link href="/User/Layanan" className="hover:underline hover:text-green-600">Layanan</Link>
                            <span className="mx-2 text-zinc-500">{'>'}</span>
                            <span className="text-red-600 font-medium">{service.title}</span>
                        </p>
                    </div>
                </div>
            </header>

            {/* TENTANG LAYANAN SECTION */}
            <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-12 flex flex-col lg:flex-row lg:items-center gap-10">
                <div className="w-full lg:w-1/2 flex justify-center">
                    <div className="w-full h-80 md:h-96 overflow-hidden rounded-2xl shadow-lg relative bg-gray-100">
                         {service.image_url ? (
                            <img className="w-full h-full object-cover" src={service.image_url} alt={service.title} />
                         ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                         )}
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col justify-center items-start gap-6">
                    <h2 className="text-zinc-800 text-2xl lg:text-3xl font-bold leading-tight">
                        Tentang Layanan Ini
                    </h2>

                    <div className="text-zinc-800 text-base font-normal leading-7 text-justify whitespace-pre-line">
                        {parsedData.mainDesc || service.description}
                    </div>

                    <Link href="/User/Contact" className="inline-flex justify-start items-center px-6 py-3 bg-green-500 rounded-lg shadow-lg hover:bg-green-600 transition-colors">
                        <span className="text-white text-base font-semibold">Konsultasi Sekarang</span>
                    </Link>
                </div>
            </section>

            {/* HIGHLIGHTS SECTION (Mengambil dari Poin-poin Layanan) */}
            {parsedData.points.length > 0 && (
                <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-12 bg-slate-50">
                    <h2 className="text-lime-500 text-lg md:text-2xl text-center font-medium capitalize mb-4">
                        Penawaran Kami
                    </h2>
                    <p className="text-zinc-700 text-2xl md:text-3xl font-semibold text-center leading-relaxed mb-4">
                        Apa Saja Lingkup {service.title}?
                    </p>
                    <ServiceHighlights items={parsedData.points} />
                </section>
            )}

            {/* CTA SECTION (Tetap Sama) */}
            <section className="px-4 md:px-20 py-20 bg-white">
                <div className="w-full rounded-3xl overflow-hidden relative shadow-xl bg-gradient-to-b from-green-500 to-lime-500 p-10 text-center">
                    <h2 className="text-white text-3xl md:text-4xl font-bold capitalize leading-tight mb-4 relative z-10">
                        Tertarik dengan Layanan ini?
                    </h2>
                    <p className="text-white text-lg md:text-xl font-normal relative z-10 mb-8">
                        Hubungi tim ahli kami untuk mendiskusikan kebutuhan Anda lebih lanjut.
                    </p>
                    <a href={`https://wa.me/62812345678?text=Halo saya tertarik dengan layanan ${service.title}`} target="_blank" className="relative z-10 inline-flex items-center gap-3 px-8 py-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition text-green-600 font-bold">
                        <FaWhatsapp size={24} />
                        Hubungi via WhatsApp
                    </a>
                </div>
            </section>

            {/* Floating WA Button */}
            <a href="https://wa.me/6285220203453" target="_blank" className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-green-600 transition-colors text-white">
                <FaWhatsapp size={32} />
            </a>
        </div>
    );
}