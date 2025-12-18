import React, { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { X, Image as ImageIcon, Trash2, Youtube, Plus } from "lucide-react";
import Swal from "sweetalert2";
import Cropper from "react-easy-crop";

const EditProductModal = ({ isOpen, onClose, onSuccess, productData }) => {
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    nama_produk: "",
    deskripsi: "",
    tahun: new Date().getFullYear(),
  });

  const [mediaItems, setMediaItems] = useState([]);

  // CROPPER STATE
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspect, setAspect] = useState(1);
  const [isFullSize, setIsFullSize] = useState(false);

  // YouTube input modal
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [youtubeLinkInput, setYoutubeLinkInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // === PERBAIKAN DI SINI: LOAD DATA LAMA ===
  useEffect(() => {
    if (isOpen && productData) {
      // 1. Set Form Text
      setFormData({
        nama_produk: productData.nama_produk || "",
        deskripsi: productData.deskripsi || "",
        tahun: productData.tahun || new Date().getFullYear(),
      });

      // 2. Set Media Items
      // Prioritas: media_items (format baru) > foto_produk (format lama)
      let initialMedia = [];
      
      if (productData.media_items) {
        try {
          const items = typeof productData.media_items === 'string' 
            ? JSON.parse(productData.media_items) 
            : productData.media_items;
            
          initialMedia = items.map(item => ({
            type: item.type || 'image',
            data: item.url || item, // Untuk edit, data berisi URL (bukan file object)
            url: item.url || item,  // Simpan URL asli
            videoId: item.videoId,
            preview: item.type === 'youtube' 
              ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg` 
              : (item.url || item)
          }));
        } catch (e) { console.error("Gagal parse media_items", e); }
      } 
      else if (productData.foto_produk) {
        try {
          const parsed = JSON.parse(productData.foto_produk);
          const urls = Array.isArray(parsed) ? parsed : [productData.foto_produk];
          initialMedia = urls.map(url => ({
            type: 'image',
            data: url, 
            url: url,
            preview: url
          }));
        } catch (e) {
           // Fallback string tunggal
           initialMedia = [{
             type: 'image',
             data: productData.foto_produk,
             url: productData.foto_produk,
             preview: productData.foto_produk
           }];
        }
      }
      
      setMediaItems(initialMedia);
    }
  }, [isOpen, productData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const extractYoutubeVideoId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const getCroppedImg = async (imageSrc, cropPixels, isFullSize) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (isFullSize || !cropPixels) {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
    } else {
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
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob,
          url: URL.createObjectURL(blob),
        });
      }, "image/jpeg");
    });
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleImageChange = async (e) => {
    const fileArray = Array.from(e.target.files);
    if (mediaItems.length >= 5) {
      Swal.fire("Batas Maksimal", "Maksimal 5 media.", "warning");
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
    const { blob, url } = await getCroppedImg(selectedFile.data, croppedAreaPixels, isFullSize);
    const now = new Date();
    const timestamp = `${now.getTime()}`;
    const baseName = formData.nama_produk.replace(/[^a-zA-Z0-9]/g, "-") || "produk";
    
    const croppedFile = new File([blob], `${baseName}-${timestamp}.jpg`, { type: "image/jpeg" });

    setMediaItems((prev) => [
      ...prev,
      { type: "image", data: croppedFile, preview: url, isNew: true }, // Tandai sebagai file baru
    ]);

    setCropModalOpen(false);
    setSelectedFile(null);
  };

  const handleAddYoutube = () => {
    if (mediaItems.length >= 10) {
      Swal.fire("Batas Maksimal", "Maksimal 5 media.", "warning");
      return;
    }
    setYoutubeLinkInput("");
    setYoutubeModalOpen(true);
  };

  const saveYoutubeLink = () => {
    const videoId = extractYoutubeVideoId(youtubeLinkInput);
    if (!videoId) {
      Swal.fire("Error", "Link YouTube tidak valid", "error");
      return;
    }
    setMediaItems((prev) => [
      ...prev,
      {
        type: "youtube",
        data: youtubeLinkInput,
        preview: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        videoId: videoId,
      },
    ]);
    setYoutubeModalOpen(false);
    setYoutubeLinkInput("");
  };

  const removeMedia = (index) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const moveMedia = (index, direction) => {
    const newItems = [...mediaItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setMediaItems(newItems);
  };

  const handleAspectChange = (value) => {
    if (value === "full") {
      setAspect(null);
      setIsFullSize(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
    } else {
      setAspect(value);
      setIsFullSize(false);
    }
  };

  const noop = () => {};

  // === SUBMIT EDIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_produk.trim()) return Swal.fire("Error", "Nama produk wajib diisi", "error");
    if (mediaItems.length === 0) return Swal.fire("Error", "Minimal 1 media", "error");

    setIsSubmitting(true);

    try {
      const currentUserId = user?.id || 1;
      const processedMedia = [];

      for (const item of mediaItems) {
        if (item.type === "image") {
          // Jika gambar baru (File Object), upload dulu
          if (item.isNew && item.data instanceof File) {
            const formDataUpload = new FormData();
            formDataUpload.append("file", item.data);

            const uploadRes = await fetch("/api/products/upload", {
              method: "POST",
              body: formDataUpload,
            });

            if (uploadRes.ok) {
              const { url } = await uploadRes.json();
              processedMedia.push({ type: "image", url: url });
            }
          } else {
            // Jika gambar lama (URL String), pakai langsung
            processedMedia.push({ type: "image", url: item.url || item.data });
          }
        } else if (item.type === "youtube") {
          processedMedia.push({ type: "youtube", url: item.data, videoId: item.videoId });
        }
      }

      const payload = {
        nama_produk: formData.nama_produk,
        deskripsi: formData.deskripsi,
        tahun: formData.tahun,
        
        // Simpan format baru (Json)
        media_items: JSON.stringify(processedMedia),
        
        // Simpan format lama (Legacy String Array) untuk backup
        foto_produk: JSON.stringify(processedMedia.filter(m => m.type === 'image').map(m => m.url)),
        
        userId: currentUserId,
      };

      // GUNAKAN METHOD PUT KE ID PRODUK
      const res = await fetch(`/api/products/${productData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire("Sukses", "Produk berhasil diperbarui", "success");
        onSuccess();
        onClose();
      } else {
        throw new Error("Gagal menyimpan perubahan");
      }
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-['Poppins']">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-800">Edit Produk</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <X />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* MEDIA SECTION */}
            <div>
              <label className="block font-semibold mb-3 text-gray-700">Media Produk (Max 5) *</label>
              <div className="space-y-3 mb-3">
                {mediaItems.map((item, idx) => (
                  <div key={idx} className="border-2 border-gray-200 rounded-lg p-3 flex items-center gap-3">
                    <div className="text-gray-500 font-bold text-sm w-8">#{idx + 1}</div>
                    
                    {/* Preview Thumbnail */}
                    <div className="w-20 h-20 rounded overflow-hidden border flex-shrink-0 relative bg-gray-100">
                      {item.type === 'image' ? (
                         <img src={item.preview} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                         <>
                           <img src={item.preview} className="w-full h-full object-cover" alt="Video" />
                           <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Youtube className="text-white drop-shadow-md" size={24} />
                           </div>
                         </>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800">
                        {item.type === "image" ? "Foto" : "YouTube Video"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {/* Tampilkan URL atau Nama File */}
                        {item.data instanceof File ? item.data.name : item.data}
                      </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      <button type="button" onClick={() => moveMedia(idx, "up")} disabled={idx === 0} className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30">▲</button>
                      <button type="button" onClick={() => moveMedia(idx, "down")} disabled={idx === mediaItems.length - 1} className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30">▼</button>
                      <button type="button" onClick={() => removeMedia(idx)} className="p-1.5 hover:bg-red-100 text-red-600 rounded"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Buttons */}
              {mediaItems.length < 5 && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 transition">
                    <ImageIcon className="text-gray-400" size={28} />
                    <span className="font-medium text-sm">Tambah Foto</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  <button type="button" onClick={handleAddYoutube} className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition">
                    <Youtube className="text-red-500" size={28} />
                    <span className="font-medium text-sm">Tambah YouTube</span>
                  </button>
                </div>
              )}
            </div>

            {/* FORM FIELDS */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Nama Produk *</label>
              <input name="nama_produk" value={formData.nama_produk} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Deskripsi</label>
              <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" rows={3} />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Tahun</label>
              <input name="tahun" type="number" value={formData.tahun} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#2D2D39] text-white py-3 rounded-lg font-medium hover:bg-[#1f1f27] transition disabled:opacity-50">
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </div>

      {/* CROP MODAL */}
      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">
          <div className="bg-white p-5 rounded-xl shadow-xl w-full max-w-xl">
            <h3 className="font-semibold mb-3">Crop Gambar</h3>
            <div className="w-full h-64 relative">
              <Cropper image={selectedFile?.data} crop={crop} zoom={zoom} aspect={aspect} onCropChange={isFullSize ? noop : setCrop} onZoomChange={isFullSize ? noop : setZoom} onCropComplete={isFullSize ? noop : onCropComplete} restrictPosition={isFullSize} showGrid={!isFullSize} cropShape="rect" />
            </div>
            <div className="flex gap-2 mt-4">
               <button type="button" onClick={() => handleAspectChange(1)} className="px-3 py-1 bg-gray-200 rounded">1:1</button>
               <button type="button" onClick={() => handleAspectChange(4/3)} className="px-3 py-1 bg-gray-200 rounded">4:3</button>
               <button type="button" onClick={() => handleAspectChange(16/9)} className="px-3 py-1 bg-gray-200 rounded">16:9</button>
               <button type="button" onClick={() => handleAspectChange("full")} className="px-3 py-1 bg-gray-200 rounded">Full</button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setCropModalOpen(false)} className="px-4 py-2 hover:bg-gray-100 rounded-lg">Batal</button>
              <button type="button" onClick={finishCrop} className="px-4 py-2 bg-[#2D2D39] text-white rounded-lg">Crop & Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* YOUTUBE MODAL */}
      {youtubeModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Youtube className="text-red-600" /> Tambah Link YouTube</h3>
            <input value={youtubeLinkInput} onChange={(e) => setYoutubeLinkInput(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-2" />
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setYoutubeModalOpen(false)} className="px-4 py-2 hover:bg-gray-100 rounded-lg">Batal</button>
              <button type="button" onClick={saveYoutubeLink} className="px-4 py-2 bg-red-600 text-white rounded-lg">Tambahkan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProductModal;