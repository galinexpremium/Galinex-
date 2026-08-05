import { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingBag, Heart, Tag, X, ArrowRight, Save } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { formatPrice, getEffectivePrice } from '@/lib/format';

export default function CartPage() {
  const { cartItems, updateCartQuantity, removeFromCart, saveForLater, navigate, cartSubtotal, applyCoupon, removeCoupon, couponCode, discountAmount, toggleWishlist } = useStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponError, setCouponError] = useState(false);

  const shipping = cartSubtotal >= 999 ? 0 : 99;
  const clampedDiscount = Math.min(discountAmount, cartSubtotal);
  const total = Math.max(0, cartSubtotal - clampedDiscount + shipping);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const result = await applyCoupon(couponInput, cartSubtotal);
    setCouponMsg(result.message);
    setCouponError(!result.success);
    if (result.success) setCouponInput('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-card bg-cream dark:bg-walnut-900 flex items-center justify-center mb-6 border border-champagne-200/30">
            <ShoppingBag size={40} className="text-champagne-400" />
          </div>
          <h1 className="text-3xl font-display text-walnut-900 dark:text-ivory mb-3 tracking-tight">Your Cart is Empty</h1>
          <div className="w-16 h-px bg-champagne-300 mx-auto mb-4" />
          <p className="text-walnut-500 dark:text-beige-400 mb-8 max-w-md mx-auto">Discover our premium personalized gifts, crafted with timeless elegance.</p>
          <button onClick={() => navigate('shop')} className="px-10 py-3.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory font-medium tracking-wide inline-flex items-center gap-2 transition-colors">
            Start Shopping <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  const savedItems = cartItems.filter(i => i.saved_for_later);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-display text-walnut-900 dark:text-ivory tracking-tight">Shopping Cart</h1>
        <div className="mt-3 h-px bg-gradient-to-r from-champagne-400 via-champagne-200 to-transparent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => {
            const price = item.product ? getEffectivePrice(item.product) : 0;
            return (
              <div key={item.id} className="flex gap-5 p-5 bg-ivory dark:bg-walnut-900 rounded-card border border-champagne-200/30 dark:border-champagne-900/20">
                <button
                  onClick={() => item.product && navigate('product', { slug: item.product!.slug })}
                  className="w-24 h-24 rounded-card overflow-hidden bg-cream dark:bg-walnut-800 flex-shrink-0"
                >
                  <img src={item.product?.image_url ?? ''} alt={item.product?.name ?? ''} className="w-full h-full object-cover" />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={() => item.product && navigate('product', { slug: item.product!.slug })}>
                      <h3 className="font-medium text-sm text-walnut-900 dark:text-ivory hover:text-champagne-600 transition-colors line-clamp-2 tracking-wide">
                        {item.product?.name}
                      </h3>
                    </button>
                    <button onClick={() => removeFromCart(item.id)} className="text-walnut-400 hover:text-rose-500 transition-colors flex-shrink-0">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {item.variant_name && <p className="text-xs text-walnut-500 dark:text-beige-400 mt-1.5">Variant: {item.variant_name}</p>}
                  {item.customization_text && <p className="text-xs text-walnut-500 dark:text-beige-400 mt-1">Custom: {item.customization_text}</p>}
                  {item.photo_url && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={item.photo_url} alt="Custom" className="w-12 h-12 rounded-card object-cover border border-champagne-200/30" />
                      {item.customization_data && (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-champagne-100 dark:bg-champagne-900/20 text-champagne-700 dark:text-champagne-400 font-medium tracking-wide">
                          Personalized
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-champagne-200 dark:border-champagne-900/30 rounded-card">
                      <button onClick={() => item.quantity <= 1 ? removeFromCart(item.id) : updateCartQuantity(item.id, item.quantity - 1)} className="p-1.5 text-walnut-500 hover:text-champagne-600 transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-medium text-walnut-900 dark:text-ivory">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="p-1.5 text-walnut-500 hover:text-champagne-600 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-display text-lg text-walnut-900 dark:text-ivory">{formatPrice(price * item.quantity)}</span>
                  </div>

                  <div className="flex gap-4 mt-3">
                    <button
                      onClick={() => saveForLater(item.id, true)}
                      className="text-xs text-walnut-500 hover:text-champagne-600 flex items-center gap-1 transition-colors tracking-wide"
                    >
                      <Save size={12} /> Save for Later
                    </button>
                    {item.product && (
                      <button
                        onClick={() => { toggleWishlist(item.product!); removeFromCart(item.id); }}
                        className="text-xs text-walnut-500 hover:text-rose-500 flex items-center gap-1 transition-colors tracking-wide"
                      >
                        <Heart size={12} /> Move to Wishlist
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Saved for Later */}
          {savedItems.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-display text-walnut-900 dark:text-ivory tracking-tight">Saved for Later ({savedItems.length})</h2>
                <div className="flex-1 h-px bg-champagne-200/40 dark:bg-champagne-900/20" />
              </div>
              {savedItems.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-cream/50 dark:bg-walnut-800/30 rounded-card mb-3 border border-champagne-200/20">
                  <div className="w-20 h-20 rounded-card overflow-hidden bg-cream dark:bg-walnut-800 flex-shrink-0">
                    <img src={item.product?.image_url ?? ''} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-walnut-900 dark:text-ivory tracking-wide">{item.product?.name}</h3>
                    <p className="text-sm text-walnut-500 dark:text-beige-400 mt-1">{item.product ? formatPrice(getEffectivePrice(item.product)) : ''}</p>
                    <button
                      onClick={() => saveForLater(item.id, false)}
                      className="text-xs text-champagne-600 hover:underline mt-2 tracking-wide"
                    >
                      Move to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-ivory dark:bg-walnut-900 rounded-card p-7 border border-champagne-200/30 dark:border-champagne-900/20">
            <h2 className="text-xl font-display text-walnut-900 dark:text-ivory mb-5 tracking-tight">Order Summary</h2>
            <div className="h-px bg-champagne-200/40 dark:bg-champagne-900/20 mb-5" />

            {/* Coupon */}
            {couponCode ? (
              <div className="flex items-center justify-between p-3 rounded-card bg-champagne-50 dark:bg-champagne-900/20 border border-champagne-200/40 mb-5">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-champagne-600" />
                  <span className="text-sm font-medium text-champagne-700 dark:text-champagne-400 tracking-wide">{couponCode}</span>
                </div>
                <button onClick={removeCoupon} className="text-champagne-600 hover:text-champagne-800 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="mb-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2.5 rounded-card bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-champagne-200/40 focus:border-champagne-500 transition-colors"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-5 py-2.5 rounded-card bg-walnut-900 dark:bg-ivory text-ivory dark:text-walnut-900 text-sm font-medium tracking-wide transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-xs mt-2 tracking-wide ${couponError ? 'text-rose-500' : 'text-champagne-600'}`}>{couponMsg}</p>
                )}
                <div className="flex gap-3 mt-3 flex-wrap">
                  {['WELCOME10', 'GALINEX20'].map(code => (
                    <button key={code} onClick={() => setCouponInput(code)} className="text-xs text-champagne-600 hover:underline tracking-wide">
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 py-5 border-t border-champagne-200/30 dark:border-champagne-900/20">
              <div className="flex justify-between text-sm">
                <span className="text-walnut-500 dark:text-beige-400">Subtotal</span>
                <span className="font-medium text-walnut-900 dark:text-ivory">{formatPrice(cartSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-champagne-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-walnut-500 dark:text-beige-400">Shipping</span>
                <span className="font-medium text-walnut-900 dark:text-ivory">
                  {shipping === 0 ? <span className="text-champagne-600 tracking-wide">FREE</span> : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-champagne-600 tracking-wide">Add {formatPrice(999 - cartSubtotal)} more for complimentary shipping</p>
              )}
            </div>

            <div className="flex justify-between py-5 border-t border-champagne-200/30 dark:border-champagne-900/20">
              <span className="font-display text-lg text-walnut-900 dark:text-ivory">Total</span>
              <span className="font-display text-2xl text-walnut-900 dark:text-ivory">{formatPrice(total)}</span>
            </div>

            <button
              onClick={() => navigate('checkout')}
              className="w-full py-3.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory font-medium tracking-wide flex items-center justify-center gap-2 transition-colors mt-4"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('shop')}
              className="w-full py-3 rounded-card text-sm text-walnut-500 dark:text-beige-400 hover:text-walnut-900 dark:hover:text-ivory transition-colors mt-2 tracking-wide"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
