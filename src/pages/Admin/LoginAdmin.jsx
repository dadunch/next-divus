import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { Assets } from "../../assets"; // Pastikan path ini benar sesuai struktur Anda
import Link from 'next/link';
import { useRouter } from 'next/router';

const LoginAdmin = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // State untuk Form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // State untuk UI
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Tambahan loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validasi Input Kosong
    if (!username || !password) {
      setError("Username dan Password tidak boleh kosong!");
      return;
    }

    // 2. Reset error & set Loading
    setError("");
    setIsLoading(true);

    try {
      // 3. Panggil API Backend
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      // 4. Cek apakah Login Sukses (Status 200 OK)
      if (res.ok) {
        // Simpan data user ke Redux
        dispatch(login(data.user));
        
        // OPSIONAL: Simpan ke LocalStorage agar tidak logout saat di-refresh
        localStorage.setItem('adminUser', JSON.stringify(data.user));

        // Redirect ke Dashboard
        router.push('/Admin/Dashboard');
      } else {
        // Jika Gagal (Password salah / User tidak ada), ambil pesan dari API
        setError(data.message || "Terjadi kesalahan saat login.");
      }

    } catch (err) {
      // Jika server mati atau internet putus
      setError("Gagal menghubungi server. Cek koneksi internet Anda.");
      console.error("Login Error:", err);
    } finally {
      // Matikan loading
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-900 bg-opacity-80 bg-cover bg-center"
      style={{ backgroundImage: `url(${Assets.BGLogin})` }} // Pastikan Assets.BGLogin ada isinya
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 text-center">
        {/* Pastikan Assets.Logo ada isinya */}
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
              disabled={isLoading} // Matikan input saat loading
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
                disabled={isLoading} // Matikan input saat loading
              />

              {/* Tombol Mata */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 focus:outline-none"
              >
                {showPassword ? (
                  // Icon Mata Terbuka
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7 1.103-2.36 2.88-4.3 4.99-5.4M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                ) : (
                  // Icon Mata Tertutup
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Pesan Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4 text-sm text-left">
              {error}
            </div>
          )}

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-semibold font-['Poppins'] py-2 rounded-lg transition duration-200 shadow-lg shadow-black/30 
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#27D14C] hover:bg-[#20b93f]'}`}
          >
            {isLoading ? "Memproses..." : "Login"}
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