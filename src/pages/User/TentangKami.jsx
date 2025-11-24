import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { Assets } from '../../assets';

const solutionsData = [
  {
    title: 'Management Consulting',
    desc: 'Membantu perusahaan dalam menganalisis kelayakan bisnis, menyusun strategi pemasaran, serta merancang perencanaan strategis untuk mendukung pertumbuhan berkelanjutan.',
    icon: Assets.Icon1,
  },
  {
    title: 'Research & Survey',
    desc: 'Menyediakan layanan riset pasar, survei kepuasan pelanggan, dan pemetaan sosial untuk memperoleh data akurat sebagai dasar pengambilan keputusan bisnis.',
    icon: Assets.Icon2,
  },
  {
    title: 'Corporate Id',
    desc: 'Membangun identitas perusahaan melalui pembuatan website, logo, profil perusahaan, dan media komunikasi korporasi lainnya yang profesional dan konsisten.',
    icon: Assets.Icon3,
  },
  {
    title: 'Product Service & Knowledge',
    desc: 'Menyajikan informasi produk dan layanan secara jelas dan menarik melalui berbagai media agar pelanggan memahami nilai, fungsi, serta keunggulan yang ditawarkan perusahaan.',
    icon: Assets.Icon4,
  },
  {
    title: 'Report & Journal',
    desc: 'Menyusun berbagai laporan dan publikasi profesional dengan data yang akurat dan struktur yang rapi untuk mendukung proses evaluasi serta pengambilan keputusan bisnis.',
    icon: Assets.Icon5,
  },
];

const galleryImages = [
  Assets.Port1,
  Assets.Port2,
  Assets.Port3,
  Assets.Port4,
  Assets.Port5,
  Assets.Port6,
];

const statsData = [
  { value: "10", label: "Pengalaman" },
  { value: "510+", label: "Klien Divus" },
  { value: "100+", label: "Proyek Selesai" },
];

