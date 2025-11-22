import { useEffect } from 'react'; // 1. Import useEffect
import { useRouter } from 'next/router';
import { Provider, useDispatch } from 'react-redux'; // 2. Import useDispatch
import { store } from '../store';
import { login } from '../store/slices/authSlice'; // 3. Import action login Anda (SESUAIKAN PATH INI)
import AdminLayout from '../layouts/AdminLayouts';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import Footer2 from '../components/Footer2';
import '../global.css';

// --- KOMPONEN WRAPPER KHUSUS ---
// Kita butuh ini karena kita tidak bisa pakai useDispatch langsung di MyApp
// sebelum <Provider> merender children-nya.
const AuthCheck = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Cek apakah ada data user yang tersimpan di LocalStorage?
    const savedUser = localStorage.getItem('adminUser');

    if (savedUser) {
      try {
        // Jika ada, kembalikan datanya ke Redux Store
        const userData = JSON.parse(savedUser);
        dispatch(login(userData)); 
      } catch (error) {
        console.error("Gagal memulihkan sesi:", error);
        localStorage.removeItem('adminUser'); // Bersihkan jika data korup
      }
    }
  }, [dispatch]);

  return children; // Render halaman seperti biasa
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const path = router.pathname;
  const isAuthRoute = path === '/Admin/LoginAdmin' || path === '/Admin/RegisterAdmin';
  const isAdminRoute = path.startsWith('/Admin') && !isAuthRoute;

  return (
    <Provider store={store}>
      {/* Bungkus logika layout dengan AuthCheck */}
      <AuthCheck>
        {isAdminRoute ? (
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        ) : isAuthRoute ? (
          <Component {...pageProps} />
        ) : (
          <>
            <Navbar />
            <Component {...pageProps} />
            {['/User/Contact', '/User/TentangKami', '/User/Proyek', '/User/LayananProduk'].includes(path) ? <Footer2 /> : <Footer />}
          </>
        )}
      </AuthCheck>
    </Provider>
  );
}

export default MyApp;