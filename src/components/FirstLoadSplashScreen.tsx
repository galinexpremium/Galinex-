import { useEffect, useState } from 'react';

export default function FirstLoadSplashScreen() {
  const [show, setShow] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !sessionStorage.getItem('galinex_intro_shown');
    } catch {
      return false;
    }
  });
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!show) return;

    // Start gentle fade-out after ~850ms
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 850);

    // Complete transition and unmount after ~1250ms total
    const removeTimer = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem('galinex_intro_shown', 'true');
      } catch {
        // Safe sessionStorage fallback
      }
    }, 1250);

    // Hard fallback maximum ~1500ms
    const safetyTimer = setTimeout(() => {
      setShow(false);
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      clearTimeout(safetyTimer);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0E0A08] transition-opacity duration-400 ease-out select-none pointer-events-none ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center text-center px-4">
        {/* Brand Logotype */}
        <h1 className="brand-intro-logo font-display text-3xl sm:text-4xl md:text-5xl tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-[#F0D5A3] via-[#E8C882] to-[#B08D57] font-light">
          GALINEX
        </h1>

        {/* Elegant Expanding Gold Line */}
        <div className="w-20 sm:w-28 h-[1.5px] bg-gradient-to-r from-transparent via-[#D97706] to-transparent my-3 brand-intro-line" />

        {/* Subtitle */}
        <p className="brand-intro-subtitle text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.28em] text-[#C5A880]/85 font-light">
          Luxury Personalized Gifts
        </p>
      </div>
    </div>
  );
}
