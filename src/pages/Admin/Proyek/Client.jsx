import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import {
  Plus,
  Search,
  Settings,
  Pencil,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import Swal from "sweetalert2";

// Import Layout
// import AdminLayouts from "../../../layouts/AdminLayouts"; // Uncomment jika perlu

// Import Modals
import AddClientModal from "../../../components/Modals/AddClientModal";
import EditClientModal from "../../../components/Modals/EditClientModal";

const ClientPage = () => {
  const router = useRouter();

  // 1. Ambil User dari Redux
  const { user } = useSelector((state) => state.auth || {});

  // 2. State Data & UI
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- STATE BARU UNTUK SORTING ---
  const [sortOrder, setSortOrder] = useState("az"); // Default: A-Z

  // State Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [openSortDropdown, setOpenSortDropdown] = useState(false);
    const sortDropdownRef = useRef(null);

  // 3. Fungsi Fetch Data
  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/clients");
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
    const handleClickOutside = (event) => {
    if (
      sortDropdownRef.current &&
      !sortDropdownRef.current.contains(event.target)
    ) {
      setOpenSortDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
  }, []);

  // 4. Filter Pencarian
  const filteredClients = clients.filter((item) =>
    item.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- LOGIKA SORTING (BARU) ---
  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortOrder) {
      case "az": // Nama A-Z
        return a.client_name.localeCompare(b.client_name);
      case "za": // Nama Z-A
        return b.client_name.localeCompare(a.client_name);
      case "most_projects": // Proyek Terbanyak
        return (b.projects?.length || 0) - (a.projects?.length || 0);
      case "least_projects": // Proyek Paling Sedikit
        return (a.projects?.length || 0) - (b.projects?.length || 0);
      default:
        return 0;
    }
  });

  // 5. Handle Tombol Edit Diklik
  const handleEditClick = (client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  // 6. Handle Delete
  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Client?",
      text: "Data client dan proyek terkait akan dihapus permanen!",
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
          const res = await fetch(`/api/clients/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user?.id }),
          });

          if (res.ok) {
            setClients((prev) => prev.filter((client) => client.id !== id));
            Swal.fire("Terhapus!", "Client berhasil dihapus.", "success");
          } else {
            throw new Error("Gagal menghapus");
          }
        } catch (error) {
          Swal.fire("Gagal", "Terjadi kesalahan server.", "error");
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
      <header className="bg-[#1E1E2D] px-4 md:px-8 py-4 flex flex-row justify-between items-center shadow-md sticky top-0 z-30 gap-4">
        <div className="relative flex-1 md:max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
            placeholder="Cari client..."
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">
              Hi, {user?.username || "Admin"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold uppercase border-2 border-gray-400">
            {user?.username ? user.username.charAt(0) : "A"}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="px-8 pt-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">
              Client / Customer
            </h1>
            <p className="text-gray-500 italic text-sm md:text-lg font-medium">
              Kelola Daftar Client & Partner
            </p>
          </div>

          <div className="flex gap-3">
            {/* --- DROPDOWN SORTING (BARU) --- */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setOpenSortDropdown(!openSortDropdown)}
                className="w-full bg-white border border-gray-300 text-gray-700
                              py-2.5 pl-4 pr-10 rounded-lg shadow-sm
                              cursor-pointer text-sm font-medium text-left
                              focus:outline-none focus:ring-2 focus:ring-[#27D14C]
                              transition-all duration-200
                              hover:border-[#27D14C]"
              >
                {sortOrder === "az" && "Abjad A-Z"}
                {sortOrder === "za" && "Abjad Z-A"}
                {sortOrder === "most_projects" && "Proyek Terbanyak"}
                {sortOrder === "least_projects" && "Proyek Paling Sedikit"}
                
              </button>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ArrowUpDown size={16} />
              </div>

              {openSortDropdown && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 min-w-[190px] w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">

                  {[
                    { label: "Abjad A-Z", value: "az" },
                    { label: "Abjad Z-A", value: "za" },
                    { label: "Proyek Terbanyak", value: "most_projects" },
                    { label: "Proyek Paling Sedikit", value: "least_projects" },
                    
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortOrder(opt.value);
                        setOpenSortDropdown(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-sm font-medium hover:bg-green-50 hover:text-[#27D14C] transition-colors ${
                        sortOrder === opt.value
                          ? "bg-green-50 text-[#27D14C]"
                          : "text-gray-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            

            <button
              className="bg-[#2D2D39] hover:bg-black text-white px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={20} />
              <span>Tambah Client</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-4 px-6 font-semibold text-gray-700 text-center w-16 border-b border-gray-200">
                  No
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 border-b border-gray-200">
                  Customer
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-center border-b border-gray-200">
                  Logo
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-center border-b border-gray-200">
                  Jumlah Proyek
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-center border-b border-gray-200">
                  Proyek
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-center border-b border-gray-200">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-gray-500 font-medium"
                  >
                    Sedang memuat data...
                  </td>
                </tr>
              ) : sortedClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-gray-500 font-medium"
                  >
                    Tidak ada data client ditemukan.
                  </td>
                </tr>
              ) : (
                // Menggunakan sortedClients untuk map
                sortedClients.map((client, index) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <td className="py-4 px-6 text-center text-gray-600">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-800">
                      {client.client_name}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center h-12 w-full items-center">
                        {client.client_logo ? (
                          <img
                            src={client.client_logo}
                            alt="Logo"
                            className="h-full max-w-[100px] object-contain"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No Logo</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center font-semibold text-gray-700">
                      {client.projects ? client.projects.length : 0}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() =>
                          router.push(`/Admin/Proyek/Client/${client.id}`)
                        }
                        className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
                        title="Lihat Detail Proyek"
                      >
                        <Settings size={18} />
                      </button>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {/* Tombol Edit */}
                        <button
                          onClick={() => handleEditClick(client)}
                          className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => handleDelete(client.id)}
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

      {/* ================= MODALS ================= */}

      {/* Modal Tambah */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchClients}
      />

      {/* Modal Edit */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchClients}
        clientData={selectedClient}
        userId={user?.id}
      />
    </div>
  );
};

export default ClientPage;
