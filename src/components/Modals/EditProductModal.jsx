import React, { useState, useEffect, useCallback } from 'react';
import { X, Image as ImageIcon, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import Cropper from 'react-easy-crop';

const EditProductModal = ({ isOpen, onClose, onSuccess, productData }) => {
  const [formData, setFormData] = useState({
    nama_produk: '',
    deskripsi: '',
    tahun: new Date().getFullYear()
  });

  // Array untuk menyimpan semua foto (URL existing + file baru)
  const [photos, setPhotos] = useState([]); // Format: [{ url: '...', isNew: false }, ...]
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cropper states
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspect, setAspect] = useState(1 / 1);

  // Load data saat modal dibuka
  useEffect(() => {
    if (isOpen && productData) {
      setFormData({
        nama_produk: productData.nama_produk || '',
        deskripsi: productData.deskripsi || '',
        tahun: productData.tahun || new Date().getFullYear()
      });
      
      // Parse semua foto yang ada
      if (productData.foto_produk) {
        try {
          const parsed = JSON.parse(productData.foto_produk);
          const photoArray = Array.isArray(parsed) ? parsed : [productData.foto_produk];
          setPhotos(photoArray.map(url => ({ url, isNew: false, file: null })));
        } catch {
          setPhotos([{ url: productData.foto_produk, isNew: false, file: null }]);
        }
      } else {
        setPhotos([]);
      }
    }
  }, [isOpen, productData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Crop functions
  const getCroppedImg = async (imageSrc, cropPixels) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise(resolve => image.onload = resolve);
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;

    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({ blob, url: URL.createObjectURL(blob) });
      }, "image/jpeg");
    });
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleImageChange = (e) => {
    const fileArray = Array.from(e.target.files);

    if (photos.length + fileArray.length > 5) {
      Swal.fire('Batas Maksimal', 'Maksimal 5 foto saja.', 'warning');
      return;
    }

    startCropFlow(fileArray[0]);
  };

  const startCropFlow = (file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      setSelectedFile({ data: e.target.result, file });
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const finishCrop = async () => {
    const { blob, url } = await getCroppedImg(selectedFile.data, croppedAreaPixels);
    
    // Buat File object dengan nama custom
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const baseName = formData.nama_produk.replace(/[^a-zA-Z0-9]/g, '-') || 'produk';
    const croppedFile = new File([blob], `${baseName}-${timestamp}.jpg`, { type: "image/jpeg" });

    // Tambahkan ke array photos
    setPhotos(prev => [...prev, { url, isNew: true, file: croppedFile }]);

    setCropModalOpen(false);
    setSelectedFile(null);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama_produk.trim()) {
      Swal.fire('Peringatan', 'Nama produk wajib diisi!', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      // Pisahkan foto existing dan foto baru
      const existingPhotos = photos.filter(p => !p.isNew).map(p => p.url);
      const newPhotos = photos.filter(p => p.isNew);

      // Upload foto baru
      const uploadedUrls = [];
      for (const photo of newPhotos) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', photo.file);
        
        const uploadRes = await fetch('/api/products/upload', {
          method: 'POST',
          body: formDataUpload
        });

        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          uploadedUrls.push(url);
        }
      }

      // Gabungkan foto existing dan foto baru
      const finalPhotos = [...existingPhotos, ...uploadedUrls];

      // Update ke database
      const updateData = {
        nama_produk: formData.nama_produk.trim(),
        deskripsi: formData.deskripsi?.trim() || '',
        foto_produk: JSON.stringify(finalPhotos),
        tahun: formData.tahun
      };

      const res = await fetch(`/api/products/${productData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const responseData = await res.json();

      if (res.ok) {
        await Swal.fire('Berhasil!', 'Data produk berhasil diperbarui', 'success');
        onClose();
        onSuccess();
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
    <>
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
            
            {/* FOTO PRODUK - GRID LAYOUT */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Foto Produk (Max 5)</label>
              
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden group">
                    <img src={photo.url} className="w-full h-full object-cover" alt={`Foto ${idx + 1}`} />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                    {photo.isNew && (
                      <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-[10px] px-1 py-0.5 rounded">Baru</span>
                    )}
                  </div>
                ))}

                {/* Tombol Upload Foto Baru */}
                {photos.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                    <ImageIcon className="text-gray-400 mb-1" size={20} />
                    <span className="text-xs text-gray-600">+ Tambah</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
              
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="font-medium text-gray-700">PNG, JPG</span>
                </div>
                <div className="flex justify-between">
                  <span>Maksimal File</span>
                  <span className="font-medium text-gray-700">5 MB</span>
                </div>
              </div>
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

      {/* CROP MODAL */}
      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">
          <div className="bg-white p-5 rounded-xl shadow-xl w-full max-w-xl">
            <h3 className="font-semibold mb-3">Crop Gambar</h3>

            <div className="w-full h-64 relative">
              <Cropper
                image={selectedFile?.data}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setAspect(1 / 1)} className="px-3 py-1 bg-gray-200 rounded">1 : 1</button>
              <button onClick={() => setAspect(4 / 3)} className="px-3 py-1 bg-gray-200 rounded">4 : 3</button>
              <button onClick={() => setAspect(16 / 9)} className="px-3 py-1 bg-gray-200 rounded">16 : 9</button>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setCropModalOpen(false)} className="px-4 py-2">Batal</button>
              <button onClick={finishCrop} className="px-4 py-2 bg-[#2D2D39] text-white rounded-lg">
                Crop & Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProductModal;