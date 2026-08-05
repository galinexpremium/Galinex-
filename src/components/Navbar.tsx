import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Heart, BarChart3, User, Menu, X, Phone } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { useAuth } from '@/store/AuthContext';
import { BRAND_NAME, BRAND_PHONE } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/format';

export default function Navbar() {
  const { navigate, currentPage, cartCount, wishlistCount, compareCount, isMenuOpen, setMenuOpen, isSearchOpen, setSearchOpen } = useStore();
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
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setSearchOpen]);

  const navLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Collections', page: 'shop' as const },
    { label: 'About', page: 'about' as const },
    { label: 'Gallery', page: 'gallery' as const },
    { label: 'Reviews', page: 'reviews' as const },
    { label: 'FAQ', page: 'faq' as const },
    { label: 'Contact', page: 'contact' as const },
  ];

  return (
    <>
      {/* Luxury Top Bar */}
      <div className="bg-walnut-950 text-cream/70 text-[10px] tracking-luxury uppercase py-3 px-4 text-center font-light hidden md:block">
        Crafted with Precision
        <span className="mx-4 text-gold-500">•</span>
        Premium Personalized Gifts
        <span className="mx-4 text-gold-500">•</span>
        Pan India Delivery
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'glass shadow-md py-0'
          : 'bg-ivory dark:bg-walnut-950 border-b border-gold-200/30 dark:border-gold-900/20'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 -ml-2 text-walnut-800 dark:text-cream hover:text-gold-600 transition-colors duration-300"
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2 group"
            >
              <span className="text-2xl lg:text-3xl font-display font-semibold tracking-wider2 text-walnut-900 dark:text-cream group-hover:text-gold-500 transition-colors duration-700">
                {BRAND_NAME}
              </span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map(link => (
                <button
                  key={link.page}
                  onClick={() => navigate(link.page)}
                  className={`text-[13px] font-medium tracking-wide transition-colors duration-300 relative group ${
                    currentPage === link.page
                      ? 'text-gold-600'
                      : 'text-walnut-700 dark:text-cream/70 hover:text-gold-600'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1.5 left-0 h-px bg-gold-500 transition-all duration-500 ${
                    currentPage === link.page ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => navigate('admin')}
                  className={`text-[13px] font-medium tracking-wide transition-colors ${currentPage === 'admin' ? 'text-gold-600' : 'text-gold-700 dark:text-gold-500 hover:text-gold-600'}`}
                >
                  Admin
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={() => setSearchOpen(!isSearchOpen)}
                className="p-2.5 text-walnut-700 dark:text-cream/70 hover:text-gold-600 transition-colors duration-300"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <button
                onClick={() => navigate('compare')}
                className="p-2.5 text-walnut-700 dark:text-cream/70 hover:text-gold-600 transition-colors duration-300 relative hidden sm:block"
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
                className="p-2.5 text-walnut-700 dark:text-cream/70 hover:text-gold-600 transition-colors duration-300 relative"
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
                className="p-2.5 text-walnut-700 dark:text-cream/70 hover:text-gold-600 transition-colors duration-300 hidden sm:block"
                aria-label="Account"
              >
                <User size={20} />
              </button>

              <button
                onClick={() => navigate('cart')}
                className="p-2.5 text-walnut-700 dark:text-cream/70 hover:text-gold-600 transition-colors duration-300 relative"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold-600 text-ivory text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
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
                        <img src={product.image_url ?? ''} alt={product.name} className="w-14 h-14 rounded-card object-cover" />
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
        </nav>

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
