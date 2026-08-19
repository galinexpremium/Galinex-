import { useState, useEffect, type FormEvent } from 'react';
import {
  Search, Package, Truck, CheckCircle2, Clock, MapPin,
  Calendar, Phone, Mail, ArrowRight, MessageCircle, AlertCircle,
  ChevronRight, Box, ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { supabase, WHATSAPP_NUMBER, BRAND_NAME } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/format';
import type { Order } from '@/types';

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Order received & under review', icon: Package },
  { key: 'confirmed', label: 'Confirmed', desc: 'Design verified & approved', icon: ShieldCheck },
  { key: 'processing', label: 'Crafting & Engraving', desc: 'Laser engraving in progress', icon: Box },
  { key: 'shipped', label: 'Dispatched', desc: 'Handed over to courier partner', icon: Truck },
  { key: 'delivered', label: 'Delivered', desc: 'Successfully delivered to customer', icon: CheckCircle2 },
];

export default function TrackOrderPage() {
  const { pageProps, navigate } = useStore();
  const [query, setQuery] = useState((pageProps?.orderNumber as string) ?? '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const lookupOrder = async (searchStr: string) => {
    const clean = searchStr.trim();
    if (!clean) return;
    setLoading(true);
    setErrorMsg('');
    setSearched(true);

    try {
      // Look up by order_number or customer_phone
      let q = supabase
        .from('orders')
        .select('*, order_items(*)');

      if (clean.toUpperCase().startsWith('GX-')) {
        q = q.ilike('order_number', clean);
      } else {
        q = q.or(`order_number.ilike.%${clean}%,customer_phone.ilike.%${clean}%,customer_email.ilike.%${clean}%`);
      }

      const { data, error } = await q.order('created_at', { ascending: false }).limit(1).maybeSingle();

      if (error || !data) {
        setOrder(null);
        setErrorMsg('No order found matching your search. Please check the order number and try again.');
      } else {
        setOrder(data as Order);
      }
    } catch {
      setOrder(null);
      setErrorMsg('Failed to fetch order details. Please try again or reach out on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageProps?.orderNumber) {
      lookupOrder(pageProps.orderNumber as string);
    }
  }, [pageProps?.orderNumber]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    lookupOrder(query);
  };

  const getStepIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'processing') return 2;
    if (s === 'confirmed') return 1;
    return 0;
  };

  const currentStep = order ? getStepIndex(order.order_status) : 0;
  const isCancelled = order?.order_status.toLowerCase() === 'cancelled';

  return (
    <div className="min-h-screen bg-ivory dark:bg-walnut-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-walnut-400 mb-8 font-light tracking-wide">
          <button onClick={() => navigate('home')} className="hover:text-champagne-600 transition-colors">Home</button>
          <ChevronRight size={12} />
          <span className="text-walnut-800 dark:text-cream">Track Order</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-champagne-600 text-xs font-medium uppercase tracking-wider2 mb-3">Live Order Status</p>
          <h1 className="font-display text-4xl sm:text-5xl text-walnut-900 dark:text-cream font-light mb-4">
            Track Your Order
          </h1>
          <p className="text-sm text-walnut-500 dark:text-beige-400 font-light max-w-md mx-auto">
            Enter your order number (e.g. <span className="font-mono text-champagne-700 dark:text-champagne-400">GX-123456</span>) or registered phone number.
          </p>
          <div className="gold-divider w-24 mx-auto mt-6" />
        </div>

        {/* Search Bar */}
        <div className="bg-cream/40 dark:bg-walnut-900/60 p-6 sm:p-8 rounded-card border border-champagne-200/50 dark:border-champagne-900/30 shadow-sm mb-12">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-walnut-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Order # or Phone (e.g. GX-102938 / 9360482480)"
                className="w-full pl-11 pr-4 py-3.5 bg-ivory dark:bg-walnut-950 text-walnut-900 dark:text-cream text-sm rounded-input border border-champagne-200/80 dark:border-champagne-900/50 outline-none focus:border-champagne-500 transition-colors font-light"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-3.5 bg-champagne-600 hover:bg-champagne-500 disabled:opacity-50 text-ivory text-sm font-medium rounded-btn flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-champagne-600/10"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                  <span>Checking…</span>
                </>
              ) : (
                <>
                  <span>Track Status</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error message */}
        {searched && errorMsg && (
          <div className="p-5 rounded-card bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 flex items-start gap-3 mb-10">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">Order Not Found</p>
              <p className="text-xs font-light leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Order Details Card */}
        {order && (
          <div className="space-y-8 animate-fade-in">
            {/* Header info */}
            <div className="bg-ivory dark:bg-walnut-900 p-6 sm:p-8 rounded-card border border-champagne-200 dark:border-champagne-900/40 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-champagne-200/40 dark:border-champagne-900/30">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-mono text-xl font-semibold text-walnut-900 dark:text-cream">
                      {order.order_number}
                    </h2>
                    <span className={`px-3 py-1 text-xs font-medium uppercase rounded-full ${
                      isCancelled
                        ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                        : order.order_status === 'delivered'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-champagne-100 dark:bg-champagne-900/30 text-champagne-800 dark:text-champagne-300'
                    }`}>
                      {order.order_status}
                    </span>
                  </div>
                  <p className="text-xs text-walnut-500 dark:text-beige-400 font-light">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-walnut-400 uppercase tracking-wide mb-1">Total Amount</p>
                  <p className="font-display text-2xl font-semibold text-champagne-700 dark:text-champagne-400">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              {isCancelled ? (
                <div className="py-8 text-center">
                  <p className="text-rose-600 dark:text-rose-400 font-medium text-lg mb-2">This order was cancelled</p>
                  <p className="text-xs text-walnut-500 font-light">For queries regarding refund or cancellation reasons, please contact us on WhatsApp.</p>
                </div>
              ) : (
                <div className="py-8">
                  <div className="relative">
                    {/* Progress Bar background */}
                    <div className="hidden md:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-champagne-200 dark:bg-walnut-800" />
                    {/* Active Progress Bar */}
                    <div
                      className="hidden md:block absolute top-1/2 left-8 -translate-y-1/2 h-0.5 bg-champagne-600 transition-all duration-500"
                      style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 85}%` }}
                    />

                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2 relative">
                      {ORDER_STEPS.map((s, idx) => {
                        const isDone = idx <= currentStep;
                        const isCurrent = idx === currentStep;
                        const Icon = s.icon;

                        return (
                          <div key={s.key} className="flex md:flex-col items-center md:text-center gap-4 md:gap-2">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-500 ${
                                isDone
                                  ? 'bg-champagne-600 text-ivory ring-4 ring-champagne-100 dark:ring-champagne-900/30'
                                  : 'bg-cream dark:bg-walnut-800 text-walnut-400 border border-champagne-200/50 dark:border-champagne-900/30'
                              }`}
                            >
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-medium leading-tight ${
                                isCurrent
                                  ? 'text-champagne-700 dark:text-champagne-400 font-semibold'
                                  : isDone
                                  ? 'text-walnut-900 dark:text-cream'
                                  : 'text-walnut-400'
                              }`}>
                                {s.label}
                              </p>
                              <p className="text-[11px] text-walnut-400 dark:text-beige-400 font-light mt-0.5">
                                {s.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery info & Tracking Number */}
              <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-champagne-200/40 dark:border-champagne-900/30 text-xs text-walnut-600 dark:text-beige-400">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-champagne-600 flex-shrink-0" />
                  <div>
                    <span className="text-walnut-400 block text-[10px] uppercase">Estimated Delivery</span>
                    <span className="font-medium text-walnut-800 dark:text-cream">
                      {order.estimated_delivery ? formatDate(order.estimated_delivery) : '5–7 Business Days'}
                    </span>
                  </div>
                </div>

                {order.tracking_number && (
                  <div className="flex items-center gap-3">
                    <Truck size={16} className="text-champagne-600 flex-shrink-0" />
                    <div>
                      <span className="text-walnut-400 block text-[10px] uppercase">Tracking Number</span>
                      <span className="font-mono font-medium text-walnut-800 dark:text-cream">
                        {order.tracking_number}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items & Shipping Address */}
            <div className="grid sm:grid-cols-3 gap-6">
              {/* Items */}
              <div className="sm:col-span-2 bg-ivory dark:bg-walnut-900 p-6 rounded-card border border-champagne-200 dark:border-champagne-900/40 shadow-sm space-y-4">
                <h3 className="font-display text-base text-walnut-900 dark:text-cream font-medium">
                  Ordered Items ({order.order_items?.length ?? 0})
                </h3>
                <div className="divide-y divide-champagne-200/30 dark:divide-champagne-900/20">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="py-3 flex items-center gap-4">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-14 h-14 rounded-card object-cover bg-cream dark:bg-walnut-800 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-card bg-cream dark:bg-walnut-800 flex items-center justify-center text-champagne-500 flex-shrink-0">
                          <Package size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-walnut-900 dark:text-cream truncate">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-walnut-500 dark:text-beige-400 font-light">
                          Qty: {item.quantity} × {formatPrice(item.unit_price)}
                        </p>
                        {item.customization_text && (
                          <p className="text-[11px] text-champagne-700 dark:text-champagne-400 italic truncate mt-0.5">
                            Engraving: "{item.customization_text}"
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-walnut-900 dark:text-cream">
                          {formatPrice(item.total_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-ivory dark:bg-walnut-900 p-6 rounded-card border border-champagne-200 dark:border-champagne-900/40 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-base text-walnut-900 dark:text-cream font-medium mb-3 flex items-center gap-2">
                    <MapPin size={16} className="text-champagne-600" />
                    Delivery Address
                  </h3>
                  <div className="text-xs text-walnut-600 dark:text-beige-400 space-y-1 font-light leading-relaxed">
                    <p className="font-medium text-walnut-900 dark:text-cream">
                      {order.shipping_address?.full_name || order.customer_name}
                    </p>
                    <p>{order.shipping_address?.address_line1}</p>
                    {order.shipping_address?.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                    <p>
                      {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                    </p>
                    <p className="pt-2 flex items-center gap-1.5">
                      <Phone size={12} className="text-walnut-400" />
                      {order.customer_phone}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi GALINEX, I am tracking my order ${order.order_number}. Could you please share an update?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-ivory text-xs font-medium rounded-btn flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp Support</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
