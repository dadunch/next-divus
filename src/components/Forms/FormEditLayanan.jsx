import React, { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';

const FormEditLayanan = ({ onClose, existingData }) => {
  // Data awal dari props (jika sedang edit layanan yang sudah ada)
  const [namaLayanan, setNamaLayanan] = useState(
    existingData?.namaLayanan || ""
  );
  const [items, setItems] = useState(
    existingData?.items || [
      "Business Feasibility & Evaluation",
      "Marketing Plan & Communications",
      "Strategic Planning",
    ]
  );

  // Icon/image
  const [icon, setIcon] = useState(null);
  const [preview, setPreview] = useState(existingData?.icon || null);

  const handleAddItem = () => {
    setItems([...items, ""]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleChangeItem = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIcon(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      namaLayanan,
      icon,
      items: items.filter((i) => i.trim() !== ""),
    };
    console.log("Data diperbarui:", formData);
    onClose(); // nanti bisa diganti logika update backend
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="relative bg-white p-6 rounded-xl w-[400px] shadow-lg">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-7 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-2">Edit Layanan</h2>
        <p className="text-sm text-gray-500 mb-4">
          Perbarui informasi layanan dan ikon yang mewakilinya
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Input nama layanan */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Layanan
            </label>
            <input
              type="text"
              value={namaLayanan}
              onChange={(e) => setNamaLayanan(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none"
              required
            />
          </div>

          {/* Upload Icon */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Upload Icon Layanan
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-md border"
                />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Format: JPG, PNG, atau SVG — Maksimal 2MB
            </p>
          </div>

          {/* Item layanan */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Item Layanan
            </label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleChangeItem(index, e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#27D14C] outline-none"
                    placeholder={`Item #${index + 1}`}
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="border border-red-400 text-red-500 px-2 py-1 rounded-md hover:bg-red-50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
              >
                + Tambah Item
              </button>
            </div>
          </div>

          {/* Tombol aksi */}
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
              Perbarui
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormEditLayanan;
