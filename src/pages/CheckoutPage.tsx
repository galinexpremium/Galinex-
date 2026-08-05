import { useState } from 'react';
import { Check, MessageCircle, CreditCard, Wallet, Banknote, ArrowRight, ArrowLeft, Truck, Shield, Lock, Star, Package, Clock } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { useAuth } from '@/store/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, getEffectivePrice } from '@/lib/format';
import { buildWhatsAppOrderMessage, openWhatsApp } from '@/lib/whatsapp';
import type { ShippingAddress } from '@/types';

function base64ToBlob(base64: string): Blob {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: 'image/jpeg' });
}

export default function CheckoutPage() {
  const { cartItems, cartSubtotal, discountAmount, couponCode, navigate, paymentMethod, setPaymentMethod, setShippingAddress, clearCart } = useStore();
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

  const shipping = cartSubtotal >= 999 ? 0 : 99;
  const total = cartSubtotal - discountAmount + shipping;

  const paymentMethods = [
    { id: 'whatsapp', label: 'WhatsApp Order', desc: 'Send order via WhatsApp', icon: MessageCircle, recommended: true },
    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: Banknote },
    { id: 'upi', label: 'UPI Payment', desc: 'Pay via UPI (GPay, PhonePe, etc.)', icon: Wallet },
    { id: 'card', label: 'Credit/Debit Card', desc: 'Demo UI only — not processed', icon: CreditCard },
  ];

  const validateAddress = () => {
    const errs: Record<string, string> = {};
    if (!address.full_name.trim()) errs.full_name = 'Required';
    if (!address.phone.trim() || address.phone.length < 10) errs.phone = 'Valid phone required';
    if (!address.address_line1.trim()) errs.address_line1 = 'Required';
    if (!address.city.trim()) errs.city = 'Required';
    if (!address.state.trim()) errs.state = 'Required';
    if (!address.pincode.trim() || address.pincode.length < 6) errs.pincode = 'Valid pincode required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    const { data: orderNum } = await supabase.rpc('generate_order_number');
    const orderNumber = orderNum ?? 'GX-' + Date.now().toString().slice(-6);
    setOrderNumber(orderNumber);
    setShippingAddress(address);

    const { data: orderRow, error: orderErr } = await supabase.from('orders').insert({
      order_number: orderNumber,
      user_id: user?.id ?? null,
      customer_name: address.full_name,
      customer_phone: address.phone,
      customer_email: address.email || null,
      shipping_address: address,
      subtotal: cartSubtotal,
      discount_amount: discountAmount,
      shipping_amount: shipping,
      total,
      coupon_code: couponCode,
      payment_method: paymentMethod,
      payment_status: 'pending',
      order_status: 'pending',
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }).select('id').single();

    if (orderErr || !orderRow) {
      alert('Failed to place order. Please try again.');
      return;
    }

    const orderId = orderRow.id;

    for (const item of cartItems) {
      let photoUrl = item.photo_url;
      let customizationData = item.customization_data;

      // Upload customization photo to storage if it's a data URL
      if (photoUrl && photoUrl.startsWith('data:')) {
        const fileName = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const base64 = photoUrl.split(',')[1];
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('customizations')
          .upload(fileName, base64ToBlob(base64), { contentType: 'image/jpeg' });
        if (!uploadErr && uploadData) {
          const { data: urlData } = supabase.storage.from('customizations').getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
          if (customizationData) customizationData = { ...customizationData, photo_url: photoUrl };
        }
      }

      await supabase.from('order_items').insert({
        order_id: orderId,
        product_id: item.product_id,
        product_name: item.product?.name ?? 'Product',
        product_image: item.product?.image_url ?? null,
        variant_name: item.variant_name,
        quantity: item.quantity,
        unit_price: item.product ? getEffectivePrice(item.product) : 0,
        total_price: item.product ? getEffectivePrice(item.product) * item.quantity : 0,
        customization_text: item.customization_text,
        photo_url: photoUrl,
        customization_data: customizationData,
      });
    }

    if (paymentMethod === 'whatsapp') {
      const message = buildWhatsAppOrderMessage(
        cartItems, address, cartSubtotal, discountAmount, shipping, total, couponCode, paymentMethod, orderNumber
      );
      openWhatsApp(message);
    }

    clearCart();
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-card bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center mb-6 border border-gold-200/40">
            <Check size={48} className="text-gold-600" />
          </div>
          <h1 className="text-3xl font-display text-walnut-900 dark:text-ivory mb-3 tracking-tight">Order Placed Successfully</h1>
          <div className="w-16 h-px bg-gold-300 mx-auto mb-4" />
          <p className="text-walnut-500 dark:text-beige-400 mb-2 tracking-wide">Your order number is</p>
          <p className="text-2xl font-display text-gold-600 mb-6 tracking-tight">{orderNumber}</p>
          <p className="text-sm text-walnut-500 dark:text-beige-400 mb-8 max-w-md mx-auto">
            {paymentMethod === 'whatsapp'
              ? 'WhatsApp has opened with your order details. Please send the message to confirm your order.'
              : 'We will contact you shortly to confirm your order.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('orders')} className="px-8 py-3.5 rounded-btn bg-gold-600 hover:bg-gold-500 text-ivory font-medium tracking-wide transition-colors">
              Track Order
            </button>
            <button onClick={() => navigate('shop')} className="px-8 py-3.5 rounded-btn border border-gold-200/40 dark:border-gold-900/30 text-walnut-700 dark:text-beige-300 font-medium tracking-wide hover:border-gold-500 transition-colors">
              Continue Shopping
            </button>
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
      {/* Header with secure indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-4xl font-display text-walnut-900 dark:text-ivory tracking-tight">Checkout</h1>
          <div className="flex items-center gap-2 px-4 py-2 rounded-btn bg-gold-50 dark:bg-gold-900/20 border border-gold-200/40 dark:border-gold-900/30">
            <Lock size={15} className="text-gold-600" />
            <span className="text-xs font-medium text-gold-700 dark:text-gold-400 tracking-wide uppercase">Secure Checkout</span>
          </div>
        </div>
        <div className="mt-3 h-px bg-gradient-to-r from-gold-400 via-gold-200 to-transparent" />
      </div>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-10">
        {[
          { num: 1, label: 'Shipping' },
          { num: 2, label: 'Payment' },
          { num: 3, label: 'Review' },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-btn flex items-center justify-center text-sm font-medium transition-colors ${
              step >= s.num ? 'bg-gold-600 text-ivory' : 'bg-cream dark:bg-walnut-800 text-walnut-400 border border-gold-200/30'
            }`}>
              {step > s.num ? <Check size={16} /> : s.num}
            </div>
            <span className={`text-sm font-medium tracking-wide ${step >= s.num ? 'text-walnut-900 dark:text-ivory' : 'text-walnut-400'}`}>{s.label}</span>
            {i < 2 && <div className={`w-12 h-px ${step > s.num ? 'bg-gold-600' : 'bg-gold-200/40 dark:bg-gold-900/20'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="bg-ivory dark:bg-walnut-900 rounded-card p-7 border border-gold-200/30 dark:border-gold-900/20 luxury-shadow">
              <h2 className="text-xl font-display text-walnut-900 dark:text-ivory mb-5 tracking-tight">Shipping Address</h2>
              <div className="h-px bg-gold-200/40 dark:bg-gold-900/20 mb-6" />
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-medium text-walnut-600 dark:text-beige-300 mb-2 block tracking-wide uppercase">Full Name *</label>
                  <input
                    type="text"
                    value={address.full_name}
                    onChange={e => setAddress({ ...address, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                  {errors.full_name && <p className="text-xs text-rose-500 mt-1.5 tracking-wide">{errors.full_name}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-walnut-600 dark:text-beige-300 mb-2 block tracking-wide uppercase">Phone *</label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={e => setAddress({ ...address, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                  {errors.phone && <p className="text-xs text-rose-500 mt-1.5 tracking-wide">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-walnut-600 dark:text-beige-300 mb-2 block tracking-wide uppercase">Email</label>
                  <input
                    type="email"
                    value={address.email}
                    onChange={e => setAddress({ ...address, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-walnut-600 dark:text-beige-300 mb-2 block tracking-wide uppercase">Address Line 1 *</label>
                  <input
                    type="text"
                    value={address.address_line1}
                    onChange={e => setAddress({ ...address, address_line1: e.target.value })}
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                  {errors.address_line1 && <p className="text-xs text-rose-500 mt-1.5 tracking-wide">{errors.address_line1}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-walnut-600 dark:text-beige-300 mb-2 block tracking-wide uppercase">Address Line 2</label>
                  <input
                    type="text"
                    value={address.address_line2}
                    onChange={e => setAddress({ ...address, address_line2: e.target.value })}
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-walnut-600 dark:text-beige-300 mb-2 block tracking-wide uppercase">City *</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={e => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                  {errors.city && <p className="text-xs text-rose-500 mt-1.5 tracking-wide">{errors.city}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-walnut-600 dark:text-beige-300 mb-2 block tracking-wide uppercase">State *</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={e => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                  {errors.state && <p className="text-xs text-rose-500 mt-1.5 tracking-wide">{errors.state}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-walnut-600 dark:text-beige-300 mb-2 block tracking-wide uppercase">Pincode *</label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={e => setAddress({ ...address, pincode: e.target.value })}
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                  {errors.pincode && <p className="text-xs text-rose-500 mt-1.5 tracking-wide">{errors.pincode}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-walnut-600 dark:text-beige-300 mb-2 block tracking-wide uppercase">Landmark</label>
                  <input
                    type="text"
                    value={address.landmark}
                    onChange={e => setAddress({ ...address, landmark: e.target.value })}
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-ivory outline-none border border-gold-200/40 focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={() => validateAddress() && setStep(2)}
                className="mt-8 px-8 py-3.5 rounded-btn bg-gold-600 hover:bg-gold-500 text-ivory font-medium tracking-wide flex items-center gap-2 transition-colors btn-shimmer"
              >
                Continue to Payment <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-ivory dark:bg-walnut-900 rounded-card p-7 border border-gold-200/30 dark:border-gold-900/20 luxury-shadow">
              <h2 className="text-xl font-display text-walnut-900 dark:text-ivory mb-5 tracking-tight">Payment Method</h2>
              <div className="h-px bg-gold-200/40 dark:bg-gold-900/20 mb-6" />
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-btn border transition-all text-left ${
                      paymentMethod === method.id
                        ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20'
                        : 'border-gold-200/40 dark:border-gold-900/30 hover:border-gold-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-btn flex items-center justify-center transition-colors ${paymentMethod === method.id ? 'bg-gold-600 text-ivory' : 'bg-cream dark:bg-walnut-800 text-walnut-500'}`}>
                      <method.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-walnut-900 dark:text-ivory tracking-wide">{method.label}</p>
                      <p className="text-xs text-walnut-500 dark:text-beige-400 mt-0.5">{method.desc}</p>
                    </div>
                    {method.recommended && (
                      <span className="px-2.5 py-1 rounded-btn bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-[10px] font-medium uppercase tracking-wider">Recommended</span>
                    )}
                    {paymentMethod === method.id && <Check size={20} className="text-gold-600" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="px-6 py-3.5 rounded-btn border border-gold-200/40 dark:border-gold-900/30 text-walnut-700 dark:text-beige-300 font-medium tracking-wide flex items-center gap-2 hover:border-gold-500 transition-colors">
                  <ArrowLeft size={18} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 px-8 py-3.5 rounded-btn bg-gold-600 hover:bg-gold-500 text-ivory font-medium tracking-wide flex items-center justify-center gap-2 transition-colors btn-shimmer"
                >
                  Review Order <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-ivory dark:bg-walnut-900 rounded-card p-7 border border-gold-200/30 dark:border-gold-900/20 luxury-shadow">
                <h2 className="text-xl font-display text-walnut-900 dark:text-ivory mb-5 tracking-tight">Review Your Order</h2>
                <div className="h-px bg-gold-200/40 dark:bg-gold-900/20 mb-6" />

                {/* Shipping */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-walnut-500 dark:text-beige-400 mb-2 tracking-wide uppercase">Shipping To</h3>
                  <p className="text-sm text-walnut-900 dark:text-ivory font-medium">{address.full_name}</p>
                  <p className="text-sm text-walnut-500 dark:text-beige-400 mt-1">{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}</p>
                  <p className="text-sm text-walnut-500 dark:text-beige-400">{address.city}, {address.state} - {address.pincode}</p>
                  <p className="text-sm text-walnut-500 dark:text-beige-400">{address.phone}</p>
                </div>

                {/* Payment */}
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-walnut-500 dark:text-beige-400 mb-2 tracking-wide uppercase">Payment Method</h3>
                  <p className="text-sm text-walnut-900 dark:text-ivory font-medium capitalize">
                    {paymentMethods.find(m => m.id === paymentMethod)?.label}
                  </p>
                </div>

                {/* Items */}
                <div className="border-t border-gold-200/30 dark:border-gold-900/20 pt-5">
                  <h3 className="text-xs font-medium text-walnut-500 dark:text-beige-400 mb-4 tracking-wide uppercase">Items</h3>
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <img src={item.product?.image_url ?? ''} alt="" className="w-16 h-16 rounded-card object-cover border border-gold-200/30" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-walnut-900 dark:text-ivory tracking-wide">{item.product?.name}</p>
                          <p className="text-xs text-walnut-500 dark:text-beige-400 mt-1">Qty: {item.quantity}</p>
                          {item.customization_text && <p className="text-xs text-walnut-500 dark:text-beige-400">Custom: {item.customization_text}</p>}
                        </div>
                        <p className="text-sm font-medium text-walnut-900 dark:text-ivory">
                          {formatPrice((item.product ? getEffectivePrice(item.product) : 0) * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-6 py-3.5 rounded-btn border border-gold-200/40 dark:border-gold-900/30 text-walnut-700 dark:text-beige-300 font-medium tracking-wide flex items-center gap-2 hover:border-gold-500 transition-colors">
                  <ArrowLeft size={18} /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 px-8 py-3.5 rounded-btn bg-gold-600 hover:bg-gold-500 text-ivory font-medium tracking-wide flex items-center justify-center gap-2 transition-colors btn-shimmer"
                >
                  {paymentMethod === 'whatsapp' ? <><MessageCircle size={20} fill="currentColor" /> Place Order via WhatsApp</> : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-5">
            {/* Order Summary */}
            <div className="bg-ivory dark:bg-walnut-900 rounded-card p-7 border border-gold-200/30 dark:border-gold-900/20 luxury-shadow">
              <h2 className="text-xl font-display text-walnut-900 dark:text-ivory mb-5 tracking-tight">Order Summary</h2>
              <div className="h-px bg-gold-200/40 dark:bg-gold-900/20 mb-5" />
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-walnut-500 dark:text-beige-400">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium text-walnut-900 dark:text-ivory">{formatPrice(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-gold-600">
                    <span>Discount {couponCode ? `(${couponCode})` : ''}</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-walnut-500 dark:text-beige-400">Shipping</span>
                  <span className="font-medium text-walnut-900 dark:text-ivory">
                    {shipping === 0 ? <span className="text-gold-600 tracking-wide">FREE</span> : formatPrice(shipping)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between py-5 mt-5 border-t border-gold-200/30 dark:border-gold-900/20">
                <span className="font-display text-lg text-walnut-900 dark:text-ivory">Total</span>
                <span className="font-display text-2xl text-walnut-900 dark:text-ivory">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-ivory dark:bg-walnut-900 rounded-card p-6 border border-gold-200/30 dark:border-gold-900/20">
              <h3 className="text-xs font-medium text-walnut-900 dark:text-ivory mb-4 uppercase tracking-wider2 flex items-center gap-2">
                <Shield size={14} className="text-gold-600" /> Why Shop With Us
              </h3>
              <div className="space-y-3.5">
                {[
                  { icon: Lock, text: '256-bit SSL secure checkout' },
                  { icon: Truck, text: 'Estimated delivery: 5-9 days' },
                  { icon: Package, text: 'Premium gift packaging included' },
                  { icon: Star, text: '100% satisfaction guarantee' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-walnut-500 dark:text-beige-400 font-light">
                    <item.icon size={15} className="text-gold-600 flex-shrink-0" />
                    <span className="tracking-wide">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment icons */}
            <div className="bg-ivory dark:bg-walnut-900 rounded-card p-6 border border-gold-200/30 dark:border-gold-900/20">
              <h3 className="text-xs font-medium text-walnut-900 dark:text-ivory mb-4 uppercase tracking-wider2">We Accept</h3>
              <div className="flex flex-wrap gap-2.5">
                {['UPI', 'VISA', 'Mastercard', 'RuPay', 'COD'].map(p => (
                  <span key={p} className="px-3 py-2 rounded-btn bg-cream dark:bg-walnut-800 border border-gold-200/30 dark:border-gold-900/20 text-[10px] font-medium tracking-wider text-walnut-600 dark:text-beige-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
