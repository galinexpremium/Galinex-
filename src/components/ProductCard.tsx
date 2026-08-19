import { Heart, BarChart3, Eye, Star, ShoppingBag, Sparkles, MessageCircle } from 'lucide-react';
import type { Product } from '@/types';
import { useStore } from '@/store/StoreContext';
import { formatPrice, getEffectivePrice, getDiscountPercent, badgeLabel, badgeColor, getProductImageUrl } from '@/lib/format';
import { buildDirectWhatsAppUrl, buildMdfQuoteRequestMessage } from '@/lib/whatsapp';

export default function ProductCard({ product }: { product: Product }) {
  const { navigate, addToCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare } = useStore();
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const price = getEffectivePrice(product);
  const isPriced = price > 0;
  const discount = isPriced ? getDiscountPercent(product) : 0;
  const imageUrl = getProductImageUrl(product);

  const whatsappInquiryUrl = buildDirectWhatsAppUrl(
    !isPriced
      ? buildMdfQuoteRequestMessage(product)
      : `Hi GALINEX, I would like to inquire about: ${product.name}`
  );

  return (
    <div className="group relative bg-ivory dark:bg-walnut-900/90 rounded-2xl overflow-hidden transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1.5 border border-gold-200/40 dark:border-gold-900/30 hover:border-gold-400/60 dark:hover:border-gold-700/50 flex flex-col justify-between">
      {/* Top Media Area */}
      <div className="relative w-full aspect-[4/5] bg-[#0d0b0a] overflow-hidden">
        {/* Badge */}
        {product.badge && (
          <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 text-[8px] sm:text-[9px] font-semibold text-ivory uppercase tracking-wider rounded-md shadow-md ${badgeColor(product.badge)}`}>
            {badgeLabel(product.badge)}
          </div>
        )}

        {/* Discount Tag */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 z-10 px-2 py-0.5 bg-walnut-950/90 text-gold-300 text-[9px] font-semibold tracking-wider rounded-md border border-gold-500/30">
            -{discount}%
          </div>
        )}

        {/* Wishlist Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className={`absolute ${discount > 0 ? 'top-10' : 'top-3'} right-3 z-10 w-8 h-8 rounded-full bg-walnut-950/70 backdrop-blur-md flex items-center justify-center transition-all duration-300 ${inWishlist ? 'text-gold-500' : 'text-ivory/80 hover:text-gold-400 hover:scale-110'}`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Desktop Quick Actions */}
        <div className="absolute right-3 bottom-3 z-10 flex flex-col gap-1.5 translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex">
          <button
            onClick={(e) => { e.stopPropagation(); toggleCompare(product); }}
            className={`w-8 h-8 rounded-full bg-walnut-950/80 backdrop-blur-md flex items-center justify-center transition-colors ${inCompare ? 'text-gold-500' : 'text-ivory/80 hover:text-gold-400'}`}
            title="Compare"
          >
            <BarChart3 size={14} />
          </button>
          <button
            onClick={() => navigate('product', { slug: product.slug })}
            className="w-8 h-8 rounded-full bg-walnut-950/80 backdrop-blur-md text-ivory/80 hover:text-gold-400 flex items-center justify-center transition-colors"
            title="Quick view"
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Main Product Photography */}
        <button
          onClick={() => navigate('product', { slug: product.slug })}
          className="w-full h-full block cursor-pointer"
        >
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/products/3d-crystal-gifts/5x5x8-3d-crystal-single-image.webp';
            }}
          />
        </button>
      </div>

      {/* Product Information Card Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1.5">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                size={10}
                className={i <= Math.round(product.rating || 5) ? 'text-gold-500 fill-gold-500' : 'text-beige-300 dark:text-walnut-700'}
              />
            ))}
            <span className="text-[10px] text-walnut-400 dark:text-beige-400 ml-1">
              {product.review_count > 0 ? `(${product.review_count})` : ''}
            </span>
          </div>

          {/* Title */}
          <button
            onClick={() => navigate('product', { slug: product.slug })}
            className="text-left w-full block mb-1 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors"
          >
            <h3 className="font-display text-sm sm:text-base text-walnut-900 dark:text-cream leading-snug line-clamp-2 font-medium">
              {product.name}
            </h3>
          </button>

          {/* Dimensions / Material badge */}
          {product.dimensions && (
            <p className="text-[11px] text-walnut-500 dark:text-beige-400 line-clamp-1 mb-2 font-light">
              {product.dimensions} {product.material ? `• ${product.material}` : ''}
            </p>
          )}
        </div>

        {/* Pricing & CTA Section */}
        <div className="pt-2 border-t border-gold-200/30 dark:border-gold-900/30 mt-2">
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <span className={`font-display font-semibold text-walnut-900 dark:text-cream ${isPriced ? 'text-base sm:text-lg text-gold-700 dark:text-gold-400' : 'text-xs text-gold-600 dark:text-gold-400 font-sans tracking-wide uppercase font-medium'}`}>
              {formatPrice(price)}
            </span>
            {isPriced && product.sale_price && product.sale_price < product.base_price && (
              <span className="text-[11px] text-walnut-400 line-through font-light">{formatPrice(product.base_price)}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5">
            {isPriced ? (
              <>
                {product.is_customizable ? (
                  <button
                    onClick={() => navigate('product', { slug: product.slug })}
                    className="w-full py-2 sm:py-2.5 bg-gold-600 hover:bg-gold-500 text-ivory text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Sparkles size={13} /> Personalize Now
                  </button>
                ) : null}
                <button
                  onClick={() => addToCart(product)}
                  className={`w-full py-2 sm:py-2.5 ${product.is_customizable ? 'border border-walnut-700 dark:border-cream/30 text-walnut-800 dark:text-cream hover:bg-walnut-800 dark:hover:bg-cream hover:text-ivory dark:hover:text-walnut-900' : 'bg-gold-600 hover:bg-gold-500 text-ivory'} text-[10px] sm:text-[11px] font-medium uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5`}
                >
                  <ShoppingBag size={13} /> {product.is_customizable ? 'Add to Cart' : 'Order Now'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('product', { slug: product.slug })}
                  className="w-full py-2 sm:py-2.5 bg-gold-600 hover:bg-gold-500 text-ivory text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Eye size={13} /> View Catalogue Options
                </button>
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 sm:py-2.5 border border-emerald-600/60 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-ivory text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  <MessageCircle size={13} /> Inquire on WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
