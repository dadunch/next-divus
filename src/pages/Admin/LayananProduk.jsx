import React, { useState } from "react";
import { Assets } from '../../assets';
import FormTambahProduk from "../../components/Forms/FormTambahProduk";
import FormEditProduk from "../../components/Forms/FormEditProduk";
import FormEditLayanan from "../../components/Forms/FormEditLayanan";
import PopupHapus from "../../components/Forms/PopupHapus";
import PopupBD from "../../components/Forms/PopupBD";
import Link from 'next/link';
import { useRouter } from 'next/router';

const LayananProduk = () => {
    const [activeTab, setActiveTab] = useState("Layanan");
    const [searchQuery, setSearchQuery] = useState("");
    const [showTambahProduk, setShowTambahProduk] = useState(false);
    const [showEditProduk, setShowEditProduk] = useState(false);
    const [showEditLayanan, setShowEditLayanan] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showHapus, setShowHapus] = useState(false);
    const [showBerhasil, setShowBerhasil] = useState(false);
    const [selectedName, setSelectedName] = useState("");

    // FILTER TAB PRODUK
    const [selectedFilters, setSelectedFilters] = useState([]);

    const filterOptions = [
        "Semua Produk",
        "Research & Survey",
        "Corporate ID",
        "Product & Services Knowledge",
        "Report & Journal",
    ];

    const data = {
        Layanan: [
            {
                title: "Management Consulting",
                points: [
                    "Business Feasibility & Consultation",
                    "Marketing Plans & Communication",
                    "Strategic Planning",
                ],
                icon: Assets.Icon1,
            },
            {
                title: "Research & Survey",
                points: ["Market Studies", "Customer Satisfaction", "Trend Monitoring"],
                icon: Assets.Icon2,
            },
            {
                title: "Corporate",
                points: ["Media", "Agencies", "Partners", "Enterprises"],
                icon: Assets.Icon3,
            },
            {
                title: "Product & Service Knowledge",
                points: ["B2C/B2B", "Service Details", "User Insights"],
                icon: Assets.Icon4,
            },
            {
                title: "Reports & Journals",
                points: ["Annual Report", "Business Plan", "Monthly Summary"],
                icon: Assets.Icon5,
            },
        ],

        Produk: [
            {
                nama: "Aplikasi Analisis Data",
                mitra: "PT DataTech Indonesia",
                tahun: "2024",
                kategori: "Research & Survey",
                deskripsi:
                    "Aplikasi berbasis web untuk membantu perusahaan menganalisis data penjualan dan performa bisnis secara interaktif.",
                gambar: Assets.Produk1,
            },
            {
                nama: "Smart Marketing Tools",
                mitra: "CV DigitalMedia",
                tahun: "2023",
                kategori: "Product & Services Knowledge",
                deskripsi:
                    "Platform digital untuk membantu tim marketing mengelola kampanye, analisis audiens, dan pelacakan performa iklan.",
                gambar: Assets.Produk2,
            },
            {
                nama: "Sistem Pelayanan Publik",
                mitra: "Dinas Kominfo",
                tahun: "2025",
                kategori: "Corporate ID",
                deskripsi:
                    "Sistem manajemen layanan publik berbasis web yang mempermudah masyarakat dalam mengakses layanan pemerintahan.",
                gambar: Assets.Produk3,
            },
        ],
    };

    // ✅ FIX FILTER: hanya 1 filteredData
    const filteredData = data[activeTab].filter((item) => {
        const matchSearch = (item.title || item.nama)?.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === "Produk" && selectedFilters.length > 0 && !selectedFilters.includes("Semua Produk")) {
            return matchSearch && selectedFilters.includes(item.kategori);
        }

        return matchSearch;
    });

    return (
        <div className="min-h-screen bg-[#F5F7FB] px-10 py-8 font-medium font-['Poppins']">

            {/* Header */}
            <div className="flex justify-between items-center mb-9">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Layanan Dan Produk
                    </h1>
                    <p className="text-gray-600 font-medium">
                        Kelola produk dan layanan yang ditawarkan
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari produk/layanan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 h-10 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#27D14C]"
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-700">Hi, Admin</span>
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">
                            A
                        </div>
                    </div>

                    <button className="px-6 py-2 bg-[#27D14C] text-white font-semibold rounded-lg hover:bg-[#20b93f] transition shadow-md">
                        Register Admin
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3">
                    {["Layanan", "Produk"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setSelectedFilters([]); // reset filter saat pindah tab
                            }}
                            className={`px-6 py-2 rounded-full font-semibold shadow-sm transition ${activeTab === tab
                                ? "bg-[#27D14C] text-white"
                                : "bg-white text-gray-600 border hover:bg-gray-50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex justify-end mb-8 mt-2">
                    <button
                        onClick={() => setShowTambahProduk(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#111827] transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Produk
                    </button>
                </div>
            </div>

            {/* ✅ FILTER Kategori hanya muncul saat TAB PRODUK */}
            {activeTab === "Produk" && (
                <div className="flex flex-wrap gap-3 mb-6">
                    {filterOptions.map((filter) => {
                        const isActive = selectedFilters.includes(filter);
                        return (
                            <button
                                key={filter}
                                onClick={() => {
                                    if (filter === "Semua Produk") {
                                        setSelectedFilters(["Semua Produk"]);
                                    } else {
                                        setSelectedFilters((prev) =>
                                            prev.includes(filter)
                                                ? prev.filter((f) => f !== filter)
                                                : [...prev.filter((f) => f !== "Semua Produk"), filter]
                                        );
                                    }
                                }}
                                className={`px-6 py-2 rounded-full font-semibold border transition ${isActive
                                    ? "bg-[#27D14C] text-white shadow"
                                    : "bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Layanan */}
                {activeTab === "Layanan" &&
                    filteredData.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-20 h-20 flex items-center justify-center bg-[#E7F4D4] rounded-tr-3xl rounded-bl-3xl">
                                    <img src={item.icon} alt={item.title} className="w-10 h-10 object-contain" />
                                </div>
                                <div className="flex gap-2 text-gray-400">
                                    <button className="text-[#27D14C] hover:text-green-600" onClick={() => setShowEditLayanan(true)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.768-6.768a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-600 transition"
                                        onClick={() => {
                                            setSelectedName(item.title);
                                            setShowHapus(true);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">{item.title}</h3>
                            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                {item.points.map((point, i) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}

                {/* Produk */}
                {activeTab === "Produk" &&
                    filteredData.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition relative">
                            <div className="absolute top-6 right-6 flex gap-2 text-gray-400">
                                <button
                                    className="text-[#27D14C] hover:text-green-600"
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setShowEditProduk(true);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.768-6.768a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                                    </svg>
                                </button>
                                <button
                                    className="text-red-500 hover:text-red-600 transition"
                                    onClick={() => {
                                        setSelectedName(item.nama);
                                        setShowHapus(true);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Kategori badge di bagian atas */}
                            <div className="flex justify-between items-center mb-2">
                                <span className="inline-block bg-[#27D14C]/10 text-[#27D14C] text-xs font-semibold px-3 py-1 rounded-full">
                                    {item.kategori}
                                </span>
                            </div>

                            {/* Gambar produk */}
                            <img
                                src={item.gambar || "https://via.placeholder.com/400x200?text=No+Image"}
                                alt="gambar produk"
                                className="w-full h-40 object-cover rounded-lg mb-4"
                            />

                            {/* Detail produk */}
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.nama}</h3>
                            <p className="text-sm text-gray-500 mb-1"><strong>Mitra:</strong> {item.mitra}</p>
                            <p className="text-sm text-gray-500 mb-2"><strong>Tahun:</strong> {item.tahun}</p>
                            <p className="text-gray-600 text-sm">{item.deskripsi}</p>

                        </div>
                    ))}
            </div>

            {/* Popup Edit Layanan */}
            {showEditLayanan && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <FormEditLayanan onClose={() => setShowEditLayanan(false)} />
                </div>
            )}

            {/* Popup Tambah Produk */}
            {showTambahProduk && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[500px] relative">
                        <FormTambahProduk onClose={() => setShowTambahProduk(false)} />
                    </div>
                </div>
            )}

            {/* Popup Edit Produk */}
            {showEditProduk && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <FormEditProduk
                        onClose={() => {
                            setShowEditProduk(false);
                            setSelectedItem(null);
                        }}
                        item={selectedItem}
                    />
                </div>
            )}

            {/* Pop-up Hapus */}
            {showHapus && (
                <PopupHapus
                    onClose={() => setShowHapus(false)}
                    onConfirm={() => {
                        setShowHapus(false);
                        setShowBerhasil(true);
                    }}
                />
            )}

            {/* Pop-up Berhasil */}
            {showBerhasil && (
                <PopupBD
                    namaProduk={selectedName}
                    onClose={() => setShowBerhasil(false)}
                />
            )}
        </div>
    );
};

export default LayananProduk;
