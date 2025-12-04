import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const EditAdminModal = ({ isOpen, onClose, onSuccess, adminData }) => {
  const { user } = useSelector((state) => state.auth);

  // FORM STATE
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  // DATA & UI STATE
  const [rolesList, setRolesList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // DROPDOWN
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // FETCH ROLE
  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        try {
          const res = await fetch('/api/roles');
          const data = await res.json();
          if (res.ok) setRolesList(data);
        } catch (err) {
          console.error("Gagal ambil role", err);
        }
      };
      fetchRoles();
    }
  }, [isOpen]);

  // POPULATE EDIT DATA
  useEffect(() => {
    if (isOpen && adminData) {
      setUsername(adminData.username || "");
      setPassword("");
      
      // LOGIC POPULATE ROLES:
      if (adminData.roles && Array.isArray(adminData.roles)) {
        setSelectedRoleIds(adminData.roles.map(r => r.id));
      } else if (adminData.role_ids && Array.isArray(adminData.role_ids)) {
         setSelectedRoleIds(adminData.role_ids);
      } else if (adminData.role_id) {
        setSelectedRoleIds([adminData.role_id]);
      } else {
        setSelectedRoleIds([]);
      }

      setIsRoleDropdownOpen(false);
    }
  }, [isOpen, adminData]);

  // CLICK OUTSIDE DROPDOWN
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ROLE LABEL GENERATOR
  const getSelectedRoleLabel = () => {
    if (selectedRoleIds.length === 0) return "Pilih Jabatan";
    
    const selectedNames = rolesList
      .filter((r) => selectedRoleIds.includes(r.id))
      .map((r) => r.role);

    if (selectedNames.length > 2) {
      return `${selectedNames.slice(0, 2).join(", ")} +${selectedNames.length - 2} lainnya`;
    }
    
    return selectedNames.join(", ");
  };

  // TOGGLE SELECTION HANDLER
  const toggleRole = (id) => {
    setSelectedRoleIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((roleId) => roleId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // CLOSE HANDLER
  const handleClose = () => {
    setIsRoleDropdownOpen(false);
    onClose();
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        username,
        role_ids: selectedRoleIds, 
        currentUserId: user?.id || 1,
        ...(password && { password }),
      };

      const res = await fetch(`/api/admin/${adminData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal update data");

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data pegawai berhasil diperbarui.",
        iconColor: "#27D14C",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'font-["Poppins"] rounded-2xl' },
      });

      onSuccess();
      handleClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        customClass: { popup: 'font-["Poppins"] rounded-2xl' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-['Poppins']">
      {/* PERBAIKAN DISINI: 
         Saya menghapus class 'overflow-hidden' agar dropdown bisa tampil keluar dari kotak modal.
      */}
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in-up">

        {/* HEADER */}
        <div className="px-8 pt-8 pb-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Pegawai</h2>
            <p className="text-xs text-gray-500 mt-1">Ubah informasi login & role pegawai</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* USERNAME */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#27D14C] focus:border-[#27D14C] focus:outline-none transition-all placeholder-gray-400"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password Baru
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kosongkan jika tidak diganti"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#27D14C] focus:border-[#27D14C] focus:outline-none transition-all placeholder-gray-400"
            />
          </div>

          {/* CUSTOM MULTI-SELECT DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Jabatan / Role (Multi-select)
            </label>

            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 shadow-sm
                ${isRoleDropdownOpen
                  ? "border-[#27D14C] ring-4 ring-[#27D14C]/10 bg-white"
                  : "border-gray-300 bg-white hover:border-[#27D14C]"
                }
              `}
            >
              <span className={`text-base font-medium truncate pr-2 ${selectedRoleIds.length > 0 ? "text-gray-900" : "text-gray-400"}`}>
                {rolesList.length > 0 ? getSelectedRoleLabel() : "Memuat data..."}
              </span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                  isRoleDropdownOpen ? "rotate-180 text-[#27D14C]" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-48 overflow-y-auto">
                {rolesList.length > 0 ? (
                  rolesList.map((r) => {
                    const isSelected = selectedRoleIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleRole(r.id)}
                        className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 flex justify-between items-center
                          ${isSelected
                            ? "bg-green-50 text-[#27D14C]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-[#27D14C]"
                          }
                        `}
                      >
                        <span>{r.role}</span>
                        {isSelected && <Check size={16} className="text-[#27D14C]" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-5 py-3 text-sm text-gray-400 italic text-center">
                    Tidak ada data role
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-[#2D2D39] text-white font-medium hover:bg-black transition-all shadow-lg disabled:opacity-70 flex justify-center items-center gap-2 transform active:scale-95"
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