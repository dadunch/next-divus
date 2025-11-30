import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaChevronDown, FaChevronLeft, FaWhatsapp } from 'react-icons/fa';
import { Assets } from '../../assets';

export default function Proyek() {
  const [proyekData, setProyekData] = useState([]); // Data dari Database
  const [loading, setLoading] = useState(true);

  // Filter State
  const [activeFilter, setActiveFilter] = useState('Semua Bidang');
  const [categories, setCategories] = useState(['Semua Bidang']); // Kategori dinamis

  const [selectedYear, setSelectedYear] = useState('Semua');
  const [years, setYears] = useState(['Semua']); // Tahun dinamis
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Bisa diatur mau tampil berapa per halaman

  // 1. FETCH DATA DARI API
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects'); // Panggil API yang baru kita buat
      const data = await res.json();

      if (Array.isArray(data)) {
        setProyekData(data);

        // Ambil list Kategori unik dari data yang ada
        const uniqueCategories = ['Semua Bidang', ...new Set(data.map(item => item.category?.bidang).filter(Boolean))];
        setCategories(uniqueCategories);

        // Ambil list Tahun unik dari data yang ada
        const uniqueYears = ['Semua', ...new Set(data.map(item => item.tahun).filter(Boolean))].sort((a, b) => b - a);
        setYears(uniqueYears);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. LOGIKA FILTER
  const filteredProyek = proyekData.filter((item) => {
    // Cek Bidang (Ambil dari relasi category.bidang)
    const itemBidang = item.category?.bidang || '';
    const matchFilter = activeFilter === 'Semua Bidang' || itemBidang === activeFilter;

    // Cek Tahun
    // Pastikan perbandingan tipe datanya sama (string vs string)
    const itemTahun = item.tahun ? item.tahun.toString() : '';
    const matchYear = selectedYear === 'Semua' || itemTahun === selectedYear.toString();

    return matchFilter && matchYear;
  });

  // 3. LOGIKA PAGINATION
  const totalPages = Math.ceil(filteredProyek.length / itemsPerPage);
  const paginatedProyek = filteredProyek.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
                - Proyek
              </p>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="w-full bg-zinc-300 py-3 mb-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-zinc-800 text-base">
              {/* Level 1: Beranda */}
              <Link href="/User/Home" className="hover:underline hover:text-green-600 transition-colors">
                Beranda
              </Link>
              {/* Separator */}
              <span className="mx-2 text-zinc-500">{'>'}</span>
              {/* Level 2: Kategori (Misal: Layanan) */}
              <Link href="/User/Portofolio" className="hover:underline hover:text-green-600 transition-colors">
                Portofolio
              </Link>
              {/* Separator */}
              <span className="mx-2 text-zinc-500">{'>'}</span>
              {/* Level 3: Halaman Aktif (Merah) */}
              <span className="text-red-600 font-medium">
                Proyek
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* Section utama */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-16">
        <h2 className="text-zinc-800 text-3xl md:text-4xl font-bold  capitalize mb-6">
          Proyek dan Klien kami
        </h2>
        <p className="text-zinc-700 text-base font-normal leading-relaxed mb-12">
          PT Divus Global Mediacomm telah berpengalaman mengerjakan berbagai proyek...
        </p>

        {/* Filter Categories Dinamis */}
        <div className="flex flex-wrap gap-6 mb-8">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveFilter(category);
                setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
              }}
              className={`px-6 py-2 rounded-[10px] text-lg font-medium transition-all ${activeFilter === category
                ? 'bg-zinc-800 text-white'
                : 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Dropdown Tahun Dinamis */}
        <div className="flex justify-end mb-8 relative">
          <button
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            className="w-36 h-10 px-4 bg-zinc-800 rounded-[10px] flex items-center justify-between gap-2 text-sm relative"
          >
            <span className="text-white text-sm font-medium font-['Poppins'] leading-6">
              {selectedYear === 'Semua' ? 'Tahun' : selectedYear}
            </span>
            <FaChevronDown className="text-white w-4 h-4" />
          </button>

          {showYearDropdown && (
            <div className="absolute mt-10 right-0 w-36 bg-white rounded-md shadow-lg z-10 border border-zinc-200 h-48 overflow-y-auto">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setSelectedYear(y);
                    setShowYearDropdown(false);
                    setCurrentPage(1);
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
        <div className="w-full bg-white rounded-lg border border-zinc-700 overflow-hidden mb-8 overflow-x-auto">
          <table className="w-full min-w-[600px]">
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
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">Loading data...</td>
                </tr>
              ) : paginatedProyek.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">Tidak ada proyek ditemukan.</td>
                </tr>
              ) : (
                paginatedProyek.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 border-b border-zinc-200">
                    <td className="px-4 py-3 text-zinc-700 text-sm font-normal font-['Poppins']">
                      {/* Ambil Nama Client dari relasi */}
                      {item.client?.client_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 text-sm font-normal font-['Poppins']">
                      {item.project_name}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 text-sm font-normal font-['Poppins']">
                      {/* Ambil Bidang dari relasi category */}
                      {item.category?.bidang || '-'}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 text-sm font-normal font-['Poppins']">
                      {item.tahun}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              <FaChevronLeft className="text-white w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-1">
              <div className="min-w-[90px] h-10 px-4 py-2 bg-white rounded-md border-2 border-zinc-800 flex items-center justify-center mt-6">
                <span className="text-zinc-800 text-base font-medium font-['Poppins']">{currentPage}</span>
              </div>
              <span className="text-zinc-600 text-sm font-medium font-['Poppins']">Dari {totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              <FaChevronLeft className="text-white w-5 h-5 rotate-180" />
            </button>
          </div>
        )}
      </section>
      {/* CTA SECTION */}
            <section className="px-6 md:px-20 py-16 md:py-6 overflow-hidden">
              <div className="max-w-7xl mx-auto">
                <div className="w-full rounded-3xl overflow-hidden relative shadow-xl">
                  {/* Background layer for gradient and image */}
                  <div className="absolute inset-0 bg-gradient-to-b from-green-500 to-lime-500">
                    {/* Background image 1 with low opacity */}
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: `url(${Assets.Banner1})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    ></div>
                  </div>
      
                  {/* Content layer */}
                  <div className="relative px-6 py-16 md:py-20 text-center flex flex-col items-center justify-center gap-6">
                    {/* Judul */}
                    <h2 className="text-white text-3xl md:text-4xl font-bold capitalize leading-tight z-10 ">
                      PT Divus Global Medicom siap menjadi solusi <br className="hidden md:block" />
                      terpercaya untuk bisnis Anda!
                    </h2>
      
                    {/* Subjudul */}
                    <p className="text-white text-lg md:text-xl font-normal capitalize leading-snug max-w-4xl z-10">
                      Hubungi kami dan dapatkan panduan dari konsultan berpengalaman
                    </p>
      
                    {/* Tombol CTA */}
                    <a href="https://wa.me/62812345678" className="mt-4 inline-flex justify-center items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 z-10 group">
                      <FaWhatsapp className="text-green-600 w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-black text-base md:text-lg font-semibold font-['Poppins'] capitalize">
                        Konsultasi Sekarang
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </section>

      {/* WA Button */}
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