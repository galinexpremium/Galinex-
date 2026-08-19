import { useState } from 'react';
import {
  Check,
  MessageCircle,
  CreditCard,
  Wallet,
  Banknote,
  ArrowRight,
  ArrowLeft,
  Truck,
  Shield,
  Lock,
  Star,
  Package,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { useAuth } from '@/store/AuthContext';
import { supabase, WHATSAPP_NUMBER } from '@/lib/supabase';
import { formatPrice, getEffectivePrice, getProductImageUrl } from '@/lib/format';
import { buildWhatsAppOrderMessage, buildDirectWhatsAppUrl, openWhatsApp } from '@/lib/whatsapp';
import type { ShippingAddress } from '@/types';

function base64ToBlob(base64: string): Blob {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: 'image/jpeg' });
}

export default function CheckoutPage() {
  const {
    cartItems,
    cartSubtotal,
    discountAmount,
    couponCode,
    navigate,
    paymentMethod,
    setPaymentMethod,
    setShippingAddress,
    clearCart,
    showToast,
    sessionId,
  } = useStore();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<ShippingAddress>({
    full_name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedWhatsAppUrl, setGeneratedWhatsAppUrl] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const shipping = cartSubtotal >= 999 ? 0 : 99;
  const total = Math.max(0, cartSubtotal - discountAmount + shipping);

  const paymentMethods = [
    {
      id: 'whatsapp',
      label: 'WhatsApp Order',
      desc: 'Instant order confirmation with our dedicated luxury concierge on WhatsApp',
      icon: MessageCircle,
      active: true,
      badge: 'Active & Recommended',
    },
    {
      id: 'cod',
      label: 'Cash on Delivery (COD)',
      desc: 'Pay securely at doorstep via cash or UPI scanner upon delivery',
      icon: Banknote,
      active: false,
      badge: 'Coming Soon',
    },
    {
      id: 'upi',
      label: 'UPI Instant Payment',
      desc: 'Google Pay, PhonePe, Paytm, BHIM & all major UPI apps',
      icon: Wallet,
      active: false,
      badge: 'Coming Soon',
    },
    {
      id: 'card',
      label: 'Credit / Debit Card & Netbanking',
      desc: 'All major domestic & international cards with 3D Secure verification',
      icon: CreditCard,
      active: false,
      badge: 'Coming Soon',
    },
  ];

  const handleSelectPaymentMethod = (method: (typeof paymentMethods)[number]) => {
    if (!method.active) {
      showToast({
        type: 'info',
        title: 'Coming Soon',
        subtitle: 'Online payment for this option will be available shortly.',
      });
      return;
    }
    setPaymentMethod(method.id);
  };

  const validateAddress = () => {
    const errs: Record<string, string> = {};
    if (!address.full_name.trim()) errs.full_name = 'Full name is required';
    if (!address.phone.trim() || address.phone.replace(/[^0-9]/g, '').length < 10) {
      errs.phone = 'Valid 10-digit phone required';
    }
    if (!address.address_line1.trim()) errs.address_line1 = 'Address line 1 is required';
    if (!address.city.trim()) errs.city = 'City is required';
    if (!address.state.trim()) errs.state = 'State is required';
    if (!address.pincode.trim() || address.pincode.replace(/[^0-9]/g, '').length < 6) {
      errs.pincode = 'Valid 6-digit pincode required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      navigate('cart');
      return;
    }

    if (!validateAddress()) {
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      // 1. Generate Order Number
      let orderNum = '';
      try {
        const { data: rpcNum } = await supabase.rpc('generate_order_number');
        if (rpcNum && typeof rpcNum === 'string') {
          orderNum = rpcNum;
        }
      } catch (e) {
        console.warn('RPC generate_order_number fallback:', e);
      }

      if (!orderNum) {
        orderNum = 'GX-' + Math.floor(100000 + Math.random() * 900000);
      }

      setOrderNumber(orderNum);
      setShippingAddress(address);

      // 2. Generate client UUID for orders table to avoid RLS SELECT restrictions on guest checkout
      const orderId = crypto.randomUUID();

      const orderPayload = {
        id: orderId,
        order_number: orderNum,
        user_id: user?.id ?? null,
        session_id: sessionId,
        customer_name: address.full_name.trim(),
        customer_phone: address.phone.trim(),
        customer_email: address.email?.trim() || null,
        shipping_address: address,
        subtotal: cartSubtotal,
        discount_amount: discountAmount,
        shipping_amount: shipping,
        total,
        coupon_code: couponCode,
        payment_method: 'whatsapp',
        payment_status: 'pending',
        order_status: 'pending',
        estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      // 3. Insert order record
      const { error: orderErr } = await supabase.from('orders').insert(orderPayload);
      if (orderErr) {
        console.warn('Supabase orders insert:', orderErr.message);
      }

      // 4. Handle item customization images & insert order items
      const orderItemsToInsert = [];
      for (const item of cartItems) {
        let photoUrl = item.photo_url;
        let customizationData = item.customization_data;

        // Try upload customization photo if data URL
        if (photoUrl && photoUrl.startsWith('data:')) {
          try {
            const fileName = `order-${orderNum}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`;
            const base64 = photoUrl.split(',')[1];
            if (base64) {
              const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('customer_uploads')
                .upload(fileName, base64ToBlob(base64), { contentType: 'image/jpeg' });
              if (!uploadErr && uploadData) {
                const { data: urlData } = supabase.storage.from('customer_uploads').getPublicUrl(fileName);
                photoUrl = urlData.publicUrl;
                if (customizationData) {
                  customizationData = { ...customizationData, photo_url: photoUrl };
                }
              }
            }
          } catch (storageErr) {
            console.warn('Customization upload fallback:', storageErr);
          }
        }

        const effectiveUnitPrice = item.product ? getEffectivePrice(item.product) : 0;
        orderItemsToInsert.push({
          order_id: orderId,
          product_id: item.product_id,
          product_name: item.product?.name ?? 'Personalized Gift',
          product_image: getProductImageUrl(item.product),
          variant_name: item.variant_name,
          quantity: item.quantity,
          unit_price: effectiveUnitPrice,
          total_price: effectiveUnitPrice * item.quantity,
          customization_text: item.customization_text,
          photo_url: photoUrl,
          customization_data: customizationData,
        });
      }

      if (orderItemsToInsert.length > 0) {
        const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsToInsert);
        if (itemsErr) {
          console.warn('Supabase order_items insert:', itemsErr.message);
        }
      }

      // 5. Construct WhatsApp Message & URL
      const message = buildWhatsAppOrderMessage(
        cartItems,
        address,
        cartSubtotal,
        discountAmount,
        shipping,
        total,
        couponCode,
        'whatsapp',
        orderNum
      );
      const whatsappUrl = buildDirectWhatsAppUrl(message, WHATSAPP_NUMBER);
      setGeneratedWhatsAppUrl(whatsappUrl);

      // 6. Direct WhatsApp Launch (with fallback support on success screen)
      openWhatsApp(message, WHATSAPP_NUMBER);

      // 7. Clear cart & transition to confirmation screen
      clearCart();
      setOrderPlaced(true);
    } catch (err: any) {
      console.error('Checkout processing error:', err);
      setCheckoutError(
        'An unexpected error occurred while preparing your order. Please check your details or connect directly on WhatsApp.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (orderPlaced) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center max-w-2xl mx-auto px-4 py-12 animate-fade-in">
        <div className="text-center w-full bg-ivory dark:bg-walnut-900/90 rounded-2xl p-6 sm:p-10 border border-gold-500/30 shadow-2xl shadow-black/40">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-inner">
            <Check size={44} className="text-emerald-400" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 dark:text-gold-400 mb-2">
            Order Confirmed
          </p>
          <h1 className="text-2xl sm:text-3xl font-display text-walnut-900 dark:text-ivory mb-2 tracking-tight">
            Thank You for Your Order
          </h1>

          <div className="w-16 h-px bg-gold-400/40 mx-auto my-4" />

          <p className="text-xs sm:text-sm text-walnut-500 dark:text-beige-400 mb-1 tracking-wide">
            Your official order number is
          </p>
          <p className="text-2xl sm:text-3xl font-display font-semibold text-gold-600 dark:text-gold-400 mb-6 tracking-wider">
            {orderNumber}
          </p>

          <div className="p-4 sm:p-5 rounded-xl bg-gold-50/60 dark:bg-walnut-950/60 border border-gold-300/30 dark:border-gold-900/40 mb-8 text-left">
            <div className="flex items-start gap-3">
              <MessageCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-walnut-700 dark:text-beige-300 space-y-1">
                <p className="font-semibold text-walnut-900 dark:text-ivory">WhatsApp Confirmation Active</p>
                <p className="text-walnut-600 dark:text-beige-400 leading-relaxed font-light">
                  Your order details and customization specifications have been formatted. Tap below to send your order
                  message directly to the GALINEX official concierge (+91 93604 82480).
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action: Direct WhatsApp Fallback Link */}
          <div className="space-y-3">
            <a
              href={generatedWhatsAppUrl || buildDirectWhatsAppUrl(buildWhatsAppOrderMessage(cartItems, address, cartSubtotal, discountAmount, shipping, total, couponCode, 'whatsapp', orderNumber), WHATSAPP_NUMBER)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-ivory font-semibold text-sm tracking-wide uppercase flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-950/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <MessageCircle size={20} fill="currentColor" /> Open WhatsApp to Confirm Order
            </a>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate('track-order', { orderNumber })}
                className="flex-1 py-3 px-6 rounded-xl bg-gold-600 hover:bg-gold-500 text-ivory font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Track Order Status
              </button>
              <button
                onClick={() => navigate('shop')}
                className="flex-1 py-3 px-6 rounded-xl border border-gold-300/40 dark:border-gold-800/50 text-walnut-700 dark:text-beige-300 hover:text-walnut-900 dark:hover:text-ivory font-semibold text-xs uppercase tracking-wider hover:border-gold-500 transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate('cart');
    return null;
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display text-walnut-900 dark:text-ivory tracking-tight">Checkout</h1>
            <p className="text-xs sm:text-sm text-walnut-500 dark:text-beige-400 mt-1">
              Finalize your bespoke luxury gifts & delivery destination
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-50 dark:bg-gold-900/20 border border-gold-200/40 dark:border-gold-900/30 shadow-sm">
            <Lock size={15} className="text-gold-600 dark:text-gold-400" />
            <span className="text-xs font-semibold text-gold-700 dark:text-gold-300 tracking-wider uppercase">
              Secure Checkout
            </span>
          </div>
        </div>
        <div className="mt-4 h-px bg-gradient-to-r from-gold-400 via-gold-200 to-transparent" />
      </div>

      {checkoutError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{checkoutError}</p>
          </div>
        </div>
      )}

      {/* Steps Indicator */}
      <div className="flex items-center gap-2 sm:gap-4 mb-8 sm:mb-10 overflow-x-auto pb-2">
        {[
          { num: 1, label: 'Shipping' },
          { num: 2, label: 'Payment' },
          { num: 3, label: 'Review' },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                if (s.num === 1) setStep(1);
                if (s.num === 2 && validateAddress()) setStep(2);
              }}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                step >= s.num
                  ? 'bg-gold-600 text-ivory shadow-sm'
                  : 'bg-cream dark:bg-walnut-800 text-walnut-400 border border-gold-200/30'
              }`}
            >
              {step > s.num ? <Check size={16} /> : s.num}
            </button>
            <span
              className={`text-xs sm:text-sm font-medium tracking-wide ${
                step >= s.num ? 'text-walnut-900 dark:text-ivory' : 'text-walnut-400'
              }`}
            >
              {s.label}
            </span>
            {i < 2 && (
              <div
                className={`w-8 sm:w-12 h-px ${
                  step > s.num ? 'bg-gold-600' : 'bg-gold-200/40 dark:bg-gold-900/20'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div className="bg-ivory dark:bg-walnut-900 rounded-2xl p-6 sm:p-8 border border-gold-200/30 dark:border-gold-900/20 luxury-shadow">
              <h2 className="text-xl font-display text-walnut-900 dark:text-ivory mb-2 tracking-tight">
                Shipping Address
              </h2>
              <p className="text-xs text-walnut-500 dark:text-beige-400 mb-5">
                Please provide accurate contact & doorstep delivery details
              </p>
              <div className="h-px bg-gold-200/40 dark:bg-gold-900/20 mb-6" />

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-walnut-600 dark:text-beige-300 mb-2 block tracking-wider uppercase">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={address.full_name}
                    onChange={e => setAddress({ ...address, full_name: e.target.value })}
                    placeholder="Recipient's full name"
                    className="w-full px-4 py-3 rounded-xl bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                  {errors.full_name && (
                    <p className="text-xs text-rose-500 mt-1.5 tracking-wide">{errors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-walnut-600 dark:text-beige-300 mb-2 block tracking-wider uppercase">
                    WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={e => setAddress({ ...address, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-3 rounded-xl bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                  {errors.phone && <p className="text-xs text-rose-500 mt-1.5 tracking-wide">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-walnut-600 dark:text-beige-300 mb-2 block tracking-wider uppercase">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={address.email}
                    onChange={e => setAddress({ ...address, email: e.target.value })}
                    placeholder="For tracking & invoice updates"
                    className="w-full px-4 py-3 rounded-xl bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-walnut-600 dark:text-beige-300 mb-2 block tracking-wider uppercase">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={address.address_line1}
                    onChange={e => setAddress({ ...address, address_line1: e.target.value })}
                    placeholder="Flat / House No., Building, Street Area"
                    className="w-full px-4 py-3 rounded-xl bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                  {errors.address_line1 && (
                    <p className="text-xs text-rose-500 mt-1.5 tracking-wide">{errors.address_line1}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-walnut-600 dark:text-beige-300 mb-2 block tracking-wider uppercase">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={address.address_line2}
                    onChange={e => setAddress({ ...address, address_line2: e.target.value })}
                    placeholder="Apartment, Suite, Unit, etc."
                    className="w-full px-4 py-3 rounded-xl bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-walnut-600 dark:text-beige-300 mb-2 block tracking-wider uppercase">
                    City *
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={e => setAddress({ ...address, city: e.target.value })}
                    placeholder="City / Town"
                    className="w-full px-4 py-3 rounded-xl bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                  {errors.city && <p className="text-xs text-rose-500 mt-1.5 tracking-wide">{errors.city}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-walnut-600 dark:text-beige-300 mb-2 block tracking-wider uppercase">
                    State *
                  </label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={e => setAddress({ ...address, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-4 py-3 rounded-xl bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                  {errors.state && <p className="text-xs text-rose-500 mt-1.5 tracking-wide">{errors.state}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-walnut-600 dark:text-beige-300 mb-2 block tracking-wider uppercase">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={e => setAddress({ ...address, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                    maxLength={6}
                    placeholder="6-digit PIN"
                    className="w-full px-4 py-3 rounded-xl bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                  {errors.pincode && <p className="text-xs text-rose-500 mt-1.5 tracking-wide">{errors.pincode}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-walnut-600 dark:text-beige-300 mb-2 block tracking-wider uppercase">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={address.landmark}
                    onChange={e => setAddress({ ...address, landmark: e.target.value })}
                    placeholder="Nearby landmark"
                    className="w-full px-4 py-3 rounded-xl bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (validateAddress()) setStep(2);
                }}
                className="mt-8 px-8 py-3.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-ivory font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-gold-950/20 active:scale-[0.99]"
              >
                Continue to Payment <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Payment Methods */}
          {step === 2 && (
            <div className="bg-ivory dark:bg-walnut-900 rounded-2xl p-6 sm:p-8 border border-gold-200/30 dark:border-gold-900/20 luxury-shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-display text-walnut-900 dark:text-ivory tracking-tight">
                  Select Order & Payment Option
                </h2>
              </div>
              <p className="text-xs text-walnut-500 dark:text-beige-400 mb-5">
                Choose your preferred order channel. WhatsApp order concierge is currently active.
              </p>
              <div className="h-px bg-gold-200/40 dark:bg-gold-900/20 mb-6" />

              <div className="space-y-3.5">
                {paymentMethods.map(method => {
                  const isCurrentActive = method.active;
                  const isSelected = paymentMethod === method.id;

                  return (
                    <div
                      key={method.id}
                      onClick={() => handleSelectPaymentMethod(method)}
                      className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                        isCurrentActive
                          ? isSelected
                            ? 'border-gold-500 bg-gold-500/10 dark:bg-gold-900/25 ring-1 ring-gold-500/40 shadow-sm'
                            : 'border-gold-200/50 dark:border-gold-900/30 bg-cream/40 dark:bg-walnut-800/40 hover:border-gold-400'
                          : 'border-gold-200/20 dark:border-gold-950/30 bg-cream/20 dark:bg-walnut-950/30 opacity-70 hover:opacity-90 hover:border-gold-500/30'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isCurrentActive
                            ? 'bg-gold-600 text-ivory shadow-sm'
                            : 'bg-walnut-100 dark:bg-walnut-800 text-walnut-400 dark:text-walnut-500'
                        }`}
                      >
                        <method.icon size={20} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`font-semibold text-sm tracking-wide ${
                              isCurrentActive
                                ? 'text-walnut-900 dark:text-ivory'
                                : 'text-walnut-600 dark:text-beige-300'
                            }`}
                          >
                            {method.label}
                          </p>
                          {method.badge && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                isCurrentActive
                                  ? 'bg-gold-500/20 border border-gold-500/40 text-gold-700 dark:text-gold-300'
                                  : 'bg-walnut-200/60 dark:bg-walnut-800/80 border border-gold-500/15 text-walnut-500 dark:text-beige-400/80'
                              }`}
                            >
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-walnut-500 dark:text-beige-400 mt-1 font-light leading-relaxed">
                          {method.desc}
                        </p>
                      </div>

                      {/* State Indicator */}
                      <div className="shrink-0 flex items-center">
                        {isCurrentActive ? (
                          isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-gold-600 text-ivory flex items-center justify-center shadow-sm">
                              <Check size={14} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-gold-300 dark:border-gold-800" />
                          )
                        ) : (
                          <span className="text-[11px] font-medium text-gold-600/70 dark:text-gold-400/60 tracking-wider uppercase hidden sm:inline-block">
                            Soon
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 rounded-xl border border-gold-200/40 dark:border-gold-900/30 text-walnut-700 dark:text-beige-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 hover:border-gold-500 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 px-8 py-3.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-ivory font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-gold-950/20 active:scale-[0.99]"
                >
                  Review Order <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-ivory dark:bg-walnut-900 rounded-2xl p-6 sm:p-8 border border-gold-200/30 dark:border-gold-900/20 luxury-shadow">
                <h2 className="text-xl font-display text-walnut-900 dark:text-ivory mb-2 tracking-tight">
                  Review & Confirm Order
                </h2>
                <p className="text-xs text-walnut-500 dark:text-beige-400 mb-5">
                  Verify your delivery destination and customized selection before finalizing
                </p>
                <div className="h-px bg-gold-200/40 dark:bg-gold-900/20 mb-6" />

                {/* Shipping info */}
                <div className="mb-6 p-4 rounded-xl bg-cream/40 dark:bg-walnut-800/40 border border-gold-200/30 dark:border-gold-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-gold-600 dark:text-gold-400 uppercase tracking-wider">
                      Shipping Destination
                    </h3>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-gold-600 hover:text-gold-500 dark:text-gold-400 underline font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-walnut-900 dark:text-ivory font-semibold">{address.full_name}</p>
                  <p className="text-xs sm:text-sm text-walnut-600 dark:text-beige-300 mt-0.5">
                    {address.address_line1}
                    {address.address_line2 ? `, ${address.address_line2}` : ''}
                  </p>
                  <p className="text-xs sm:text-sm text-walnut-600 dark:text-beige-300">
                    {address.city}, {address.state} - {address.pincode}
                    {address.landmark ? ` (Near ${address.landmark})` : ''}
                  </p>
                  <p className="text-xs sm:text-sm text-walnut-600 dark:text-beige-300 mt-1 font-medium">
                    Phone: {address.phone}
                    {address.email ? ` | Email: ${address.email}` : ''}
                  </p>
                </div>

                {/* Payment Option */}
                <div className="mb-6 p-4 rounded-xl bg-cream/40 dark:bg-walnut-800/40 border border-gold-200/30 dark:border-gold-900/20 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-gold-600 dark:text-gold-400 uppercase tracking-wider mb-1">
                      Payment Channel
                    </h3>
                    <p className="text-sm font-semibold text-walnut-900 dark:text-ivory flex items-center gap-2">
                      <MessageCircle size={16} className="text-emerald-500" /> WhatsApp Order & Payment
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-gold-600 hover:text-gold-500 dark:text-gold-400 underline font-medium cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* Ordered Items */}
                <div className="border-t border-gold-200/30 dark:border-gold-900/20 pt-6">
                  <h3 className="text-xs font-semibold text-walnut-500 dark:text-beige-400 mb-4 uppercase tracking-wider">
                    Order Items ({cartItems.length})
                  </h3>
                  <div className="space-y-4">
                    {cartItems.map(item => {
                      const itemPrice = item.product ? getEffectivePrice(item.product) : 0;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3.5 rounded-xl bg-cream/30 dark:bg-walnut-800/30 border border-gold-200/20 dark:border-gold-900/20"
                        >
                          <img
                            src={getProductImageUrl(item.product)}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover border border-gold-200/40 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-walnut-900 dark:text-ivory tracking-wide truncate">
                              {item.product?.name}
                            </p>
                            <div className="text-xs text-walnut-500 dark:text-beige-400 mt-1 space-y-0.5">
                              {item.variant_name && <p>Variant: {item.variant_name}</p>}
                              {item.customization_text && <p>Engraving: "{item.customization_text}"</p>}
                              <p>Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-walnut-900 dark:text-ivory whitespace-nowrap">
                            {formatPrice(itemPrice * item.quantity)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-4 rounded-xl border border-gold-200/40 dark:border-gold-900/30 text-walnut-700 dark:text-beige-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 hover:border-gold-500 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-ivory font-semibold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-emerald-950/30 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                      <span>Generating Order...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle size={20} fill="currentColor" />
                      <span>Place Order via WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-5">
            {/* Order Summary Card */}
            <div className="bg-ivory dark:bg-walnut-900 rounded-2xl p-6 sm:p-7 border border-gold-200/30 dark:border-gold-900/20 luxury-shadow">
              <h2 className="text-xl font-display text-walnut-900 dark:text-ivory mb-5 tracking-tight">
                Order Summary
              </h2>
              <div className="h-px bg-gold-200/40 dark:bg-gold-900/20 mb-5" />

              <div className="space-y-3.5">
                <div className="flex justify-between text-sm">
                  <span className="text-walnut-500 dark:text-beige-400">Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold text-walnut-900 dark:text-ivory">{formatPrice(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-gold-600 dark:text-gold-400 font-medium">
                    <span>Discount {couponCode ? `(${couponCode})` : ''}</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-walnut-500 dark:text-beige-400">Shipping</span>
                  <span className="font-semibold text-walnut-900 dark:text-ivory">
                    {shipping === 0 ? (
                      <span className="text-emerald-500 tracking-wider uppercase text-xs font-bold">Complimentary</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-5 mt-5 border-t border-gold-200/30 dark:border-gold-900/20">
                <span className="font-display text-lg text-walnut-900 dark:text-ivory">Total Amount</span>
                <span className="font-display text-2xl text-gold-600 dark:text-gold-400">{formatPrice(total)}</span>
              </div>

              <div className="p-3 rounded-xl bg-gold-50/60 dark:bg-walnut-800/40 border border-gold-200/30 dark:border-gold-900/30 flex items-center gap-2.5 text-xs text-walnut-600 dark:text-beige-400">
                <Sparkles size={16} className="text-gold-500 shrink-0" />
                <span>Complimentary gift box & safety packaging included with all orders.</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-ivory dark:bg-walnut-900 rounded-2xl p-6 border border-gold-200/30 dark:border-gold-900/20">
              <h3 className="text-xs font-semibold text-walnut-900 dark:text-ivory mb-4 uppercase tracking-wider flex items-center gap-2">
                <Shield size={15} className="text-gold-500" /> GALINEX Assurance
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Lock, text: '256-bit encrypted checkout' },
                  { icon: Truck, text: 'Fast Express Delivery (Pan India)' },
                  { icon: Package, text: 'Customized & engraved with precision' },
                  { icon: Star, text: '100% Quality & Satisfaction guaranteed' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-walnut-500 dark:text-beige-400 font-light">
                    <item.icon size={15} className="text-gold-500 shrink-0" />
                    <span className="tracking-wide">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
