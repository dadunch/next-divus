import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { X, Image as ImageIcon, Trash2, Youtube, Plus } from "lucide-react";
import Swal from "sweetalert2";
import Cropper from "react-easy-crop";

const EditProjectModal  = ({ isOpen, onClose, onSuccess, projectData, userId }) => {
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    nama_produk: "",
    deskripsi: "",
    tahun: new Date().getFullYear(),
  });

  // Array media yang bisa campuran foto dan youtube
  // Format: { type: 'image'|'youtube', data: file|url, preview: url }
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

  React.useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

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
      // 🔥 FULL SIZE MODE
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
    } else {
      // 🔥 NORMAL CROP
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
      Swal.fire(
        "Batas Maksimal",
        "Maksimal 5 media (foto + video).",
        "warning"
      );
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
    const { blob, url } = await getCroppedImg(
      selectedFile.data,
      croppedAreaPixels,
      isFullSize
    );

    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    const baseName =
      formData.nama_produk.replace(/[^a-zA-Z0-9]/g, "-") || "produk";
    const croppedFile = new File([blob], `${baseName}-${timestamp}.jpg`, {
      type: "image/jpeg",
    });

    setMediaItems((prev) => [
      ...prev,
      {
        type: "image",
        data: croppedFile,
        preview: url,
      },
    ]);

    setCropModalOpen(false);
    setSelectedFile(null);
  };

  const handleAddYoutube = () => {
    if (mediaItems.length >= 10) {
      Swal.fire(
        "Batas Maksimal",
        "Maksimal 5 media (foto + video).",
        "warning"
      );
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
        preview: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
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

    [newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ];
    setMediaItems(newItems);
  };

  const resetForm = () => {
    setFormData({
      nama_produk: "",
      deskripsi: "",
      tahun: new Date().getFullYear(),
    });
    setMediaItems([]);
  };

  const handleAspectChange = (value) => {
    if (value === "full") {
      setAspect(null); // rasio asli
      setIsFullSize(true); // 🔒 lock crop
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
    } else {
      setAspect(value);
      setIsFullSize(false);
    }
  };

  const noop = () => {};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_produk.trim()) {
      return Swal.fire("Error", "Nama produk wajib diisi", "error");
    }

    if (mediaItems.length === 0) {
      return Swal.fire(
        "Error",
        "Minimal tambahkan 1 media (foto atau video)",
        "error"
      );
    }

    setIsSubmitting(true);

    try {
      const currentUserId = user?.id || 1;

      // Process media items
      const processedMedia = [];

      for (const item of mediaItems) {
        if (item.type === "image") {
          // Upload foto
          const formDataUpload = new FormData();
          formDataUpload.append("file", item.data);

          const uploadRes = await fetch("/api/products/upload", {
            method: "POST",
            body: formDataUpload,
          });

          if (uploadRes.ok) {
            const { url } = await uploadRes.json();
            processedMedia.push({
              type: "image",
              url: url,
            });
          }
        } else if (item.type === "youtube") {
          // Simpan YouTube link
          processedMedia.push({
            type: "youtube",
            url: item.data,
            videoId: item.videoId,
          });
        }
      }

      // Simpan produk dengan array media
      const productData = {
        nama_produk: formData.nama_produk,
        deskripsi: formData.deskripsi,
        tahun: formData.tahun,

        // 🔥 backend lama (foto saja)
        foto_produk: JSON.stringify(
          processedMedia.filter((m) => m.type === "image").map((m) => m.url)
        ),

        // 🔥 backend baru (campuran foto + youtube)
        media_items: JSON.stringify(processedMedia),

        userId: currentUserId,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        Swal.fire("Sukses", "Produk berhasil ditambahkan", "success");
        onSuccess();
      } else {
        throw new Error("Gagal menyimpan ke database");
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-800">Tambah Produk</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* MEDIA SECTION */}
            <div>
              <label className="block font-semibold mb-3 text-gray-700">
                Media Produk (Max 5) *
              </label>

              {/* Media Grid */}
              <div className="space-y-3 mb-3">
                {mediaItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-gray-200 rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="text-gray-500 font-bold text-sm w-8">
                      #{idx + 1}
                    </div>

                    {/* Preview */}
                    <div className="w-20 h-20 rounded overflow-hidden border flex-shrink-0">
                      {item.type === "image" ? (
                        <img
                          src={item.preview}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      ) : (
                        <div className="w-full h-full bg-red-100 flex items-center justify-center">
                          <Youtube className="text-red-600" size={32} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800">
                        {item.type === "image" ? "Foto" : "YouTube Video"}
                      </div>
                      {item.type === "youtube" && (
                        <div className="text-xs text-gray-500 truncate">
                          {item.data}
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => moveMedia(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Pindah ke atas"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveMedia(idx, "down")}
                        disabled={idx === mediaItems.length - 1}
                        className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Pindah ke bawah"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMedia(idx)}
                        className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Buttons */}
              {mediaItems.length < 5 && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition">
                    <ImageIcon className="text-gray-400" size={28} />
                    <span className="font-medium text-sm">Tambah Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleAddYoutube}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-gray-50 hover:border-gray-400 transition"
                  >
                    <Youtube className="text-red-500" size={28} />
                    <span className="font-medium text-sm">Tambah YouTube</span>
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Anda bisa mencampur foto dan video YouTube dalam urutan apapun
                <div className="flex justify-between">
                  <span>Rasio</span>{" "}
                  <span className="font-medium">1 : 1, 4 : 3, 16 : 9</span>
                </div>
                <div className="flex justify-between">
                  <span>Format</span> <span>JPG / PNG</span>
                </div>
                <div className="flex justify-between">
                  <span>Maks</span> <span>10 MB</span>
                </div>
              </p>
            </div>

            {/* FORM FIELDS */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Nama Produk *
              </label>
              <input
                name="nama_produk"
                value={formData.nama_produk}
                onChange={handleChange}
                placeholder="Masukkan nama produk"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                placeholder="Masukkan deskripsi produk"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                rows={3}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Tahun
              </label>
              <input
                name="tahun"
                type="number"
                value={formData.tahun}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2D2D39] text-white py-3 rounded-lg font-medium hover:bg-[#1f1f27] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
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
              <Cropper
                image={selectedFile?.data}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={isFullSize ? noop : setCrop}
                onZoomChange={isFullSize ? noop : setZoom}
                onCropComplete={isFullSize ? noop : onCropComplete}
                restrictPosition={isFullSize}
                showGrid={!isFullSize}
                cropShape="rect"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => handleAspectChange(1)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                1 : 1
              </button>
              <button
                type="button"
                onClick={() => handleAspectChange(4 / 3)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                4 : 3
              </button>
              <button
                type="button"
                onClick={() => handleAspectChange(16 / 9)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                16 : 9
              </button>
              <button
                type="button"
                onClick={() => handleAspectChange("full")}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Full
              </button>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="px-4 py-2 hover:bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={finishCrop}
                className="px-4 py-2 bg-[#2D2D39] text-white rounded-lg hover:bg-[#1f1f27]"
              >
                Crop & Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YOUTUBE MODAL */}
      {youtubeModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Youtube className="text-red-600" />
              Tambah Link YouTube
            </h3>

            <input
              value={youtubeLinkInput}
              onChange={(e) => setYoutubeLinkInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 mb-2"
            />
            <p className="text-xs text-gray-500 mb-4">
              Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ
            </p>

            {extractYoutubeVideoId(youtubeLinkInput) && (
              <div className="mb-4 border rounded-lg overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${extractYoutubeVideoId(
                      youtubeLinkInput
                    )}`}
                    title="YouTube preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setYoutubeModalOpen(false)}
                className="px-4 py-2 hover:bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveYoutubeLink}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProjectModal;
