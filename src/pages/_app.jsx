import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../store';
import { login } from '../store/slices/authSlice';
import AdminLayout from '../layouts/AdminLayouts';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import '../global.css';
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;


const AuthCheck = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedUser = localStorage.getItem('adminUser');

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        dispatch(login(userData));
      } catch (error) {
        console.error("Gagal memulihkan sesi:", error);
        localStorage.removeItem('adminUser');
      }
    }
  }, [dispatch]);

  return children;
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const path = router.pathname;
  const isAuthRoute = path === '/Admin/LoginAdmin' || path === '/Admin/RegisterAdmin';
  const isAdminRoute = path.startsWith('/Admin') && !isAuthRoute;
  const is404 = path === '/404' || Component.name === 'Custom404'; // Tambahkan pengecekan 404

  return (
    <Provider store={store}>
      <AuthCheck>
        {isAdminRoute ? (
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        ) : isAuthRoute || is404 ? ( // Tambahkan is404 ke kondisi tanpa layout
          <Component {...pageProps} />
        ) : (
          <>
            <Navbar />
            <Component {...pageProps} />
            <Footer />
          </>
        )}
      </AuthCheck>
    </Provider >
  );
}

export default MyApp;