import React, { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';

const Perusahaan = () => {
    const [logo, setLogo] = useState(null);
    const [form, setForm] = useState({
        nama: "PT Divus Global Mediacommm",
        email: "divusgrm@gmail.com",
        telepon: "+62-8522-0203-453",
        alamat:
            "Jl. Terusan Kapten Halim, Kampung Sukamulya, Kel. Salammulya, Kec. Pondoksalam, Kab. Purwakarta, Prov. Jawa Barat 41115",
        deskripsi:
            "PT Divus Global Mediacommm Adalah Perusahaan Konsultan Yang Bergerak Di Bidang Manajemen, Komunikasi Korporat, Dan Desain Grafis. Kami Menyediakan Layanan Mulai Dari Studi Kelayakan, Perencanaan Strategis, Riset Pasar, Hingga Identitas Korporasi Dan Media Promosi. Dengan Pengalaman Beragam Proyek, Divus Berkomitmen Menjadi Mitra Terpercaya Dalam Menghadirkan Solusi Profesional Dan Inovatif.",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) setLogo(URL.createObjectURL(file));
    };

    return (
        <div className="min-h-screen bg-[#F5F7FB] px-10 py-8 font-['Poppins']">
            <div className="flex justify-between items-center mb-9">
                {/* Kiri: Judul */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Perusahaan</h1>
                    <p className="text-gray-600 font-medium">Kelola Informasi Perusahaan</p>
                </div>

                {/* Kanan: Profil + Tombol */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium  ">Hi, Admin</span>
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">
                            A
                        </div>
                    </div>

                    <button className="px-6 py-2 bg-[#27D14C] text-white font-semibold font-['Poppins'] rounded-lg hover:bg-[#20b93f] transition shadow-md">
                        Register Admin
                    </button>
                </div>
            </div>


            {/* Form Container */}
            <div className="bg-white shadow-md rounded-xl p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                    Informasi Perusahaan
                </h2>
                <p className="text-gray-500 mb-6">
                    Perbarui detail perusahaan dan informasi kontak
                </p>

                {/* Upload Logo */}
                <div className="flex flex-col items-center border border-dashed border-gray-300 rounded-lg p-6 mb-6 w-60">
                    {logo ? (
                        <img
                            src={logo}
                            alt="Logo Preview"
                            className="w-24 h-24 object-contain mb-3"
                        />
                    ) : (
                        <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded-md mb-3">
                            <span className="text-gray-400 text-sm">Logo</span>
                        </div>
                    )}
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                        Upload Logo
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleLogoChange}
                            className="hidden"
                        />
                    </label>
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG hingga 2MB</p>
                    <p className="text-xs text-gray-400 mt-2">*Ukuran 50 x 50 pxl</p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="text-gray-700 font-medium text-sm">
                            Nama Perusahaan
                        </label>
                        <input
                            type="text"
                            name="nama"
                            value={form.nama}
                            onChange={handleChange}
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#27D14C]"
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 font-medium text-sm">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#27D14C]"
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 font-medium text-sm">Telepon</label>
                        <input
                            type="text"
                            name="telepon"
                            value={form.telepon}
                            onChange={handleChange}
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#27D14C]"
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 font-medium text-sm">Alamat</label>
                        <textarea
                            name="alamat"
                            value={form.alamat}
                            onChange={handleChange}
                            rows="2"
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#27D14C]"
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 font-medium text-sm">
                            Deskripsi
                        </label>
                        <textarea
                            name="deskripsi"
                            value={form.deskripsi}
                            onChange={handleChange}
                            rows="4"
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#27D14C]"
                        />
                    </div>
                </div>

                {/* Button Simpan */}
                <div className="flex justify-end mt-6">
                    <button className="px-6 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#111827] transition">
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Perusahaan;
