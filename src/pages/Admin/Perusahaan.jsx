import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import { Search, Upload, Save, Calendar as CalendarIcon } from "lucide-react";
import Swal from "sweetalert2";
import AdminLayouts from "../../layouts/AdminLayouts";

// --- DATEPICKER IMPORTS ---
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { id } from "date-fns/locale";


const PerusahaanPage = () => {
  const { user } = useSelector((state) => state.auth); // 1. Ambil User Login
  const fileInputRef = useRef(null);

  // State Form
  const [logo, setLogo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);

  const [form, setForm] = useState({
    id: "",
    company_name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    business_field: "",
  });

  // 1. Fetch Data
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch("/api/company");
        const data = await res.json();
        if (res.ok && data) {
          setForm({
            id: data.id,
            company_name: data.company_name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            description: data.description || "",
            business_field: data.business_field || "",
          });

          if (data.established_date) {
            setSelectedDate(new Date(data.established_date));
          }

          setLogo(data.logo_url || null);
        }
      } catch (error) {
        console.error("Gagal load data perusahaan", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "File Terlalu Besar",
          text: "Ukuran file maksimal 2MB",
          confirmButtonColor: "#F59E0B",
          customClass: { popup: 'font-["Poppins"] rounded-xl' },
        });
        return;
      }
      setLogoFile(file);
      setLogo(URL.createObjectURL(file));
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      let logoData = logo;
      if (logoFile) {
        logoData = await toBase64(logoFile);
      }

      const payload = {
        ...form,
        established_date: selectedDate ? selectedDate.toISOString() : null,
        logo_url: logoData,
        userId: user?.id, // <--- 2. PASTIKAN INI DIKIRIM (User ID Login)
      };

      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil Disimpan!",
          text: "Informasi perusahaan telah diperbarui.",
          confirmButtonColor: "#27D14C",
          customClass: { popup: 'font-["Poppins"] rounded-xl' },
        });
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menyimpan data.",
        confirmButtonColor: "#EF4444",
        customClass: { popup: 'font-["Poppins"] rounded-xl' },
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center font-['Poppins']">
        Memuat Data...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      <Head>
        <title>Informasi Perusahaan - Divus Admin</title>
      </Head>

      {/* --- CUSTOM CSS UNTUK DATEPICKER --- */}
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker {
          font-family: "Poppins", sans-serif;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .react-datepicker__header {
          background-color: white;
          border-bottom: 1px solid #f3f4f6;
        }
        .react-datepicker__current-month {
          color: #374151;
          font-weight: 600;
        }
        .react-datepicker__day-name {
          color: #9ca3af;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #27d14c !important;
          color: white !important;
          border-radius: 0.5rem;
        }
        .react-datepicker__day:hover {
          background-color: #ecfdf5;
          color: #27d14c;
          border-radius: 0.5rem;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #6b7280;
        }
      `}</style>

      {/* TOP BAR */}
      <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className="relative w-1/3">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
            placeholder="Search.."
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">
              Hi, {user?.username || "Admin"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white uppercase font-bold border-2 border-gray-400">
            {user?.username ? user.username.charAt(0) : "A"}
          </div>
        </div>
      </header>

      <div className="px-8 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Informasi Perusahaan
          </h1>
          <p className="text-gray-500 italic font-medium">
            Kelola Informasi Perusahaan
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-medium text-gray-700 mb-6 border-b pb-4">
            Perbarui detail perusahaan dan informasi kontak
          </h2>

          {/* Upload Logo Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-8 items-start">
            <div className="w-40 h-40 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative group shrink-0">
              {logo ? (
                <img
                  src={logo}
                  alt="Company Logo"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <span className="text-gray-400 text-xs">No Logo</span>
              )}
              <div
                className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="text-white text-xs">Ganti</span>
              </div>
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Upload size={16} />
                Upload Logo
              </button>
              <p className="text-xs text-gray-400 mt-2">
                PNG, JPG hingga 2MB <br /> *Ukuran disarankan persegi (1:1)
              </p>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Perusahaan
              </label>
              <input
                type="text"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 rounded-lg px-4 py-3 text-gray-800 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bidang Usaha
              </label>
              <input
                type="text"
                name="business_field"
                value={form.business_field}
                onChange={handleChange}
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 rounded-lg px-4 py-3 text-gray-800 transition-colors"
                placeholder="Contoh: Jasa Konsultasi"
              />
            </div>

            {/* --- CUSTOM DATE PICKER --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Berdiri Sejak
              </label>
              <div className="relative w-full">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd MMMM yyyy"
                  locale={id}
                  placeholderText="Pilih tanggal berdiri"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 rounded-lg px-4 py-3 text-gray-800 transition-colors cursor-pointer"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <CalendarIcon size={18} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 rounded-lg px-4 py-3 text-gray-800 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telepon
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 rounded-lg px-4 py-3 text-gray-800 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 rounded-lg px-4 py-3 text-gray-800 transition-colors resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 rounded-lg px-4 py-3 text-gray-800 transition-colors resize-none"
              ></textarea>
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="mt-10 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#1E293B] hover:bg-black text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Save size={18} />
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerusahaanPage;
