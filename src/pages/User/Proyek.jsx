import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaChevronDown, FaChevronLeft, FaWhatsapp } from 'react-icons/fa';
import { Assets } from '../../assets';

// Filter categories
const filterCategories = ['Semua Bidang', 'Bantuan Teknik', 'Perencanaan', 'Kajian'];

// Data proyek
const proyekData = [
  {
    customer: 'Bagian Ekonomi Kota Bandung',
    proyek:
      'Kajian Penyehatan Perseroan Bli Sub Keg Kord, Sinkr, Monev, Kebijakan Pengelolaan BUMDdan BLUD',
    bidang: 'Bantuan Teknis',
    tahun: '2024',
  },
  {
    customer: 'Dinas Perhubungan',
    proyek: 'Perencaan Arsitektur dan desain interior pemeliharaan Gedung kantor Diasn Perhubungan',
    bidang: 'Perencanaan',
    tahun: '2024',
  },
  {
    customer: 'Dinas Perhubungan',
    proyek: 'Perencanaan Arsitektur dan desain interior pemeliharaan Gedung kantor Dinas Perhubungan',
    bidang: 'Perencanaan',
    tahun: '2024',
  },
  {
    customer: 'Pemeliharaan Sarana dan Prasaran Gedung Kantor',
    proyek: 'Dinas Penanaman modal dan Pelayanan Terpadu',
    bidang: 'Perencanaan',
    tahun: '2024',
  },
  {
    customer: 'Dinas Perkim',
    proyek: 'Belana jasa Konsultansi IKM Dinas Perumahan dan Permukiman',
    bidang: 'Bantuan Teknik',
    tahun: '2024',
  },
  {
    customer: 'Dinas PUPR',
    proyek: 'Jasa Konsultansi Perencanaan Penataan Ruang Interior Bidang PBPPBK',
    bidang: 'Perencanaan',
    tahun: '2024',
  },
  {
    customer: 'PT. Kurnia Parahyangan Sejahter',
    proyek: 'Jasa Pengurusan Ijin (SLF)',
    bidang: 'Bantuan Teknik',
    tahun: '2024',
  },
  {
    customer: 'Sekretariat Daerah Bagian Ekonomi',
    proyek:
      'Kajian analisis Investasi penyelenggaraan Pemerintahan kepada Perumda Pasar Juara Kota Bandung',
    bidang: 'Kajian/ Bantuan Teknik',
    tahun: '2024',
  },
  {
    customer: 'PT. Angkasa Pura II',
    proyek: 'Pedoman Pembuatan Feasibility Study di Lingkungan Direktorat Teknik PT. Angkasa Pura II',
    bidang: 'Kajian/ Bantuan Teknik',
    tahun: '2024',
  },
];

