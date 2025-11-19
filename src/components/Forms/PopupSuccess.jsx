import React from "react";
import { CheckCircle } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/router';

const PopupSuccess = ({ title, message, highlight, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="relative bg-black text-white rounded-xl shadow-lg w-[380px] p-6 flex gap-3 items-start">
        {/* Icon sukses */}
        <CheckCircle className="text-[#27D14C] w-6 h-6 mt-1" />

        {/* Isi pesan */}
        <div>
          <h2 className="text-md font-semibold text-[#27D14C]">{title}</h2>
          <p className="text-sm text-gray-300 mt-1">
            {message}{" "}
            {highlight && (
              <span className="font-semibold text-[#27D14C]">
                ({highlight})
              </span>
            )}
            .
          </p>
        </div>

        {/* Tombol tutup */}
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

export default PopupSuccess;
