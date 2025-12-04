import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Assets } from "../assets";
import Swal from 'sweetalert2';
// import { Plus } from 'lucide-react'; // Uncomment jika dipakai

// --- ICON MAPPING (TETAP SAMA) ---
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
  "/Admin/AdminManagement": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
  const [servicesMenu, setServicesMenu] = useState([]); 
  const [openMenus, setOpenMenus] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 1. FUNGSI FETCH SERVICES
  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        const formattedServices = data.map(service => ({
          name: service.title,
          path: `/Admin/Layanan/${service.id}`, 
          isDynamic: true 
        }));
        setServicesMenu(formattedServices);
      }
    } catch (error) {
      console.error("Gagal load services:", error);
    }
  };

  // 2. USE EFFECT untuk EVENT LISTENER
  useEffect(() => {
    fetchServices(); 

    const handleRefresh = () => {
        console.log("Sidebar mendeteksi perubahan, merefresh menu...");
        fetchServices();
    };

    window.addEventListener('refreshSidebar', handleRefresh);
    return () => {
        window.removeEventListener('refreshSidebar', handleRefresh);
    };
  }, []);

  // 3. FETCH MENU PERMISSIONS (UPDATED FOR MULTI-ROLE)
  useEffect(() => {
    const fetchMenus = async () => {
      // === UPDATE LOGIC PENGAMBILAN ROLE ===
      let roleIds = [];

      // Cek apakah user punya array roles (Login Baru)
      if (user?.roles && Array.isArray(user.roles)) {
        roleIds = user.roles.map(r => r.id);
      } 
      // Fallback: Cek apakah user punya roleId tunggal (Login Lama / Redux Lama)
      else if (user?.roleId || user?.role_id) {
        roleIds = [user.roleId || user.role_id];
      }

      // Jika tidak ada role sama sekali, stop.
      if (roleIds.length === 0) {
        setIsLoading(false); 
        return;
      }

      try {
        // Gabungkan ID menjadi string (contoh: "1,2,3")
        const idsParam = roleIds.join(',');

        // Perhatian: Pastikan API permissions Anda mendukung query param 'role_ids' 
        // atau loop request jika API backend belum diupdate.
        // Di sini saya asumsikan API backend bisa terima 'role_ids'
        const res = await fetch(`/api/roles/permissions?role_ids=${idsParam}`);
        const data = await res.json(); 

        if (res.ok) {
          // Flattening array of permissions jika API mengembalikan nested arrays karena multi-role
          // (Tergantung implementasi backend Anda nanti)
          const rawMenus = Array.isArray(data) ? data.map(item => item.menu).flat() : [];
          
          // Hilangkan duplikat menu (karena multiple role bisa punya akses ke menu yg sama)
          const uniqueMenus = Array.from(new Map(rawMenus.map(m => [m.id, m])).values());

          const normalizedMenus = uniqueMenus.map(m => ({
            ...m,
            id: String(m.id),
            parent_id: m.parent_id ? String(m.parent_id) : null,
            url: m.url === '/Admin/Proyek/Produk' ? '/Admin/Produk' : m.url
          }));

          const parents = normalizedMenus.filter(m => !m.parent_id);
          const children = normalizedMenus.filter(m => m.parent_id);

          const structuredMenu = parents.map(parent => {
            
            // 1. Ambil anak-anak default dari database
            let myChildren = children
              .filter(child => child.parent_id === parent.id && !child.nama_menu.toLowerCase().includes('tambah layanan'))
              .map(child => ({
                name: child.nama_menu,
                path: child.url
              }));

            // 2. Logika Khusus: LAYANAN
            if (parent.nama_menu === 'Layanan' || parent.url === '#Layanan') {
               myChildren = [
                 ...myChildren,     
                 ...servicesMenu,
                 { name: '+ Tambah Layanan', path: '/Admin/LayananProduk', isSpecial: true } 
               ];
            }

            // 3. Logika Khusus: PERUSAHAAN
             if (
              parent.nama_menu === "Perusahaan" ||
              parent.url === "#Perusahaan"
            ) {
              myChildren = [
                { name: "Informasi Perusahaan", path: "/Admin/Perusahaan" },
                { name: "Foto Perusahaan", path: "/Admin/FotoPerusahaan" },
                { name: "Asset Konten", path: "/Admin/AssetKonten" },
                ...myChildren,
              ];
            }

            // 4. Logika Khusus: PORTOFOLIO
            if (
                parent.nama_menu === "Portofolio" || 
                parent.url === "#Portofolio"
              ) {
                myChildren = [
                  { name: "Produk", path: "/Admin/Produk" },
                  { name: "Client", path: "/Admin/Proyek/Client" },  
                ];
              }

            return {
              name: parent.nama_menu,
              path: parent.url || "#",
              icon: ICON_MAP[parent.url] || ICON_MAP["default"],
              subItems: myChildren
            };
          });

          // Tambahkan Dashboard jika belum ada
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
  }, [user, servicesMenu]); 

  // --- (SISANYA KE BAWAH TETAP SAMA) ---
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
      customClass: { popup: 'font-["Poppins"] rounded-xl' }
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        localStorage.removeItem('adminUser');
        router.push('/Admin/LoginAdmin');
      }
    });
  };

  const renderMenuItem = (item, index) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActiveParent = router.pathname === item.path || (hasSubItems && item.subItems.some(sub => router.asPath === sub.path || router.pathname === sub.path));
    const isExpanded = openMenus[item.name] || isActiveParent;

    return (
      <div key={index} className="mb-3">
        {hasSubItems ? (
          <div>
            <button
              onClick={() => toggleMenu(item.name)}
              className={`w-full flex items-center justify-between px-6 py-3.5 rounded-xl font-['Poppins'] font-medium transition-all duration-200 
                ${isActiveParent ? 'bg-gradient-to-r from-[#94E93F] to-[#39B54A] text-white shadow-lg shadow-green-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
              `}
            >
              <div className="flex items-center gap-4">
                <span className={isActiveParent ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
                <span className="text-[15px]">{item.name}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="mt-2 pl-6 space-y-1">
                {item.subItems.map((sub, subIndex) => {
                  const isSubActive = router.asPath === sub.path;
                  const isSpecialBtn = sub.isSpecial; 

                  return (
                    <Link
                      key={subIndex}
                      href={sub.path}
                      className={`
                        flex items-center px-6 py-2.5 rounded-lg text-sm font-['Poppins'] transition-colors 
                        ${isSpecialBtn 
                            ? 'mt-3 bg-gray-100 text-gray-700 justify-center font-bold hover:bg-gray-200 shadow-sm' 
                            : (isSubActive 
                                ? 'text-[#39B54A] font-semibold' 
                                : 'text-gray-500 hover:text-gray-700')
                        }
                      `}
                    >
                      {!isSpecialBtn && (
                        <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isSubActive ? 'bg-[#39B54A]' : 'bg-gray-300'}`}></span>
                      )}
                      
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <Link
            href={item.path}
            className={`flex items-center gap-4 px-6 py-3.5 rounded-xl font-['Poppins'] font-medium transition-all duration-200 
              ${router.pathname === item.path ? 'bg-gradient-to-r from-[#94E93F] to-[#39B54A] text-white shadow-lg shadow-green-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
            `}
          >
            {item.icon}
            <span className="text-[15px]">{item.name}</span>
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="hidden lg:flex h-screen w-[280px] bg-white shadow-2xl flex-col sticky top-0 z-50">
        <div className="pt-10 pb-8 flex justify-center">
          <img src={Assets?.Logo || "/assets/logo.png"} alt="DIVUS Logo" className="w-40" />
        </div>
        <nav className="flex-1 px-5 overflow-y-auto scrollbar-hide">
          {isLoading ? (
             <div className="space-y-4 mt-4 px-2">
               <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
               <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
             </div>
          ) : (
             menuItems.map((item, idx) => renderMenuItem(item, idx))
          )}
        </nav>
        <div className="p-6 mt-auto border-t border-gray-100 bg-white">
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-['Poppins'] font-medium text-white bg-[#FF3B3B] hover:bg-[#e63535] transition-all shadow-lg shadow-red-100">
            <span>Log out</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-[280px] bg-white shadow-2xl flex flex-col h-full">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500">X</button>
            <div className="pt-10 pb-8 flex justify-center">
              <img src={Assets?.Logo} alt="DIVUS Logo" className="w-32" />
            </div>
            <nav className="flex-1 px-5 overflow-y-auto">
              {menuItems.map((item, idx) => renderMenuItem(item, idx))}
            </nav>
            <div className="p-6 mt-auto border-t">
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-['Poppins'] font-medium text-white bg-[#FF3B3B] hover:bg-[#e63535]">
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