export default function Proyek() {
  const [activeFilter, setActiveFilter] = useState('Semua Bidang');
  const [currentPage, setCurrentPage] = useState(1);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [selectedYear, setSelectedYear] = useState('Semua');
  const years = Array.from(new Set(proyekData.map((p) => p.tahun))).sort((a, b) => b - a);
  years.unshift('Semua');

  const totalPages = 3;

  // Apply filtering by bidang and tahun
  const filteredProyek = proyekData.filter((item) => {
    const matchFilter = activeFilter === 'Semua Bidang' || item.bidang.includes(activeFilter);
    const matchYear = selectedYear === 'Semua' || item.tahun === selectedYear;
    return matchFilter && matchYear;
  });

  return (
    <div className="relative w-full bg-white overflow-hidden">
      <header className="relative w-full">
        {/* Banner image */}
        <div className="relative w-full h-[470px] mt-[90px]">
          <img
            src={Assets.Banner4}
            alt="Latar Belakang Proyek"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-zinc-800/50 z-10"></div>

          {/* Header */}
          <div className="relative z-20 max-w-[1440px] mx-auto px-6 md:px-20 pt-32 pb-16 text-white h-full flex flex-col justify-end">
            <p className="text-xl md:text-3xl font-bold text-lime-500 mb-2">
              PT Divus Global Mediacomm
            </p>
            <h1 className="text-5xl md:text-7xl font-bold capitalize">Proyek</h1>
          </div>
        </div>

        <div className="w-full bg-zinc-300 py-3 px-6 md:px-20">
          <p className="text-zinc-800 text-base">
            <Link href="/User/Home" className="hover:underline ml-1">
              Beranda
            </Link>
            <span className="text-red-600"> {' > '} Proyek</span>
          </p>
        </div>
      </header>

      {/* Section utama */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-16">
        <h2 className="text-zinc-800 text-3xl md:text-4xl font-bold font-['Poppins'] capitalize mb-6">
          Proyek dan Klien kami
        </h2>
        <p className="text-zinc-700 text-base font-normal font-['Poppins'] leading-relaxed mb-12">
          PT Divus Global Mediacomm telah berpengalaman mengerjakan berbagai proyek, mulai dari
          konsultansi manajemen, studi kelayakan, perencanaan, hingga pengembangan aplikasi dan
          sistem informasi. Setiap proyek menjadi bukti komitmen kami dalam memberikan solusi yang
          tepat sesuai kebutuhan klien.
        </p>

        <div className="flex flex-wrap gap-6 mb-8">
          {filterCategories.map((category, index) => (
            <button
              key={index}
              onClick={() => setActiveFilter(category)}
              className={`px-7 py-2.5 rounded-[10px] text-xl font-medium font-['Poppins'] transition-all ${
                activeFilter === category
                  ? 'bg-zinc-800 text-white'
                  : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Dropdown */}
        <div className="flex justify-end mb-8 relative">
          <button
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            aria-haspopup="listbox"
            aria-expanded={showYearDropdown}
            className="w-36 h-10 px-4 bg-zinc-800 rounded-[10px] flex items-center justify-between gap-2 text-sm relative"
          >
            <span className="text-white text-sm font-medium font-['Poppins'] leading-6">
              {selectedYear === 'Semua' ? 'Tahun' : selectedYear}
            </span>
            <FaChevronDown className="text-white w-4 h-4" />
          </button>

          {showYearDropdown && (
            <div className="absolute mt-10 right-0 w-36 bg-white rounded-md shadow-lg z-10 border border-zinc-200">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setSelectedYear(y);
                    setShowYearDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-zinc-800 text-sm font-medium font-['Poppins'] hover:bg-zinc-100"
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="w-full bg-white rounded-lg border border-zinc-700 overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-100">
                <th className="px-4 py-3 text-left text-zinc-800 text-sm font-semibold font-['Poppins'] border-b border-zinc-700">
                  Customer:
                </th>
                <th className="px-4 py-3 text-left text-zinc-800 text-sm font-semibold font-['Poppins'] border-b border-zinc-700">
                  Proyek:
                </th>
                <th className="px-4 py-3 text-left text-zinc-800 text-sm font-semibold font-['Poppins'] border-b border-zinc-700">
                  Bidang:
                </th>
                <th className="px-4 py-3 text-left text-zinc-800 text-sm font-semibold font-['Poppins'] border-b border-zinc-700">
                  Tahun:
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProyek.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 border-b border-zinc-200">
                  <td className="px-4 py-3 text-zinc-700 text-sm font-normal font-['Poppins']">
                    {item.customer}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 text-sm font-normal font-['Poppins']">
                    {item.proyek}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 text-sm font-normal font-['Poppins']">
                    {item.bidang}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 text-sm font-normal font-['Poppins']">
                    {item.tahun}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft className="text-white w-5 h-5" />
          </button>

            <div className="flex flex-col items-center gap-1">
              <div className="min-w-[90px] h-10 px-4 py-2 bg-white rounded-md border-2  border-zinc-800 flex items-center justify-center mt-6">
                <span className="text-zinc-800 text-base font-medium font-['Poppins']">{currentPage}</span>
              </div>
              <span className="text-zinc-600 text-sm font-medium font-['Poppins']">Dari {totalPages}</span>
            </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft className="text-white w-5 h-5 rotate-180" />
          </button>
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