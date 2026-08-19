import { Heart, BarChart3, Eye, Star, ShoppingBag, Sparkles, MessageCircle } from 'lucide-react';
import type { Product } from '@/types';
import { useStore } from '@/store/StoreContext';
import { formatPrice, getEffectivePrice, getDiscountPercent, badgeLabel, badgeColor } from '@/lib/format';
import { WHATSAPP_NUMBER } from '@/lib/supabase';

export default function ProductCard({ product }: { product: Product }) {
  const { navigate, addToCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare } = useStore();
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const price = getEffectivePrice(product);
  const isPriced = price > 0;
  const discount = isPriced ? getDiscountPercent(product) : 0;

  return (
    <div className="group relative bg-ivory dark:bg-walnut-900 rounded-card overflow-hidden transition-all duration-700 luxury-shadow hover:luxury-shadow-xl hover:-translate-y-2 border border-gold-200/30 dark:border-gold-900/20 hover:border-gold-400/50 dark:hover:border-gold-700/40">
      {/* Badge */}
      {product.badge && (
        <div className={`absolute top-4 left-4 z-10 px-3.5 py-1.5 text-[9px] font-semibold text-ivory uppercase tracking-wider2 rounded-btn ${badgeColor(product.badge)}`}>
          {badgeLabel(product.badge)}
        </div>
      )}

      {/* Discount */}
      {discount > 0 && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-walnut-800 text-ivory text-[9px] font-semibold tracking-wider rounded-btn">
          -{discount}%
        </div>
      )}

      {/* Wishlist heart - always visible on mobile, hover on desktop */}
      <button
        onClick={() => toggleWishlist(product)}
        className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full glass flex items-center justify-center transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 ${inWishlist ? 'text-gold-600' : 'text-walnut-600 dark:text-cream/70 hover:text-gold-600'} ${discount > 0 ? 'top-14' : 'top-4'}`}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
      </button>

      {/* Hover Actions - compare + quick view */}
      <div className="absolute right-4 bottom-[45%] z-10 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 hidden md:flex">
        <button
          onClick={() => toggleCompare(product)}
          className={`w-9 h-9 rounded-full glass flex items-center justify-center transition-all duration-300 ${inCompare ? 'text-gold-600' : 'text-walnut-600 dark:text-cream/70 hover:text-gold-600'}`}
          aria-label="Compare"
        >
          <BarChart3 size={15} />
        </button>
        <button
          onClick={() => navigate('product', { slug: product.slug })}
          className="w-9 h-9 rounded-full glass text-walnut-600 dark:text-cream/70 hover:text-gold-600 flex items-center justify-center transition-all duration-300"
          aria-label="Quick view"
        >
          <Eye size={15} />
        </button>
      </div>

      {/* Image - larger */}
      <button
        onClick={() => navigate('product', { slug: product.slug })}
        className="block w-full aspect-[4/5] overflow-hidden bg-cream dark:bg-walnut-800"
      >
        <img
          src={product.image_url ?? ''}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
      </button>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-1 mb-2.5">
          {[1, 2, 3, 4, 5].map(i => (
            <Star
              key={i}
              size={11}
              className={i <= Math.round(product.rating) ? 'text-gold-500 fill-gold-500' : 'text-beige-300'}
            />
          ))}
          <span className="text-[11px] text-walnut-400 ml-1.5 tracking-wide">{product.review_count > 0 ? `(${product.review_count})` : ''}</span>
        </div>

        <button
          onClick={() => navigate('product', { slug: product.slug })}
          className="text-left w-full"
        >
          <h3 className="font-display text-base sm:text-lg text-walnut-900 dark:text-cream leading-tight mb-2 hover:text-gold-600 transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>
        </button>

        <p className="text-xs text-walnut-500 dark:text-beige-400 line-clamp-1 mb-4 font-light leading-relaxed">
          {product.short_description}
        </p>

        <div className="flex items-baseline gap-2 mb-5">
          <span className={`font-display font-medium text-walnut-900 dark:text-cream ${isPriced ? 'text-xl' : 'text-sm text-gold-600 dark:text-gold-400 font-sans tracking-wide uppercase'}`}>
            {formatPrice(price)}
          </span>
          {isPriced && product.sale_price && product.sale_price < product.base_price && (
            <span className="text-xs text-walnut-400 line-through font-light">{formatPrice(product.base_price)}</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5">
          {isPriced ? (
            <>
              {product.is_customizable ? (
                <button
                  onClick={() => navigate('product', { slug: product.slug })}
                  className="w-full py-3 bg-gold-600 hover:bg-gold-500 text-ivory text-[11px] font-medium uppercase tracking-wider2 transition-all duration-500 rounded-btn btn-shimmer flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} /> Personalize Now
                </button>
              ) : null}
              <button
                onClick={() => addToCart(product)}
                className={`w-full py-3 ${product.is_customizable ? 'border border-walnut-800 dark:border-cream/30 text-walnut-800 dark:text-cream hover:bg-walnut-800 dark:hover:bg-cream hover:text-ivory dark:hover:text-walnut-900' : 'bg-walnut-800 dark:bg-cream text-ivory dark:text-walnut-900 hover:bg-gold-600 dark:hover:bg-gold-500 dark:hover:text-ivory'} text-[11px] font-medium uppercase tracking-wider2 transition-all duration-500 rounded-btn btn-shimmer flex items-center justify-center gap-2`}
              >
                <ShoppingBag size={14} /> {product.is_customizable ? 'Add Without Customization' : 'Add to Cart'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('product', { slug: product.slug })}
                className="w-full py-3 bg-gold-600 hover:bg-gold-500 text-ivory text-[11px] font-medium uppercase tracking-wider2 transition-all duration-500 rounded-btn btn-shimmer flex items-center justify-center gap-2"
              >
                <Eye size={14} /> View Designs & Options
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi GALINEX, I would like to inquire about the price and custom designs for: ${product.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 border border-emerald-600/60 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-ivory text-[11px] font-medium uppercase tracking-wider2 transition-all duration-500 rounded-btn flex items-center justify-center gap-2"
              >
                <MessageCircle size={14} /> Inquire on WhatsApp
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
