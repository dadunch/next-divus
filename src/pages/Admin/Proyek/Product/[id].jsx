// pages/Admin/Proyek/Product/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export async function getServerSideProps(context) {
  const { id } = context.params;
  
  // Validasi ID
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return {
      notFound: true
    };
  }
  
  return {
    props: {
      productId
    }
  };
}

export default function ProductDetail({ productId }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state untuk edit
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    product_image: '',
    tahun: '',
    category_id: '',
    client_id: '',
    status: '',
    project_value: ''
  });

  // Fetch product data
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        throw new Error('Produk tidak ditemukan');
      }
      
      const data = await response.json();
      setProduct(data);
      
      // Set form data untuk edit
      setFormData({
        product_name: data.product_name || '',
        description: data.description || '',
        product_image: data.product_image || '',
        tahun: data.tahun || '',
        category_id: data.category_id || '',
        client_id: data.client_id || '',
        status: data.status || '',
        project_value: data.project_value || ''
      });
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle update product
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: 1 // Ganti dengan user ID dari session/auth
        })
      });

      if (!response.ok) {
        throw new Error('Gagal mengupdate produk');
      }

      const updatedProduct = await response.json();
      setProduct(updatedProduct);
      setIsEditing(false);
      alert('Produk berhasil diupdate!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete product
  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1 // Ganti dengan user ID dari session/auth
        })
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus produk');
      }

      alert('Produk berhasil dihapus!');
      router.push('/Admin/Proyek/Product');
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/Admin/Proyek/Product')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Kembali ke Daftar Produk
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product?.product_name || 'Product Detail'} - Admin</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Detail Produk</h1>
            <button
              onClick={() => router.push('/Admin/Proyek/Product')}
              className="text-blue-500 hover:text-blue-600"
            >
              ← Kembali
            </button>
          </div>

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
                disabled={loading}
              >
                Edit Produk
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                disabled={loading}
              >
                Hapus Produk
              </button>
            </div>
          )}

          {/* Content */}
          <div className="bg-white shadow-md rounded-lg p-6">
            {!isEditing ? (
              // View Mode
              <div className="space-y-4">
                {product?.product_image && (
                  <div className="mb-6">
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div>
                  <label className="font-semibold text-gray-700">Nama Produk:</label>
                  <p className="text-gray-900 mt-1">{product?.product_name}</p>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Deskripsi:</label>
                  <p className="text-gray-900 mt-1">{product?.description || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700">Tahun:</label>
                    <p className="text-gray-900 mt-1">{product?.tahun}</p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700">Status:</label>
                    <p className="text-gray-900 mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        product?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product?.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700">Kategori:</label>
                    <p className="text-gray-900 mt-1">{product?.category?.category_name || '-'}</p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700">Klien:</label>
                    <p className="text-gray-900 mt-1">{product?.client?.client_name || '-'}</p>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Nilai Proyek:</label>
                  <p className="text-gray-900 mt-1">
                    {product?.project_value 
                      ? `Rp ${parseFloat(product.project_value).toLocaleString('id-ID')}`
                      : '-'
                    }
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Dibuat oleh:</label>
                  <p className="text-gray-900 mt-1">{product?.createdBy?.username || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <label className="font-semibold">Dibuat pada:</label>
                    <p className="mt-1">
                      {product?.created_at 
                        ? new Date(product.created_at).toLocaleDateString('id-ID')
                        : '-'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="font-semibold">Diupdate pada:</label>
                    <p className="mt-1">
                      {product?.updated_at 
                        ? new Date(product.updated_at).toLocaleDateString('id-ID')
                        : '-'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    URL Gambar Produk
                  </label>
                  <input
                    type="text"
                    name="product_image"
                    value={formData.product_image}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Tahun *
                    </label>
                    <input
                      type="text"
                      name="tahun"
                      value={formData.tahun}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Nilai Proyek
                  </label>
                  <input
                    type="number"
                    name="project_value"
                    value={formData.project_value}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data
                      setFormData({
                        product_name: product.product_name || '',
                        description: product.description || '',
                        product_image: product.product_image || '',
                        tahun: product.tahun || '',
                        category_id: product.category_id || '',
                        client_id: product.client_id || '',
                        status: product.status || '',
                        project_value: product.project_value || ''
                      });
                    }}
                    disabled={loading}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 disabled:bg-gray-400"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}