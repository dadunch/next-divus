import React, { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';

const FormTambahProduk = ({ onClose }) => {
  const kategoriOptions = [
    "Research & Survey",
    "Corporate ID",
    "Product & Services Knowledge",
    "Report & Journal",
  ];

  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [mitra, setMitra] = useState("");
  const [tahun, setTahun] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setGambar(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!/^\d{4}$/.test(tahun)) {
      setError("Tahun harus terdiri dari 4 angka (contoh: 2024)");
      return;
    }

    setError("");

    console.log("Produk baru ditambahkan:", {
      nama,
      kategori,
      mitra,
      tahun,
      deskripsi,
      gambar,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="relative bg-white p-6 rounded-xl w-[500px] shadow-lg">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-2">Tambah Produk</h2>
        <p className="text-sm text-gray-500 mb-4">
          Tambahkan produk baru beserta detail dan gambarnya.
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {/* Nama Produk */}
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama Produk"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none"
          />

          {/* Dropdown Kategori */}
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#27D14C] outline-none"
          >
            <option value="">-- Pilih Kategori --</option>
            {kategoriOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Mitra */}
          <input
            type="text"
            value={mitra}
            onChange={(e) => setMitra(e.target.value)}
            placeholder="Mitra"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none"
          />

          {/* Tahun */}
          <input
            type="text"
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            placeholder="Tahun (contoh: 2024)"
            maxLength={4}
            pattern="\d{4}"
            title="Masukkan tahun dengan 4 angka"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Deskripsi */}
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Deskripsi"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none h-20 resize-none"
          ></textarea>

          {/* Upload Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar Produk
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-600"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg mt-2 border"
              />
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-4 py-1.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#27D14C] text-white rounded-lg text-sm hover:bg-[#20b540]"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormTambahProduk;
