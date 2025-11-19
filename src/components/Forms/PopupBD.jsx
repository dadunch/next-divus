import React from "react";
import { CheckCircle } from "lucide-react"; // pastikan sudah install lucide-react
import Link from 'next/link';
import { useRouter } from 'next/router';

const PopupBD = ({ namaProduk, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="relative bg-black text-white rounded-xl shadow-lg w-[380px] p-6 flex gap-3 items-start">
        <CheckCircle className="text-[#27D14C] w-6 h-6 mt-1" />
        <div>
          <h2 className="text-md font-semibold text-[#27D14C]">
            Produk Berhasil Dihapus
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            <span className="font-semibold text-[#27D14C]">({namaProduk})</span>{" "}
            telah dihapus dari daftar produk.
          </p>
        </div>
        {/* Tombol X */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default PopupBD;
