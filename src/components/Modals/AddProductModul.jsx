import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { X, Image as ImageIcon, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import Cropper from 'react-easy-crop';

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    nama_produk: '',
    deskripsi: '',
    tahun: new Date().getFullYear()
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // CROPPER STATE
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [aspect, setAspect] = useState(1 / 1); // default 1:1

  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Convert cropped area to actual image
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

    return canvas.toDataURL("image/jpeg");
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleImageChange = async (e) => {
    const fileArray = Array.from(e.target.files);

    if (imageFiles.length + fileArray.length > 5) {
      Swal.fire('Batas Maksimal', 'Maksimal upload 5 foto saja.', 'warning');
      return;
    }

    // Proses crop satu per satu
    startCropFlow(fileArray[0]);
  };

  const startCropFlow = (file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      setSelectedFile(e.target.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const finishCrop = async () => {
    const croppedImage = await getCroppedImg(selectedFile, croppedAreaPixels);

    setPreviews(prev => [...prev, croppedImage]);
    setImageFiles(prev => [...prev, croppedImage]);

    setCropModalOpen(false);
    setSelectedFile(null);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({ nama_produk: '', deskripsi: '', tahun: new Date().getFullYear() });
    setImageFiles([]);
    setPreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_produk.trim()) return Swal.fire('Error', 'Nama wajib diisi', 'error');

    setIsSubmitting(true);

    try {
      const currentUserId = user?.id || 1;

      const productData = {
        nama_produk: formData.nama_produk,
        deskripsi: formData.deskripsi,
        tahun: formData.tahun,
        foto_produk: JSON.stringify(imageFiles),
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
        if (res.status === 413) throw new Error('Ukuran gambar terlalu besar.');
        throw new Error('Gagal menyimpan ke database');
      }
    } catch (error) {
      Swal.fire('Gagal', error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ==================== MAIN MODAL ==================== */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-800">Tambah Produk</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Foto Produk */}
            <label className="block font-semibold mb-2 text-gray-700">Foto Produk (Max 5)</label>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-2">
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden group">
                  <img src={src} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              

              {previews.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <ImageIcon className="text-gray-400 mb-1" />
                  <span className="text-xs">+ Pilih</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
            
              {/* Size Chart */}
              <div className="mt-2 mb-4 text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="font-medium text-gray-700">PNG, JPG</span>
                </div>
                <div className="flex justify-between">
                  <span>Maksimal File</span>
                  <span className="font-medium text-gray-700">5 MB</span>
                </div>
              </div>

            {/* Form */}
            <input name="nama_produk" value={formData.nama_produk} onChange={handleChange} placeholder="Nama Produk"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800" required />

            <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} placeholder="Deskripsi"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800" rows={3} />

            <input name="tahun" type="number" value={formData.tahun} onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800" />

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-[#2D2D39] text-white py-3 rounded-lg font-medium">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </form>
        </div>
      </div>

      {/* ==================== CROP MODAL ==================== */}
      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">
          <div className="bg-white p-5 rounded-xl shadow-xl w-full max-w-xl">
            <h3 className="font-semibold mb-3">Crop Gambar</h3>

            <div className="w-full h-64 relative">
              <Cropper
                image={selectedFile}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Aspect Ratio Buttons */}
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

export default AddProductModal;