export default function TentangKami() {
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
              <h1 className="text-zinc-800 text-xl md:text-3xl font-bold font-['Poppins'] leading-tight">
                PT Divus Global Mediacomm
              </h1>
              <p className="text-zinc-500 text-base md:text-xl font-medium italic font-['Poppins']">
                - Tentang Kami
              </p>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="w-full bg-zinc-300 py-3 px-6 md:px-20 mb-4">
          <p className="text-zinc-800 text-base">
            <Link href="/User/Home" className="hover:underline">
              Beranda
            </Link>
            <span className="text-red-600"> {' > '} Tentang Kami</span>
          </p>
        </div>
      </header>

      {/* PROFIL PERUSAHAAN SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-20 py-16">
        <div className="flex flex-col lg:flex-row justify-center items-start">
          <div className="w-full lg:w-1/2 relative">
            <h2 className="text-zinc-800 text-lg md:text-xl font-semibold leading-tight z-10 relative">
              Profile Perusahaan
            </h2>
            <p className='text-zinc-800 text-xl md:text-2xl font-sm leading-tight mt-4'>
              PT Divus Global Mediacomm
            </p>
            <p className='text-zinc-800 text-sm text-justify font-sm leading-loose mt-4'>
              Nama Perusahaan : PT Divus Global Mediacomm
            </p>
            <p className='text-zinc-800 text-sm text-justify font-sm leading-loose mt-4'>
              Bidang Usaha : Jasa Konsultasi
            </p>
            <p className='text-zinc-800 text-sm text-justify font-sm leading-loose mt-4'>
              Berdiri Sejak : 10 November 2010
            </p>
          </div>

          <div className="w-full lg:w-5/12">
            <h2 className="text-zinc-800 text-lg md:text-xl font-semibold leading-tight z-10 relative">
              Tentang Perusahaan
            </h2>
            <p className='text-zinc-800 text-sm text-justify font-sm leading-loose mt-4'>
              PT Divus Global Mediacomm adalah perusahaan konsultan yang bergerak di bidang manajemen, komunikasi korporat, dan desain grafis.
              Kami menyediakan layanan mulai dari studi kelayakan, perencanaan strategis, riset pasar, hingga identitas korporasi dan media promosi.
              Dengan pengalaman beragam proyek, Divus berkomitmen menjadi mitra terpercaya dalam menghadirkan solusi profesional dan inovatif.
            </p>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/6285220203453"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-green-600 transition-colors"
      >
        <FaWhatsapp size={32} className="text-white" />
      </a>

      {/* PORTFOLIO GALLERY TITLE SECTION */}
      <section className="w-full py-16 px-6 md:px-20 bg-white">
        <h2 className='text-zinc-800 text-lg md:text-xl font-semibold text-center leading-tight z-10 relative'>
          We are happy to help solve your business problems.
        </h2>
      </section>

      {/* PORTFOLIO GRID & STATS SECTION */}
      <section className="w-full py-20 px-6 md:px-20 bg-white">
        <div className="max-w-5xl mx-auto">

          {/* GALERI GAMBAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-20">
            {galleryImages.map((imgSrc, index) => (
              <div key={index} className="w-full h-72 rounded-2xl overflow-hidden shadow-sm group">
                <img
                  src={imgSrc}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>

          {/* STATISTIK */}
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-24">
            {statsData.map((stat, idx) => (
              <div key={idx} className="text-center">
                <span className="block text-black text-2xl md:text-3xl font-semibold font-['Poppins'] leading-tight mb-2">
                  {stat.value}
                </span>
                <span className="block text-black/50 text-lg md:text-xl font-normal font-['Poppins'] leading-relaxed">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* KEAHLIAN KAMI SECTION */}
      <section className="px-6 md:px-10 py-16 md:py-20 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-center items-start gap-10 mb-16">
            <div className="w-full lg:w-1/2 relative">
              <p className='text-lime-500 text-lg md:text-xl text-center font-normal leading-tight mt-4'>
                Experienced, able to maintain quality and professionalism
              </p>
              <h2 className="text-zinc-800 text-2xl md:text-3xl text-center font-semibold leading-tight z-10 relative mt-6">
                Keahlian Kami
              </h2>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="flex flex-wrap justify-center gap-13 lg:gap-15">
            {solutionsData.map((item, index) => (
              <div
                key={index}
                className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2.5rem)] max-w-[420px] flex flex-col items-start"
              >
                <div className="bg-white rounded-2xl p-6 md:p-8 w-95 h-80 flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300 shadow-sm hover:shadow-md">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      {/* Icon Box */}
                      <div className="w-20 h-20 flex-shrink-0 bg-lime-500/20 rounded-tr-3xl rounded-bl-3xl flex items-center justify-center p-4">
                        <img
                          src={item.icon}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="text-zinc-800 text-xl font-semibold font-['Poppins'] leading-snug">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-zinc-600 text-base font-medium font-['Poppins'] capitalize leading-relaxed text-justify mb-8">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full px-4 md:px-24 py-4 mb-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="relative w-full rounded-xl overflow-hidden shadow-xl bg-gradient-to-b from-green-500 to-lime-500 px-4 py-16 md:py-20 text-center flex flex-col items-center justify-center gap-6">
            {/* Background Pattern */}
            <div
              className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url(${Assets.Banner1})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            ></div>

            {/* Judul */}
            <h2 className="text-white text-3xl md:text-4xl font-bold capitalize leading-tight z-10">
              Ingin Mengenal jauh Tentang Kami?
            </h2>

            {/* Subjudul */}
            <p className="text-white text-lg md:text-xl font-normal capitalize leading-snug max-w-4xl z-10">
              Download Company Profile 
            </p>

            {/* Tombol CTA */}
            <a
              href="https://wa.me/62812345678"
              className="mt-4 inline-flex justify-center items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 z-10 group"
            >
              <FaWhatsapp className="text-green-600 w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-black text-base md:text-lg font-semibold font-['Poppins'] capitalize">
               Download
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}