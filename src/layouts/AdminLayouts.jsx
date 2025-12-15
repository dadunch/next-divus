import React, { useState } from 'react';
import Sidebar from "../components/Sidebar";
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Menu } from 'lucide-react';
import { Assets } from "../assets";

const AdminLayouts = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter(); // Initialize useRouter
  const { user } = useSelector((state) => state.auth || {}); // Get user from auth context

  // Determine if we should hide the hamburger (e.g. on Detail/Edit pages)
  // const isEditPage = router.pathname.includes("/Admin/Layanan/") && router.pathname.includes("[slug]");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR COMPONENT */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden">

        {/* Mobile Header Bar - Only show if NOT an edit page (or if we want a different header) */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-30 flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-['Poppins'] font-semibold text-lg text-gray-800">Admin Panel</span>
          </div>

        </div>

        {/* Spacer for Mobile Header */}
        <div className="lg:hidden h-16"></div>

        {/* Render Halaman Dashboard di sini */}
        <main className="w-full flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayouts;