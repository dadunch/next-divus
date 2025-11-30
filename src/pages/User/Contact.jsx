import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Assets } from '../../assets';

export default function Contact() {
    return (
        <div className="relative w-full bg-white overflow-hidden">
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
                <div className="flex-1 w-full lg:w-2/5">
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-800 mb-8 capitalize">
                        Informasi Detail Kontak
                    </h2>

                    <div className="flex flex-col gap-6">
                        {/* Alamat */}
                        <div className="flex items-start gap-4 bg-white rounded-lg shadow-lg border-zinc-300 border-b-4 border-r-2 border-l-2 p-5">
                            <div className="w-12 h-12 bg-gradient-to-b from-lime-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <MapPin className="text-white w-6 h-6 " />
                            </div>
                            <div>
                                <h3 className="text-zinc-800 text-xl font-semibold capitalize">
                                    Alamat
                                </h3>
                                <p className="text-black text-base mt-1 leading-relaxed">
                                    Jl. Terusan Kapten Halim, Kampung Sukamulya, Kel. Salammulya,
                                    Kec. Pondoksalam, Kab. Purwakarta, Prov. Jawa Barat 41115
                                </p>
                            </div>
                        </div>

                        {/* Telepon */}
                        <div className="flex items-center gap-4 bg-white rounded-lg shadow-sm border-zinc-300 border-b-4 border-r-2 border-l-2 p-5">
                            <div className="w-12 h-12 bg-gradient-to-b from-lime-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Phone className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-zinc-800 text-xl font-semibold capitalize">
                                    Telepon
                                </h3>
                                <a
                                    href="tel:+6285220203453"
                                    className="text-zinc-800 text-lg hover:text-green-600 transition-colors"
                                >
                                    +62-8522-0203-453
                                </a>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-4 bg-white rounded-lg shadow-sm border-zinc-300 border-b-4 border-r-2 border-l-2 p-5">
                            <div className="w-12 h-12 bg-gradient-to-b from-lime-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Mail className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-zinc-800 text-xl font-semibold capitalize">
                                    Email
                                </h3>
                                <a
                                    href="mailto:divusgm@gmail.com"
                                    className="text-zinc-800 text-lg hover:text-green-600 transition-colors"
                                >
                                    divusgm@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Map */}
                <div className="flex-1 w-full lg:w-3/5 flex justify-center lg:justify-end mt-10 lg:mt-0 rounded-xl overflow-hidden border-r-4 border-b-4 shadow-md border-zinc-300 h-[470px]">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3997.006528885579!2d107.68974571062172!3d-6.902019367516907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e7799d64ea97%3A0x6354e71b8440d24e!2sDivus%20Global%20Mediacomm!5e1!3m2!1sid!2sid!4v1761939450230!5m2!1sid!2sid"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="Office Location"
                    />
                </div>
            </section>
            {/* Wa */}
            <a
                href="https://wa.me/6285220203453"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-green-600 transition-colors"
            >
                <FaWhatsapp size={32} className="text-white" />
            </a>
        </div>
    );
}