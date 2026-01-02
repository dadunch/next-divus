import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../store';
import { login } from '../store/slices/authSlice';
import AdminLayout from '../layouts/AdminLayouts';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
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
  const is404 = path === '/404' || Component.name === 'Custom404';

  // Loading state untuk prevent flash of content
  const [isPageLoading, setIsPageLoading] = useState(true);

  // FIX: Reset scroll position on route change & page load
  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Handle route change start - show loading
    const handleRouteChangeStart = () => {
      setIsPageLoading(true);
    };

    // Handle route change complete - hide loading & scroll to top
    const handleRouteChangeComplete = () => {
      window.scrollTo(0, 0);
      // Delay sedikit untuk smooth transition
      setTimeout(() => {
        setIsPageLoading(false);
      }, 300);
    };

    // Handle route change error - hide loading
    const handleRouteChangeError = () => {
      setIsPageLoading(false);
    };

    // Subscribe to router events
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    // Initial page load
    window.scrollTo(0, 0);

    // Hide loading screen after initial mount
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800); // 800ms untuk smooth initial load

    return () => {
      clearTimeout(timer);
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router.events]);

  // Add/remove loading class from body
  useEffect(() => {
    if (isPageLoading) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
    }

    return () => {
      document.body.classList.remove('loading');
    };
  }, [isPageLoading]);

  return (
    <Provider store={store}>
      {/* Loading Screen - OUTSIDE everything else */}
      <LoadingScreen isLoading={isPageLoading} />

      {/* Main Content - Only render when NOT loading */}
      <div style={{
        opacity: isPageLoading ? 0 : 1,
        visibility: isPageLoading ? 'hidden' : 'visible',
        transition: 'opacity 0.3s ease-in-out'
      }}>
        <AuthCheck>
          {isAdminRoute ? (
            <AdminLayout>
              <Component {...pageProps} />
            </AdminLayout>
          ) : isAuthRoute || is404 ? (
            <Component {...pageProps} />
          ) : (
            <>
              <Navbar />
              {/* Force minimum height on main content */}
              <main className="flex-grow w-full" style={{ minHeight: '85vh' }}>
                <Component {...pageProps} />
              </main>
              <Footer />
            </>
          )}
        </AuthCheck>
      </div>
    </Provider >
  );
}

export default MyApp;