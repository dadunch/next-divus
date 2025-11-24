import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { brands, regular, solid } from "@fortawesome/fontawesome-svg-core/import.macro";

export default function LayananFormMerged() {
  const [foto, setFoto] = useState(null);
  const [namaLayanan, setNamaLayanan] = useState("");
  const [layananDitawarkan, setLayananDitawarkan] = useState([]);
  const [layananInput, setLayananInput] = useState("");
  const [iconLayanan, setIconLayanan] = useState(null);
  const [deskripsiSingkat, setDeskripsiSingkat] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setFoto(URL.createObjectURL(file));
  };

  const tambahLayanan = () => {
    if (layananInput.trim() !== "") {
      setLayananDitawarkan([...layananDitawarkan, layananInput]);
      setLayananInput("");
    }
  };

  const hapusLayanan = (index) => {
    const updated = [...layananDitawarkan];
    updated.splice(index, 1);
    setLayananDitawarkan(updated);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Layanan</h1>

      {/* FOTO + UPLOAD */}
      <div className="flex gap-6 mb-6">
        <div className="w-64 h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          {foto ? (
            <img src={foto} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500">Preview Foto</span>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <label className="text-sm font-semibold mb-1">Upload Foto</label>
          <input type="file" onChange={handleFotoUpload} className="border p-2 rounded-md" />
        </div>
      </div>

      {/* NAMA LAYANAN */}
      <div className="mb-6">
        <label className="font-semibold text-sm">Nama Layanan</label>
        <input
          type="text"
          value={namaLayanan}
          onChange={(e) => setNamaLayanan(e.target.value)}
          className="w-full border p-2 rounded-md mt-1"
        />
      </div>

      {/* ICON LAYANAN */}
      <div className="mb-6">
        <label className="font-semibold text-sm">Icon Layanan</label>
        <div className="flex items-center gap-4 mt-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            onClick={() => setIconLayanan(solid("star"))}
          >
            Pilih Icon
          </button>

          {iconLayanan && (
            <FontAwesomeIcon icon={iconLayanan} size="2x" />
          )}

          {!iconLayanan && <span className="text-gray-500">Belum ada icon</span>}
        </div>
      </div>

      {/* LAYANAN YANG DITAWARKAN */}
      <div className="mb-6 bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-3">Layanan yang Ditawarkan</h2>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={layananInput}
            onChange={(e) => setLayananInput(e.target.value)}
            className="flex-1 border p-2 rounded-md"
            placeholder="Tambah layanan ..."
          />
          <button onClick={tambahLayanan} className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Tambah
          </button>
        </div>

        {layananDitawarkan.map((l, i) => (
          <div key={i} className="flex justify-between items-center bg-white p-3 rounded-md mb-2">
            <span>{l}</span>
            <button onClick={() => hapusLayanan(i)} className="px-3 py-1 bg-gray-300 rounded-md hover:bg-gray-400">
              Hapus
            </button>
          </div>
        ))}
      </div>

      {/* DESKRIPSI */}
      <div className="mb-6">
        <label className="font-semibold text-sm">Deskripsi Singkat</label>
        <textarea
          value={deskripsiSingkat}
          onChange={(e) => setDeskripsiSingkat(e.target.value)}
          rows={3}
          className="w-full border p-2 rounded-md mt-1"
        ></textarea>
      </div>

      <div className="mb-6">
        <label className="font-semibold text-sm">Deskripsi</label>
        <textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={5}
          className="w-full border p-2 rounded-md mt-1"
        ></textarea>
      </div>

      {/* BUTTON AKSI */}
      <div className="flex justify-between mt-10">
        <button className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Hapus Layanan</button>
        <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan Perubahan</button>
      </div>
    </div>
  );
}
