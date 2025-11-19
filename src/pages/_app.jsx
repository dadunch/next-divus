import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import { store } from '../store';
import AdminLayout from '../layouts/AdminLayouts';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import Footer2 from '../components/Footer2';
import '../global.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const path = router.pathname;
  const isAuthRoute = path === '/Admin/LoginAdmin' || path === '/Admin/RegisterAdmin';

  const isAdminRoute = path.startsWith('/Admin') && !isAuthRoute;

  return (
    <Provider store={store}>
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
    </Provider>
  );
}

export default MyApp;