import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';

const FormEditProyek = ({ onClose, dataProyek, onSave }) => {
  const [customer, setCustomer] = useState("");
  const [namaProyek, setNamaProyek] = useState("");
  const [bidang, setBidang] = useState("");
  const [tahun, setTahun] = useState("");
  const [error, setError] = useState("");

  // Set nilai awal dari data proyek yang akan diedit
  useEffect(() => {
    if (dataProyek) {
      setCustomer(dataProyek.customer || "");
      setNamaProyek(dataProyek.namaProyek || "");
      setBidang(dataProyek.bidang || "");
      setTahun(dataProyek.tahun || "");
    }
  }, [dataProyek]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi tahun harus 4 digit angka
    if (!/^\d{4}$/.test(tahun)) {
      setError("Tahun harus terdiri dari 4 angka (contoh: 2025).");
      return;
    }

    setError("");
    const updatedData = {
      ...dataProyek,
      customer,
      namaProyek,
      bidang,
      tahun,
    };

    console.log("Data diperbarui:", updatedData);
    if (onSave) onSave(updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">
        <h2 className="text-lg font-semibold mb-2">Edit Proyek</h2>
        <p className="text-sm text-gray-500 mb-4">
          Perbarui informasi proyek di bawah ini
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {/* Customer */}
          <div>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none"
              required
            />
          </div>

          {/* Nama Proyek */}
          <div>
            <label className="block text-sm font-medium mb-1">Nama Proyek</label>
            <input
              type="text"
              value={namaProyek}
              onChange={(e) => setNamaProyek(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none"
              required
            />
          </div>

          {/* Bidang */}
          <div>
            <label className="block text-sm font-medium mb-1">Bidang</label>
            <input
              type="text"
              value={bidang}
              onChange={(e) => setBidang(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none"
              required
            />
          </div>

          {/* Tahun */}
          <div>
            <label className="block text-sm font-medium mb-1">Tahun</label>
            <input
              type="number"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none ${
                error ? "border-red-400 focus:ring-red-300" : "focus:ring-[#27D14C]"
              }`}
              required
            />
            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#27D14C] text-white rounded-lg text-sm hover:bg-[#20b540]"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormEditProyek;
