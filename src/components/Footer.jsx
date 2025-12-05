import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Assets } from '../assets';
import { serviceCache } from '../utils/serviceCache';


export default function Footer() {
    // --- STATE UNTUK DATA DATABASE ---
    const [servicesList, setServicesList] = useState([]);
    const [companyData, setCompanyData] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Ambil Data Layanan (Ambil 5 teratas)
                // const resServices = await fetch('/api/services');
                // const dataServices = await resServices.json();
                // if (Array.isArray(dataServices)) {
                //     setServicesList(dataServices.slice(0, 5)); 
                // }

                const dataService = await serviceCache.fetch();
                if (Array.isArray(dataService)) {
                    setServicesList(dataService.slice(0, 5));
                }

                // 2. Ambil Data Profil Perusahaan (Kontak & Deskripsi)
                const resCompany = await fetch('/api/company');
                const dataCompany = await resCompany.json();
                if (dataCompany) {
                    setCompanyData(dataCompany);
                }
            } catch (error) {
                console.error("Gagal memuat data footer:", error);
            }
        };

        fetchData();
    }, []);

    // Setup Data Kontak Dinamis (Fallback ke hardcode jika DB belum siap)
    const contacts = [
        { 
            icon: Phone, 
            text: companyData?.phone || "+62-8522-0203-453" 
        },
        { 
            icon: Mail, 
            text: companyData?.email || "divusgm@gmail.com" 
        },
        { 
            icon: MapPin, 
            text: companyData?.address || "Jl. Terusan Kapten Halim, Kampung Sukamulya, Kel. Salammulya, Kec. Pondoksalam, Kab. Purwakarta, Prov. Jawa Barat 41115" 
        },
    ];

    return (
        <footer className="w-full bg-zinc-800">
            <div className="max-w-[1440px] mx-auto px-6 md:px-20 py-12">
                {/* Bagian Atas Footer (Konten, Layanan, Kontak) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-20 pb-12 border-b border-white/20">
                    
                    {/* Kolom 1: Logo & Deskripsi */}
                    <div className="flex flex-col gap-4">
                        <img
                            className="w-40 h-auto filter brightness-0 invert"
                            src={Assets.Logo}
                            alt="PT Divus Logo"
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/154x80/000/fff?text=LOGO" }}
                        />
                        <p className="text-white/70 text-base font-light leading-6 text-justify">
                            {/* Deskripsi Dinamis (Potong jika terlalu panjang) */}
                            {companyData?.description 
                                ? (companyData.description.length > 200 ? companyData.description.substring(0, 200) + "..." : companyData.description)
                                : "PT Divus Global Mediacomm menghadirkan layanan konsultasi manajemen, riset, laporan, dan komunikasi korporat untuk mendukung pertumbuhan serta nilai strategis bisnis di berbagai sektor."
                            }
                        </p>
                    </div>

                    {/* Kolom 2: Layanan */}
                    <div>
                        <h4 className="text-white/90 text-xl font-semibold ml-12 capitalize leading-7 pt-12 mb-4">Layanan</h4>
                        <div className="flex flex-col space-y-2 ml-12">
                            {servicesList.length > 0 ? (
                                servicesList.map(service => (
                                    <Link 
                                        key={service.id} 
                                        // Arahkan ke halaman list layanan
                                        href="/User/LayananProduk" 
                                        className="text-white/70 text-base font-light leading-6 hover:text-lime-500 transition-colors"
                                    >
                                        {service.title}
                                    </Link>
                                ))
                            ) : (
                                // Fallback jika belum ada data
                                <span className="text-white/50 text-sm italic">Memuat layanan...</span>
                            )}
                        </div>
                    </div>

                    {/* Kolom 3: Kontak */}
                    <div>
                        <h4 className="text-white/90 text-xl font-semibold capitalize leading-7 pt-12 mb-4">Kontak</h4>
                        <div className="flex flex-col space-y-4">
                            {contacts.map((contact, index) => (
                                <ContactItem key={index} icon={contact.icon} text={contact.text} />
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Bagian Bawah Footer (Copyright) */}
                <div className="pt-8 text-center">
                    <p className="text-zinc-200 text-base md:text-xl light capitalize leading-7">
                        Copyright © {new Date().getFullYear()} {companyData?.company_name || "PT Divus Global Mediacomm"}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

// Sub-komponen untuk item kontak
const ContactItem = ({ icon: Icon, text }) => (
    <div className="flex justify-start items-start gap-3.5">
        <Icon size={24} className="text-white/70 mt-0.5 min-w-[24px] shrink-0" />
        <div className="text-justify text-white/70 text-lg font-light leading-6 flex-1 break-words">
            {text}
        </div>
    </div>
);