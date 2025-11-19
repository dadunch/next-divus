import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Assets } from '../../assets';
import { FaWhatsapp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Data layanan dan produk
const servicesData = [
    { title: 'Management Konsulting', items: ['Business Feasibility & Evaluation', 'Marketing Plan & Communications', 'Strategic Planning'], icon: Assets.Icon1 },
    { title: 'Research & Survey', items: ['Market Survey', 'Customer Satisfaction', 'Social Mapping'], icon: Assets.Icon2 },
    { title: 'Corporate ID', items: ['Website', 'Logo', 'Stationery', 'Company Profile', 'Kalender', 'Agenda', 'Video Profile'], icon: Assets.Icon4 },
    { title: 'Product & Service Knowledge', items: ['Brosur', 'Booklet', 'Banner', 'Backdrop', 'Merchandise', 'Event'], icon: Assets.Icon5 },
    { title: 'Report & Journal', items: ['Annual Plan', 'Monitoring Report', 'Annual Report', 'Newsletter'], icon: Assets.Icon3 }
];

// Data Produk
const productCategories = [
    'Semua Produk',
    'Research & Survey',
    'Corporate ID',
    'Product & Services Knowledge',
    'Report & Journal'
];

// Contoh Data Produk
const productsData = [
    { title: 'Annual Report', category: 'Report & Journal', image: Assets.Banner1, description: 'Laporan Tahunan Perusahaan' },
    { title: 'Quarterly Report', category: 'Report & Journal', image: Assets.Banner2, description: 'Laporan Kuartalan' },
    { title: 'Kalender', category: 'Corporate ID', image: Assets.Banner3, description: 'Kalender Desain Khusus' },
    { title: 'Website E-Commerce', category: 'Corporate ID', image: Assets.Banner4, description: 'Pengembangan Situs Web' },
    { title: 'Brochure Produk A', category: 'Product & Services Knowledge', image: Assets.Hero1, description: 'Media Promosi' },
    { title: 'Logo Branding', category: 'Corporate ID', image: Assets.Hero2, description: 'Desain Identitas Perusahaan' },
    { title: 'Company Profile', category: 'Corporate ID', image: Assets.Hero3, description: 'Profil Perusahaan' },
    { title: 'Market Research Report', category: 'Report & Journal', image: Assets.Banner1, description: 'Riset Pasar' },
];

// Komponen Kartu Layanan
const ServiceCard = ({ service }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm transition-all border-r-2 border-l-2 border-b-4 border-zinc-500/50 hover:shadow-xl hover:border-lime-500">
        <div className="flex items-start gap-4 mb-4">
            <img
                src={service.icon}
                alt={`${service.title} Icon`}
                className="w-12 h-12 object-contain"
            />
            <h3 className="text-xl font-semibold text-zinc-800">{service.title}</h3>
        </div>
        <ul className="space-y-2">
            {service.items.map((item, index) => (
                <li key={index} className="text-zinc-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-lime-500 rounded-full flex-shrink-0"></span>
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

const ProductSection = () => {
    const [activeCategory, setActiveCategory] = useState(productCategories[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Filter produk berdasarkan kategori aktif
    const filteredProducts = activeCategory === 'Semua Produk'
        ? productsData
        : productsData.filter(p => p.category === activeCategory);

    // Hitung paginasi
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setCurrentPage(1); // Reset halaman saat kategori berubah
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const ProductCard = ({ product }) => (
        <div className="w-full relative rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02] duration-300">
            {/* Image Placeholder */}
            <img
                src={product.image || 'https://via.placeholder.com/370x400?text=Produk'}
                alt={product.title}
                className="w-full h-72 object-cover"
            />
            {/* Title Block */}
            <div className="w-full p-6 bg-zinc-600/90 absolute bottom-0 flex justify-center items-center">
                <p className="text-white text-xl font-semibold font-['Poppins'] capitalize text-center">{product.title}</p>
            </div>
        </div>
    );

    return (
        <div className="w-full">
            <div className="bg-zinc-800 rounded-[40px] p-10 md:p-16">
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {productCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryChange(category)}
                            className={`
                                w-auto px-8 py-3 rounded-[50px] transition-colors duration-200
                                text-xl font-semibold font-['Poppins'] capitalize whitespace-nowrap
                                ${activeCategory === category
                                    ? 'bg-white text-zinc-800 outline outline-1 outline-zinc-800'
                                    : 'bg-zinc-800 text-white outline outline-1 outline-white hover:bg-zinc-700'
                                }
                            `}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Produk */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
                    {currentProducts.map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-7">
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`w-16 h-16 rounded-[10px] flex items-center justify-center transition-opacity duration-200 ${
                                currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-700'
                            } outline outline-1 outline-white`}
                        >
                            <FaChevronLeft size={24} className="text-white" />
                        </button>

                        {/* Page Number */}
                        <div className="w-16 h-16 rounded-md flex items-center justify-center bg-white border border-zinc-800">
                            <span className="text-black text-xl font-medium font-['Poppins']">{currentPage}</span>
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`w-16 h-16 rounded-[10px] flex items-center justify-center transition-opacity duration-200 ${
                                currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-700'
                            } outline outline-1 outline-white`}
                        >
                            <FaChevronRight size={24} className="text-white" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function LayananProduk() {
    const [activeTab, setActiveTab] = useState('layanan');

    return (
        <div className="relative w-full bg-white overflow-hidden">

            <header className="relative w-full">
                <div className="relative w-full h-[470px] mt-[90px]">
                    <img
                        src={Assets.Banner3}
                        alt="Latar Belakang Layanan"
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    <div className="absolute inset-0 bg-zinc-800/50 z-10"></div>
                    <div className="relative z-20 max-w-[1440px] mx-auto px-6 md:px-20 pt-32 pb-16 text-white h-full flex flex-col justify-end">
                        <p className="text-xl md:text-3xl font-bold text-lime-500 mb-2">
                            PT Divus Global Mediacomm
                        </p>
                        <h1 className="text-5xl md:text-7xl font-bold capitalize">
                            Layanan & Produk
                        </h1>
                    </div>
                </div>
                <div className="w-full bg-zinc-300 py-3 px-6 md:px-20 ">
                    <p className="text-zinc-800 text-base">
                        <Link href="/User/Home" className="hover:underline ml-1">
                            Beranda
                        </Link>
                        <span className="text-red-600"> {' > '} Layanan & Produk</span>
                    </p>
                </div>
            </header>

            <section className="max-w-[1440px] mx-auto px-6 md:px-20 py-16">
                <h2 className="text-zinc-800 text-3xl md:text-4xl font-bold font-['Poppins'] capitalize mb-6">
                    Solusi Bisnis Menyeluruh
                </h2>
                <p className="text-zinc-700 text-base font-normal font-['Poppins'] leading-relaxed mb-12 max-w-[1280px]">
                    PT Divus Global Mediacomm menyediakan layanan dan produk terpadu, mulai dari Management Consulting, Research & Survey, Corporate ID, Product & Services Knowledge, serta Report & Jurnal. Semua dirancang untuk mendukung pertumbuhan bisnis dan memperkuat citra perusahaan Anda.
                </p>

                {/* Tabs Layanan & Produk */}
                <div className="flex gap-0 mb-12">
                    <button
                        onClick={() => setActiveTab('layanan')}
                        className={`px-8 py-2.5 rounded-l-[10px] text-lg md:text-xl font-semibold font-['Poppins'] capitalize transition-all border border-green-500 ${
                            activeTab === 'layanan'
                                ? 'bg-gradient-to-b from-green-500 to-lime-500 text-white border-r-0'
                                : 'bg-white text-black'
                        }`}
                    >
                        Layanan
                    </button>
                    <button
                        onClick={() => setActiveTab('produk')}
                        className={`px-7 py-2.5 rounded-r-[10px] text-lg md:text-xl font-semibold font-['Poppins'] capitalize transition-all border border-green-500 ${
                            activeTab === 'produk'
                                ? 'bg-gradient-to-b from-green-500 to-lime-500 text-white border-l-0'
                                : 'bg-white text-black'
                        }`}
                    >
                        Produk
                    </button>
                </div>

                {/* Konten Berdasarkan Tab */}
                {activeTab === 'layanan' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {servicesData.map((service, index) => (
                            <ServiceCard key={index} service={service} />
                        ))}
                    </div>
                ) : (
                    <ProductSection />
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
    )
}