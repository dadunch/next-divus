import React, { useState, useEffect } from "react";
import Head from 'next/head';
import { useRouter } from 'next/router'; // 1. IMPORT USEROUTER
import { useSelector } from 'react-redux';
import { Plus, Search, Settings, Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

// Import Layout & Modal
import AdminLayouts from '../../../layouts/AdminLayouts';
import AddClientModal from '../../../components/Modals/AddClientModal';

const ClientPage = () => {
  const router = useRouter(); // 2. INISIALISASI ROUTER
  
  // Ambil User dari Redux
  const { user } = useSelector((state) => state.auth);

  // State Data & UI
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fungsi Fetch Data
  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      
      if (res.ok) {
        setClients(data);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error("Error fetch clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Filter Pencarian
  const filteredClients = clients.filter(item => 
    item.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Delete
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Client?',
      text: "Data client ini akan dihapus permanen!",
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
          const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
          
          if (res.ok) {
            setClients(prev => prev.filter(client => client.id !== id));
            Swal.fire('Terhapus!', 'Client berhasil dihapus.', 'success');
          } else {
            throw new Error("Gagal menghapus");
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
          <title>Client / Customer - Divus Admin</title>
        </Head>

        {/* TOP BAR */}
        <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
          <div className="relative w-1/3">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm" 
              placeholder="Cari nama client.." 
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-white">Hi, {user?.username || "Admin"}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold uppercase border-2 border-gray-400">
               {user?.username ? user.username.charAt(0) : "A"}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="px-8 pt-8">
          
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">Client / Customer</h1>
              <p className="text-gray-600 text-lg italic">Kelola Daftar Client & Partner</p>
            </div>
            
            <button 
              className="bg-[#2D2D39] hover:bg-black text-white px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={20} />
              <span>Tambah Client</span>
            </button>
          </div>

          {/* TABEL DATA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-4 px-6 font-semibold text-gray-700 text-center w-16 border-b border-gray-200">No</th>
                  <th className="py-4 px-6 font-semibold text-gray-700 border-b border-gray-200">Customer</th>
                  <th className="py-4 px-6 font-semibold text-gray-700 text-center border-b border-gray-200">Logo</th>
                  <th className="py-4 px-6 font-semibold text-gray-700 text-center border-b border-gray-200">Jumlah Proyek</th>
                  <th className="py-4 px-6 font-semibold text-gray-700 text-center border-b border-gray-200">Proyek</th>
                  <th className="py-4 px-6 font-semibold text-gray-700 text-center border-b border-gray-200">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-500 font-medium">Sedang memuat data...</td></tr>
                ) : filteredClients.length === 0 ? ( 
                  <tr><td colSpan={6} className="py-10 text-center text-gray-500 font-medium">Tidak ada data client ditemukan.</td></tr>
                ) : (
                  filteredClients.map((client, index) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                      <td className="py-4 px-6 text-center text-gray-600">{index + 1}</td>
                      <td className="py-4 px-6 font-medium text-gray-800">{client.client_name}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center h-12 w-full items-center">
                          {client.client_logo ? (
                            <img src={client.client_logo} alt="Logo" className="h-full max-w-[100px] object-contain"/>
                          ) : (<span className="text-xs text-gray-400">No Logo</span>)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-gray-700">
                        {client.projects ? client.projects.length : 0}
                      </td>
                      
                      {/* TOMBOL PROYEK (FIXED LINK) */}
                      <td className="py-4 px-6 text-center">
                        <button 
                          // 3. NAVIGASI KE HALAMAN DETAIL PROYEK
                          onClick={() => router.push(`/Admin/Proyek/Client/${client.id}`)}
                          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
                          title="Lihat Detail Proyek"
                        >
                          <Settings size={18} />
                        </button>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDelete(client.id)} className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
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

        <AddClientModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchClients} 
        />

      </div>
  );
};

export default ClientPage;