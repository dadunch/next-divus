import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Assets } from "../assets";
import Swal from 'sweetalert2';

// --- 1. ICON MAPPING ---
// Kunci (Key) harus SAMA PERSIS dengan kolom 'url' di database public.menu
const ICON_MAP = {
  "/Admin/Dashboard": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  "#Layanan": ( 
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  "#Portofolio": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  "#Perusahaan": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  "/Admin/Users": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  "default": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [menuItems, setMenuItems] = useState([]);
  const [openMenus, setOpenMenus] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // --- 2. LOGIC FETCH & TRANSFORM DATA ---
  useEffect(() => {
    const fetchMenus = async () => {
      const roleId = user?.roleId || user?.role_id;
      
      // Jika belum ada roleId, jangan fetch dulu
      if (!roleId) {
        setIsLoading(false); 
        return;
      }

      try {
        const res = await fetch(`/api/roles/permissions?role_id=${roleId}`);
        const data = await res.json(); 

        if (res.ok) {
          // Ambil object menu-nya saja dari response permission
          const rawMenus = data.map(item => item.menu);

          // [PERBAIKAN PENTING]: Normalisasi ID ke String agar pencocokan akurat
          const normalizedMenus = rawMenus.map(m => ({
            ...m,
            id: String(m.id), // Paksa ID jadi string
            parent_id: m.parent_id ? String(m.parent_id) : null // Paksa ParentID jadi string
          }));

          // 1. Ambil Semua Parent (yang parent_id-nya null)
          const parents = normalizedMenus.filter(m => !m.parent_id);
          
          // 2. Ambil Semua Child (yang punya parent_id)
          const children = normalizedMenus.filter(m => m.parent_id);

          // 3. Susun Hierarki
          const structuredMenu = parents.map(parent => {
            // Cari anak yang parent_id-nya SAMA dengan id parent ini
            const myChildren = children.filter(child => child.parent_id === parent.id);
            
            return {
              name: parent.nama_menu,
              path: parent.url || "#",
              // Pilih icon berdasarkan URL, fallback ke default jika tidak ketemu
              icon: ICON_MAP[parent.url] || ICON_MAP["default"],
              
              // Format anak-anaknya
              subItems: myChildren.map(child => ({
                name: child.nama_menu,
                path: child.url
              }))
            };
          });

          // Safety Net: Pastikan Dashboard selalu muncul jika user admin tapi belum di-assign menu
          if (!structuredMenu.find(m => m.path === '/Admin/Dashboard')) {
             structuredMenu.unshift({
               name: "Beranda",
               path: "/Admin/Dashboard",
               icon: ICON_MAP["/Admin/Dashboard"],
               subItems: []
             });
          }

          setMenuItems(structuredMenu);
        }
      } catch (error) {
        console.error("Gagal load menu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
  }, [user]);

  // --- 3. SECURITY CHECK (REDIRECT JIKA DILARANG) ---
  useEffect(() => {
    if (!isLoading && menuItems.length > 0) {
      const currentPath = router.pathname;
      
      let allowedPaths = [];
      menuItems.forEach(item => {
        allowedPaths.push(item.path);
        if (item.subItems && item.subItems.length > 0) {
          item.subItems.forEach(sub => allowedPaths.push(sub.path));
        }
      });

      const isAllowed = allowedPaths.includes(currentPath);
      
      if (!isAllowed && currentPath !== '/Admin/Dashboard' && currentPath !== '/404') {
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak',
          text: 'Role Anda tidak mengizinkan akses ke halaman ini.',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          router.push('/Admin/Dashboard');
        });
      }
    }
  }, [router.pathname, menuItems, isLoading]);


  // --- UI HELPERS ---
  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: "Sesi Anda akan berakhir.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Ya, Logout',
      cancelButtonText: 'Batal',
      width: '22em',
      customClass: {
        popup: 'font-["Poppins"] rounded-xl',
        title: 'text-lg font-bold',
        htmlContainer: 'text-sm'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        // Hapus juga local storage agar bersih total
        localStorage.removeItem('adminUser');
        router.push('/Admin/LoginAdmin');
      }
    });
  };

  // --- RENDER ITEM ---
  const renderMenuItem = (item, index) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActiveParent = router.pathname === item.path || (hasSubItems && item.subItems.some(sub => router.pathname === sub.path));
    const isExpanded = openMenus[item.name] || isActiveParent;

    return (
      <div key={index} className="mb-2">
        {hasSubItems ? (
          // TIPE 1: MENU DROPDOWN (Ada Submenu)
          <div>
            <button
              onClick={() => toggleMenu(item.name)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-['Poppins'] font-medium transition-all duration-200 
                ${isActiveParent ? 'text-gray-800' : 'text-gray-500 hover:bg-gray-50'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className={isActiveParent ? 'text-gray-700' : 'text-gray-400'}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="mt-1 pl-4 space-y-1">
                {item.subItems.map((sub, subIndex) => {
                  const isSubActive = router.pathname === sub.path;
                  return (
                    <Link
                      key={subIndex}
                      href={sub.path}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-['Poppins'] transition-colors 
                        ${isSubActive ? 'text-[#5FCF2F] font-semibold' : 'text-gray-500 hover:text-gray-700'}
                      `}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // TIPE 2: SINGLE LINK (Tanpa Submenu)
          <Link
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-['Poppins'] font-medium transition-all duration-200 
              ${router.pathname === item.path 
                ? 'bg-[#5FCF2F] text-white shadow-md shadow-green-200' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }
            `}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-64 bg-white shadow-xl flex-col sticky top-0 z-50">
        <div className="pt-8 pb-6 flex justify-center">
          <img src={Assets?.Logo || "/assets/logo.png"} alt="DIVUS Logo" className="w-32" />
        </div>

        <nav className="flex-1 px-4 overflow-y-auto scrollbar-hide">
          {isLoading ? (
             <div className="space-y-4 mt-4 px-2">
               <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
               <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
               <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
             </div>
          ) : (
             menuItems.map((item, idx) => renderMenuItem(item, idx))
          )}
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100 bg-white">
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-['Poppins'] font-medium text-white bg-[#FF3B3B] hover:bg-[#e63535] transition-all shadow-md shadow-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-64 bg-white shadow-2xl flex flex-col h-full">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="pt-8 pb-6 flex justify-center">
              <img src={Assets?.Logo || "/assets/logo.png"} alt="DIVUS Logo" className="w-32" />
            </div>
            <nav className="flex-1 px-4 overflow-y-auto">
              {menuItems.map((item, idx) => renderMenuItem(item, idx))}
            </nav>
            <div className="p-4 mt-auto border-t">
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-['Poppins'] font-medium text-white bg-[#FF3B3B] hover:bg-[#e63535]">
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;