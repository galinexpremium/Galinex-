import { lazy, Suspense, useEffect } from 'react';
import { StoreProvider, useStore } from '@/store/StoreContext';
import { AuthProvider } from '@/store/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import MobileNav from '@/components/MobileNav';
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';

const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const AccountPage = lazy(() => import('@/pages/AccountPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const ReviewsPage = lazy(() => import('@/pages/ReviewsPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const TrackOrderPage = lazy(() => import('@/pages/TrackOrderPage'));
import PdfCatalogueModal from '@/components/PdfCatalogueModal';
import ErrorBoundary from '@/components/ErrorBoundary';

function PageRouter() {
  const { currentPage } = useStore();

  switch (currentPage) {
    case 'home': return <HomePage />;
    case 'shop': return <ShopPage />;
    case 'product': return <ProductDetailPage />;
    case 'cart': return <CartPage />;
    case 'checkout': return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><CheckoutPage /></Suspense>;
    case 'wishlist': return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><WishlistPage /></Suspense>;
    case 'compare': return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><ComparePage /></Suspense>;
    case 'login': return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><AuthPage mode="login" /></Suspense>;
    case 'register': return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><AuthPage mode="register" /></Suspense>;
    case 'account': return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><AccountPage /></Suspense>;
    case 'admin': return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><AdminPage /></Suspense>;
    case 'about': return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><AboutPage /></Suspense>;
    case 'gallery': return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><GalleryPage /></Suspense>;
    case 'reviews': return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><ReviewsPage /></Suspense>;
    case 'faq': return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><FAQPage /></Suspense>;
    case 'contact': return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><ContactPage /></Suspense>;
    case 'track-order':
    case 'orders':
      return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-walnut-400">Loading…</div>}><TrackOrderPage /></Suspense>;
    default: return <HomePage />;
  }
}

const META: Record<string, { title: string; description: string }> = {
  home: { title: 'GALINEX | Premium Personalized Gifts — Crystal, Wood & Acrylic', description: 'Premium personalized gifts from GALINEX. Custom crystal, wood, and acrylic keepsakes for birthdays, anniversaries, and special occasions.' },
  shop: { title: 'Shop All Products | GALINEX', description: 'Browse our full collection of premium personalized gifts. Filter by occasion, material, and price.' },
  product: { title: 'Product | GALINEX', description: 'Premium personalized gift from GALINEX.' },
  cart: { title: 'Shopping Cart | GALINEX', description: 'Review your selected items before checkout.' },
  checkout: { title: 'Checkout | GALINEX', description: 'Complete your order securely with GALINEX.' },
  wishlist: { title: 'My Wishlist | GALINEX', description: 'Your saved favorite products from GALINEX.' },
  compare: { title: 'Compare Products | GALINEX', description: 'Compare features and prices of our premium gifts.' },
  login: { title: 'Sign In | GALINEX', description: 'Sign in to your GALINEX account.' },
  register: { title: 'Create Account | GALINEX', description: 'Create a GALINEX account to track orders and save favorites.' },
  account: { title: 'My Account | GALINEX', description: 'Manage your profile, orders, and wishlist.' },
  admin: { title: 'Admin Dashboard | GALINEX', description: 'Admin dashboard for managing GALINEX store.' },
  about: { title: 'About Us | GALINEX', description: 'Learn about GALINEX — our story, craftsmanship, and commitment to premium personalized gifts.' },
  gallery: { title: 'Gallery | GALINEX', description: 'View our gallery of personalized gift creations.' },
  reviews: { title: 'Customer Reviews | GALINEX', description: 'Read what our customers say about GALINEX personalized gifts.' },
  faq: { title: 'FAQ | GALINEX', description: 'Frequently asked questions about GALINEX products and orders.' },
  contact: { title: 'Contact Us | GALINEX', description: 'Get in touch with GALINEX for inquiries and support.' },
  'track-order': { title: 'Track Your Order | GALINEX', description: 'Track the real-time shipping and delivery status of your GALINEX order.' },
  orders: { title: 'Track Your Order | GALINEX', description: 'Track the real-time shipping and delivery status of your GALINEX order.' },
};

function ensureMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function ensureCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

function ensureJsonLd(data: Record<string, unknown>) {
  let el = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function AppContent() {
  const { currentPage, isCatalogueOpen, setCatalogueOpen } = useStore();
  const meta = META[currentPage] ?? META.home;

  useEffect(() => {
    document.title = meta.title;
    ensureMetaTag('description', meta.description);
    ensureMetaTag('og:title', meta.title, 'property');
    ensureMetaTag('og:description', meta.description, 'property');
    ensureMetaTag('og:type', 'website', 'property');
    ensureMetaTag('og:site_name', 'GALINEX', 'property');
    ensureMetaTag('twitter:card', 'summary_large_image');
    ensureMetaTag('twitter:title', meta.title);
    ensureMetaTag('twitter:description', meta.description);
    ensureCanonical(window.location.href);
    ensureJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'GALINEX',
      description: 'Premium personalized gifts — crystal, wood & acrylic.',
      url: window.location.origin,
    });
  }, [meta]);

  return (
    <div className="min-h-screen bg-ivory dark:bg-walnut-950 flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0">
        <PageRouter />
      </main>
      <Footer />
      <FloatingActions />
      <MobileNav />
      <PdfCatalogueModal isOpen={isCatalogueOpen} onClose={() => setCatalogueOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
