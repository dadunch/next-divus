import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { ChevronRight } from 'lucide-react';

const EditAdminModal = ({ isOpen, onClose, onSuccess, adminData }) => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Isi form saat modal dibuka
  useEffect(() => {
    if (isOpen && adminData) {
      setUsername(adminData.username || "");
      setRole(adminData.role || "");
    }
  }, [isOpen, adminData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/${adminData.id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role }),
      });

      if (!res.ok) throw new Error("Gagal update data!");

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data admin berhasil diperbarui.",
        iconColor: "#27D14C",
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          popup: 'font-["Poppins"] rounded-2xl shadow-xl',
        }
      });

      onSuccess();
      onClose();

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat memperbarui data.",
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#d33",
        customClass: {
          popup: 'font-["Poppins"] rounded-2xl shadow-xl',
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-3">
          <h2 className="text-2xl font-bold text-gray-900">Edit Admin</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Masukkan username"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Role
            </label>

            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg text-left text-gray-600 hover:bg-gray-50"
              onClick={() => {
                Swal.fire({
                  title: "Pilih Role",
                  input: "select",
                  inputOptions: {
                    SuperAdmin: "SuperAdmin",
                    Admin: "Admin",
                    Editor: "Editor",
                  },
                  inputPlaceholder: "Pilih Role",
                  showCancelButton: true,
                  confirmButtonText: "Pilih",
                  cancelButtonText: "Batal",
                  customClass: {
                    popup: 'font-["Poppins"] rounded-xl',
                  }
                }).then((result) => {
                  if (result.isConfirmed && result.value) {
                    setRole(result.value);
                  }
                });
              }}
            >
              <span>{role || "Pilih Role"}</span>
              <ChevronRight size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#2D2D39] text-white rounded-lg hover:bg-black shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Perbarui"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditAdminModal;
