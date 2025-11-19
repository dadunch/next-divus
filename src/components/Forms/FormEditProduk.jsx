import React, { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';

const FormEditProduk = ({ item, onClose }) => {
  // ✅ Tetapkan nilai awal dengan fallback agar tidak error meskipun `item` belum ada
  const kategoriList = [
    "Research & Survey",
    "Corporate ID",
    "Product & Services Knowledge",
    "Report & Journal",
  ];

  const [formData, setFormData] = useState({
    nama: item?.nama || "",
    kategori: item?.kategori || kategoriList[0],
    mitra: item?.mitra || "",
    tahun: item?.tahun || "",
    deskripsi: item?.deskripsi || "",
  });

  const [preview, setPreview] = useState(item?.gambar || null);
  const [file, setFile] = useState(null);

  if (!item) return null; // ✅ Aman: Hook sudah dideklarasikan di atas

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Data produk diubah:", {
      ...formData,
      gambar: file || item.gambar,
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

        <h2 className="text-lg font-semibold mb-2">Edit Produk</h2>
        <p className="text-sm text-gray-500 mb-4">
          Ubah detail produk yang dipilih.
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {/* Nama Produk */}
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            placeholder="Nama Produk"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none"
            required
          />

          {/* Dropdown Kategori */}
          <select
            name="kategori"
            value={formData.kategori}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none"
          >
            {kategoriList.map((kategori, index) => (
              <option key={index} value={kategori}>
                {kategori}
              </option>
            ))}
          </select>

          {/* Mitra */}
          <input
            type="text"
            name="mitra"
            value={formData.mitra}
            onChange={handleChange}
            placeholder="Mitra"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none"
          />

          {/* Tahun */}
          <input
            type="text"
            name="tahun"
            value={formData.tahun}
            onChange={handleChange}
            placeholder="Tahun"
            maxLength={4}
            pattern="\d{4}"
            title="Masukkan tahun dengan 4 angka"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none"
          />

          {/* Deskripsi */}
          <textarea
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
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

export default FormEditProduk;
