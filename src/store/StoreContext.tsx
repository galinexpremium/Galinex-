import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Product, CartItem, WishlistItem, Page, Coupon, ShippingAddress, CustomizationData } from '@/types';
import { supabase } from '@/lib/supabase';
import { getEffectivePrice } from '@/lib/format';

interface StoreContextValue {
  // Routing
  currentPage: Page;
  pageProps: Record<string, unknown>;
  navigate: (page: Page, props?: Record<string, unknown>) => void;

  // Cart
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: Product, opts?: { quantity?: number; variant?: string; customization?: string; photo?: string; customizationData?: CustomizationData }) => void;
  updateCartQuantity: (cartId: string, quantity: number) => void;
  removeFromCart: (cartId: string) => void;
  saveForLater: (cartId: string, saved: boolean) => void;
  clearCart: () => void;

  // Wishlist
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Compare
  compareItems: Product[];
  compareCount: number;
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;

  // Recently Viewed
  recentlyViewed: Product[];
  addRecentlyViewed: (product: Product) => void;

  // Coupon
  appliedCoupon: Coupon | null;
  couponCode: string | null;
  discountAmount: number;
  applyCoupon: (code: string, subtotal: number) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  // Checkout
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (addr: ShippingAddress) => void;
  paymentMethod: string;
  setPaymentMethod: (m: string) => void;

  // UI
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  isCatalogueOpen: boolean;
  setCatalogueOpen: (open: boolean) => void;

  // Session
  sessionId: string;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

function getSessionId(): string {
  let id = localStorage.getItem('galinex_session');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('galinex_session', id);
  }
  return id;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageProps, setPageProps] = useState<Record<string, unknown>>({});

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [compareItems, setCompareItems] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isCatalogueOpen, setCatalogueOpen] = useState(false);
  const [sessionId] = useState(getSessionId);

  // Load persisted state
  useEffect(() => {
    const savedCart = localStorage.getItem('galinex_cart');
    if (savedCart) {
      try { setCartItems(JSON.parse(savedCart)); } catch { /* ignore */ }
    }
    const savedWishlist = localStorage.getItem('galinex_wishlist');
    if (savedWishlist) {
      try { setWishlistItems(JSON.parse(savedWishlist)); } catch { /* ignore */ }
    }
    const savedCompare = localStorage.getItem('galinex_compare');
    if (savedCompare) {
      try { setCompareItems(JSON.parse(savedCompare)); } catch { /* ignore */ }
    }
    const savedRecent = localStorage.getItem('galinex_recent');
    if (savedRecent) {
      try { setRecentlyViewed(JSON.parse(savedRecent)); } catch { /* ignore */ }
    }
  }, []);

  // Persist state
  useEffect(() => { localStorage.setItem('galinex_cart', JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem('galinex_wishlist', JSON.stringify(wishlistItems)); }, [wishlistItems]);
  useEffect(() => { localStorage.setItem('galinex_compare', JSON.stringify(compareItems)); }, [compareItems]);
  useEffect(() => { localStorage.setItem('galinex_recent', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMenuOpen(false);
  }, [currentPage]);

  const navigate = useCallback((page: Page, props: Record<string, unknown> = {}) => {
    setCurrentPage(page);
    setPageProps(props);
  }, []);

  // Cart operations
  const addToCart = useCallback((product: Product, opts?: { quantity?: number; variant?: string; customization?: string; photo?: string; customizationData?: CustomizationData }) => {
    const quantity = opts?.quantity ?? 1;
    const variant = opts?.variant ?? null;
    const customization = opts?.customization ?? null;
    const photo = opts?.photo ?? null;
    const customizationData = opts?.customizationData ?? null;
    const customizationText = customizationData?.text || customization;
    const photoUrl = customizationData?.photo_url || photo;

    setCartItems(prev => {
      const existing = prev.find(i =>
        i.product_id === product.id &&
        i.variant_name === variant &&
        i.customization_text === customizationText &&
        i.photo_url === photoUrl &&
        !i.saved_for_later
      );
      if (existing) {
        return prev.map(i =>
          i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      const newItem: CartItem = {
        id: 'cart_' + Math.random().toString(36).substring(2),
        product_id: product.id,
        product,
        variant_name: variant,
        quantity,
        customization_text: customizationText,
        photo_url: photoUrl,
        customization_data: customizationData,
        saved_for_later: false,
      };
      return [...prev, newItem];
    });
  }, []);

  const updateCartQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(i => i.id === cartId ? { ...i, quantity } : i));
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== cartId));
  }, []);

  const saveForLater = useCallback((cartId: string, saved: boolean) => {
    setCartItems(prev => prev.map(i => i.id === cartId ? { ...i, saved_for_later: saved } : i));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems(prev => prev.filter(i => i.saved_for_later));
  }, []);

  // Wishlist
  const toggleWishlist = useCallback((product: Product) => {
    setWishlistItems(prev => {
      const exists = prev.find(i => i.product_id === product.id);
      if (exists) return prev.filter(i => i.product_id !== product.id);
      return [...prev, { id: 'wl_' + Math.random().toString(36).substring(2), product_id: product.id, product }];
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlistItems.some(i => i.product_id === productId);
  }, [wishlistItems]);

  // Compare
  const toggleCompare = useCallback((product: Product) => {
    setCompareItems(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 4) return prev;
      return [...prev, product];
    });
  }, []);

  const isInCompare = useCallback((productId: string) => {
    return compareItems.some(p => p.id === productId);
  }, [compareItems]);

  const clearCompare = useCallback(() => setCompareItems([]), []);

  // Recently viewed
  const addRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 10);
    });
  }, []);

  // Coupon
  const applyCoupon = useCallback(async (code: string, subtotal: number): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        return { success: false, message: 'Invalid coupon code' };
      }

      const coupon = data as Coupon;
      if (coupon.min_order_amount > subtotal) {
        return { success: false, message: `Minimum order of ₹${coupon.min_order_amount} required` };
      }

      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = Math.round((subtotal * coupon.discount_value) / 100);
      } else {
        discount = coupon.discount_value;
      }

      setAppliedCoupon(coupon);
      setCouponCode(coupon.code);
      setDiscountAmount(discount);
      return { success: true, message: `Coupon applied! You save ₹${discount}` };
    } catch {
      return { success: false, message: 'Failed to apply coupon' };
    }
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCode(null);
    setDiscountAmount(0);
  }, []);

  // Computed
  const activeCartItems = cartItems.filter(i => !i.saved_for_later);
  const cartCount = activeCartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = activeCartItems.reduce((sum, i) => {
    const price = i.product ? getEffectivePrice(i.product) : 0;
    return sum + price * i.quantity;
  }, 0);

  const value: StoreContextValue = {
    currentPage, pageProps, navigate,
    cartItems: activeCartItems, cartCount, cartSubtotal,
    addToCart, updateCartQuantity, removeFromCart, saveForLater, clearCart,
    wishlistItems, wishlistCount: wishlistItems.length, toggleWishlist, isInWishlist,
    compareItems, compareCount: compareItems.length, toggleCompare, isInCompare, clearCompare,
    recentlyViewed, addRecentlyViewed,
    appliedCoupon, couponCode, discountAmount, applyCoupon, removeCoupon,
    shippingAddress, setShippingAddress, paymentMethod, setPaymentMethod,
    isMenuOpen, setMenuOpen, isSearchOpen, setSearchOpen,
    isCatalogueOpen, setCatalogueOpen,
    sessionId,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
