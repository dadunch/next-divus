import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

// --- PENTING: Hapus tanda // di bawah ini di project Anda ---
import Swal from 'sweetalert2'; 

const EditClientModal = ({ isOpen, onClose, onSuccess, clientData, userId }) => {
  
  // State Form
  const [clientName, setClientName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  // Efek: Isi form saat modal dibuka & data tersedia
  useEffect(() => {
    if (isOpen && clientData) {
      setClientName(clientData.client_name || "");
      setPreviewUrl(clientData.client_logo || null);
      setLogoFile(null); 
    }
  }, [isOpen, clientData]);

  const handleClose = () => {
    setLogoFile(null);
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        // Alert Warning Konsisten
        Swal.fire({
            icon: 'warning',
            title: 'File Terlalu Besar',
            text: 'Maksimal ukuran file adalah 2MB',
            confirmButtonColor: '#F59E0B', // Kuning Warning
            confirmButtonText: 'Oke',
            width: '22em',
            customClass: { 
                popup: 'font-["Poppins"] rounded-2xl shadow-xl',
                title: 'text-lg font-bold',
                htmlContainer: 'text-sm',
                confirmButton: 'font-["Poppins"] rounded-lg px-6 py-2'
            }
        });
        return;
      }
      setLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let logoToSend = clientData.client_logo; 
      if (logoFile) {
        logoToSend = await toBase64(logoFile);
      }

      const res = await fetch(`/api/clients/${clientData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          client_logo: logoToSend,
          userId: userId 
        }),
      });

      if (!res.ok) throw new Error("Gagal update data");

      // SUKSES: Alert Hijau & Compact
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data client berhasil diperbarui.',
        width: '22em',
        padding: '1.5em',
        iconColor: '#27D14C', // Hijau Divus
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        customClass: {
          popup: 'font-["Poppins"] rounded-2xl shadow-xl',
          title: 'text-lg font-bold text-gray-700',
          htmlContainer: 'text-sm text-gray-500'
        }
      });

      onSuccess(); 
      handleClose();

    } catch (error) {
      console.error(error);
      // ERROR: Alert Merah & Compact
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyimpan data.',
        width: '22em',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Coba Lagi',
        customClass: {
          popup: 'font-["Poppins"] rounded-2xl shadow-xl',
          title: 'text-lg font-bold',
          htmlContainer: 'text-sm',
          confirmButton: 'font-["Poppins"] rounded-lg text-sm px-4 py-2'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100 overflow-hidden">
        
        <div className="px-8 pt-8 pb-2">
          <h2 className="text-2xl font-bold text-gray-900">Edit Data Client</h2>
          <p className="text-gray-500 mt-1 text-sm">Perbarui informasi Client</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Logo Section */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Logo Perusahaan</label>
            <div className="relative w-full h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center mb-3 group hover:border-green-500 transition-colors">
              {previewUrl ? (
                <div className="relative w-full h-full p-4">
                   <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                   <button type="button" onClick={() => { setLogoFile(null); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-red-50 text-red-500 transition-colors"><X size={16} /></button>
                </div>
              ) : (
                <div className="text-center p-4">
                   <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                   <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                   <p className="text-xs text-gray-400">Format: PNG, JPG (Max 2MB)</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current.click()} className="w-full py-2.5 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              <Upload size={18} /> Ganti Logo
            </button>
          </div>

          {/* Nama Customer */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Customer</label>
            <input 
              type="text" 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
              placeholder="Nama Perusahaan Client"
            />
          </div>

          {/* Footer Actions */}
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
              className="px-6 py-2.5 rounded-lg bg-[#2D2D39] text-white font-medium hover:bg-black transition-colors shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Perbarui'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditClientModal;