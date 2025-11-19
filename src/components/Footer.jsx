import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Assets } from '../assets';

export default function Footer() {
    // Layanan
    const services = [
        'Management Consulting', 
        'Research & Survey', 
        'Corporate ID', 
        'Product & Service knowledge', 
        'Report & Jurnal'
    ];
    
    // Kontak
    const contacts = [
        { icon: Phone, text: "+62-8522-0203-453" },
        { icon: Mail, text: "divusgm@gmail.com" },
        { icon: MapPin, text: "Jl. Terusan Kapten Halim, Kampung Sukamulya, Kel. Salammulya, Kec. Pondoksalam, Kab. Purwakarta, Prov. Jawa Barat 41115" },
    ];

    return (
        <footer className="w-full bg-zinc-800 ">
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
                        <p className="text-white/90 text-base font-light font-['Poppins'] leading-6 text-justify">
                            PT Divus Global Mediacomm menghadirkan layanan konsultasi manajemen, riset, laporan, dan komunikasi korporat untuk mendukung pertumbuhan serta nilai strategis bisnis di berbagai sektor.
                        </p>
                    </div>

                    {/* Kolom 2: Layanan */}
                    <div>
                        <h4 className="text-white/90 text-xl font-semibold font-['Poppins'] capitalize leading-7 pt-4 mb-4">Layanan</h4>
                        <div className="flex flex-col space-y-2">
                            {services.map(service => (
                                <Link 
                                    key={service} 
                                    href={`/${service.toLowerCase().replace(/\s/g, '-')}`} 
                                    className="text-white/90 text-base font-light font-['Poppins'] leading-6 hover:text-lime-500 transition-colors"
                                >
                                    {service}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Kolom 3: Kontak */}
                    <div>
                        <h4 className="text-white/90 text-xl font-semibold font-['Poppins'] capitalize leading-7 pt-4 mb-4">Kontak</h4>
                        <div className="flex flex-col space-y-4">
                            {contacts.map((contact, index) => (
                                <ContactItem key={index} icon={contact.icon} text={contact.text} />
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Bagian Bawah Footer (Copyright) */}
                <div className="pt-8 text-center">
                    <p className="text-zinc-300 text-base md:text-xl light font-['Poppins'] capitalize leading-7">
                        Copyright © 2022 PT Divus Global Mediacomm. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

// Sub-komponen untuk item kontak
const ContactItem = ({ icon: Icon, text }) => (
    <div className="flex justify-start items-start gap-3.5">
        <Icon size={24} className="text-white mt-0.5 min-w-[24px]" />
        <div className="text-justify text-white text-base font-light font-['Poppins'] leading-6 flex-1">
            {text}
        </div>
    </div>
);