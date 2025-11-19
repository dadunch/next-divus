import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Assets } from '../assets';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('ID');
    const router = useRouter();
    const navItems = [
        { name: "Beranda", path: "/User/Home"},
        { name: "Layanan & Produk", path: "/User/LayananProduk" },
        { name: "Proyek", path: "/User/Proyek"},
        { name: "Tentang Kami", path: "/User/TentangKami"},
        { name: "Kontak", path: "/User/Contact"},
    ];
    
    // ubah language
    const handleLangChange = (lang) => {
        setCurrentLang(lang);
        setIsLangOpen(false);
    };

    return (
        <nav className="w-full h-24 fixed top-0 left-0 z-50 bg-white shadow-md">
            
            {/* Desktop */}
            <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-6 md:px-[90px]">
                <div className="flex items-center h-full">
                    <img className="w-auto h-16"
                         src={Assets.Logo}
                         alt="DMUS Logo"
                    />
                </div>
                <div className="hidden lg:flex space-x-9 text-lg font-medium font-['Poppins']">
                    {navItems.map((item) => (
                        <Link 
                            key={item.name}
                            href={item.path} 
                            className={`text-center leading-6 transition-colors duration-200 ${
                                router.pathname === item.path? "text-lime-600"
                                : "text-zinc-800 hover:text-lime-600"
                    }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Bahasa & Hamburger */}
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <button 
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="bg-zinc-800 text-white text-lg font-medium font-['Poppins'] px-4 py-2 rounded-lg flex items-center gap-1 transition-colors hover:bg-zinc-700"
                        >
                            {currentLang} 
                            <ChevronDown size={18} className={`transform transition-transform ${isLangOpen ? 'rotate-180' : 'rotate-0'}`} />
                        </button>
                        {isLangOpen && (
                            <div className="absolute top-full right-0 mt-2 w-16 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 z-50">
                                {['ID', 'EN'].filter(lang => lang !== currentLang).map(lang => (
                                    <button 
                                        key={lang}
                                        onClick={() => handleLangChange(lang)}
                                        className="w-full text-center text-zinc-800 text-lg font-medium font-['Poppins'] py-2 hover:bg-gray-100"
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden text-zinc-800 p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl pb-4 transition-all duration-300 ease-in-out">
                    <div className="flex flex-col space-y-2 pt-2 px-6">
                        {navItems.map((item) => (
                            <Link 
                                key={item.name}
                                href={item.path} 
                                onClick={() => setIsOpen(false)} // Tutup menu setelah klik
                                className={`block py-2 rounded-md text-xl font-medium font-['Poppins'] px-4 transition-colors ${
                                    router.pathname === item.path ? 'bg-lime-50 text-lime-600' : 'text-zinc-800 hover:bg-gray-50'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <button className="md:hidden bg-zinc-800 text-white text-lg font-medium font-['Poppins'] w-full py-3 mt-4">
                        {currentLang} ▸
                    </button>
                </div>
            )}
        </nav>
    )
}

export default Navbar;
