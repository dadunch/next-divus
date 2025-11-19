import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { Assets } from '../../assets';

export default function TentangKami() {
    return (
        <div className="relative w-full bg-white overflow-hidden">
            <header className="relative w-full">
                {/* Banner image */}
                <div className="relative w-full h-[470px] mt-[90px]">
                    <img
                        src={Assets.Banner2}
                        alt="Latar Belakang About"
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-zinc-800/50 z-10"></div>

                    {/* Header*/}
                    <div className="relative z-20 max-w-[1440px] mx-auto px-6 md:px-20 pt-32 pb-16 text-white h-full flex flex-col justify-end">
                        <p className="text-xl md:text-3xl font-bold text-lime-500 mb-2">
                            PT Divus Global Mediacomm
                        </p>
                        <h1 className="text-5xl md:text-7xl font-bold capitalize">
                            Tentang Kami
                        </h1>
                    </div>
                </div>

                <div className="w-full bg-zinc-300 py-3 px-6 md:px-20">
                    <p className="text-zinc-800 text-base">
                        <Link href="/User/Home" className="hover:underline ml-1">
                            Beranda
                        </Link>
                        <span className="text-red-600"> {' > '} Tentang Kami</span>
                    </p>
                </div>
            </header>
            {/* Profil Perusahaan */}
            <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-16">
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    <div className="w-full lg:w-2/5 flex justify-center">
                        <img
                            src={Assets.Logo}
                            alt="Gambar Profil Perusahaan"
                            className="w-[320px] object-contain"
                        />
                    </div>
                    <div className="w-full lg:w-3/5">
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-800 mb-6 capitalize">
                            Profil Perusahaan
                        </h2>
                        <p className="text-zinc-800 text-base font-normal leading-loose text-justify">
                            PT Divus Global Mediacomm adalah perusahaan konsultan yang bergerak di bidang manajemen, komunikasi korporat, dan desain grafis. Kami menyediakan layanan mulai dari studi kelayakan, perencanaan strategis, riset pasar, hingga identitas korporasi dan media promosi. Dengan pengalaman beragam proyek, Divus berkomitmen menjadi mitra terpercaya dalam menghadirkan solusi profesional dan inovatif.
                        </p>
                    </div>
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
    )
}