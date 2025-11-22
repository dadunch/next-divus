import React, { useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { Assets } from "../../assets";
import { useRouter } from 'next/router';
import Swal from 'sweetalert2'; // Import SweetAlert

const RegisterAdmin = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // --- STATE FORM ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  
  // --- STATE UI & DATA ---
  const [rolesList, setRolesList] = useState([]); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State untuk Custom Dropdown

  // 1. Ambil Data Role saat halaman dimuat
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/roles');
        const data = await res.json();
        if (res.ok) setRolesList(data);
      } catch (error) {
        console.error("Gagal ambil role", error);
      }
    };
    fetchRoles();
  }, []);

  // 2. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi Input Kosong
    if (!username || !password || !roleId) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Semua kolom wajib diisi!',
        width: '22em', // Ukuran compact
        confirmButtonColor: '#F59E0B',
        customClass: {
          popup: 'font-["Poppins"] rounded-2xl shadow-xl',
          title: 'text-lg font-bold',
          htmlContainer: 'text-sm'
        }
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create User (/api/users)
      const userRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error(userData.error || "Gagal membuat user");

      // Step 2: Assign Role (/api/employees)
      const empRes = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users_id: userData.id, role_id: roleId }),
      });
      
      if (!empRes.ok) throw new Error("Gagal assign role");

      // SUKSES
      dispatch(login({ username, roleId })); // Update Redux
      
      // Popup Sukses
      Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil!',
        text: 'Akun admin telah dibuat.',
        width: '22em',
        padding: '1.5em',
        iconColor: '#27D14C',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        customClass: {
          popup: 'font-["Poppins"] rounded-2xl shadow-xl',
          title: 'text-lg font-bold',
          htmlContainer: 'text-sm'
        }
      }).then(() => {
        router.push('/Admin/Dashboard');
      });

    } catch (err) {
      // Popup Error
      Swal.fire({
        icon: 'error',
        title: 'Gagal Register',
        text: err.message,
        width: '22em',
        confirmButtonColor: '#d33',
        customClass: {
          popup: 'font-["Poppins"] rounded-2xl shadow-xl',
          title: 'text-lg font-bold',
          htmlContainer: 'text-sm'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-900 bg-opacity-80 bg-cover bg-center"
      style={{ backgroundImage: `url(${Assets.BGLogin})` }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 text-center">
        <img src={Assets.Logo} alt="DIVUS Logo" className="mx-auto mb-3 w-40" />
        
        <h2 className="text-gray-700 font-semibold font-['Poppins'] mb-6 text-s">
          Register Dashboard Admin
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="text-left mb-4">
            <label className="block text-sm font-medium font-['Poppins'] text-gray-600 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Buat Username Baru"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 font-['Poppins'] text-gray-700 bg-white transition"
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className="text-left mb-4">
            <label className="block text-sm font-medium font-['Poppins'] text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 font-['Poppins'] text-gray-700 bg-white transition"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 focus:outline-none text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7 1.103-2.36 2.88-4.3 4.99-5.4M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Custom Role Dropdown (Hover Hijau & Konsisten) */}
          <div className="text-left mb-6 relative">
            <label className="block text-sm font-medium font-['Poppins'] text-gray-600 mb-1">
              Role (Jabatan)
            </label>
            
            {/* Trigger Button (Tampilannya mirip input biasa) */}
            <div 
              onClick={() => !isLoading && setIsDropdownOpen(!isDropdownOpen)}
              className={`
                w-full border rounded-lg px-3 py-2 
                flex justify-between items-center
                bg-white cursor-pointer
                transition-all duration-200
                ${isDropdownOpen ? 'ring-2 ring-green-500 border-transparent' : 'border-gray-200'}
              `}
            >
              <span className={`font-['Poppins'] ${roleId ? 'text-gray-700' : 'text-gray-400'}`}>
                {/* Menampilkan nama role yang dipilih */}
                {rolesList.find(r => r.id == roleId)?.role || "Pilih Role..."}
              </span>

              {/* Icon Chevron (Berputar saat dibuka) */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Dropdown Menu (Muncul saat state true) */}
            {isDropdownOpen && (
              <>
                {/* Backdrop Invisible untuk menutup saat klik luar */}
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsDropdownOpen(false)}
                ></div>

                <div className="absolute top-full left-0 w-full bg-white border border-gray-100 rounded-lg shadow-xl mt-2 z-40 overflow-hidden max-h-60 overflow-y-auto">
                  {rolesList.length > 0 ? (
                    rolesList.map((roleItem) => (
                      <div
                        key={roleItem.id}
                        onClick={() => {
                          setRoleId(roleItem.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`
                          px-4 py-3 cursor-pointer font-['Poppins'] text-sm transition-colors duration-150
                          ${roleId == roleItem.id ? 'bg-green-50 text-green-600 font-semibold' : 'text-gray-600'}
                          hover:bg-[#27D14C] hover:text-white
                        `}
                      >
                        {roleItem.role}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-400 font-['Poppins'] text-sm text-center">
                      Memuat Data...
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-semibold font-['Poppins'] py-2 rounded-lg transition duration-200 shadow-lg shadow-black/30 flex justify-center items-center
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#27D14C] hover:bg-[#20b93f]'
              }`}
          >
            {isLoading ? (
               <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : "Register"}
          </button>
        </form>

        <p className="text-gray-400 text-xs mt-6 font-['Poppins']">
          © 2025 PT Divus Global Mediacomm
        </p>
      </div>
    </div>
  );
};

export default RegisterAdmin;