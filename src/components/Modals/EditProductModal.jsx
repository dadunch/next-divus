import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

// Menerima prop 'productData' (data produk yg mau diedit)
const EditProductModal = ({ isOpen, onClose, onSuccess, productData }) => {
  const [formData, setFormData] = useState({
    nama_produk: '',
    deskripsi: '',
    tahun: new Date().getFullYear()
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efek untuk mengisi form saat modal dibuka
  useEffect(() => {
    if (isOpen && productData) {
      setFormData({
        nama_produk: productData.nama_produk || '',
        deskripsi: productData.deskripsi || '',
        tahun: productData.tahun || new Date().getFullYear()
      });
      // Tampilkan preview gambar lama jika ada
      if (productData.foto_produk) {
        setImagePreview(productData.foto_produk);
      }
    }
  }, [isOpen, productData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle jika user memilih file gambar BARU
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama_produk.trim()) {
      Swal.fire('Peringatan', 'Nama produk wajib diisi!', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Cek apakah ada upload gambar BARU
      let finalImageUrl = productData.foto_produk; // Default pakai URL lama

      if (imageFile) {
        // Jika ada file baru, upload dulu
        try {
          const imageFormData = new FormData();
          imageFormData.append('file', imageFile);
          
          const uploadRes = await fetch('/api/product/upload', {
            method: 'POST',
            body: imageFormData
          });
          
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            finalImageUrl = uploadData.url; // Pakai URL baru
            console.log('New image uploaded:', finalImageUrl);
          }
        } catch (uploadError) {
          console.warn('Upload error:', uploadError);
          Swal.fire('Gagal Upload', 'Gagal mengupload gambar baru, menggunakan gambar lama.', 'warning');
        }
      }

      // 2. Siapkan Data Update
      const updateData = {
        nama_produk: formData.nama_produk.trim(),
        deskripsi: formData.deskripsi?.trim() || '',
        foto_produk: finalImageUrl,
        tahun: formData.tahun
      };

      console.log('Sending update data:', updateData);

      // 3. Kirim ke API Update (Method PUT ke ID produk)
      const res = await fetch(`/api/products/${productData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const responseData = await res.json();

      if (res.ok) {
        await Swal.fire('Berhasil!', 'Data produk berhasil diperbarui', 'success');
        onClose();
        onSuccess(); // Refresh data di halaman induk
      } else {
        throw new Error(responseData.error || 'Gagal memperbarui produk');
      }
    } catch (error) {
      console.error("Update Error:", error);
      Swal.fire('Gagal', error.message || 'Terjadi kesalahan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !productData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">Edit Produk</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" disabled={isSubmitting}>
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gambar Produk (Opsional)</label>
            <div className="relative">
              {imagePreview ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    // Tombol silang hanya mereset preview ke gambar asli database jika ada
                    onClick={() => { 
                        setImageFile(null); 
                        setImagePreview(productData.foto_produk || null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Batalkan perubahan gambar"
                  >
                    <X size={16} />
                  </button>
                  {imageFile && <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Gambar Baru Terpilih</span>}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                  <ImageIcon size={48} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Klik untuk ganti gambar</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
            {productData.foto_produk && !imageFile && (
                <p className="text-xs text-gray-500 mt-1 ml-1">*Ini adalah gambar saat ini. Klik gambar untuk menggantinya.</p>
            )}
          </div>

          {/* Nama Produk */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_produk"
              value={formData.nama_produk}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Tahun */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun</label>
            <input
              type="number"
              name="tahun"
              value={formData.tahun}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#2D2D39] text-white rounded-lg font-medium hover:bg-black transition-colors"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;