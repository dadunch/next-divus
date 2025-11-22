import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { Assets } from "../../assets"; 
import Link from 'next/link';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2'; // <--- INI YANG SEBELUMNYA HILANG!

const LoginAdmin = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // State Form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // State UI
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validasi Input Kosong
    if (!username || !password) {
      setError("Username dan Password tidak boleh kosong!");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // 2. Panggil API Backend
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      // 3. Cek Status Login
      if (res.ok) {
        // A. Simpan ke Redux (Sesi saat ini)
        dispatch(login(data.user));
        
        // B. Simpan ke LocalStorage (Agar tahan refresh)
        localStorage.setItem('adminUser', JSON.stringify(data.user));

        // C. Tampilkan Popup Sukses
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil!',
          text: `Selamat datang kembali, ${data.user.username}`,
          width: '22em',
          padding: '1.5em',
          iconColor: '#27D14C', // Warna Hijau Divus
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          customClass: {
            popup: 'font-["Poppins"] rounded-2xl shadow-xl',
            title: 'text-lg font-bold text-gray-700',
            htmlContainer: 'text-sm text-gray-500'
          }
        }).then(() => {
          router.push('/Admin/Dashboard');
        });

      } else {
        // Login Gagal (Password Salah / User Tidak Ada)
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: data.message || "Periksa username dan password Anda.",
          width: '22em',
          confirmButtonColor: '#d33',
          customClass: {
            popup: 'font-["Poppins"] rounded-2xl shadow-xl',
            title: 'text-lg font-bold',
            htmlContainer: 'text-sm',
            confirmButton: 'font-["Poppins"] rounded-lg text-sm px-4 py-2'
          }
        });
      }

    } catch (err) {
      // Error Jaringan / Frontend Crash
      console.error("LOGIN ERROR:", err); // Cek console browser jika error lagi
      
      Swal.fire({
        icon: 'warning',
        title: 'Terjadi Kesalahan',
        text: "Gagal memproses login. Cek console browser untuk detail.",
        width: '22em',
        confirmButtonColor: '#F59E0B',
        customClass: {
          popup: 'font-["Poppins"] rounded-2xl',
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
        
        <img src={Assets.Logo || "/assets/logo.png"} alt="DIVUS Logo" className="mx-auto mb-3 w-40" />
        
        <h2 className="text-gray-700 font-semibold font-['Poppins'] mb-6 text-s">
          Login Dashboard Admin
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="text-left mb-4">
            <label className="block text-sm font-medium font-['Poppins'] text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="User"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 font-['Poppins'] text-gray-700"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="text-left mb-6">
            <label className="block text-sm font-medium font-['Poppins'] text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 font-['Poppins'] text-gray-700"
                disabled={isLoading}
              />

              {/* Tombol Toggle Password */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 focus:outline-none text-gray-500 hover:text-green-600 transition"
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

          {/* Pesan Error Teks (Opsional, karena sudah ada popup) */}
          {error && (
            <div className="text-red-500 text-xs text-left mb-4 font-['Poppins']">
              * {error}
            </div>
          )}

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-semibold font-['Poppins'] py-2 rounded-lg transition duration-200 shadow-lg shadow-black/30 flex justify-center items-center
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#27D14C] hover:bg-[#20b93f]'}`}
          >
            {isLoading ? (
               <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : "Login"}
          </button>
        </form>

        <p className="text-gray-400 text-xs mt-6 font-['Poppins']">
          © 2025 PT Divus Global Mediacomm
        </p>
      </div>
    </div>
  );
};

export default LoginAdmin;