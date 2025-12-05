import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import Swal from 'sweetalert2';

const EditProjectModal = ({ isOpen, onClose, onSuccess, projectData, userId }) => {
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

  useEffect(() => {
    if (isOpen) {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error("Gagal load kategori", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (projectData) {
      setFormData({
        project_name: projectData.project_name || '',
        category_id: projectData.category_id || '',
        tahun: projectData.tahun || new Date().getFullYear()
      });
    }
  }, [projectData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.project_name || !formData.category_id || !formData.tahun) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Mohon isi semua form.',
        confirmButtonColor: '#F59E0B',
        customClass: { popup: 'font-["Poppins"] rounded-xl' }
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${projectData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: userId
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data proyek berhasil diperbarui.',
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'font-["Poppins"] rounded-xl' }
      });
      
      onSuccess();
      handleClose();

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat menyimpan data.',
        confirmButtonColor: '#EF4444',
        customClass: { popup: 'font-["Poppins"] rounded-xl' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
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
      {/* Modal Container */}
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100 overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-8 pt-8 pb-2 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Proyek</h2>
            <p className="text-gray-500 mt-1 text-sm">Perbarui informasi proyek</p>
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
              className={`w-full border rounded-lg px-4 py-3 flex justify-between items-center cursor-pointer transition-all ${isDropdownOpen ? 'border-[#27D14C] ring-2 ring-[#27D14C]/20' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <span className={`text-sm ${formData.category_id ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                {getSelectedCategoryLabel()}
              </span>
              <ChevronDown size={20} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Options */}
            {isDropdownOpen && (
              <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-auto focus:outline-none py-2 animate-in fade-in zoom-in-95 duration-200">
                {categories.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-gray-500 text-center">Tidak ada kategori.</li>
                ) : (
                  categories.map((category) => {
                    const isSelected = category.id == formData.category_id;
                    return (
                      <li 
                        key={category.id}
                        onClick={() => {
                          setFormData({...formData, category_id: category.id});
                          setIsDropdownOpen(false);
                        }}
                        className={`px-4 py-3 text-sm cursor-pointer flex justify-between items-center transition-colors ${isSelected ? 'bg-[#27D14C]/10 text-[#27D14C] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {category.bidang}
                        {isSelected && <Check size={18} />}
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>

          {/* Input Tahun */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tahun</label>
            <input 
              type="number" 
              min="2000"
              max={new Date().getFullYear() + 5}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#27D14C] transition-all"
              placeholder="Contoh: 2023"
              value={formData.tahun}
              onChange={e => setFormData({...formData, tahun: e.target.value})}
            />
          </div>

          {/* Footer Buttons */}
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
              className="px-6 py-2.5 rounded-lg bg-[#2D2D39] text-white font-medium hover:bg-black transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;