import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  LayoutDashboard, Package, Tag, Boxes, Users, Ticket, Star, MessageSquare,
  Settings, LogOut, Plus, Pencil, Trash2, X, Search, AlertTriangle,
  TrendingUp, ShoppingBag, DollarSign, Menu, Check, ArrowUpRight,
  BarChart3, Image as ImageIcon, Mail, Trash, Upload, StarOff, Eye, EyeOff,
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { useAuth } from '@/store/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Product, Category, Order, Coupon, Review, ProductImage } from '@/types';
import { formatPrice, formatDate, getEffectivePrice } from '@/lib/format';

type Section = 'dashboard' | 'orders' | 'products' | 'categories' | 'inventory' | 'customers' | 'coupons' | 'reviews' | 'messages' | 'homepage' | 'analytics' | 'settings';

interface CustomerProfile {
  id: string; full_name: string | null; phone: string | null; email: string | null;
  total_orders: number; total_spent: number; created_at: string;
}
interface SiteSettings {
  id: string; brand_name: string; whatsapp_number: string; announcement_banner: string;
  announcement_active: boolean; free_shipping_threshold: number; default_payment_method: string;
}
interface NewsletterSub { id: string; email: string; created_at: string }
interface ContactMessage {
  id: string; name: string; email: string; phone: string | null;
  subject: string; message: string; is_read: boolean; created_at: string;
}
interface HomepageContent {
  id: string; hero_title: string; hero_subtitle: string; hero_image_url: string;
  hero_badge: string; about_title: string; about_text: string;
  process_title: string; occasions_title: string; why_title: string; updated_at: string;
}

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusColor = (s: string) =>
  s === 'delivered' ? 'bg-emerald-900/30 text-emerald-400'
  : s === 'shipped' ? 'bg-champagne-900/30 text-champagne-400'
  : s === 'processing' ? 'bg-champagne-900/30 text-champagne-400'
  : s === 'cancelled' ? 'bg-rose-900/30 text-rose-400'
  : 'bg-walnut-800 text-beige-400';
const inputCls = 'w-full px-4 py-2.5 rounded-card bg-walnut-800/50 text-sm text-cream outline-none focus:ring-1 focus:ring-champagne-500 border border-champagne-900/30';
const cardCls = 'bg-walnut-900 rounded-card border border-champagne-900/20';

export default function AdminPage() {
  const { navigate } = useStore();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('login');
  }, [user, isAdmin, loading, navigate]);

  const navItems: { id: Section; label: string; icon: typeof Package }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'homepage', label: 'Homepage', icon: ImageIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-walnut-400 font-light">Loading…</div>;
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 flex items-center gap-2 border-b border-champagne-900/20">
        <div className="w-9 h-9 rounded-card bg-champagne-600 flex items-center justify-center text-ivory font-display font-semibold">G</div>
        <div>
          <p className="font-display font-medium text-cream leading-tight tracking-wider2">GALINEX</p>
          <p className="text-[10px] uppercase tracking-widest text-champagne-500 font-light">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setSection(item.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-card text-sm font-medium transition-colors duration-300 ${
              section === item.id ? 'bg-champagne-900/20 text-champagne-400'
              : 'text-cream/60 hover:bg-cream/5 hover:text-champagne-500'}`}>
            <item.icon size={18} /> {item.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-champagne-900/20 space-y-1">
        <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-card text-sm font-medium text-rose-400 hover:bg-rose-900/20 transition-colors duration-300">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-walnut-950 flex">
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-walnut-950 border-r border-champagne-900/20 sticky top-0 h-screen">
        <Sidebar />
      </aside>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-walnut-950/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-walnut-950 h-full"><Sidebar /></div>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 glass border-b border-champagne-900/20 px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-cream/60"><Menu size={20} /></button>
          <h1 className="text-lg font-display font-medium text-cream capitalize flex-1">{section}</h1>
          <div className="w-9 h-9 rounded-card bg-champagne-900/30 flex items-center justify-center text-champagne-400 font-display font-medium text-sm">
            {(user.email ?? 'A').charAt(0).toUpperCase()}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {section === 'dashboard' && <DashboardSection />}
          {section === 'orders' && <OrdersSection />}
          {section === 'products' && <ProductsSection />}
          {section === 'categories' && <CategoriesSection />}
          {section === 'inventory' && <InventorySection />}
          {section === 'customers' && <CustomersSection />}
          {section === 'coupons' && <CouponsSection />}
          {section === 'reviews' && <ReviewsSection />}
          {section === 'messages' && <MessagesSection />}
          {section === 'homepage' && <HomepageSection />}
          {section === 'analytics' && <AnalyticsSection />}
          {section === 'settings' && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

/* ---------- shared ---------- */
function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Package; label: string; value: string; accent: string }) {
  return (
    <div className={cardCls + ' p-5 flex items-center gap-4'}>
      <div className={`w-12 h-12 rounded-card flex items-center justify-center ${accent}`}><Icon size={22} /></div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-walnut-400 font-light">{label}</p>
        <p className="text-xl font-display font-medium text-cream truncate">{value}</p>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h2 className="text-2xl font-display font-medium text-cream">{title}</h2>
        {subtitle && <p className="text-sm text-walnut-400 mt-1 font-light">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Package; text: string }) {
  return <div className="text-center py-16"><Icon size={36} className="text-walnut-700 mx-auto mb-3" /><p className="text-walnut-400 text-sm font-light">{text}</p></div>;
}

function Modal({ title, onClose, children, size = 'md' }: { title: string; onClose: () => void; children: React.ReactNode; size?: 'md' | 'lg' }) {
  const maxW = size === 'lg' ? 'max-w-3xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-walnut-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxW} max-h-[90vh] overflow-y-auto bg-walnut-900 rounded-card p-6 space-y-4 border border-champagne-900/20 shadow-xl`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-medium text-cream">{title}</h3>
          <button onClick={onClose} className="p-2 text-walnut-400 hover:text-cream"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-medium text-walnut-400 mb-1 block tracking-wide">{label}</label>{children}</div>;
}

/* ---------- Dashboard ---------- */
function DashboardSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [o, p, c] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('products').select('*'),
        supabase.from('customer_profiles').select('*'),
      ]);
      if (o.data) setOrders(o.data as Order[]);
      if (p.data) setProducts(p.data as Product[]);
      if (c.data) setCustomers(c.data as CustomerProfile[]);
      setLoading(false);
    })();
  }, []);

  const totalRevenue = useMemo(() => orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0), [orders]);
  const lowStock = useMemo(() => products.filter(p => p.stock_quantity <= 5).sort((a, b) => a.stock_quantity - b.stock_quantity), [products]);
  const salesByDay = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach(o => {
      const d = new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      map.set(d, (map.get(d) ?? 0) + o.total);
    });
    return Array.from(map.entries()).slice(-7);
  }, [orders]);
  const maxSale = Math.max(1, ...salesByDay.map(d => d[1]));

  if (loading) return <div className="text-walnut-400 font-light">Loading dashboard…</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(totalRevenue)} accent="bg-champagne-900/30 text-champagne-400" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={String(orders.length)} accent="bg-champagne-900/30 text-champagne-400" />
        <StatCard icon={Package} label="Products" value={String(products.length)} accent="bg-emerald-900/30 text-emerald-400" />
        <StatCard icon={Users} label="Customers" value={String(customers.length)} accent="bg-champagne-900/30 text-champagne-400" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center gap-2"><TrendingUp size={18} className="text-champagne-600" /><h3 className="font-display font-medium text-cream">Sales (last 7 days)</h3></div>
          {salesByDay.length === 0 ? <EmptyState icon={TrendingUp} text="No sales data yet." /> : (
            <div className="flex items-end justify-between gap-2 h-48 pt-4">
              {salesByDay.map(([day, val]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  <div className="w-full flex-1 flex items-end">
                    <div className="w-full rounded-t-sm bg-gradient-to-t from-champagne-600 to-champagne-400 hover:from-champagne-700 hover:to-champagne-500 transition-all duration-500" style={{ height: `${Math.max(4, (val / maxSale) * 100)}%` }} title={formatPrice(val)} />
                  </div>
                  <span className="text-[10px] text-walnut-400 font-light truncate w-full text-center">{day}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2"><AlertTriangle size={18} className="text-rose-500" /><h3 className="font-display font-medium text-cream">Low Stock Alerts</h3></div>
          {lowStock.length === 0 ? <p className="text-sm text-walnut-400 font-light">All products well stocked.</p> : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {lowStock.slice(0, 8).map(p => (
                <div key={p.id} className="flex items-center justify-between gap-2 p-2 rounded-card bg-walnut-800/50">
                  <span className="text-sm text-beige-300 truncate">{p.name}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-card ${p.stock_quantity === 0 ? 'bg-rose-900/30 text-rose-400' : 'bg-champagne-900/30 text-champagne-400'}`}>{p.stock_quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="p-6 space-y-4">
        <h3 className="font-display font-medium text-cream">Recent Orders</h3>
        {orders.length === 0 ? <EmptyState icon={ShoppingBag} text="No orders yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-walnut-400 border-b border-champagne-900/20"><th className="py-2 pr-4 font-light">Order</th><th className="py-2 pr-4 font-light">Customer</th><th className="py-2 pr-4 font-light">Date</th><th className="py-2 pr-4 font-light">Total</th><th className="py-2 font-light">Status</th></tr></thead>
              <tbody>
                {orders.slice(0, 6).map(o => (
                  <tr key={o.id} className="border-b border-champagne-900/10">
                    <td className="py-3 pr-4 font-medium text-cream">{o.order_number}</td>
                    <td className="py-3 pr-4 text-beige-300 truncate max-w-[160px]">{o.customer_name}</td>
                    <td className="py-3 pr-4 text-walnut-400 font-light">{formatDate(o.created_at)}</td>
                    <td className="py-3 pr-4 font-medium text-cream">{formatPrice(o.total)}</td>
                    <td className="py-3"><span className={`px-2.5 py-1 rounded-card text-xs font-medium capitalize ${statusColor(o.order_status)}`}>{o.order_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Orders ---------- */
function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    const prev = orders;
    setOrders(curr => curr.map(o => o.id === id ? { ...o, order_status: status } : o));
    const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', id);
    if (error) { setOrders(prev); alert('Failed to update order status.'); }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) { alert('Failed to delete order.'); return; }
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) || o.customer_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <SectionHeader title="Orders" subtitle={`${orders.length} total orders`} />
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-walnut-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" className={inputCls + ' pl-9'} />
      </div>
      {loading ? <div className="text-walnut-400 font-light">Loading…</div> : filtered.length === 0 ? <EmptyState icon={ShoppingBag} text="No orders found." /> : (
        <div className="space-y-3">
          {filtered.map(o => (
            <div key={o.id} className={cardCls + ' p-4'}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div><p className="font-display font-medium text-cream">{o.order_number}</p><p className="text-xs text-walnut-400 font-light">{formatDate(o.created_at)} · {o.customer_name} · {o.customer_phone}</p></div>
                <div className="flex items-center gap-2"><span className={`px-2.5 py-1 rounded-card text-xs font-medium capitalize ${statusColor(o.order_status)}`}>{o.order_status}</span><span className="font-display font-medium text-cream">{formatPrice(o.total)}</span></div>
              </div>
              {o.order_items && o.order_items.length > 0 && (
                <div className="space-y-2 mb-3">
                  {o.order_items.map((it, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-card bg-walnut-800/30">
                      <img src={it.product_image ?? ''} alt="" className="w-10 h-10 rounded-lg object-cover bg-walnut-800 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-beige-300">{it.product_name} ×{it.quantity}</p>
                        {it.customization_text && <p className="text-[11px] text-champagne-500 mt-0.5">Text: "{it.customization_text}"</p>}
                        {it.customization_data?.font && <p className="text-[11px] text-walnut-500">Font: {it.customization_data.font.split(',')[0].replace(/'/g, '')}</p>}
                        {it.customization_data?.photo_transform && (
                          <p className="text-[11px] text-walnut-500">
                            Zoom: {it.customization_data.photo_transform.scale.toFixed(1)}x · Rotation: {it.customization_data.photo_transform.rotation}°
                          </p>
                        )}
                      </div>
                      {it.photo_url && (
                        <a href={it.photo_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                          <img src={it.photo_url} alt="Custom" className="w-12 h-12 rounded-lg object-cover border border-champagne-900/30 hover:border-champagne-500 transition-colors" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-walnut-400 font-light">Update status:</span>
                <select value={o.order_status} onChange={e => updateStatus(o.id, e.target.value)} className="px-3 py-1.5 rounded-card bg-walnut-800/50 text-xs text-cream outline-none focus:ring-1 focus:ring-champagne-500 border border-champagne-900/30">{ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <button onClick={() => deleteOrder(o.id)} className="ml-auto p-1.5 rounded-lg hover:bg-rose-900/20 text-rose-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Products ---------- */
const BADGE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'new', label: 'New Arrival' },
  { value: 'best_seller', label: 'Best Seller' },
  { value: 'trending', label: 'Trending' },
  { value: 'sale', label: 'On Sale' },
  { value: 'limited_edition', label: 'Limited Edition' },
];

function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      supabase.from('products').select('*, category:categories(*), images:product_images(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    if (p.data) setProducts(p.data as Product[]);
    if (c.data) setCategories(c.data as Category[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product and all its images?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { alert('Failed to delete product.'); return; }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleActive = async (p: Product) => {
    const prev = products;
    setProducts(curr => curr.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x));
    const { error } = await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    if (error) { setProducts(prev); }
  };

  const toggleFeatured = async (p: Product) => {
    const prev = products;
    setProducts(curr => curr.map(x => x.id === p.id ? { ...x, is_featured: !x.is_featured } : x));
    const { error } = await supabase.from('products').update({ is_featured: !p.is_featured }).eq('id', p.id);
    if (error) { setProducts(prev); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Products" subtitle={`${products.length} products`} action={
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory text-sm font-medium transition-colors">
          <Plus size={16} /> Add Product
        </button>
      } />
      {loading ? <div className="text-walnut-400">Loading…</div> : products.length === 0 ? (
        <EmptyState icon={Package} text="No products yet." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className={cardCls + ' p-4 flex gap-3'}>
              <div className="relative flex-shrink-0">
                <img src={p.image_url ?? ''} alt="" className="w-16 h-16 rounded-card object-cover bg-walnut-800" />
                {p.images && p.images.length > 1 && (
                  <span className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-champagne-900 text-champagne-300 font-medium">{p.images.length}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-cream truncate">{p.name}</p>
                <p className="text-xs text-walnut-500">{p.category?.name ?? 'Uncategorized'}</p>
                <p className="text-sm font-semibold text-champagne-600 mt-1">{formatPrice(getEffectivePrice(p))}</p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-card ${p.stock_quantity <= 5 ? 'bg-rose-900/30 text-rose-400' : 'bg-walnut-800 text-walnut-400'}`}>{p.stock_quantity} in stock</span>
                  {p.badge && <span className="text-xs px-2 py-0.5 rounded-card bg-champagne-900/30 text-champagne-400 capitalize">{p.badge.replace('_', ' ')}</span>}
                  {p.is_featured && <span className="text-xs px-2 py-0.5 rounded-card bg-amber-900/30 text-amber-400">Featured</span>}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <button onClick={() => toggleActive(p)} title={p.is_active ? 'Disable' : 'Enable'} className={`p-1.5 rounded-lg ${p.is_active ? 'text-emerald-400 hover:bg-emerald-900/20' : 'text-walnut-600 hover:bg-walnut-800'}`}>{p.is_active ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                  <button onClick={() => toggleFeatured(p)} title={p.is_featured ? 'Unfeature' : 'Feature'} className={`p-1.5 rounded-lg ${p.is_featured ? 'text-amber-400 hover:bg-amber-900/20' : 'text-walnut-600 hover:bg-walnut-800'}`}><Star size={14} /></button>
                  <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-walnut-800 text-walnut-500"><Pencil size={14} /></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-rose-900/20 text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && <ProductForm product={editing} categories={categories} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function ProductForm({ product, categories, onClose, onSaved }: { product: Product | null; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: product?.name ?? '', slug: product?.slug ?? '', category_id: product?.category_id ?? '',
    base_price: product?.base_price ?? 0, sale_price: product?.sale_price ?? '',
    stock_quantity: product?.stock_quantity ?? 0, sku: product?.sku ?? '',
    short_description: product?.short_description ?? '', description: product?.description ?? '',
    badge: product?.badge ?? '', is_active: product?.is_active ?? true, is_featured: product?.is_featured ?? false,
  });
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [featuredImage, setFeaturedImage] = useState<string>(product?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    const uploaded: ProductImage[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('products').upload(fileName, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
        uploaded.push({
          id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          product_id: product?.id ?? '',
          image_url: urlData.publicUrl,
          alt_text: null,
          sort_order: images.length + uploaded.length,
          _isNew: true,
        } as ProductImage & { _isNew: boolean });
      }
    }
    setImages(prev => [...prev, ...uploaded]);
    if (!featuredImage && uploaded.length > 0) setFeaturedImage(uploaded[0].image_url);
    setUploading(false);
  };

  const removeImage = (img: ProductImage) => {
    setImages(prev => prev.filter(i => i.image_url !== img.image_url));
    if (featuredImage === img.image_url) {
      const remaining = images.filter(i => i.image_url !== img.image_url);
      setFeaturedImage(remaining.length > 0 ? remaining[0].image_url : '');
    }
    if (!(img as ProductImage & { _isNew?: boolean })._isNew) {
      const path = img.image_url.split('/products/').pop() ?? img.image_url.split('/').pop() ?? '';
      if (path) supabase.storage.from('products').remove([path]);
      if (product) supabase.from('product_images').delete().eq('id', img.id);
    }
  };

  const submit = async () => {
    if (!form.name) return;
    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const payload = {
      name: form.name, slug, category_id: form.category_id || null,
      base_price: Number(form.base_price), sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock_quantity: Number(form.stock_quantity), sku: form.sku || null,
      image_url: featuredImage || null,
      short_description: form.short_description || null, description: form.description || null,
      badge: form.badge || null, is_active: form.is_active, is_featured: form.is_featured,
    };
    let productId = product?.id;
    if (product) {
      const { error: updErr } = await supabase.from('products').update(payload).eq('id', product.id);
      if (updErr) { setSaving(false); alert('Failed to save product.'); return; }
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select('id').single();
      if (error || !data) { setSaving(false); alert('Failed to create product.'); return; }
      productId = data.id;
    }
    if (productId) {
      const existingIds = (product?.images ?? []).map(i => i.id);
      const keptIds = images.filter(i => !(i as ProductImage & { _isNew?: boolean })._isNew).map(i => i.id);
      const deletedIds = existingIds.filter(id => !keptIds.includes(id));
      for (const id of deletedIds) await supabase.from('product_images').delete().eq('id', id);
      const newImages = images.filter(i => (i as ProductImage & { _isNew?: boolean })._isNew);
      for (let i = 0; i < newImages.length; i++) {
        await supabase.from('product_images').insert({
          product_id: productId, image_url: newImages[i].image_url,
          alt_text: form.name, sort_order: i,
        });
      }
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!(img as ProductImage & { _isNew?: boolean })._isNew) {
          await supabase.from('product_images').update({ sort_order: i }).eq('id', img.id);
        }
      }
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Modal title={product ? 'Edit Product' : 'New Product'} onClose={onClose} size="lg">
      <div className="space-y-5">
        {/* Images section */}
        <div>
          <label className="text-xs font-medium text-walnut-400 mb-2 block tracking-wide">Product Images</label>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative group aspect-square rounded-card overflow-hidden bg-walnut-800">
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(img)} className="absolute top-1 right-1 p-1 rounded-full bg-rose-900/80 text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                <button onClick={() => setFeaturedImage(img.image_url)} className={`absolute bottom-1 left-1 p-1 rounded-full transition-all ${featuredImage === img.image_url ? 'bg-champagne-500 text-ivory' : 'bg-walnut-950/80 text-walnut-400 opacity-0 group-hover:opacity-100'}`}>
                  <Star size={12} className={featuredImage === img.image_url ? 'fill-current' : ''} />
                </button>
                {featuredImage === img.image_url && <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-champagne-600 text-ivory py-0.5">Featured</span>}
              </div>
            ))}
            <label className="aspect-square rounded-card border-2 border-dashed border-champagne-900/40 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-champagne-600 hover:bg-champagne-900/10 transition-colors">
              <Upload size={20} className="text-walnut-500" />
              <span className="text-[10px] text-walnut-500">{uploading ? 'Uploading…' : 'Upload'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && uploadImages(e.target.files)} disabled={uploading} />
            </label>
          </div>
          <p className="text-xs text-walnut-500 mt-1.5 font-light">Click the star icon on any image to set it as the featured image. Upload multiple images at once.</p>
        </div>

        {/* Basic info */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><Field label="Name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field></div>
          <Field label="Slug"><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto" className={inputCls} /></Field>
          <Field label="Category"><select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className={inputCls}><option value="">Uncategorized</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        </div>

        {/* Pricing & stock */}
        <div className="grid sm:grid-cols-4 gap-3">
          <Field label="Base Price (₹)"><input type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: Number(e.target.value) })} className={inputCls} /></Field>
          <Field label="Sale Price (₹)"><input type="number" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value ? Number(e.target.value) : '' })} placeholder="—" className={inputCls} /></Field>
          <Field label="Stock"><input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: Number(e.target.value) })} className={inputCls} /></Field>
          <Field label="SKU"><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={inputCls} /></Field>
        </div>

        {/* Badge */}
        <Field label="Badge / Label"><select value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} className={inputCls}>{BADGE_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}</select></Field>

        {/* Descriptions */}
        <div className="space-y-3">
          <Field label="Short Description"><input value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} className={inputCls} /></Field>
          <Field label="Description"><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} /></Field>
        </div>

        {/* Toggles */}
        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-beige-300"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="accent-champagne-600" /> Active (visible on store)</label>
          <label className="flex items-center gap-2 text-sm text-beige-300"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="accent-champagne-600" /> Featured Product</label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={submit} disabled={saving || uploading || !form.name} className="flex-1 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 disabled:opacity-50 text-ivory text-sm font-medium transition-colors">{saving ? 'Saving…' : 'Save Product'}</button>
        <button onClick={onClose} className="px-5 py-2.5 rounded-card bg-walnut-800 text-beige-300 text-sm font-medium">Cancel</button>
      </div>
    </Modal>
  );
}

