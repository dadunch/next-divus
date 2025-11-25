import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { X, Image as ImageIcon, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    nama_produk: '',
    deskripsi: '',
    tahun: new Date().getFullYear()
  });

  const [imageFiles, setImageFiles] = useState([]); 
  const [previews, setPreviews] = useState([]);     
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper: Ubah File menjadi Base64 (Teks)
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (imageFiles.length + files.length > 5) {
      Swal.fire('Batas Maksimal', 'Maksimal upload 5 foto saja.', 'warning');
      return;
    }

    // Buat preview
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_produk.trim()) return Swal.fire('Error', 'Nama wajib diisi', 'error');

    setIsSubmitting(true);

    try {
      // 1. KONVERSI SEMUA GAMBAR KE BASE64 (TEKS)
      // Kita tidak upload ke server, tapi mengubahnya jadi teks di sini
      const base64Images = await Promise.all(imageFiles.map(async (file) => {
        return await toBase64(file);
      }));

      // 2. Simpan Data ke DB (Base64 dikirim langsung)
      const currentUserId = user?.id || 1;
      
      const productData = {
        nama_produk: formData.nama_produk,
        deskripsi: formData.deskripsi,
        tahun: formData.tahun,
        foto_produk: JSON.stringify(base64Images), // Array string Base64
        userId: currentUserId
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (res.ok) {
        Swal.fire('Sukses', 'Produk berhasil ditambahkan', 'success');
        onSuccess();
      } else {
        // Cek jika error karena ukuran file terlalu besar
        if (res.status === 413) {
            throw new Error('Ukuran gambar terlalu besar untuk disimpan di Database.');
        }
        throw new Error('Gagal menyimpan ke database');
      }
    } catch (error) {
      Swal.fire('Gagal', error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ nama_produk: '', deskripsi: '', tahun: new Date().getFullYear() });
    setImageFiles([]);
    setPreviews([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Tambah Produk (Simpan di DB)</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Foto Produk (Max 5)</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden group shadow-sm">
                  <img src={src} className="w-full h-full object-cover" alt="Preview" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {imageFiles.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all">
                  <ImageIcon className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 font-medium">+ Pilih</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-xs text-orange-500">*Gambar akan disimpan langsung di database.</p>
          </div>

          {/* Input Nama, Deskripsi, Tahun (Sama seperti sebelumnya) */}
          <input name="nama_produk" value={formData.nama_produk} onChange={handleChange} placeholder="Nama Produk" className="w-full border border-gray-300 px-4 py-2 rounded-lg" required />
          <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} placeholder="Deskripsi" className="w-full border border-gray-300 px-4 py-2 rounded-lg" rows={3} />
          <input name="tahun" type="number" value={formData.tahun} onChange={handleChange} className="w-full border border-gray-300 px-4 py-2 rounded-lg" />
          
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting} className="w-full bg-[#2D2D39] text-white py-3 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50">
                {isSubmitting ? 'Menyimpan ke DB...' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddProductModal;