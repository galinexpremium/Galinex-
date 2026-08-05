import { useEffect, useState } from 'react';
import { User, Package, Heart, MapPin, Bell, LogOut, ShoppingBag, Settings, Check } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { useStore } from '@/store/StoreContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/format';
import type { Order } from '@/types';

export default function AccountPage() {
  const { user, signOut, isAdmin, updateProfile } = useAuth();
  const { navigate, wishlistItems } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses' | 'notifications'>('profile');
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('login');
      return;
    }
    setProfileName(String((user.user_metadata as Record<string, unknown>)?.full_name ?? ''));
    setProfilePhone(String((user.user_metadata as Record<string, unknown>)?.phone ?? ''));
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setOrders(data as Order[]);
    })();
  }, [user, navigate]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await updateProfile({ full_name: profileName, phone: profilePhone });
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'orders' as const, label: 'Orders', icon: Package },
    { id: 'wishlist' as const, label: 'Wishlist', icon: Heart },
    { id: 'addresses' as const, label: 'Addresses', icon: MapPin },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-ivory dark:bg-walnut-950 rounded-card p-6 border border-champagne-200 dark:border-champagne-900/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-card bg-champagne-100 dark:bg-champagne-900/30 flex items-center justify-center text-champagne-700 dark:text-champagne-300 font-display font-medium text-lg">
                {(user.email ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-walnut-900 dark:text-ivory truncate">{String((user.user_metadata as Record<string, unknown>)?.full_name ?? user.email ?? '')}</p>
                <p className="text-xs text-walnut-500 dark:text-beige-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-card text-sm font-medium transition-colors ${
                    tab === t.id ? 'bg-champagne-50 text-champagne-700 dark:bg-champagne-900/20 dark:text-champagne-300 border-l-2 border-champagne-600' : 'text-walnut-600 dark:text-beige-400 hover:bg-cream dark:hover:bg-walnut-900'
                  }`}
                >
                  <t.icon size={18} /> {t.label}
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => navigate('admin')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-card text-sm font-medium text-champagne-700 dark:text-champagne-400 hover:bg-champagne-50 dark:hover:bg-champagne-900/20 transition-colors"
                >
                  <Settings size={18} /> Admin Dashboard
                </button>
              )}
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-card text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {tab === 'profile' && (
            <div className="bg-ivory dark:bg-walnut-950 rounded-card p-6 border border-champagne-200 dark:border-champagne-900/40">
              <h2 className="font-display text-2xl font-medium text-walnut-900 dark:text-ivory mb-4">Profile Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-walnut-500 dark:text-beige-400 mb-2 block">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-card bg-cream dark:bg-walnut-900 text-sm text-walnut-900 dark:text-ivory outline-none focus:ring-1 focus:ring-champagne-500 border border-champagne-200 dark:border-walnut-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-walnut-500 dark:text-beige-400 mb-2 block">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email ?? ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-card bg-cream dark:bg-walnut-900 text-sm text-walnut-500 dark:text-beige-400 outline-none border border-champagne-200 dark:border-walnut-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-walnut-500 dark:text-beige-400 mb-2 block">Phone</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    placeholder="Add phone number"
                    className="w-full px-4 py-2.5 rounded-card bg-cream dark:bg-walnut-900 text-sm text-walnut-900 dark:text-ivory outline-none focus:ring-1 focus:ring-champagne-500 border border-champagne-200 dark:border-walnut-800 transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button onClick={handleSaveProfile} disabled={savingProfile} className="px-6 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 disabled:opacity-50 text-ivory text-sm font-medium tracking-wide transition-colors">
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                {profileSaved && <span className="text-sm text-emerald-600 flex items-center gap-1"><Check size={16} /> Saved</span>}
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-medium text-walnut-900 dark:text-ivory mb-4">Order History</h2>
              {orders.length === 0 ? (
                <div className="text-center py-12 bg-ivory dark:bg-walnut-950 rounded-card border border-champagne-200 dark:border-champagne-900/40">
                  <Package size={40} className="text-champagne-400 mx-auto mb-4" />
                  <p className="text-walnut-500 dark:text-beige-400 mb-4">No orders yet.</p>
                  <button onClick={() => navigate('shop')} className="px-6 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory text-sm font-medium tracking-wide transition-colors">
                    Start Shopping
                  </button>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-ivory dark:bg-walnut-950 rounded-card p-4 border border-champagne-200 dark:border-champagne-900/40">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm text-walnut-900 dark:text-ivory">{order.order_number}</p>
                        <p className="text-xs text-walnut-500 dark:text-beige-400">{formatDate(order.created_at)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-card text-xs font-medium capitalize ${
                        order.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        order.order_status === 'shipped' ? 'bg-champagne-100 text-champagne-700' :
                        order.order_status === 'processing' ? 'bg-champagne-100 text-champagne-700' :
                        order.order_status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                        'bg-cream text-walnut-600 dark:bg-walnut-900 dark:text-beige-400'
                      }`}>
                        {order.order_status}
                      </span>
                    </div>
                    {order.order_items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-t border-champagne-100 dark:border-walnut-800/50">
                        <img src={item.product_image ?? ''} alt="" className="w-12 h-12 rounded-card object-cover" />
                        <div className="flex-1">
                          <p className="text-sm text-walnut-900 dark:text-ivory">{item.product_name}</p>
                          <p className="text-xs text-walnut-500 dark:text-beige-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-walnut-900 dark:text-ivory">{formatPrice(item.total_price)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between mt-3 pt-3 border-t border-champagne-200 dark:border-walnut-800">
                      <span className="text-sm text-walnut-500 dark:text-beige-400">Total</span>
                      <span className="font-display font-medium text-lg text-walnut-900 dark:text-ivory">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'wishlist' && (
            <div>
              <h2 className="font-display text-2xl font-medium text-walnut-900 dark:text-ivory mb-4">My Wishlist</h2>
              {wishlistItems.length === 0 ? (
                <div className="text-center py-12 bg-ivory dark:bg-walnut-950 rounded-card border border-champagne-200 dark:border-champagne-900/40">
                  <Heart size={40} className="text-champagne-400 mx-auto mb-4" />
                  <p className="text-walnut-500 dark:text-beige-400 mb-4">Your wishlist is empty.</p>
                  <button onClick={() => navigate('shop')} className="px-6 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory text-sm font-medium tracking-wide transition-colors">
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {wishlistItems.map(item => (
                    <div key={item.id} className="flex gap-3 p-4 bg-ivory dark:bg-walnut-950 rounded-card border border-champagne-200 dark:border-champagne-900/40">
                      <img src={item.product?.image_url ?? ''} alt="" className="w-16 h-16 rounded-card object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-walnut-900 dark:text-ivory">{item.product?.name}</p>
                        <p className="text-sm text-champagne-700 dark:text-champagne-400">{item.product ? formatPrice(item.product.sale_price ?? item.product.base_price) : ''}</p>
                        <button onClick={() => navigate('product', { slug: item.product!.slug })} className="text-xs text-champagne-700 dark:text-champagne-400 hover:underline mt-1">
                          View Product
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'addresses' && (
            <div className="bg-ivory dark:bg-walnut-950 rounded-card p-6 border border-champagne-200 dark:border-champagne-900/40">
              <h2 className="font-display text-2xl font-medium text-walnut-900 dark:text-ivory mb-4">Saved Addresses</h2>
              <p className="text-walnut-500 dark:text-beige-400 text-sm mb-4">No saved addresses yet. Addresses from your orders will appear here.</p>
              <button className="px-6 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory text-sm font-medium tracking-wide transition-colors">
                Add New Address
              </button>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="bg-ivory dark:bg-walnut-950 rounded-card p-6 border border-champagne-200 dark:border-champagne-900/40">
              <h2 className="font-display text-2xl font-medium text-walnut-900 dark:text-ivory mb-4">Notifications</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-card bg-champagne-50 dark:bg-champagne-900/10 border border-champagne-100 dark:border-champagne-900/20">
                  <Bell size={18} className="text-champagne-600 dark:text-champagne-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-walnut-900 dark:text-ivory">Welcome to GALINEX!</p>
                    <p className="text-xs text-walnut-500 dark:text-beige-400">Use code WELCOME10 for 10% off your first order.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