/* ---------- Categories ---------- */
function CategoriesSection() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState(''); const [slug, setSlug] = useState(''); const [desc, setDesc] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    if (data) setCats(data as Category[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setName(''); setSlug(''); setDesc(''); setShowForm(true); };
  const openEdit = (c: Category) => { setEditing(c); setName(c.name); setSlug(c.slug); setDesc(c.description ?? ''); setShowForm(true); };
  const save = async () => {
    const s = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!name) return;
    let result;
    if (editing) result = await supabase.from('categories').update({ name, slug: s, description: desc || null }).eq('id', editing.id);
    else result = await supabase.from('categories').insert({ name, slug: s, description: desc || null, is_active: true, sort_order: cats.length });
    if (result.error) { alert('Failed to save category: ' + result.error.message); return; }
    setShowForm(false); load();
  };

  const deleteCat = async (id: string) => {
    if (!confirm('Delete this category? Products in it will become uncategorized.')) return;
    const { error: e1 } = await supabase.from('products').update({ category_id: null }).eq('category_id', id);
    if (e1) { alert('Failed to update products.'); return; }
    const { error: e2 } = await supabase.from('categories').delete().eq('id', id);
    if (e2) { alert('Failed to delete category.'); return; }
    setCats(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Categories" subtitle={`${cats.length} categories`} action={
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory text-sm font-medium transition-colors"><Plus size={16} /> Add Category</button>
      } />
      {loading ? <div className="text-walnut-400">Loading…</div> : cats.length === 0 ? (
        <EmptyState icon={Tag} text="No categories yet." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cats.map(c => (
            <div key={c.id} className={cardCls + ' p-4'}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-cream">{c.name}</p>
                  <p className="text-xs text-walnut-500">/{c.slug}</p>
                  {c.description && <p className="text-xs text-walnut-500 mt-1 line-clamp-2">{c.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-walnut-800 text-walnut-500"><Pencil size={14} /></button>
                  <button onClick={() => deleteCat(c.id)} className="p-1.5 rounded-lg hover:bg-rose-900/20 text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>
              {!c.is_active && <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-card bg-walnut-800 text-walnut-500">Inactive</span>}
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <Modal title={editing ? 'Edit Category' : 'New Category'} onClose={() => setShowForm(false)}>
          <Field label="Name"><input value={name} onChange={e => setName(e.target.value)} className={inputCls} /></Field>
          <Field label="Slug"><input value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto" className={inputCls} /></Field>
          <Field label="Description"><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className={inputCls} /></Field>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={!name} className="flex-1 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 disabled:opacity-50 text-ivory text-sm font-medium">Save</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-card bg-walnut-800 text-beige-300 text-sm font-medium">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Inventory ---------- */
function InventorySection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('products').select('*, category:categories(*)').order('stock_quantity');
      if (data) setProducts(data as Product[]);
      setLoading(false);
    })();
  }, []);

  const stockTimers = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});
  const updateStock = (id: string, qty: number) => {
    if (isNaN(qty) || qty < 0) return;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantity: qty } : p));
    clearTimeout(stockTimers.current[id]);
    stockTimers.current[id] = setTimeout(async () => {
      const { error } = await supabase.from('products').update({ stock_quantity: qty }).eq('id', id);
      if (error) console.error('Stock update failed:', error);
    }, 600);
  };

  const lowCount = products.filter(p => p.stock_quantity <= 5).length;
  const outCount = products.filter(p => p.stock_quantity === 0).length;

  return (
    <div className="space-y-4">
      <SectionHeader title="Inventory" subtitle="Stock levels across all products" />
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Package} label="Total Products" value={String(products.length)} accent="bg-walnut-800 text-walnut-400" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={String(lowCount)} accent="bg-champagne-900/30 text-champagne-400" />
        <StatCard icon={AlertTriangle} label="Out of Stock" value={String(outCount)} accent="bg-rose-900/30 text-rose-400" />
      </div>
      {loading ? <div className="text-walnut-400">Loading…</div> : (
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.id} className={cardCls + ' p-3 flex items-center gap-3'}>
              <img src={p.image_url ?? ''} alt="" className="w-10 h-10 rounded-lg object-cover bg-walnut-800" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cream truncate">{p.name}</p>
                <p className="text-xs text-walnut-500">{p.sku ?? '—'}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-card ${p.stock_quantity === 0 ? 'bg-rose-900/30 text-rose-400' : p.stock_quantity <= 5 ? 'bg-champagne-900/30 text-champagne-400' : 'bg-emerald-900/30 text-emerald-400'}`}>{p.stock_quantity}</span>
              <input type="number" value={p.stock_quantity} onChange={e => updateStock(p.id, Number(e.target.value))} className="w-20 px-2 py-1.5 rounded-lg bg-walnut-800 text-sm text-cream outline-none focus:ring-1 focus:ring-champagne-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Customers ---------- */
function CustomersSection() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('customer_profiles').select('*').order('created_at', { ascending: false });
      if (data) setCustomers(data as CustomerProfile[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <SectionHeader title="Customers" subtitle={`${customers.length} registered customers`} />
      {loading ? <div className="text-walnut-400">Loading…</div> : customers.length === 0 ? (
        <EmptyState icon={Users} text="No customers yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wider text-walnut-400 border-b border-champagne-900/20"><th className="py-2 pr-4 font-medium">Name</th><th className="py-2 pr-4 font-medium">Email</th><th className="py-2 pr-4 font-medium">Phone</th><th className="py-2 pr-4 font-medium">Orders</th><th className="py-2 pr-4 font-medium">Spent</th><th className="py-2 font-medium">Joined</th></tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b border-champagne-900/10">
                  <td className="py-3 pr-4 font-medium text-cream">{c.full_name ?? '—'}</td>
                  <td className="py-3 pr-4 text-walnut-500 truncate max-w-[180px]">{c.email ?? '—'}</td>
                  <td className="py-3 pr-4 text-walnut-500">{c.phone ?? '—'}</td>
                  <td className="py-3 pr-4 text-walnut-400">{c.total_orders ?? 0}</td>
                  <td className="py-3 pr-4 font-medium text-cream">{formatPrice(c.total_spent ?? 0)}</td>
                  <td className="py-3 text-walnut-500">{c.created_at ? formatDate(c.created_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- Coupons ---------- */
function CouponsSection() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ code: '', description: '', discount_type: 'percentage' as 'percentage' | 'fixed', discount_value: 0, min_order_amount: 0, max_uses: '', valid_until: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data as Coupon[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ code: '', description: '', discount_type: 'percentage', discount_value: 0, min_order_amount: 0, max_uses: '', valid_until: '' });
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description ?? '', discount_type: c.discount_type,
      discount_value: c.discount_value, min_order_amount: c.min_order_amount,
      max_uses: c.max_uses ? String(c.max_uses) : '', valid_until: c.valid_until ? c.valid_until.slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.code) return;
    const payload = {
      code: form.code.toUpperCase(), description: form.description || null, discount_type: form.discount_type,
      discount_value: Number(form.discount_value), min_order_amount: Number(form.min_order_amount),
      max_uses: form.max_uses ? Number(form.max_uses) : null, valid_until: form.valid_until || null,
    };
    let result;
    if (editing) result = await supabase.from('coupons').update(payload).eq('id', editing.id);
    else result = await supabase.from('coupons').insert({ ...payload, is_active: true, used_count: 0 });
    if (result.error) { alert('Failed to save coupon: ' + result.error.message); return; }
    setShowForm(false);
    load();
  };

  const toggleActive = async (c: Coupon) => {
    const prev = coupons;
    setCoupons(curr => curr.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x));
    const { error } = await supabase.from('coupons').update({ is_active: !c.is_active }).eq('id', c.id);
    if (error) { setCoupons(prev); }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) { alert('Failed to delete coupon.'); return; }
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Coupons" subtitle={`${coupons.length} coupons`} action={
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory text-sm font-medium transition-colors"><Plus size={16} /> New Coupon</button>
      } />
      {loading ? <div className="text-walnut-400">Loading…</div> : coupons.length === 0 ? (
        <EmptyState icon={Ticket} text="No coupons yet." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(c => (
            <div key={c.id} className={cardCls + ' p-4'}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg text-champagne-600">{c.code}</p>
                  <p className="text-xs text-walnut-500">{c.discount_type === 'percentage' ? `${c.discount_value}% off` : `${formatPrice(c.discount_value)} off`}</p>
                </div>
                <button onClick={() => toggleActive(c)} className={`text-xs px-2.5 py-1 rounded-card ${c.is_active ? 'bg-emerald-900/30 text-emerald-400' : 'bg-walnut-800 text-walnut-500'}`}>{c.is_active ? 'Active' : 'Inactive'}</button>
              </div>
              {c.description && <p className="text-xs text-walnut-500 mt-2">{c.description}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-champagne-900/20 text-xs text-walnut-500">
                <span>Min: {formatPrice(c.min_order_amount)}</span>
                <span>Used: {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-walnut-800 text-walnut-500"><Pencil size={14} /></button>
                <button onClick={() => deleteCoupon(c.id)} className="p-1.5 rounded-lg hover:bg-rose-900/20 text-rose-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <Modal title={editing ? 'Edit Coupon' : 'New Coupon'} onClose={() => setShowForm(false)}>
          <Field label="Code"><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className={inputCls} placeholder="SUMMER20" /></Field>
          <Field label="Description"><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type"><select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })} className={inputCls}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select></Field>
            <Field label="Value"><input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: Number(e.target.value) })} className={inputCls} /></Field>
            <Field label="Min Order (₹)"><input type="number" value={form.min_order_amount} onChange={e => setForm({ ...form, min_order_amount: Number(e.target.value) })} className={inputCls} /></Field>
            <Field label="Max Uses"><input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} placeholder="∞" className={inputCls} /></Field>
          </div>
          <Field label="Valid Until"><input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} className={inputCls} /></Field>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={!form.code} className="flex-1 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 disabled:opacity-50 text-ivory text-sm font-medium">{editing ? 'Update' : 'Create'}</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-card bg-walnut-800 text-beige-300 text-sm font-medium">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Reviews ---------- */
function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (data) setReviews(data as Review[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggleApprove = async (r: Review) => {
    setReviews(prev => prev.map(x => x.id === r.id ? { ...x, is_approved: !x.is_approved } : x));
    await supabase.from('reviews').update({ is_approved: !r.is_approved }).eq('id', r.id);
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Reviews" subtitle={`${reviews.length} reviews`} />
      {loading ? <div className="text-walnut-400">Loading…</div> : reviews.length === 0 ? <EmptyState icon={Star} text="No reviews yet." /> : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className={cardCls + ' p-4'}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><p className="font-medium text-sm text-cream">{r.reviewer_name}</p><span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-champagne-400 text-champagne-400' : 'text-walnut-700'} />)}</span></div>
                  {r.title && <p className="text-sm font-medium text-beige-300 mt-1">{r.title}</p>}
                  <p className="text-sm text-walnut-500 mt-1">{r.body}</p>
                  <p className="text-xs text-walnut-400 mt-1">{formatDate(r.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleApprove(r)} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-card font-medium whitespace-nowrap ${r.is_approved ? 'bg-emerald-900/30 text-emerald-400' : 'bg-walnut-800 text-walnut-500'}`}><Check size={14} /> {r.is_approved ? 'Approved' : 'Pending'}</button>
                  <button onClick={() => deleteReview(r.id)} className="p-1.5 rounded-lg hover:bg-rose-900/20 text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Messages ---------- */
