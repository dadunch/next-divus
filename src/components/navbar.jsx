import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Assets } from '../assets';
import { faDisplay } from '@fortawesome/free-solid-svg-icons';
import { serviceCache } from '../utils/serviceCache';


function Navbar() {
    // State UI
    const [isOpen, setIsOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('ID');
    const [activeDropdown, setActiveDropdown] = useState(null);

    // State Data & Fallback
    const [servicesList, setServicesList] = useState([]);
    const [isLoadingServices, setIsLoadingServices] = useState(true); // State Loading Khusus Layanan
    const router = useRouter();

    // useEffect(() => {
    //     const fetchServices = async () => {
    //         setIsLoadingServices(true);
    //         try {
    //             const res = await fetch('/api/services');
    //             const data = await res.json();

    //             if (res.ok && Array.isArray(data)) {
    //                 // FORMAT DATA: Gunakan slug dari database untuk path
    //                 const formattedServices = data.map(service => ({
    //                     name: service.title,
    //                     path: '/User/Layanan/' + service.id
    //                 }));
    //                 setServicesList(formattedServices);
    //             }
    //         } catch (error) {
    //             console.error("Gagal mengambil data layanan:", error);
    //         } finally {
    //             setIsLoadingServices(false);
    //         }
    //     };

    //     fetchServices();
    // }, []);

    useEffect(() => {
        const fetchServices = async () => {
            setIsLoadingServices(true);
            try {
                // Gunakan cache - hanya fetch sekali
                const data = await serviceCache.fetch();

                // FORMAT DATA: Gunakan slug dari database untuk path
                const formattedServices = data.map(service => ({
                    name: service.title,
                    path: '/User/Layanan/' + service.id
                }));
                setServicesList(formattedServices);
            } catch (error) {
                console.error("Gagal mengambil data layanan:", error);
            } finally {
                setIsLoadingServices(false);
            }
        };

        fetchServices();
    }, []);

    // --- 2. LOGIKA FALLBACK MENU ---
    // Fungsi untuk menentukan isi dropdown Layanan
    const getLayananSubItems = () => {
        if (isLoadingServices) {
            return [{ name: "Sedang memuat...", path: "#", disabled: true }]; // Fallback 1: Loading
        }
        if (servicesList.length === 0) {
            return [{ name: "Belum ada layanan", path: "#", disabled: true }]; // Fallback 2: Data Kosong
        }
        return servicesList; // Data Ready
    };

    // Definisi Menu
    const navItems = [
        { name: "Beranda", path: "/User/Home" },
        {
            name: "Layanan",
            path: "#",
            isDropdown: true,
            subItems: getLayananSubItems() // Gunakan fungsi logic di atas
        },
        {
            name: "Portofolio",
            path: "#",
            isDropdown: true,
            subItems: [
                { name: "Produk", path: "/User/Produk" },
                { name: "Proyek", path: "/User/Proyek" },
            ]
        },
        { name: "Tentang Kami", path: "/User/TentangKami" },
        { name: "Kontak", path: "/User/Contact" },
    ];

    // Tutup dropdown jika klik di luar
    useEffect(() => {
        const closeDropdown = () => setActiveDropdown(null);
        document.addEventListener("click", closeDropdown);
        return () => document.removeEventListener("click", closeDropdown);
    }, []);

    const handleLangChange = (lang) => {
        setCurrentLang(lang);
        setIsLangOpen(false);
    };

    return (
        <nav className="w-full h-24 fixed top-0 left-0 z-50 bg-white shadow-sm">

            <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-6 md:px-[90px]">

                {/* Logo */}
                <div className="flex items-center h-full">
                    <Link href="/User/Home">
                        <img className="w-auto h-14 cursor-pointer hover:opacity-90 transition-opacity"
                            src={Assets.Logo}
                            alt="DMUS Logo"
                        />
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center space-x-10 text-[17px] font-medium text-zinc-800">
                    {navItems.map((item, index) => (
                        <div key={index} className="relative group">
                            {item.isDropdown ? (
                                // --- TIPE DROPDOWN ---
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdown(activeDropdown === item.name ? null : item.name);
                                    }}
                                    className={`flex items-center gap-1 transition-colors duration-200 hover:text-[#88C63F] ${activeDropdown === item.name ? 'text-[#88C63F]' : ''
                                        }`}
                                >
                                    {item.name}
                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''}`}
                                    />
                                </button>
                            ) : (
                                // --- TIPE LINK BIASA ---
                                <Link
                                    href={item.path}
                                    className={`transition-colors duration-200 hover:text-[#88C63F] ${router.pathname === item.path ? "text-[#88C63F]" : ""
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            )}

                            {/* Dropdown Content */}
                            {item.isDropdown && activeDropdown === item.name && (
                                <div className="absolute top-full left-0 mt-4 w-64 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    {item.subItems.map((sub, subIdx) => (
                                        sub.disabled ? (
                                            // Render item mati (untuk Loading/Kosong)
                                            <span key={subIdx} className="block px-6 py-3 text-sm text-gray-400 italic cursor-default">
                                                {sub.name}
                                            </span>
                                        ) : (
                                            // Render item hidup (Link)
                                            <Link
                                                key={subIdx}
                                                href={sub.path}
                                                className="block px-6 py-3 text-sm text-gray-600 hover:bg-green-50 hover:text-[#88C63F] transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                {sub.name}
                                            </Link>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right Section: Language & Mobile Toggle */}
                <div className="flex items-center gap-6">
                    {/* Hamburger Menu */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden text-zinc-800 p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="lg:hidden absolute top-24 left-0 w-full bg-white border-t border-gray-100 shadow-xl pb-6 transition-all duration-300 ease-in-out max-h-[80vh] overflow-y-auto">
                    <div className="flex flex-col space-y-1 pt-4 px-6">
                        {navItems.map((item, index) => (
                            <div key={index}>
                                {item.isDropdown ? (
                                    // Mobile Dropdown
                                    <div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === item.name ? null : item.name);
                                            }}
                                            className="flex items-center justify-between w-full py-3 text-lg font-medium text-zinc-800 hover:text-[#88C63F]"
                                        >
                                            {item.name}
                                            <ChevronDown size={20} className={`transform transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                                        </button>
                                        {activeDropdown === item.name && (
                                            <div className="pl-4 border-l-2 border-gray-100 mb-2 space-y-2">
                                                {item.subItems.map((sub, subIdx) => (
                                                    sub.disabled ? (
                                                        <span key={subIdx} className="block py-2 text-base text-gray-400 italic">{sub.name}</span>
                                                    ) : (
                                                        <Link
                                                            key={subIdx}
                                                            href={sub.path}
                                                            onClick={() => setIsOpen(false)}
                                                            className="block py-2 text-base text-gray-500 hover:text-[#88C63F]"
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Mobile Link Biasa
                                    <Link
                                        href={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`block py-3 text-lg font-medium transition-colors ${router.pathname === item.path ? 'text-[#88C63F]' : 'text-zinc-800 hover:text-[#88C63F]'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar;