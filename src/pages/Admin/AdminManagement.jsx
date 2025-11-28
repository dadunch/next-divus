import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Plus, Search, Pencil, Trash2, User, ShieldAlert } from "lucide-react";
import Swal from "sweetalert2";

// Layout (Sesuaikan path import Anda)
import AdminLayouts from "../../layouts/AdminLayouts";

// Modals (Pastikan komponen ini sudah dibuat)
import AddAdminModal from "../../components/Modals/AddAdminModal";
import EditAdminModal from "../../components/Modals/EditAdminModal";

const AdminManage = () => {
  const router = useRouter();
  
  // Ambil data user yang sedang login dari Redux untuk keperluan Log
  const { user } = useSelector((state) => state.auth);

  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // === 1. FETCH DATA (GET) ===
  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin");
      
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      } else {
        setAdmins([]);
      }
    } catch (error) {
      console.error("Fetch admin error:", error);
      Swal.fire("Error", "Gagal mengambil data admin", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // === 2. FILTER SEARCH ===
  const filteredAdmins = admins.filter((item) =>
    item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // === 3. HANDLE EDIT CLICK ===
  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };

  // === 4. HANDLE DELETE (Dengan Logger) ===
  const handleDelete = (id, username) => {
    Swal.fire({
      title: `Hapus Admin "${username}"?`,
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#9CA3AF",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      customClass: { popup: 'font-["Poppins"] rounded-xl' },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Fallback jika user ID redux kosong
          const currentUserId = user?.id || 0; 
          
          // Kirim request DELETE dengan query param userId untuk Activity Log
          const res = await fetch(`/api/admin/${id}?currentUserId=${currentUserId}`, {
            method: "DELETE",
          });

          const data = await res.json();

          if (res.ok) {
            Swal.fire("Terhapus!", "Akun admin berhasil dihapus.", "success");
            // Refresh data
            fetchAdmins();
          } else {
            throw new Error(data.message || "Gagal menghapus");
          }
        } catch (error) {
          Swal.fire("Gagal", error.message, "error");
        }
      }
    });
  };

  return (
    // Bungkus dengan AdminLayouts jika perlu
    // <AdminLayouts> 
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      <Head>
        <title>Kelola Admin - Divus Admin</title>
      </Head>

      {/* === HEADER === */}
       <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        
        {/* Search Bar */}
        <div className="relative w-1/3">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
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

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
            placeholder="Cari username atau role..."
          />
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">
              Hi, {user?.username || "Admin"}
            </p>
            <p className="text-xs text-gray-400">Online</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold uppercase border-2 border-gray-500">
            {user?.username ? user.username.charAt(0) : <User size={20} />}
          </div>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <div className="px-8 pt-8 animate-fade-in-up">
        
        {/* Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Manajemen Pegawai
            </h1>
            <p className="text-gray-500 font-medium">
              Kelola akses admin dan role pegawai
            </p>
          </div>

          <button
            className="bg-[#2D2D39] hover:bg-black text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            <span className="font-medium">Tambah Admin</span>
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6 text-center w-16">No</th>
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6 text-center">Role / Jabatan</th>
                  <th className="py-4 px-6 text-center w-40">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  // Loading Skeleton
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="py-4 px-6 text-center"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                      <td className="py-4 px-6"><div className="h-8 bg-gray-200 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : filteredAdmins.length === 0 ? (
                  // Empty State
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShieldAlert size={40} className="opacity-50" />
                        <p className="font-medium">Tidak ada data admin ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Data Rows
                  filteredAdmins.map((admin, index) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-center font-medium text-gray-500">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-700">
                        {admin.username}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                          {admin.role || "No Role"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(admin)}
                            className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                            title="Edit Data"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(admin.id, admin.username)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Hapus Data"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Info (Optional) */}
          {!isLoading && filteredAdmins.length > 0 && (
             <div className="px-6 py-4 border-t border-gray-100 text-sm text-gray-500">
                Total {filteredAdmins.length} admin terdaftar.
             </div>
          )}
        </div>
      </div>

      {/* === MODALS === */}
      
      {/* Modal Tambah Admin */}
      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchAdmins();
          setIsAddModalOpen(false);
        }}
      />

      {/* Modal Edit Admin */}
      {selectedAdmin && (
        <EditAdminModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAdmin(null);
          }}
          adminData={selectedAdmin}
          onSuccess={() => {
            fetchAdmins();
            setIsEditModalOpen(false);
            setSelectedAdmin(null);
          }}
        />
      )}
    </div>
    // </AdminLayouts> 
  );
};

export default AdminManage;