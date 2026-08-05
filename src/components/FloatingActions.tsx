import { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/supabase';
import { useStore } from '@/store/StoreContext';

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const { navigate, currentPage } = useStore();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showMobileNav = ['home', 'shop', 'wishlist', 'cart', 'account'].includes(currentPage);

  return (
    <>
      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi GALINEX, I have a question about your products.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed right-4 sm:right-6 z-40 group transition-all duration-700 ${
          showTop ? 'bottom-24 sm:bottom-8' : 'bottom-24 sm:bottom-8'
        }`}
        aria-label="Chat on WhatsApp"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gold-500 rounded-full animate-ping opacity-15" />
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 flex items-center justify-center shadow-lg shadow-gold-600/20 transition-all duration-500 hover:scale-110">
            <MessageCircle size={24} className="text-ivory" fill="white" />
          </div>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 glass text-walnut-800 dark:text-cream text-xs font-light px-4 py-2 rounded-btn whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 group-hover:translate-x-0 hidden sm:block tracking-wide">
            Chat with us
          </span>
        </div>
      </a>

      {/* Back to Top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed left-4 sm:left-6 z-40 w-12 h-12 rounded-full glass text-walnut-800 dark:text-cream hover:bg-gold-500 hover:text-ivory flex items-center justify-center shadow-lg transition-all duration-500 hover:scale-110 ${showMobileNav ? 'bottom-24 sm:bottom-8' : 'bottom-8'}`}
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
}
