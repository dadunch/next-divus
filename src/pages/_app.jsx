import { useEffect, useState } from 'react';
import Head from 'next/head';
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
  // Route Auth Admin
  const isAuthRoute = path === '/admindvs';
  // Route Admin Panel (setelah login)
  const isAdminRoute = path.startsWith('/Admin');
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
    const handleRouteChangeStart = (url) => {
      // Optimization: Skip full loading screen for Admin internal navigation to feel faster
      if (path.startsWith('/Admin') && url.startsWith('/Admin')) {
        return;
      }
      setIsPageLoading(true);
    };

    // Handle route change complete - hide loading & scroll to top
    const handleRouteChangeComplete = () => {
      // Check if we are in admin to behave differently if needed, but for now just reduce delay
      window.scrollTo(0, 0);
      // Delay sedikit untuk smooth transition, dipercepat dari 300ms ke 50ms
      setTimeout(() => {
        setIsPageLoading(false);
      }, 50);
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
  }, [router, path]);

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
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="PT Divus Global Mediacomm menghadirkan layanan konsultasi manajemen, riset, laporan, dan komunikasi korporat untuk mendukung pertumbuhan serta nilai strategis bisnis." />
        <meta property="og:site_name" content="PT Divus Global Mediacomm" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="PT Divus Global Mediacomm" />
        <meta property="og:description" content="PT Divus Global Mediacomm menghadirkan layanan konsultasi manajemen, riset, laporan, dan komunikasi korporat." />
        <meta property="og:image" content="https://divusglobal.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`https://divusglobal.com${path === '/' ? '' : path}`} />
        {(isAdminRoute || isAuthRoute) && (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "PT Divus Global Mediacomm",
              "url": "https://divusglobal.com",
              "logo": "https://divusglobal.com/assets/Logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+62-8522-0203-453",
                "contactType": "customer service"
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Purwakarta",
                "addressRegion": "Jawa Barat",
                "addressCountry": "ID"
              }
            })
          }}
        />
      </Head>
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
              <main className="grow w-full" style={{ minHeight: '85vh' }}>
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