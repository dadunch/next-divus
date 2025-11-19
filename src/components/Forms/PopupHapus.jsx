import React from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';

const PopupHapus = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-lg w-[480px] p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Apakah Anda Yakin?
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Data akan dihapus secara permanen dari sistem.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupHapus;
