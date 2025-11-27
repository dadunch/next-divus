import React, { useState, useEffect } from "react";
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

// Layout
import AdminLayouts from '../../layouts/AdminLayouts';

// Modals
import AddAdminModal from '../../components/Modals/AddAdminModal';
import EditAdminModal from '../../components/Modals/EditAdminModal';

const AdminManage = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Fetch Data Admin
  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();

      if (res.ok) {
        setAdmins(data);
      } else {
        setAdmins([]);
      }
    } catch (error) {
      console.error("Fetch admin error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = admins.filter(item =>
    item.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Admin?',
      text: "Akun admin akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      customClass: { popup: 'font-["Poppins"] rounded-xl' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/admin/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });

          if (res.ok) {
            setAdmins(prev => prev.filter(a => a.id !== id));
            Swal.fire('Terhapus!', 'Akun berhasil dihapus.', 'success');
          }
        } catch (error) {
          Swal.fire('Gagal', 'Terjadi kesalahan server.', 'error');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      <Head>
        <title>Kelola Admin - Divus Admin</title>
      </Head>

      {/* SEARCH BAR */}
      <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className="relative w-1/3">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 rounded-full bg-white"
            placeholder="Cari username admin.."
          />
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm text-white hidden md:block">Hi, {user?.username}</p>
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold uppercase">
            {user?.username ? user.username.charAt(0) : "A"}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="px-8 pt-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Pegawai / Admin</h1>
            <p className="text-gray-600 text-lg italic">Kelola Data admin & Role</p>
          </div>

          <button
            className="bg-[#2D2D39] hover:bg-black text-white px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            <span>Tambah Admin</span>
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-4 px-6 text-center">No</th>
                <th className="py-4 px-6">Username</th>
                <th className="py-4 px-6 text-center">Bagian / Role</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    Sedang memuat data...
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    Tidak ada admin ditemukan.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin, index) => (
                  <tr key={admin.id} className="border-b">
                    <td className="py-4 px-6 text-center">{index + 1}</td>
                    <td className="py-4 px-6">{admin.username}</td>
                    <td className="py-4 px-6 text-center">{admin.role}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEditClick(admin)}
                          className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
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
      </div>

      {/* MODAL TAMBAH */}
      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAdmins}
      />

      {/* MODAL EDIT */}
      <EditAdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        adminData={selectedAdmin}
        onSuccess={fetchAdmins}
      />
    </div>
  );
};

export default AdminManage;
