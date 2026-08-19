import { useEffect, useState, useRef } from 'react';
import { Star, Heart, BarChart3, ShoppingBag, Share2, Truck, Shield, RefreshCw, ChevronRight, Plus, Minus, MessageCircle, Check, X } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { supabase } from '@/lib/supabase';
import type { Product, Review, CustomizationData } from '@/types';
import { formatPrice, getEffectivePrice, getDiscountPercent, badgeLabel, badgeColor, getProductImageUrl } from '@/lib/format';
import { openWhatsApp, buildProductInquiryMessage, buildMdfQuoteRequestMessage } from '@/lib/whatsapp';
import ProductCard from '@/components/ProductCard';
import ProductCustomizer from '@/components/ProductCustomizer';

export default function ProductDetailPage() {
  const { pageProps, addToCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare, addRecentlyViewed, navigate, recentlyViewed } = useStore();
  const slug = (pageProps.slug as string) || (typeof window !== 'undefined' ? window.location.pathname.replace(/^\/+|\/+$/g, '').split('product/')[1] : '');
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customizationData, setCustomizationData] = useState<CustomizationData | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'faq'>('description');
  const [lightbox, setLightbox] = useState(false);
  const [reviewTab, setReviewTab] = useState<'reviews' | 'write'>('reviews');
  const [newReview, setNewReview] = useState({ reviewer_name: '', reviewer_email: '', rating: 5, comment: '', title: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isProcessingBuyNow, setIsProcessingBuyNow] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (actionsRef.current) {
        const rect = actionsRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (!data) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const p = data as Product;
      setProduct(p);

      const imgs: string[] = [];
      const primaryUrl = getProductImageUrl(p);
      imgs.push(primaryUrl);

      const { data: imgData } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', p.id)
        .order('sort_order');

      if (imgData) imgData.forEach(i => { if (!imgs.includes(i.image_url)) imgs.push(i.image_url); });
      setImages(imgs);
      const { data: revData } = await supabase.from('reviews').select('*').eq('product_id', p.id).eq('is_approved', true).order('created_at', { ascending: false });
      if (revData) setReviews(revData as Review[]);
      if (p.category_id) {
        const { data: relData } = await supabase.from('products').select('*, category:categories(*)').eq('category_id', p.category_id).neq('id', p.id).eq('is_active', true).limit(4);
        if (relData) setRelated(relData as Product[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || isAdded) return;
    setIsAdded(true);
    addToCart(product, {
      quantity,
      customization: customizationData?.text || undefined,
      photo: customizationData?.photo_url || undefined,
      customizationData: customizationData ?? undefined,
    });
    setTimeout(() => setIsAdded(false), 1400);
  };

  const handleBuyNow = () => {
    if (!product || isProcessingBuyNow) return;
    setIsProcessingBuyNow(true);
    handleAddToCart();
    setTimeout(() => {
      navigate('checkout');
    }, 250);
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const isPriced = (getEffectivePrice(product) > 0);
    const msg = isPriced
      ? buildProductInquiryMessage(product, customizationData)
      : buildMdfQuoteRequestMessage(product);
    openWhatsApp(msg);
  };

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="aspect-square rounded-card bg-cream dark:bg-walnut-800 animate-pulse" />
          <div className="space-y-4"><div className="h-10 bg-cream dark:bg-walnut-800 rounded animate-pulse" /><div className="h-4 bg-cream dark:bg-walnut-800 rounded w-3/4 animate-pulse" /><div className="h-20 bg-cream dark:bg-walnut-800 rounded animate-pulse" /></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory dark:bg-walnut-950">
        <div className="text-center">
          <p className="font-display text-3xl text-walnut-900 dark:text-cream mb-4">Product not found.</p>
          <button onClick={() => navigate('shop')} className="px-8 py-3 bg-walnut-900 dark:bg-cream text-ivory dark:text-walnut-900 font-medium rounded-card">Back to Collections</button>
        </div>
      </div>
    );
  }

  const price = getEffectivePrice(product);
  const discount = getDiscountPercent(product);
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const categorySlug = product.category?.slug || '';
  const isCrystal = categorySlug.includes('crystal') || categorySlug.includes('3d');
  const isWood = categorySlug.includes('wood');
  const isAcrylic = categorySlug.includes('acrylic');
  const isMoonLamp = categorySlug.includes('moon');
  const isHeartShape = product.slug.includes('heart');
  const isOvalShape = product.slug.includes('oval');

  return (
    <div className="min-h-screen bg-ivory dark:bg-walnut-950 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-walnut-400 mb-8 font-light tracking-wide">
        <button onClick={() => navigate('home')} className="hover:text-champagne-600">Home</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate('shop')} className="hover:text-champagne-600">Collections</button>
        {product.category && <><ChevronRight size={12} /><button onClick={() => navigate('shop', { category: product.category!.slug })} className="hover:text-champagne-600">{product.category.name}</button></>}
        <ChevronRight size={12} /><span className="text-walnut-700 dark:text-cream truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Images */}
        <div className="lg:sticky lg:top-28">
          <div className="relative aspect-[4/5] max-w-[480px] mx-auto rounded-2xl overflow-hidden bg-[#0d0b0a] border border-gold-400/20 shadow-2xl cursor-pointer group" onClick={() => setLightbox(true)}>
            {product.badge && <div className={`absolute top-4 left-4 z-10 px-3 py-1 text-[9px] font-semibold text-ivory uppercase tracking-wider rounded-md shadow-md ${badgeColor(product.badge)}`}>{badgeLabel(product.badge)}</div>}
            {discount > 0 && <div className="absolute top-4 right-4 z-10 px-2.5 py-1 bg-walnut-950/90 text-gold-300 text-[9px] font-semibold tracking-wider rounded-md border border-gold-500/30">-{discount}%</div>}
            
            {/* Base Product Photography */}
            <img src={images[activeImage] ?? getProductImageUrl(product)} alt={product.name} className="w-full h-full object-contain p-4 sm:p-6 transition-transform duration-700 group-hover:scale-105" />

            {/* Live Synchronized Personalization Engraving Layer */}
            {customizationData?.photo_url && activeImage === 0 && (
              <div
                className="absolute z-20 pointer-events-none transition-all duration-300 flex items-center justify-center overflow-hidden"
                style={{
                  top: isHeartShape ? '24%' : isOvalShape ? '22%' : isMoonLamp ? '18%' : '20%',
                  left: isHeartShape ? '20%' : isOvalShape ? '22%' : '20%',
                  width: isHeartShape ? '60%' : isOvalShape ? '56%' : '60%',
                  height: isHeartShape ? '52%' : isOvalShape ? '54%' : '54%',
                  maskImage: isHeartShape
                    ? 'radial-gradient(ellipse 52% 52% at 50% 46%, black 35%, rgba(0,0,0,0.85) 55%, transparent 85%)'
                    : 'radial-gradient(ellipse 48% 54% at 50% 46%, black 42%, rgba(0,0,0,0.8) 62%, transparent 88%)',
                  WebkitMaskImage: isHeartShape
                    ? 'radial-gradient(ellipse 52% 52% at 50% 46%, black 35%, rgba(0,0,0,0.85) 55%, transparent 85%)'
                    : 'radial-gradient(ellipse 48% 54% at 50% 46%, black 42%, rgba(0,0,0,0.8) 62%, transparent 88%)',
                  mixBlendMode: isWood ? 'multiply' : 'screen',
                  opacity: isWood ? 0.92 : 0.96,
                }}
              >
                <img
                  src={customizationData.photo_url}
                  alt="Engraved Portrait"
                  className="w-full h-full object-contain"
                  style={{
                    transform: `scale(${customizationData.photo_transform?.scale ?? 1}) rotate(${customizationData.rotation ?? 0}deg)`,
                    filter: isWood
                      ? 'sepia(90%) grayscale(30%) contrast(165%) brightness(88%)'
                      : isCrystal
                      ? 'grayscale(100%) contrast(150%) brightness(115%) drop-shadow(0 0 10px rgba(255,255,255,0.7))'
                      : 'grayscale(80%) brightness(125%) drop-shadow(0 0 12px rgba(255,225,150,0.65))',
                  }}
                />
              </div>
            )}

            {/* Live Synchronized Personalization Text Layer */}
            {customizationData?.text && activeImage === 0 && (
              <div
                className="absolute z-30 pointer-events-none text-center px-4 transition-all duration-300 w-full"
                style={{
                  top: isHeartShape ? '76%' : isWood ? '78%' : '80%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: customizationData.font,
                  color: isWood ? '#2b180d' : isAcrylic ? '#fff6df' : '#FFFFFF',
                  textShadow: isWood
                    ? '0 1px 1px rgba(255,255,255,0.4), inset 0 1px 2px rgba(0,0,0,0.6)'
                    : isAcrylic
                    ? '0 0 8px rgba(255,220,130,0.9)'
                    : '0 0 10px rgba(255,255,255,0.9)',
                }}
              >
                <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase truncate max-w-[280px] mx-auto">
                  {customizationData.text}
                </p>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-4 justify-center overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 border bg-[#0d0b0a] transition-all duration-300 ${activeImage === i ? 'border-gold-500 ring-2 ring-gold-500/50' : 'border-gold-200/20 opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={15} className={i <= Math.round(product.rating) ? 'text-champagne-500 fill-champagne-500' : 'text-beige-300'} />)}</div>
            <span className="text-sm text-walnut-400 font-light">{product.rating} ({product.review_count} reviews)</span>
            <span className="text-walnut-200">·</span>
            <span className="text-sm text-walnut-400 font-light">{product.sold_count} sold</span>
          </div>

          <h1 className="font-display text-4xl text-walnut-900 dark:text-cream mb-4 font-light leading-tight">{product.name}</h1>
          <p className="text-walnut-500 dark:text-beige-400 mb-8 font-light leading-relaxed">{product.short_description}</p>

          <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-champagne-200/30 dark:border-champagne-900/20">
            <span className={`font-display font-medium text-walnut-900 dark:text-cream ${price > 0 ? 'text-3xl' : 'text-xl text-champagne-600 dark:text-champagne-400 font-sans tracking-wide uppercase'}`}>
              {formatPrice(price)}
            </span>
            {price > 0 && product.sale_price && product.base_price && product.sale_price < product.base_price && (
              <span className="text-lg text-walnut-400 line-through font-light">{formatPrice(product.base_price)}</span>
            )}
            {price > 0 && discount > 0 && (
              <span className="px-3 py-1 bg-walnut-900 text-ivory text-[10px] font-medium tracking-wider">SAVE {discount}%</span>
            )}
          </div>

          {/* Personalization studio temporarily disabled in shopping flow (preserved for future phase) */}
          {/* {(product.is_customizable || product.requires_photo) && (
            <div className="mb-8 p-6 bg-cream/50 dark:bg-walnut-800/30 border border-champagne-200/30 dark:border-champagne-900/20 rounded-card">
              <h4 className="font-display text-lg text-walnut-900 dark:text-cream mb-4 flex items-center gap-2">
                <Plus size={16} className="text-champagne-600" /> Personalize Your Gift
              </h4>
              <ProductCustomizer
                product={product}
                productImage={images[activeImage] ?? getProductImageUrl(product)}
                productName={product.name}
                onChange={setCustomizationData}
              />
            </div>
          )} */}

          {/* Quantity */}
          <div className="flex items-center gap-5 mb-8">
            <span className="text-sm font-medium text-walnut-900 dark:text-cream">Quantity</span>
            <div className="flex items-center border border-champagne-200/40 dark:border-champagne-900/30 rounded-card">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-walnut-500 hover:text-champagne-600 transition-colors"><Minus size={15} /></button>
              <span className="px-5 font-display text-lg text-walnut-900 dark:text-cream">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-walnut-500 hover:text-champagne-600 transition-colors"><Plus size={15} /></button>
            </div>
            <span className="text-sm text-walnut-400 font-light">{product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Made to Order'}</span>
          </div>

          {/* Actions */}
          <div ref={actionsRef}>
            {price > 0 ? (
              <>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`flex-1 py-3.5 border font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 rounded-xl active:scale-[0.98] cursor-pointer ${
                      isAdded
                        ? 'border-emerald-600 bg-emerald-600 text-ivory shadow-md'
                        : 'border-gold-400/60 dark:border-gold-500/50 text-walnut-900 dark:text-cream hover:bg-gold-500/10'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} className="animate-scale-in" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isProcessingBuyNow}
                    className="flex-1 py-3.5 bg-gold-600 hover:bg-gold-500 disabled:bg-gold-700 text-ivory font-semibold text-xs uppercase tracking-wider transition-all duration-300 rounded-xl shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessingBuyNow ? (
                      <>
                        <div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Buy Now</span>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-ivory font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 rounded-xl mb-6 shadow-md shadow-emerald-950/30 active:scale-[0.98] cursor-pointer"
                >
                  <MessageCircle size={16} fill="white" /> Order via WhatsApp
                </button>
              </>
            ) : (
              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-ivory font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 rounded-xl mb-6 shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer"
              >
                <MessageCircle size={18} fill="white" /> Inquire Price & Custom Size on WhatsApp
              </button>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-3 mb-8">
            <button onClick={() => toggleWishlist(product)} className={`flex-1 py-3 border text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 rounded-card cursor-pointer ${inWishlist ? 'border-gold-500 text-gold-500 bg-gold-950/20' : 'border-champagne-200/40 dark:border-champagne-900/30 text-walnut-600 dark:text-cream/70 hover:border-gold-400'}`}>
              <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} /> {inWishlist ? 'Saved' : 'Wishlist'}
            </button>
            <button onClick={() => toggleCompare(product)} className={`flex-1 py-3 border text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 rounded-card cursor-pointer ${inCompare ? 'border-gold-500 text-gold-500 bg-gold-950/20' : 'border-champagne-200/40 dark:border-champagne-900/30 text-walnut-600 dark:text-cream/70 hover:border-gold-400'}`}>
              <BarChart3 size={15} /> Compare
            </button>
            <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href }).catch(() => {})} className="flex-1 py-3 border border-champagne-200/40 dark:border-champagne-900/30 text-walnut-600 dark:text-cream/70 hover:border-gold-400 text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 rounded-card cursor-pointer">
              <Share2 size={15} /> Share
            </button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-4 py-6 border-t border-champagne-200/30 dark:border-champagne-900/20">
            {[{ icon: Truck, label: 'Free Shipping', sub: 'Above ₹999' }, { icon: Shield, label: 'Secure', sub: 'Payment' }, { icon: RefreshCw, label: 'Easy', sub: 'Returns' }].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <item.icon size={20} className="text-gold-500 mb-2" />
                <p className="text-xs font-medium text-walnut-900 dark:text-cream">{item.label}</p>
                <p className="text-xs text-walnut-400 font-light">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-cream/50 dark:bg-walnut-800/30 rounded-card">
            <p className="text-sm text-walnut-600 dark:text-beige-300 font-light">
              <Truck size={16} className="inline mr-2 text-gold-500" />
              Estimated delivery: <span className="font-medium text-walnut-900 dark:text-cream">{product.production_days + 4}–{product.production_days + 7} days</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Purchase Bar */}
      {showStickyBar && (
        <div className="sm:hidden fixed bottom-14 left-0 right-0 z-40 bg-[#1A120C]/95 backdrop-blur-lg border-t border-gold-500/30 p-3 shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#0d0b0a] border border-gold-500/20 overflow-hidden shrink-0">
                <img src={images[activeImage] ?? getProductImageUrl(product)} alt="" className="w-full h-full object-contain p-1" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-cream truncate">{product.name}</p>
                <p className="text-xs font-semibold text-gold-400">{formatPrice(price)}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {price > 0 ? (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-600 text-ivory'
                      : 'bg-gold-600 hover:bg-gold-500 text-ivory'
                  }`}
                >
                  {isAdded ? <Check size={14} /> : <ShoppingBag size={14} />}
                  <span>{isAdded ? 'Added' : 'Add to Cart'}</span>
                </button>
              ) : (
                <button
                  onClick={handleWhatsAppOrder}
                  className="px-3 py-2 bg-emerald-600 text-ivory text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <MessageCircle size={14} />
                  <span>Inquire</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-20">
        <div className="flex gap-8 border-b border-champagne-200/30 dark:border-champagne-900/20 mb-8">
          {[{ key: 'description' as const, label: 'Description' }, { key: 'reviews' as const, label: `Reviews (${reviews.length})` }, { key: 'faq' as const, label: 'Product Info' }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`pb-3 text-sm font-medium tracking-wide border-b-2 transition-colors duration-300 ${activeTab === tab.key ? 'border-champagne-500 text-champagne-600' : 'border-transparent text-walnut-400 hover:text-walnut-700 dark:hover:text-cream'}`}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="max-w-3xl">
            <p className="text-walnut-600 dark:text-beige-300 leading-relaxed font-light text-base">{product.description}</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {[{ label: 'Material', value: product.material }, { label: 'Dimensions', value: product.dimensions }, { label: 'Weight', value: `${product.weight_grams}g` }, { label: 'Production Time', value: `${product.production_days} days` }].map((item, i) => (
                <div key={i} className="flex justify-between py-3 border-b border-champagne-200/20 dark:border-champagne-900/15">
                  <span className="text-sm text-walnut-400 font-light">{item.label}</span>
                  <span className="text-sm font-medium text-walnut-900 dark:text-cream">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="max-w-3xl">
            {reviews.length === 0 ? <p className="text-walnut-400 text-center py-8 font-light">No reviews yet. Be the first to review!</p> : (
              <div className="space-y-4">
                {reviews.map(rev => (
                  <div key={rev.id} className="p-6 bg-cream/50 dark:bg-walnut-800/30 rounded-card border border-champagne-200/20 dark:border-champagne-900/15">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-champagne-100 dark:bg-champagne-900/30 flex items-center justify-center text-champagne-600 font-display text-lg">{rev.reviewer_name.charAt(0)}</div>
                        <div><p className="text-sm font-medium text-walnut-900 dark:text-cream">{rev.reviewer_name}</p><p className="text-xs text-walnut-400 font-light">{rev.reviewer_location}</p></div>
                      </div>
                      <div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={13} className={s <= rev.rating ? 'text-champagne-500 fill-champagne-500' : 'text-beige-300'} />)}</div>
                    </div>
                    {rev.title && <h4 className="font-display text-lg text-walnut-900 dark:text-cream mb-2">{rev.title}</h4>}
                    <p className="text-sm text-walnut-600 dark:text-beige-300 font-light leading-relaxed">{rev.body}</p>
                    {rev.is_sample && <p className="text-xs text-walnut-300 mt-3 italic font-light">Sample review — replaced with verified customer reviews.</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="max-w-3xl space-y-4">
            {[{ q: 'How do I send my photo?', a: 'You can upload your photo directly on the product page using the upload button. We accept JPG, PNG, and HEIC formats.' }, { q: 'What is the production time?', a: `This product takes approximately ${product.production_days} days to craft. Delivery adds 2-4 days depending on your location.` }, { q: 'Can I customize the design?', a: 'Yes! Use the personalization field to add names, dates, or special messages.' }, { q: 'Is the photo quality important?', a: 'Yes, higher resolution photos produce better results. We recommend images of at least 1000x1000 pixels.' }].map((item, i) => (
              <details key={i} className="group p-5 bg-cream/50 dark:bg-walnut-800/30 rounded-card cursor-pointer border border-champagne-200/20 dark:border-champagne-900/15">
                <summary className="flex items-center justify-between font-display text-lg text-walnut-900 dark:text-cream list-none">
                  {item.q}<Plus size={18} className="text-champagne-600 group-open:rotate-45 transition-transform duration-300" />
                </summary>
                <p className="mt-3 text-sm text-walnut-600 dark:text-beige-300 font-light leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-20">
          <div className="text-center mb-12">
            <p className="text-champagne-600 text-xs font-medium uppercase tracking-wider2 mb-3">You May Also Like</p>
            <h2 className="font-display text-3xl text-walnut-900 dark:text-cream font-light">Related Collection</h2>
            <div className="gold-divider w-24 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 1 && (
        <div className="mt-20">
          <div className="text-center mb-12">
            <p className="text-champagne-600 text-xs font-medium uppercase tracking-wider2 mb-3">Recently Viewed</p>
            <h2 className="font-display text-3xl text-walnut-900 dark:text-cream font-light">Continue Exploring</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {recentlyViewed.filter(p => p.id !== product.id).slice(0, 5).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-walnut-950/95 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-6 right-6 text-cream p-2" onClick={() => setLightbox(false)}><X size={28} /></button>
          <img src={images[activeImage] ?? ''} alt={product.name} className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
