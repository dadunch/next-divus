import React, { useState } from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const AddAdminModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setRole("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password || !role) {
      Swal.fire('Data Tidak Lengkap', 'Username, password, dan role wajib diisi!', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          role,
          createdBy: user?.id
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Admin berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });

      onSuccess();
      handleClose();

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Terjadi kesalahan saat menyimpan admin.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="px-8 pt-8 pb-2 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tambah Admin</h2>
            <p className="text-gray-500 mt-1 text-sm">Masukkan informasi administrator</p>
          </div>

          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         text-gray-800 placeholder-gray-400"
              placeholder="Masukkan username admin"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         text-gray-800 placeholder-gray-400"
              placeholder="Password akun admin"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Bagian / Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         text-gray-800"
            >
              <option value="">Pilih Role</option>
              <option value="Admin">Admin</option>
              <option value="Pegawai">Pegawai</option>
              <option value="Kasir">Kasir</option>
              <option value="Owner">Owner</option>
            </select>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300
                         text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#2D2D39] text-white
                         font-medium hover:bg-black transition-colors shadow-lg
                         disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Tambah'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;
