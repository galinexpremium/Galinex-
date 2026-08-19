import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, ShoppingBag } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { formatPrice } from '@/lib/format';

export default function Toast() {
  const { toast, hideToast, navigate } = useStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  const iconMap = {
    success: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
    info: <Info size={18} className="text-gold-400 shrink-0" />,
    warning: <AlertTriangle size={18} className="text-amber-400 shrink-0" />,
    error: <AlertCircle size={18} className="text-rose-400 shrink-0" />,
  };

  return (
    <aside
      aria-label="Notification"
      className="fixed bottom-20 sm:bottom-8 left-4 right-4 sm:left-auto sm:right-8 z-50 max-w-md w-auto mx-auto sm:mx-0 animate-fade-in-up"
    >
      <div className="bg-[#1A120C]/95 backdrop-blur-md border border-gold-500/30 rounded-2xl p-3.5 shadow-2xl shadow-black/80 flex items-center gap-3 text-cream ring-1 ring-white/5">
        {/* Product Thumbnail or Type Icon */}
        {toast.image_url ? (
          <div className="relative w-12 h-12 rounded-xl bg-walnut-900/80 border border-gold-500/20 overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src={toast.image_url}
              alt=""
              className="w-full h-full object-contain"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 shadow">
              <CheckCircle2 size={12} className="text-ivory" />
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gold-950/40 border border-gold-500/20 flex items-center justify-center shrink-0">
            {iconMap[toast.type] || iconMap.info}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-gold-400 tracking-wide uppercase">
              {toast.title}
            </p>
          </div>
          {toast.subtitle && (
            <p className="text-xs text-cream/90 font-medium truncate mt-0.5">
              {toast.subtitle}
            </p>
          )}
          {toast.price !== undefined && (
            <p className="text-[11px] text-gold-300/80 font-light mt-0.5">
              {formatPrice(toast.price)}
            </p>
          )}
        </div>

        {/* Action Button */}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              hideToast();
            }}
            className="px-3 py-1.5 bg-gold-600 hover:bg-gold-500 text-ivory text-[11px] font-semibold tracking-wider uppercase rounded-lg transition-colors shrink-0 shadow-sm"
          >
            {toast.action.label}
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={hideToast}
          className="p-1 text-walnut-400 hover:text-cream transition-colors rounded-lg shrink-0 ml-1"
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
}
