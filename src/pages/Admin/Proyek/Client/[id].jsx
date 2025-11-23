import React, { useState, useEffect } from "react";
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Plus, Search, ArrowLeft, Pencil, Trash2, LayoutGrid } from 'lucide-react';
import Swal from 'sweetalert2';

// HAPUS IMPORT LAYOUT (Karena sudah dihandle _app.js)
// import AdminLayouts from '../../../../layouts/AdminLayouts';

import AddProjectModal from '../../../../components/Modals/AddProjectModal';

const ClientProjects = () => {
  const router = useRouter();
  const { id } = router.query; 
  const { user } = useSelector((state) => state.auth); // Ambil data user login

  // State
  const [clientData, setClientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/clients/${id}`);
      const data = await res.json();
      if (res.ok) {
        setClientData(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      fetchData();
    }
  }, [router.isReady, id]);

  // --- PERBAIKAN LOG HAPUS ---
  const handleDeleteProject = (projectId) => {
    Swal.fire({
      title: 'Hapus Proyek?',
      text: "Data proyek ini akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Hapus'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/projects/${projectId}`, { 
              method: 'DELETE', 
              // WAJIB ADA: Headers & Body berisi userId agar log tercatat
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user?.id }) 
          });

          if (res.ok) {
            fetchData(); // Refresh data
            Swal.fire('Terhapus!', 'Proyek berhasil dihapus.', 'success');
          } else {
            throw new Error("Gagal menghapus");
          }
        } catch (error) {
          Swal.fire('Error', 'Gagal menghapus proyek.', 'error');
        }
      }
    });
  };

  // Filter Project
  const filteredProjects = clientData?.projects?.filter(p => 
    p.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // --- HAPUS WRAPPER ADMINLAYOUTS DI SINI ---
  return (
      <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
        <Head>
          <title>Proyek Client - Divus Admin</title>
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
              placeholder="Cari proyek.." 
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

        <div className="px-8 pt-8">
          {/* Header Content */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">
                Proyek {clientData ? clientData.client_name : "..."}
              </h1>
              <p className="text-gray-600 text-lg italic">
                Kelola Proyek {clientData ? clientData.client_name : "..."}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#2D2D39] hover:bg-black text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all"
              >
                <Plus size={18} />
                <span>Tambah Proyek</span>
              </button>
              
              <button 
                onClick={() => router.push('/Admin/Proyek/Kategori')} 
                className="bg-[#2D2D39] hover:bg-black text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all"
              >
                <LayoutGrid size={18} />
                <span>Kelola Bidang</span>
              </button>

              <button 
                onClick={() => router.back()}
                className="bg-[#1E1E2D] hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all"
              >
                <ArrowLeft size={18} />
                <span>Kembali</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-200/60">
                <tr>
                  <th className="py-4 px-6 font-semibold text-gray-700 text-center w-16 border-b border-gray-300">No</th>
                  <th className="py-4 px-6 font-semibold text-gray-700 border-b border-gray-300">Proyek</th>
                  <th className="py-4 px-6 font-semibold text-gray-700 border-b border-gray-300">Bidang</th>
                  <th className="py-4 px-6 font-semibold text-gray-700 text-center border-b border-gray-300">Tahun</th>
                  <th className="py-4 px-6 font-semibold text-gray-700 text-center border-b border-gray-300">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-500">Memuat Data...</td></tr>
                ) : filteredProjects.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-500">Belum ada proyek untuk client ini.</td></tr>
                ) : (
                  filteredProjects.map((project, index) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                      <td className="py-4 px-6 text-center text-gray-600">{index + 1}</td>
                      <td className="py-4 px-6 font-medium text-gray-800">{project.project_name}</td>
                      <td className="py-4 px-6 text-gray-700">{project.category?.bidang || "-"}</td>
                      <td className="py-4 px-6 text-center text-gray-700 font-medium">{project.tahun}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors" 
                            title="Hapus"
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

        {/* MODAL */}
        <AddProjectModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchData}
          clientId={id} 
        />

      </div>
  );
};

export default ClientProjects;