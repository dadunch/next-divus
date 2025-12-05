import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const ManageCategoryModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);

  // State Data
  const [categories, setCategories] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error(err));
      setDeletedIds([]);
    }
  }, [isOpen]);

  const handleNameChange = (index, newValue) => {
    const updated = [...categories];
    updated[index].bidang = newValue;
    if (updated[index].id) updated[index].isModified = true;
    setCategories(updated);
  };


  const handleDelete = (index) => {
    const item = categories[index];
    if (item.id) {
      setDeletedIds([...deletedIds, item.id]);
    }
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
  };


  const handleAdd = () => {
    setCategories([...categories, { bidang: "", isNew: true }]);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const promises = [];

      deletedIds.forEach(id => {
        promises.push(
          fetch(`/api/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id }) 
          })
        );
      });

      categories.forEach(item => {
        if (item.isNew && item.bidang.trim() !== "") {
          promises.push(
            fetch('/api/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bidang: item.bidang, userId: user?.id }) 
            })
          );
        }
        else if (item.isModified && item.bidang.trim() !== "") {
          promises.push(
            fetch(`/api/categories/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bidang: item.bidang, userId: user?.id }) 
            })
          );
        }
      });

      await Promise.all(promises);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data bidang telah diperbarui.',
        timer: 1500,
        showConfirmButton: false
      });

      onSuccess();
      onClose();

    } catch (error) {
      console.error(error);
      Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-['Poppins']"
      onClick={onClose} 
    >
      {/* Stop propagatio  */}
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex-shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kelola Bidang</h2>
            <p className="text-gray-500 text-sm mt-1">Item Bidang</p>
          </div>
          {/* Tombol X untuk menutup manual */}
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* List Items */}
        <div className="p-6 space-y-3 overflow-y-auto flex-grow">
          {categories.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={item.bidang}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className="flex-grow border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all"
                placeholder="Nama Bidang"
              />
              <button
                onClick={() => handleDelete(index)}
                className="p-2.5 border border-red-500 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                title="Hapus Item"
              >
                <X size={20} />
              </button>
            </div>
          ))}

          <button
            onClick={handleAdd}
            className="w-full py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors mt-2"
          >
            <Plus size={18} />
            Tambah Item
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full py-3 bg-[#1E293B] text-white font-bold rounded-lg hover:bg-black transition-colors shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Perbarui'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ManageCategoryModal;