// import React, { useState } from "react";
import { useState, useEffect } from 'react';

import Head from "next/head";
import { useSelector } from "react-redux";
import { Pencil, Trash2, Save } from "lucide-react";
import { Assets } from "../../assets"; // Pastikan path asset benar
import Cropper from "react-easy-crop";
import Swal from "sweetalert2";

import { heroCache } from '../../utils/heroCache';


/* ================= PREVIEW (DESAIN ORIGINAL) ================= */
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const fileUrl = URL.createObjectURL(blob);
      resolve({ blob, fileUrl });
    }, "image/jpeg");
  });
};

const PreviewSneakPeek = ({ images }) => {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      {/* TOP */}
      <div className="flex justify-between gap-8">
        <div className="flex-1 space-y-4">
          <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="relative w-[260px] h-[180px]">
          {/* IMAGE 1 (Utama/Kanan) */}
          <div className="absolute top-3 right-5 w-32 h-32 rounded-xl overflow-hidden shadow-lg bg-gray-100 z-10 border border-white">
            {images.img1 ? (
              <img src={images.img1} className="w-full h-full object-cover" />
            ) : (
              <div className="text-xs text-gray-400 flex items-center justify-center h-full">
                image 1
              </div>
            )}
          </div>

          {/* IMAGE 2 (Kiri/Kecil) */}
          <div className="absolute top-12.5 left-7.5 w-24 h-24 rounded-md overflow-hidden shadow bg-gray-100 z-10 border border-white">
            {images.img2 ? (
              <img src={images.img2} className="w-full h-full object-cover" />
            ) : (
              <div className="text-xs text-gray-400 flex items-center justify-center h-full">
                image 2
              </div>
            )}
          </div>

          {/* DECOR IMAGE */}
          <img
            src={Assets.Hero3}
            alt="Dekorasi"
            className="absolute top-12 left-12 w-[180px] h-auto object-contain opacity-90 pointer-events-none"
          />
        </div>
      </div>

      <div className="my-8 h-3 bg-gray-200 rounded-full opacity-50" />

      {/* BOTTOM */}
      <div className="flex justify-between gap-8">
        <div className="flex-1 space-y-4">
          <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* IMAGE 3 (Tentang Kami) */}
        <div className="w-44 h-44 rounded-xl overflow-hidden shadow-lg bg-gray-100">
          {images.img3 ? (
            <img src={images.img3} className="w-full h-full object-cover" />
          ) : (
            <div className="text-xs text-gray-400 flex items-center justify-center h-full">
              image 3
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN PAGE ================= */
const AssetKontenPage = () => {
  const { user } = useSelector((state) => state.auth || {});

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [tempKey, setTempKey] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // State Preview
  const [images, setImages] = useState({
    img1: null,
    img2: null,
    img3: null,
  });

  // State File Asli
  const [files, setFiles] = useState({
    img1: null,
    img2: null,
    img3: null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ============= LOAD DATA AWAL DARI API =============
  useEffect(() => {
    const fetchExistingImages = async () => {
      try {
        setIsLoading(true);

        // Gunakan heroCache untuk fetch data
        const dataHero = await heroCache.fetch();

        if (dataHero) {
          setImages({
            img1: dataHero.foto1 || null,
            img2: dataHero.foto2 || null,
            img3: dataHero.foto3 || null,
          });
        }
      } catch (error) {
        console.error("Gagal load hero assets:", error);
        Swal.fire({
          icon: "warning",
          title: "Peringatan",
          text: "Gagal memuat gambar yang sudah ada.",
          confirmButtonColor: "#f59e0b",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingImages();
  }, []);

  // LOGIC: Format Nama File
  const getFormattedFileName = (key, originalFile) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    const ext = originalFile.name.split(".").pop();
    return `${key}-${timestamp}.${ext}`;
  };

  const handleUpload = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    setTempKey(key);
    setTempImage(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropModalOpen(true);
  };

  const selesaiCrop = async () => {
    const { blob, fileUrl } = await getCroppedImg(tempImage, croppedAreaPixels);

    const croppedFile = new File([blob], `crop-${tempKey}.jpg`, {
      type: "image/jpeg",
    });

    setImages((prev) => ({
      ...prev,
      [tempKey]: fileUrl,
    }));

    setFiles((prev) => ({
      ...prev,
      [tempKey]: croppedFile,
    }));

    setCropModalOpen(false);
  };

  const handleDelete = (key) => {
    setImages((prev) => ({ ...prev, [key]: null }));
    setFiles((prev) => ({ ...prev, [key]: null }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      // 1. Kirim User ID (Penting untuk log history)
      const currentUserId = user?.username || user?.id || "Admin";
      formData.append("user_id", currentUserId);

      // 2. Kirim File Gambar
      Object.keys(files).forEach((key) => {
        if (files[key]) {
          formData.append(
            key,
            files[key],
            getFormattedFileName(key, files[key])
          );
        }
      });

      // 3. Kirim ke API Hero
      const response = await fetch("/api/hero", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Clear cache setelah sukses update
        heroCache.clear();

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Perubahan berhasil disimpan.",
          confirmButtonColor: "#16a34a",
        });

        // Reset file state setelah berhasil simpan
        setFiles({
          img1: null,
          img2: null,
          img3: null,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Gagal menyimpan data.",
          confirmButtonColor: "#dc2626",
        });
      }

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Terjadi kesalahan koneksi.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const ImageBox = ({ label, imgKey }) => (
    <div>
      <p className="text-sm font-semibold mb-2">{label}</p>
      <label
        htmlFor={`upload-${imgKey}`}
        className="relative w-40 h-40 rounded-xl border-2 border-dashed bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer border-gray-300 hover:bg-gray-200 transition"
      >
        {images[imgKey] ? (
          <img src={images[imgKey]} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">Klik untuk upload</span>
        )}

        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <div className="bg-white p-1.5 rounded-full shadow">
            <Pencil size={14} />
          </div>
          {images[imgKey] && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(imgKey);
              }}
              className="bg-white p-1.5 rounded-full shadow text-red-500"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <input
          id={`upload-${imgKey}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e, imgKey)}
        />
      </label>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins']">
      <Head>
        <title>Asset Konten</title>
      </Head>

      <header className="bg-[#1E1E2D] px-8 py-4 flex justify-end items-center">
        <div className="flex items-center gap-3 text-white">
          <p className="text-sm font-medium text-white mr-1">
            Hi, {user?.username || "Admin"}
          </p>
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white uppercase font-bold border-2 border-gray-400">
            {user?.username ? user.username.charAt(0) : "A"}
          </div>
        </div>
      </header>

      <div className="px-8 pt-8 pb-10">
        <h1 className="text-3xl font-bold mb-1">Asset Konten</h1>
        <p className="text-gray-500 italic mb-8">Kelola Asset Konten</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: INPUTS */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-10">
            <ImageBox label="Main Image 1 (Utama)" imgKey="img1" />
            <ImageBox label="Main Image 2 (Kiri)" imgKey="img2" />
            <ImageBox label="Main Image 3 (Bawah)" imgKey="img3" />
            <div className="bg-white border rounded-xl p-4 shadow-sm h-fit">
              <h3 className="font-semibold text-sm mb-2 text-gray-800">
                Rekomendasi Ukuran Gambar
              </h3>

              <ul className="text-xs text-gray-600 leading-relaxed">
                <li>
                  <span className="font-medium">Main Image 1:</span>
                  <br />
                  Rasio 1:1 • 800×800 px (min 600×600)
                </li>
                <li>
                  <span className="font-medium">Main Image 2:</span>
                  <br />
                  Rasio 1:1 • 600×600 px (min 400×400)
                </li>
                <li>
                  <span className="font-medium">Main Image 3:</span>
                  <br />
                  Rasio 1:1 • 700×700 px (min 500×500)
                </li>
                <li className="pt-1">
                  <span className="font-medium">Format:</span> JPG/PNG
                </li>
                <li>
                  <span className="font-medium">Ukuran File:</span> Maks. 2 MB
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT: PREVIEW */}
          <div className="lg:col-span-5">
            <p className="font-semibold mb-2">Preview (homepage)</p>
            <PreviewSneakPeek images={images} />

            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#1E293B] hover:bg-black text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-60"
              >
                <Save size={18} />
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 shadow-lg relative w-[90%] h-[80%] max-w-lg flex flex-col">
            <h2 className="text-lg font-semibold mb-3">Crop Gambar</h2>

            <div className="relative flex-1">
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(croppedArea, croppedPixels) =>
                  setCroppedAreaPixels(croppedPixels)
                }
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              className="mt-3"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setCropModalOpen(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={selesaiCrop}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetKontenPage;