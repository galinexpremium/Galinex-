import { Home, ShoppingBag, Heart, User, Search } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { useAuth } from '@/store/AuthContext';

export default function MobileNav() {
  const { navigate, currentPage, cartCount, wishlistCount, setSearchOpen, cartPulse } = useStore();
  const { user } = useAuth();

  const items = [
    { icon: Home, label: 'Home', page: 'home' as const },
    { icon: Search, label: 'Search', action: () => setSearchOpen(true) },
    { icon: Heart, label: 'Wishlist', page: 'wishlist' as const, badge: wishlistCount },
    { icon: ShoppingBag, label: 'Cart', page: 'cart' as const, badge: cartCount, isCart: true },
    { icon: User, label: 'Account', page: user ? 'account' as const : 'login' as const },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-gold-200/40 dark:border-gold-900/30">
      <div className="flex items-center justify-around px-2 py-2 safe-area">
        {items.map((item, i) => {
          const isActive = currentPage === item.page;
          const shouldBounce = item.isCart && cartPulse;
          return (
            <button
              key={i}
              onClick={() => item.action ? item.action() : navigate(item.page!)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-btn transition-all duration-500 relative ${
                isActive
                  ? 'text-gold-600'
                  : 'text-walnut-500 dark:text-cream/60'
              } ${shouldBounce ? 'animate-cart-bounce text-gold-500' : ''}`}
            >
              <div className={`relative transition-transform duration-500 ${isActive ? 'scale-110' : ''}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                {item.badge ? (
                  <span className={`absolute -top-1.5 -right-2 bg-gold-600 text-ivory text-[9px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 transition-transform ${shouldBounce ? 'scale-125 bg-gold-500' : 'scale-100'}`}>
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] tracking-wide transition-all duration-300 ${isActive ? 'font-medium' : 'font-light'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
