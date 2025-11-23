import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

const AddClientModal = ({ isOpen, onClose, onSuccess }) => {
  const [clientName, setClientName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  // Reset form saat modal ditutup
  const handleClose = () => {
    setClientName("");
    setLogoFile(null);
    setPreviewUrl(null);
    onClose();
  };

  // Handle file upload & preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit 2MB
        Swal.fire('File Terlalu Besar', 'Maksimal ukuran file adalah 2MB', 'warning');
        return;
      }
      setLogoFile(file);
      // Buat preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // Helper: Convert File to Base64 (Agar bisa disimpan di DB tanpa Storage Bucket)
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName || !logoFile) {
      Swal.fire('Data Belum Lengkap', 'Mohon isi nama customer dan upload logo.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Convert image ke Base64 string
      const base64Image = await toBase64(logoFile);

      // 2. Kirim ke API
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          client_logo: base64Image // Kirim string gambar
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");

      // 3. Sukses
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Client baru berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });

      onSuccess(); // Refresh tabel di parent
      handleClose();

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Terjadi kesalahan saat menyimpan data.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-2">
          <h2 className="text-2xl font-bold text-gray-900">Tambah Client Baru</h2>
          <p className="text-gray-500 mt-1 text-sm">Masukkan informasi Client</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Upload Area */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Logo Perusahaan</label>
            
            {/* Preview Box (Checkerboard Pattern Style) */}
            <div className="relative w-full h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center mb-3 group hover:border-green-500 transition-colors">
              
              {previewUrl ? (
                <div className="relative w-full h-full p-4">
                   <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain" 
                   />
                   <button
                    type="button" 
                    onClick={() => { setLogoFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-red-50 text-red-500"
                   >
                     <X size={16} />
                   </button>
                </div>
              ) : (
                <div className="text-center p-4">
                   {/* Background Checkerboard Pattern (CSS Trick) */}
                   <div className="absolute inset-0 opacity-10 pointer-events-none" 
                        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                   </div>
                   <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                   <p className="text-xs text-gray-400">Format: PNG, JPG (Max 2MB)</p>
                </div>
              )}
            </div>

            {/* Hidden Input & Custom Button */}
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="w-full py-2.5 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <Upload size={18} />
              Upload logo
            </button>
          </div>

          {/* Input Customer Name */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Customer</label>
            <input 
              type="text" 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400"
              placeholder="Nama Perusahaan Client"
            />
          </div>

          {/* Actions Buttons */}
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
              {isSubmitting ? 'Menyimpan...' : 'Tambah'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddClientModal;