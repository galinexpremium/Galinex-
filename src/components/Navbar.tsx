import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Heart, BarChart3, User, Menu, X, Phone, BookOpen } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { useAuth } from '@/store/AuthContext';
import { BRAND_NAME, BRAND_PHONE } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { formatPrice, getProductImageUrl } from '@/lib/format';

export default function Navbar() {
  const { navigate, currentPage, cartCount, wishlistCount, compareCount, isMenuOpen, setMenuOpen, isSearchOpen, setSearchOpen, setCatalogueOpen, cartPulse } = useStore();
  const { user, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchReqId = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const reqId = ++searchReqId.current;
    const timer = setTimeout(async () => {
      const escaped = searchQuery.replace(/[%_\\]/g, '\\$&');
      const { data } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${escaped}%`)
        .eq('is_active', true)
        .limit(6);
      if (reqId === searchReqId.current) {
        setSearchResults(data as Product[] ?? []);
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (isSearchOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isSearchOpen, setSearchOpen]);

  const navLinks = [
    { label: 'Shop', page: 'shop' as const },
    { label: 'About', page: 'about' as const },
    { label: 'Gallery', page: 'gallery' as const },
    { label: 'Reviews', page: 'reviews' as const },
    { label: 'FAQ', page: 'faq' as const },
    { label: 'Contact', page: 'contact' as const },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg border-b border-gold-200/40 dark:border-gold-900/30'
            : 'bg-transparent'
        }`}
      >
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-walnut-950 via-walnut-900 to-walnut-950 text-cream/90 text-xs py-2 px-4 border-b border-gold-500/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <a href={`tel:${BRAND_PHONE}`} className="flex items-center gap-1.5 hover:text-gold-400 transition-colors">
                <Phone size={12} className="text-gold-500" />
                <span className="font-light">{BRAND_PHONE}</span>
              </a>
              <span className="hidden md:inline text-gold-500/40">|</span>
              <span className="hidden md:inline text-gold-400/90 font-light">Pan India Express Delivery</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCatalogueOpen(true)}
                className="flex items-center gap-1 text-gold-400 hover:text-gold-300 transition-colors font-medium cursor-pointer"
              >
                <BookOpen size={12} />
                <span>PDF Catalogue</span>
              </button>
              <span className="text-gold-500/40">|</span>
              <button
                onClick={() => navigate('track-order')}
                className="text-cream/70 hover:text-gold-400 transition-colors cursor-pointer"
              >
                Track Order
              </button>
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-walnut-700 dark:text-cream/70 hover:text-gold-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Brand Logo */}
            <button
              onClick={() => navigate('home')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <span className="font-display text-2xl sm:text-3xl tracking-[0.25em] text-walnut-900 dark:text-cream font-medium group-hover:text-gold-600 transition-colors duration-300">
                {BRAND_NAME}
              </span>
              <span className="text-[9px] tracking-[0.35em] text-gold-600 dark:text-gold-400 font-light uppercase -mt-1">
                Luxury Personalized Gifts
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <button
                  key={link.page}
                  onClick={() => navigate(link.page)}
                  className={`text-xs uppercase tracking-[0.2em] transition-all duration-300 py-2 relative cursor-pointer ${
                    currentPage === link.page
                      ? 'text-gold-600 dark:text-gold-400 font-medium'
                      : 'text-walnut-700 dark:text-cream/70 hover:text-gold-600 dark:hover:text-gold-400 font-light'
                  }`}
                >
                  {link.label}
                  {currentPage === link.page && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
                  )}
                </button>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(!isSearchOpen)}
                className="p-2.5 text-walnut-700 dark:text-cream/70 hover:text-gold-600 transition-colors duration-300 cursor-pointer"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <button
                onClick={() => navigate('compare')}
                className="p-2.5 text-walnut-700 dark:text-cream/70 hover:text-gold-600 transition-colors duration-300 relative hidden sm:block cursor-pointer"
                aria-label="Compare"
              >
                <BarChart3 size={20} />
                {compareCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold-600 text-ivory text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {compareCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('wishlist')}
                className="p-2.5 text-walnut-700 dark:text-cream/70 hover:text-gold-600 transition-colors duration-300 relative cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold-600 text-ivory text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate(user ? 'account' : 'login')}
                className="p-2.5 text-walnut-700 dark:text-cream/70 hover:text-gold-600 transition-colors duration-300 hidden sm:block cursor-pointer"
                aria-label="Account"
              >
                <User size={20} />
              </button>

              <button
                onClick={() => navigate('cart')}
                className={`p-2.5 text-walnut-700 dark:text-cream/70 hover:text-gold-600 transition-colors duration-300 relative cursor-pointer ${
                  cartPulse ? 'animate-cart-bounce text-gold-500' : ''
                }`}
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 bg-gold-600 text-ivory text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center transition-transform ${cartPulse ? 'scale-125 bg-gold-500' : 'scale-100'}`}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div ref={searchRef} className="absolute left-0 right-0 top-full glass border-t border-gold-200/30 dark:border-gold-900/20 p-6 z-50 animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-walnut-400" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search for personalized gifts..."
                    className="w-full pl-12 pr-4 py-4 rounded-input bg-cream/50 dark:bg-walnut-900/50 text-walnut-900 dark:text-cream border border-gold-200/40 dark:border-gold-900/30 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-all duration-300 text-sm"
                  />
                </div>
                {searching && (
                  <div className="mt-4 text-center text-sm text-walnut-400 py-4">Searching…</div>
                )}
                {!searching && searchQuery.trim() && searchResults.length === 0 && (
                  <div className="mt-4 text-center text-sm text-walnut-400 py-4">No products found for "{searchQuery}"</div>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
                    {searchResults.map(product => (
                      <button
                        key={product.id}
                        onClick={() => {
                          navigate('product', { slug: product.slug });
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-4 p-3 rounded-input hover:bg-cream/50 dark:hover:bg-walnut-900/50 text-left transition-colors duration-300"
                      >
                        <img src={getProductImageUrl(product)} alt={product.name} className="w-14 h-14 rounded-card object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-walnut-900 dark:text-cream font-display">{product.name}</p>
                          <p className="text-xs text-walnut-500">{formatPrice(product.sale_price ?? product.base_price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden glass border-t border-gold-200/30 dark:border-gold-900/20 animate-fade-in">
            <div className="px-4 py-6 space-y-1">
              {navLinks.map(link => (
                <button
                  key={link.page}
                  onClick={() => navigate(link.page)}
                  className={`block w-full text-left px-5 py-4 rounded-input text-sm font-medium tracking-wide transition-colors duration-300 ${
                    currentPage === link.page
                      ? 'bg-gold-50 text-gold-700 dark:bg-gold-900/20 dark:text-gold-400'
                      : 'text-walnut-700 dark:text-cream/70 hover:bg-cream/50 dark:hover:bg-walnut-900/50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setCatalogueOpen(true);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2.5 w-full text-left px-5 py-4 rounded-input text-sm font-medium text-champagne-700 dark:text-champagne-400 hover:bg-cream/50 dark:hover:bg-walnut-900/50 transition-colors"
              >
                <BookOpen size={18} />
                <span>PDF Product Catalogue</span>
              </button>
              <button
                onClick={() => navigate(user ? 'account' : 'login')}
                className="block w-full text-left px-5 py-4 rounded-input text-sm font-medium text-walnut-700 dark:text-cream/70 hover:bg-cream/50 dark:hover:bg-walnut-900/50 transition-colors"
              >
                {user ? 'My Account' : 'Login / Register'}
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate('admin')}
                  className="block w-full text-left px-5 py-4 rounded-input text-sm font-medium text-gold-700 dark:text-gold-500 hover:bg-cream/50 dark:hover:bg-walnut-900/50 transition-colors"
                >
                  Admin Dashboard
                </button>
              )}
              <a
                href={`tel:${BRAND_PHONE}`}
                className="flex items-center gap-2 px-5 py-4 text-sm font-medium text-walnut-700 dark:text-cream/70"
              >
                <Phone size={18} /> {BRAND_PHONE}
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
