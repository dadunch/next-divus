import React, { useState } from 'react';
import Sidebar from "../components/Sidebar"; 

const AdminLayouts = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // 1. Container Utama menggunakan Flexbox
    <div className="flex min-h-screen bg-[#F5F7FB]">
      
      {/* Sidebar: Lebarnya tetap (fixed) sesuai komponen Sidebar */}
      {/* Karena ini flex container, dia akan duduk di kiri */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* 2. Konten Utama */}
      {/* HAPUS 'lg:ml-[280px]' */}
      {/* TAMBAHKAN 'flex-1' (artinya: ambil sisa ruang yang tersedia) */}
      {/* TAMBAHKAN 'min-w-0' (mencegah overflow horizontal pada beberapa browser) */}
      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300"> 
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-md shadow-md text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Spacer mobile agar konten tidak tertutup tombol */}
        <div className="lg:hidden h-16"></div>
        
        {/* Render Halaman Dashboard di sini */}
        <main className="w-full">
            {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayouts;