import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { formatPrice, getEffectivePrice } from '@/lib/format';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlistItems, navigate, addToCart, toggleWishlist } = useStore();

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-card bg-cream dark:bg-walnut-900 flex items-center justify-center mb-6 border border-champagne-200/30">
            <Heart size={40} className="text-champagne-400" />
          </div>
          <h1 className="text-3xl font-display text-walnut-900 dark:text-ivory mb-3 tracking-tight">Your Wishlist is Empty</h1>
          <div className="w-16 h-px bg-champagne-300 mx-auto mb-4" />
          <p className="text-walnut-500 dark:text-beige-400 mb-8 max-w-md mx-auto">Save items you love for later — curated pieces, timeless elegance.</p>
          <button onClick={() => navigate('shop')} className="px-10 py-3.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory font-medium tracking-wide inline-flex items-center gap-2 transition-colors">
            Explore Products <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-display text-walnut-900 dark:text-ivory tracking-tight">My Wishlist</h1>
        <div className="mt-3 h-px bg-gradient-to-r from-champagne-400 via-champagne-200 to-transparent" />
        <p className="text-walnut-500 dark:text-beige-400 mt-4 tracking-wide">{wishlistItems.length} items saved</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {wishlistItems.map(item => (
          <ProductCard key={item.id} product={item.product!} />
        ))}
      </div>
    </div>
  );
}