function MessagesSection() {
  const [tab, setTab] = useState<'contact' | 'newsletter'>('contact');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [subs, setSubs] = useState<NewsletterSub[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (data) setMessages(data as ContactMessage[]);
    setLoading(false);
  }, []);

  const loadSubs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    if (data) setSubs(data as NewsletterSub[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'contact') loadMessages();
    else loadSubs();
  }, [tab, loadMessages, loadSubs]);

  const markRead = async (m: ContactMessage) => {
    const prev = messages;
    setMessages(curr => curr.map(x => x.id === m.id ? { ...x, is_read: true } : x));
    const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', m.id);
    if (error) { setMessages(prev); }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) { alert('Failed to delete message.'); return; }
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const deleteSub = async (id: string) => {
    if (!confirm('Delete this subscriber?')) return;
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (error) { alert('Failed to delete subscriber.'); return; }
    setSubs(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Messages" subtitle="Contact form submissions and newsletter subscribers" />
      <div className="flex gap-2">
        <button onClick={() => setTab('contact')} className={`px-4 py-2 rounded-card text-sm font-medium transition-colors ${tab === 'contact' ? 'bg-champagne-600 text-ivory' : 'bg-walnut-800 text-beige-300 hover:bg-walnut-700'}`}>Contact ({messages.length})</button>
        <button onClick={() => setTab('newsletter')} className={`px-4 py-2 rounded-card text-sm font-medium transition-colors ${tab === 'newsletter' ? 'bg-champagne-600 text-ivory' : 'bg-walnut-800 text-beige-300 hover:bg-walnut-700'}`}>Newsletter ({subs.length})</button>
      </div>
      {loading ? <div className="text-walnut-400">Loading…</div> : tab === 'contact' ? (
        messages.length === 0 ? <EmptyState icon={Mail} text="No contact messages yet." /> : (
          <div className="space-y-3">
            {messages.map(m => (
              <div key={m.id} className={cardCls + ' p-4'}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-cream">{m.name}</p>
                      {!m.is_read && <span className="text-xs px-2 py-0.5 rounded-card bg-champagne-900/30 text-champagne-400">New</span>}
                    </div>
                    <p className="text-xs text-walnut-500 mt-0.5">{m.email} {m.phone && `· ${m.phone}`}</p>
                    {m.subject && <p className="text-sm font-medium text-beige-300 mt-2">{m.subject}</p>}
                    <p className="text-sm text-walnut-500 mt-1">{m.message}</p>
                    <p className="text-xs text-walnut-400 mt-1">{formatDate(m.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`mailto:${m.email}`} className="text-xs text-champagne-600 hover:underline flex items-center gap-1">Reply <ArrowUpRight size={12} /></a>
                    {!m.is_read && <button onClick={() => markRead(m)} className="p-1.5 rounded-lg hover:bg-walnut-800 text-walnut-500"><Check size={14} /></button>}
                    <button onClick={() => deleteMessage(m.id)} className="p-1.5 rounded-lg hover:bg-rose-900/20 text-rose-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        subs.length === 0 ? <EmptyState icon={MessageSquare} text="No subscribers yet." /> : (
          <div className="space-y-2">
            {subs.map(s => (
              <div key={s.id} className={cardCls + ' p-3 flex items-center justify-between'}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-card bg-champagne-900/30 flex items-center justify-center text-champagne-400 font-bold text-sm">{s.email.charAt(0).toUpperCase()}</div>
                  <div><p className="text-sm font-medium text-cream">{s.email}</p><p className="text-xs text-walnut-500">{s.created_at ? formatDate(s.created_at) : ''}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`mailto:${s.email}`} className="text-xs text-champagne-600 hover:underline flex items-center gap-1">Contact <ArrowUpRight size={12} /></a>
                  <button onClick={() => deleteSub(s.id)} className="p-1.5 rounded-lg hover:bg-rose-900/20 text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* ---------- Homepage Management ---------- */
function HomepageSection() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('homepage_content').select('*').limit(1).maybeSingle();
      if (data) setContent(data as HomepageContent);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!content) return;
    setSaving(true);
    const payload = {
      hero_title: content.hero_title, hero_subtitle: content.hero_subtitle,
      hero_image_url: content.hero_image_url, hero_badge: content.hero_badge,
      about_title: content.about_title, about_text: content.about_text,
      process_title: content.process_title, occasions_title: content.occasions_title,
      why_title: content.why_title,
    };
    let result;
    if (content.id) {
      result = await supabase.from('homepage_content').update(payload).eq('id', content.id);
    } else {
      result = await supabase.from('homepage_content').insert(payload).select('*').single();
      if (result.data) setContent(result.data as HomepageContent);
    }
    setSaving(false);
    if (result.error) { alert('Failed to save: ' + result.error.message); return; }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="text-walnut-400">Loading…</div>;
  if (!content) return (
    <div className="space-y-4 max-w-2xl">
      <SectionHeader title="Homepage Management" subtitle="Edit the content shown on your homepage" action={
        <button onClick={() => setContent({ id: '', hero_title: '', hero_subtitle: '', hero_image_url: '', hero_badge: '', about_title: '', about_text: '', process_title: '', occasions_title: '', why_title: '', updated_at: '' })} className="flex items-center gap-2 px-4 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory text-sm font-medium transition-colors"><Plus size={16} /> Create Content</button>
      } />
      <EmptyState icon={ImageIcon} text="No homepage content found. Click Create Content to begin." />
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl">
      <SectionHeader title="Homepage Management" subtitle="Edit the content shown on your homepage" />
      <div className={cardCls + ' p-6 space-y-4'}>
        <div className="border-b border-champagne-900/20 pb-4">
          <p className="text-xs uppercase tracking-wider text-champagne-500 font-medium mb-3">Hero Section</p>
          <div className="space-y-3">
            <Field label="Hero Badge"><input value={content.hero_badge ?? ''} onChange={e => setContent({ ...content, hero_badge: e.target.value })} className={inputCls} placeholder="Luxury Gifting" /></Field>
            <Field label="Hero Title"><input value={content.hero_title ?? ''} onChange={e => setContent({ ...content, hero_title: e.target.value })} className={inputCls} /></Field>
            <Field label="Hero Subtitle"><input value={content.hero_subtitle ?? ''} onChange={e => setContent({ ...content, hero_subtitle: e.target.value })} className={inputCls} /></Field>
            <Field label="Hero Image URL"><input value={content.hero_image_url ?? ''} onChange={e => setContent({ ...content, hero_image_url: e.target.value })} className={inputCls} /></Field>
          </div>
        </div>
        <div className="border-b border-champagne-900/20 pb-4">
          <p className="text-xs uppercase tracking-wider text-champagne-500 font-medium mb-3">About Section</p>
          <div className="space-y-3">
            <Field label="About Title"><input value={content.about_title ?? ''} onChange={e => setContent({ ...content, about_title: e.target.value })} className={inputCls} /></Field>
            <Field label="About Text"><textarea value={content.about_text ?? ''} onChange={e => setContent({ ...content, about_text: e.target.value })} rows={3} className={inputCls} /></Field>
          </div>
        </div>
        <div className="space-y-3">
          <Field label="Process Title"><input value={content.process_title ?? ''} onChange={e => setContent({ ...content, process_title: e.target.value })} className={inputCls} /></Field>
          <Field label="Occasions Title"><input value={content.occasions_title ?? ''} onChange={e => setContent({ ...content, occasions_title: e.target.value })} className={inputCls} /></Field>
          <Field label="Why Choose Us Title"><input value={content.why_title ?? ''} onChange={e => setContent({ ...content, why_title: e.target.value })} className={inputCls} /></Field>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 disabled:opacity-50 text-ivory text-sm font-medium transition-colors">{saving ? 'Saving…' : 'Save Changes'}</button>
          {saved && <span className="text-sm text-emerald-400 flex items-center gap-1"><Check size={16} /> Saved</span>}
        </div>
      </div>
    </div>
  );
}

/* ---------- Analytics ---------- */
function AnalyticsSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [o, p, c] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)'),
        supabase.from('products').select('*'),
        supabase.from('customer_profiles').select('*'),
      ]);
      if (o.data) setOrders(o.data as Order[]);
      if (p.data) setProducts(p.data as Product[]);
      if (c.data) setCustomers(c.data as CustomerProfile[]);
      setLoading(false);
    })();
  }, []);

  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders]);
  const paidRevenue = useMemo(() => orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0), [orders]);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const pendingOrders = orders.filter(o => o.order_status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.order_status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.order_status === 'cancelled').length;

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    orders.forEach(o => {
      o.order_items?.forEach(it => {
        const existing = map.get(it.product_name) ?? { name: it.product_name, qty: 0, revenue: 0 };
        existing.qty += it.quantity;
        existing.revenue += it.total_price;
        map.set(it.product_name, existing);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  const salesByStatus = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach(o => {
      map.set(o.order_status, (map.get(o.order_status) ?? 0) + o.total);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const maxStatusRevenue = Math.max(1, ...salesByStatus.map(s => s[1]));

  if (loading) return <div className="text-walnut-400 font-light">Loading analytics…</div>;

  return (
    <div className="space-y-6">
      <SectionHeader title="Analytics" subtitle="Business performance overview" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Gross Revenue" value={formatPrice(totalRevenue)} accent="bg-champagne-900/30 text-champagne-400" />
        <StatCard icon={TrendingUp} label="Paid Revenue" value={formatPrice(paidRevenue)} accent="bg-emerald-900/30 text-emerald-400" />
        <StatCard icon={ShoppingBag} label="Avg Order Value" value={formatPrice(avgOrderValue)} accent="bg-champagne-900/30 text-champagne-400" />
        <StatCard icon={Users} label="Customers" value={String(customers.length)} accent="bg-champagne-900/30 text-champagne-400" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={cardCls + ' p-6 space-y-4'}>
          <h3 className="font-display font-medium text-cream">Top Products by Revenue</h3>
          {topProducts.length === 0 ? <EmptyState icon={Package} text="No sales data yet." /> : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-card bg-champagne-900/30 text-champagne-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="text-sm text-beige-300 truncate">{p.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-cream">{formatPrice(p.revenue)}</p>
                    <p className="text-xs text-walnut-500">{p.qty} sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={cardCls + ' p-6 space-y-4'}>
          <h3 className="font-display font-medium text-cream">Revenue by Order Status</h3>
          {salesByStatus.length === 0 ? <EmptyState icon={BarChart3} text="No order data yet." /> : (
            <div className="space-y-3">
              {salesByStatus.map(([status, revenue]) => (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-beige-300 capitalize">{status}</span>
                    <span className="text-cream font-medium">{formatPrice(revenue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-walnut-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-champagne-600 to-champagne-400" style={{ width: `${(revenue / maxStatusRevenue) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="Pending Orders" value={String(pendingOrders)} accent="bg-walnut-800 text-walnut-400" />
        <StatCard icon={Check} label="Delivered Orders" value={String(deliveredOrders)} accent="bg-emerald-900/30 text-emerald-400" />
        <StatCard icon={X} label="Cancelled Orders" value={String(cancelledOrders)} accent="bg-rose-900/30 text-rose-400" />
        <StatCard icon={Package} label="Total Products" value={String(products.length)} accent="bg-champagne-900/30 text-champagne-400" />
      </div>
    </div>
  );
}

/* ---------- Settings ---------- */
function SettingsSection() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (data) setSettings(data as SiteSettings);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const payload = {
      brand_name: settings.brand_name, whatsapp_number: settings.whatsapp_number,
      announcement_banner: settings.announcement_banner, announcement_active: settings.announcement_active,
      free_shipping_threshold: Number(settings.free_shipping_threshold), default_payment_method: settings.default_payment_method,
    };
    let result;
    if (settings.id) {
      result = await supabase.from('site_settings').update(payload).eq('id', settings.id);
    } else {
      result = await supabase.from('site_settings').insert(payload).select('*').single();
      if (result.data) setSettings(result.data as SiteSettings);
    }
    setSaving(false);
    if (result.error) { alert('Failed to save: ' + result.error.message); return; }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="text-walnut-400">Loading…</div>;
  if (!settings) return (
    <div className="space-y-4 max-w-2xl">
      <SectionHeader title="Settings" subtitle="Site-wide configuration" action={
        <button onClick={() => setSettings({ id: '', brand_name: 'GALINEX', whatsapp_number: '', announcement_banner: '', announcement_active: false, free_shipping_threshold: 999, default_payment_method: 'whatsapp' })} className="flex items-center gap-2 px-4 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory text-sm font-medium transition-colors"><Plus size={16} /> Create Settings</button>
      } />
      <EmptyState icon={Settings} text="No site settings found. Click Create Settings to begin." />
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl">
      <SectionHeader title="Settings" subtitle="Site-wide configuration" />
      <div className={cardCls + ' p-6 space-y-4'}>
        <Field label="Brand Name"><input value={settings.brand_name} onChange={e => setSettings({ ...settings, brand_name: e.target.value })} className={inputCls} /></Field>
        <Field label="WhatsApp Number"><input value={settings.whatsapp_number} onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })} className={inputCls} placeholder="919360482480" /></Field>
        <Field label="Announcement Banner"><input value={settings.announcement_banner} onChange={e => setSettings({ ...settings, announcement_banner: e.target.value })} className={inputCls} placeholder="Free shipping on orders over ₹999" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Free Shipping Threshold (₹)"><input type="number" value={settings.free_shipping_threshold} onChange={e => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })} className={inputCls} /></Field>
          <Field label="Default Payment Method"><input value={settings.default_payment_method} onChange={e => setSettings({ ...settings, default_payment_method: e.target.value })} className={inputCls} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-beige-300">
          <input type="checkbox" checked={settings.announcement_active} onChange={e => setSettings({ ...settings, announcement_active: e.target.checked })} className="accent-champagne-600" /> Show announcement banner
        </label>
        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 disabled:opacity-50 text-ivory text-sm font-medium transition-colors">{saving ? 'Saving…' : 'Save Settings'}</button>
          {saved && <span className="text-sm text-emerald-400 flex items-center gap-1"><Check size={16} /> Saved</span>}
        </div>
      </div>
    </div>
  );
}
