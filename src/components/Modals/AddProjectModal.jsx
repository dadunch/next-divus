import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';

const AddProjectModal = ({ isOpen, onClose, onSuccess, clientId }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    project_name: '',
    category_id: '',
    tahun: new Date().getFullYear()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Kategori (Bidang) untuk Dropdown
  useEffect(() => {
    if (isOpen) {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error("Gagal load kategori", err));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          client_id: clientId // ID Client otomatis dari props
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");

      Swal.fire('Berhasil', 'Proyek baru ditambahkan', 'success');
      onSuccess();
      onClose();
      setFormData({ project_name: '', category_id: '', tahun: new Date().getFullYear() }); // Reset
    } catch (error) {
      Swal.fire('Error', 'Gagal menambahkan proyek', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-900">Tambah Proyek</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-red-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Proyek</label>
            <input 
              type="text" 
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.project_name}
              onChange={e => setFormData({...formData, project_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Bidang (Kategori)</label>
            <select 
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white"
              value={formData.category_id}
              onChange={e => setFormData({...formData, category_id: e.target.value})}
            >
              <option value="">Pilih Bidang...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.bidang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tahun</label>
            <input 
              type="number" 
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.tahun}
              onChange={e => setFormData({...formData, tahun: e.target.value})}
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#2D2D39] text-white py-2.5 rounded-lg hover:bg-black transition font-medium"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Proyek'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;