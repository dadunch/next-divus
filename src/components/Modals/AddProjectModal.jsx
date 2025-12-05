import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const AddProjectModal = ({ isOpen, onClose, onSuccess, clientId }) => {
  const { user } = useSelector((state) => state.auth);
  
  // State Data
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    project_name: '',
    category_id: '',
    tahun: new Date().getFullYear()
  });

  // State UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  // 1. Fetch Kategori saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error("Gagal load kategori", err));
    }
  }, [isOpen]);

  // 2. Click Outside untuk menutup DROPDOWN (bukan modal)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.project_name || !formData.category_id || !formData.tahun) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Mohon isi semua form.',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          client_id: clientId,
          userId: user?.id
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Proyek baru ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
      
      onSuccess();
      handleClose();

    } catch (error) {
      Swal.fire('Error', 'Gagal menambahkan proyek', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Form saat tutup
  const handleClose = () => {
    setFormData({ project_name: '', category_id: '', tahun: new Date().getFullYear() });
    setIsDropdownOpen(false);
    onClose();
  };

  const getSelectedCategoryLabel = () => {
    const selected = categories.find(c => c.id == formData.category_id);
    return selected ? selected.bidang : "Pilih Bidang...";
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-['Poppins']"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100 overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-8 pt-8 pb-2 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tambah Proyek Baru</h2>
            <p className="text-gray-500 mt-1 text-sm">Masukkan informasi proyek</p>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-gray-100 hover:bg-red-50 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Input Nama Proyek */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Proyek</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#27D14C] transition-all"
              placeholder="Contoh: Jasa Konsultasi IT"
              value={formData.project_name}
              onChange={e => setFormData({...formData, project_name: e.target.value})}
            />
          </div>

          {/* Custom Dropdown Bidang */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Bidang (Kategori)</label>
            
            {/* Trigger Button */}
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`
                w-full border rounded-lg px-4 py-3 flex justify-between items-center cursor-pointer bg-white transition-all duration-200
                ${isDropdownOpen 
                  ? 'border-[#27D14C] ring-2 ring-[#27D14C]/20' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <span className={`${formData.category_id ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                {getSelectedCategoryLabel()}
              </span>
              <ChevronDown 
                size={20} 
                className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </div>

            {/* Dropdown Menu List */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setFormData({...formData, category_id: cat.id});
                        setIsDropdownOpen(false);
                      }}
                      className={`
                        px-4 py-3 cursor-pointer text-sm flex justify-between items-center transition-colors
                        ${formData.category_id == cat.id 
                          ? 'bg-green-50 text-[#27D14C] font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#27D14C]'
                        }
                      `}
                    >
                      {cat.bidang}
                      {formData.category_id == cat.id && <Check size={16} />}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm italic">
                    Belum ada bidang. Silakan tambah di menu "Kelola Bidang".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Tahun */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tahun</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#27D14C] transition-all"
              value={formData.tahun}
              onChange={e => setFormData({...formData, tahun: e.target.value})}
              placeholder="YYYY"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-lg bg-[#2D2D39] text-white font-medium hover:bg-black transition-colors shadow-lg flex items-center gap-2"
            >
              {isSubmitting ? 'Menyimpan...' : 'Tambah'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;