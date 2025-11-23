import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaChevronDown, FaChevronLeft, FaWhatsapp } from 'react-icons/fa';
import { Assets } from '../../assets'; // Pastikan path ini benar

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
        {/* Banner image */}
        <div className="relative w-full h-[470px] mt-[90px]">
          {/* Pastikan Assets.Banner4 terdefinisi atau ganti string path gambar */}
          <img
            src={Assets.Banner4 || "/placeholder-banner.jpg"} 
            alt="Latar Belakang Proyek"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div className="absolute inset-0 bg-zinc-800/50 z-10"></div>
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