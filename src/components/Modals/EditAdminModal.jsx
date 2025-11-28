import React, { useState, useEffect, useRef } from 'react';
import { X, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const EditAdminModal = ({ isOpen, onClose, onSuccess, adminData }) => {
  // Ambil user yang sedang login untuk keperluan Log Aktivitas
  const { user } = useSelector((state) => state.auth);

  // Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // Kosong = tidak ubah password
  const [roleId, setRoleId] = useState("");
  
  // Data State
  const [rolesList, setRolesList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown UI State
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Fetch Master Data Roles saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        try {
          const res = await fetch('/api/roles');
          const data = await res.json();
          if (res.ok) setRolesList(data);
        } catch (err) {
          console.error("Gagal memuat roles", err);
        }
      };
      fetchRoles();
    }
  }, [isOpen]);

  // 2. Populate Form dengan Data Admin yang dipilih
  useEffect(() => {
    if (isOpen && adminData) {
      setUsername(adminData.username || "");
      // Pastikan backend mengirim role_id (angka), bukan role name (string)
      setRoleId(adminData.role_id || ""); 
      setPassword(""); // Reset password field
    }
  }, [isOpen, adminData]);

  // 3. Logic: Tutup Dropdown saat klik di luar (Click Outside)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper: Ambil Nama Role berdasarkan ID untuk ditampilkan di tombol
  const getSelectedRoleLabel = () => {
    const selected = rolesList.find((r) => r.id == roleId);
    return selected ? selected.role : "Pilih Jabatan";
  };

  // 4. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentUserId = user?.id || 1;

      // Persiapkan Payload sesuai API PUT
      const payload = {
        username,
        role_id: parseInt(roleId), // Pastikan dikirim sebagai Integer
        currentUserId,             // Untuk Logger Backend
        ...(password && { password }) // Hanya kirim password jika diisi
      };

      const res = await fetch(`/api/admin/${adminData.id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Gagal update data!");

      // Sukses
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data admin berhasil diperbarui.",
        iconColor: "#27D14C",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'font-["Poppins"] rounded-2xl' }
      });

      onSuccess(); // Refresh table parent
      onClose();   // Tutup modal

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.message,
        customClass: { popup: 'font-["Poppins"] rounded-2xl' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">

        {/* HEADER */}
        <div className="px-8 pt-6 pb-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Data Pegawai</h2>
            <p className="text-xs text-gray-500 mt-1">Perbarui informasi akses pengguna</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* INPUT USERNAME */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#27D14C] focus:border-[#27D14C] focus:outline-none transition-all"
              placeholder="Username"
            />
          </div>

          {/* INPUT PASSWORD (OPTIONAL) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password Baru <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#27D14C] focus:border-[#27D14C] focus:outline-none transition-all placeholder-gray-400"
              placeholder="Kosongkan jika tidak ingin mengganti"
            />
          </div>

          {/* CUSTOM DROPDOWN ROLE (Updated Design) */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Jabatan / Role
            </label>

            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 shadow-sm
                ${isRoleDropdownOpen 
                  ? 'border-[#27D14C] ring-4 ring-[#27D14C]/10 bg-white' 
                  : 'border-gray-300 bg-white hover:border-[#27D14C]'
                }
              `}
            >
              <span className={`text-base font-medium ${roleId ? 'text-gray-900' : 'text-gray-400'}`}>
                 {rolesList.length > 0 ? getSelectedRoleLabel() : "Memuat data..."}
              </span>
              
              {/* Chevron Icon Animation */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180 text-[#27D14C]' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu Items */}
            {isRoleDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
                {rolesList.length > 0 ? (
                  rolesList.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRoleId(r.id);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0
                        ${parseInt(roleId) === r.id 
                          ? 'bg-green-50 text-[#27D14C]' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#27D14C]'
                        }
                      `}
                    >
                      {r.role}
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-3 text-sm text-gray-400 italic text-center">
                    Tidak ada data role
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-[#2D2D39] text-white rounded-xl font-medium hover:bg-black shadow-lg disabled:opacity-70 flex justify-center items-center gap-2 transition transform active:scale-95"
            >
              {isSubmitting ? (
                 <>
                   <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                   Menyimpan...
                 </>
              ) : (
                 <>
                   <Save size={18} /> Simpan
                 </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditAdminModal;