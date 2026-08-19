import { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { buildDirectWhatsAppUrl } from '@/lib/whatsapp';

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const { currentPage } = useStore();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Show helper bubble after 1.5s on load, auto-hide after 4.5s
  useEffect(() => {
    const showTimer = setTimeout(() => setShowHelper(true), 1500);
    const hideTimer = setTimeout(() => setShowHelper(false), 5500);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const showMobileNav = ['home', 'shop', 'wishlist', 'cart', 'account'].includes(currentPage);
  const whatsappUrl = buildDirectWhatsAppUrl('Hi GALINEX, I have a question about your personalized gifts.');

  return (
    <>
      {/* Floating WhatsApp */}
      <aside
        aria-label="Contact options"
        className={`fixed right-4 sm:right-6 z-40 group transition-all duration-500 max-w-full ${
          showMobileNav ? 'bottom-20 sm:bottom-6' : 'bottom-6'
        }`}
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center cursor-pointer"
          aria-label="Chat on WhatsApp"
        >
          {/* Subtle pulse ring on initial load */}
          <div className="absolute inset-0 bg-gold-500 rounded-full animate-ping opacity-15" />
          
          <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 flex items-center justify-center shadow-xl shadow-black/40 transition-all duration-300 hover:scale-105 active:scale-95 border border-emerald-400/20">
            <MessageCircle size={22} className="text-ivory" fill="white" />
          </div>

          {/* Helper Bubble */}
          <span
            className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#1A120C]/95 backdrop-blur-md border border-gold-500/30 text-cream text-xs font-light px-3.5 py-1.5 rounded-xl whitespace-nowrap shadow-xl shadow-black/60 transition-all duration-300 pointer-events-none hidden sm:flex items-center gap-1.5 ${
              showHelper
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Need help? <strong className="font-medium text-gold-400">Chat with us</strong></span>
          </span>
        </a>
      </aside>

      {/* Back to Top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed left-4 sm:left-6 z-40 w-11 h-11 rounded-full bg-[#1A120C]/90 backdrop-blur-md border border-gold-500/30 text-gold-400 hover:text-ivory hover:bg-gold-600 flex items-center justify-center shadow-xl shadow-black/50 transition-all duration-300 hover:scale-105 active:scale-95 animate-fade-in cursor-pointer ${
            showMobileNav ? 'bottom-20 sm:bottom-6' : 'bottom-6'
          }`}
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </>
  );
}
