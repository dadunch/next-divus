import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { Assets } from "../../assets";
import Link from 'next/link';
import { useRouter } from 'next/router';

const LoginAdmin = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Username dan Password tidak boleh kosong!");
      return;
    }

    setError("");
    // Simulate login success
    dispatch(login({ username }));
    router.push('/Admin/Dashboard');
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-900 bg-opacity-80 bg-cover bg-center"
      style={{ backgroundImage: `url(${Assets.BGLogin})` }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 text-center">
        <img src={Assets.Logo} alt="DIVUS Logo" className="mx-auto mb-3 w-40" />
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
                aria-label="Password"
              />

              {/* Tombol Mata */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 focus:outline-none"
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7 1.103-2.36 2.88-4.3 4.99-5.4M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Pesan Error */}
          {error && (
            <p className="text-red-500 text-sm font-['Poppins'] mb-4 text-left">
              {error}
            </p>
          )}

          {/* Tombol Login */}
          <button
            type="submit"
            className="w-full bg-[#27D14C] text-white font-semibold font-['Poppins'] py-2 rounded-lg hover:bg-[#20b93f] transition duration-200 shadow-lg shadow-black/30"
          >
            Login
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
