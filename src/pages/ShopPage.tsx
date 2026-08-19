import { useEffect, useState, useMemo } from 'react';
import { SlidersHorizontal, X, ChevronDown, BookOpen } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { supabase } from '@/lib/supabase';
import type { Product, Category, SortOption } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function ShopPage() {
  const { pageProps, setCatalogueOpen } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>((pageProps.category as string) ?? null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>('popularity');
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    setSelectedCategory((pageProps.category as string) ?? null);
    const occ = pageProps.occasion as string | undefined;
    if (occ) setSelectedOccasions([occ]);
  }, [pageProps.category, pageProps.occasion]);

  useEffect(() => {
    (async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*, category:categories(*)').eq('is_active', true),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      ]);
      if (prodRes.error || catRes.error) setFetchError(true);
      if (prodRes.data) setProducts(prodRes.data as Product[]);
      if (catRes.data) setCategories(catRes.data as Category[]);
      setLoading(false);
    })();
  }, []);

  const occasions = ['birthday', 'anniversary', 'wedding', 'valentine', 'housewarming', 'diwali'];
  const materials = ['Optical Crystal', 'Premium MDF Wood', 'Acrylic + LED', 'PVC + LED', 'MDF', 'Crystal'];

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedCategory) result = result.filter(p => p.category?.slug === selectedCategory);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    result = result.filter(p => {
      const price = p.sale_price ?? p.base_price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    if (selectedOccasions.length > 0) result = result.filter(p => p.occasions?.some(o => selectedOccasions.includes(o)));
    if (selectedMaterials.length > 0) result = result.filter(p => p.material && selectedMaterials.includes(p.material));
    switch (sort) {
      case 'price_low': result.sort((a, b) => (a.sale_price ?? a.base_price) - (b.sale_price ?? b.base_price)); break;
      case 'price_high': result.sort((a, b) => (b.sale_price ?? b.base_price) - (a.sale_price ?? a.base_price)); break;
      case 'newest': result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case 'best_selling': result.sort((a, b) => b.sold_count - a.sold_count); break;
      default: result.sort((a, b) => b.sold_count - a.sold_count);
    }
    return result;
  }, [products, selectedCategory, searchTerm, priceRange, selectedOccasions, selectedMaterials, sort]);

  const toggleArray = (arr: string[], val: string) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h4 className="font-display text-lg text-walnut-900 dark:text-cream mb-4">Category</h4>
        <div className="space-y-1">
          <button onClick={() => setSelectedCategory(null)} className={`block w-full text-left px-3 py-2 text-sm transition-colors duration-300 ${!selectedCategory ? 'text-champagne-600 font-medium' : 'text-walnut-600 dark:text-cream/70 hover:text-champagne-600'}`}>
            All Collections
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.slug)} className={`block w-full text-left px-3 py-2 text-sm transition-colors duration-300 ${selectedCategory === cat.slug ? 'text-champagne-600 font-medium' : 'text-walnut-600 dark:text-cream/70 hover:text-champagne-600'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div className="gold-divider" />
      <div>
        <h4 className="font-display text-lg text-walnut-900 dark:text-cream mb-4">Price Range</h4>
        <div className="flex items-center gap-3">
          <input type="number" value={priceRange[0]} onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])} className="w-full px-3 py-2.5 bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-cream border border-champagne-200/40 dark:border-champagne-900/30 outline-none focus:border-champagne-400 rounded-card" placeholder="Min" />
          <span className="text-walnut-300">—</span>
          <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full px-3 py-2.5 bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-cream border border-champagne-200/40 dark:border-champagne-900/30 outline-none focus:border-champagne-400 rounded-card" placeholder="Max" />
        </div>
      </div>
      <div className="gold-divider" />
      <div>
        <h4 className="font-display text-lg text-walnut-900 dark:text-cream mb-4">Occasion</h4>
        <div className="flex flex-wrap gap-2">
          {occasions.map(occ => (
            <button key={occ} onClick={() => setSelectedOccasions(toggleArray(selectedOccasions, occ))} className={`px-3.5 py-1.5 text-xs font-light capitalize transition-all duration-300 rounded-card border ${selectedOccasions.includes(occ) ? 'bg-walnut-900 text-ivory border-walnut-900' : 'border-champagne-200/40 dark:border-champagne-900/30 text-walnut-600 dark:text-cream/70 hover:border-champagne-400'}`}>
              {occ}
            </button>
          ))}
        </div>
      </div>
      <div className="gold-divider" />
      <div>
        <h4 className="font-display text-lg text-walnut-900 dark:text-cream mb-4">Material</h4>
        <div className="flex flex-wrap gap-2">
          {materials.map(mat => (
            <button key={mat} onClick={() => setSelectedMaterials(toggleArray(selectedMaterials, mat))} className={`px-3.5 py-1.5 text-xs font-light transition-all duration-300 rounded-card border ${selectedMaterials.includes(mat) ? 'bg-walnut-900 text-ivory border-walnut-900' : 'border-champagne-200/40 dark:border-champagne-900/30 text-walnut-600 dark:text-cream/70 hover:border-champagne-400'}`}>
              {mat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory dark:bg-walnut-950 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-champagne-600 text-xs font-medium uppercase tracking-wider2 mb-3">Collections</p>
        <h1 className="font-display text-4xl sm:text-5xl text-walnut-900 dark:text-cream font-light mb-3">
          {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name : 'All Collections'}
        </h1>
        <p className="text-sm text-walnut-500 font-light mb-5">{filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'} available</p>
        
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setCatalogueOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-btn bg-champagne-100 hover:bg-champagne-200 dark:bg-champagne-900/40 dark:hover:bg-champagne-900/60 text-champagne-800 dark:text-champagne-200 text-xs font-medium border border-champagne-300/60 dark:border-champagne-800/40 transition-all duration-300 hover:scale-105"
          >
            <BookOpen size={14} />
            <span>Download PDF Catalogue</span>
          </button>
        </div>

        <div className="gold-divider w-24 mx-auto mt-6" />
      </div>

      {/* Search + Sort Bar */}
      <div className="flex items-center gap-3 mb-8">
        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search products..." className="flex-1 px-5 py-3 bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-cream border border-champagne-200/40 dark:border-champagne-900/30 outline-none focus:border-champagne-400 rounded-card font-light" />
        <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 px-5 py-3 bg-walnut-900 dark:bg-cream text-ivory dark:text-walnut-900 text-sm font-medium rounded-card">
          <SlidersHorizontal size={16} /> Filters
        </button>
        <div className="relative">
          <select value={sort} onChange={e => setSort(e.target.value as SortOption)} className="appearance-none pl-5 pr-12 py-3 bg-cream/50 dark:bg-walnut-800/50 text-sm text-walnut-900 dark:text-cream border border-champagne-200/40 dark:border-champagne-900/30 outline-none focus:border-champagne-400 cursor-pointer rounded-card font-light">
            <option value="popularity">Popularity</option>
            <option value="newest">Newest</option>
            <option value="best_selling">Best Selling</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-walnut-400" />
        </div>
      </div>

      <div className="flex gap-10">
        {/* Desktop Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28">
            <FilterContent />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {fetchError ? (
            <div className="text-center py-20">
              <p className="text-walnut-400 font-display text-2xl mb-4">Unable to load products. Please try again.</p>
              <button onClick={() => window.location.reload()} className="px-8 py-3 bg-walnut-900 dark:bg-cream text-ivory dark:text-walnut-900 text-sm font-medium rounded-card">Retry</button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square rounded-card bg-cream dark:bg-walnut-800 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-walnut-400 font-display text-2xl mb-4">No pieces found matching your selection.</p>
              <button onClick={() => { setSelectedCategory(null); setSelectedOccasions([]); setSelectedMaterials([]); setPriceRange([0, 100000]); setSearchTerm(''); }} className="px-8 py-3 bg-walnut-900 dark:bg-cream text-ivory dark:text-walnut-900 text-sm font-medium rounded-card hover:bg-champagne-600 dark:hover:bg-champagne-500 transition-colors">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {filtered.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-walnut-950/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative w-80 max-w-[85vw] bg-ivory dark:bg-walnut-900 h-full overflow-y-auto p-6 animate-slide-in-right">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-2xl text-walnut-900 dark:text-cream">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 text-walnut-500"><X size={20} /></button>
            </div>
            <FilterContent />
            <button onClick={() => setShowFilters(false)} className="mt-8 w-full py-3.5 bg-walnut-900 dark:bg-cream text-ivory dark:text-walnut-900 font-medium rounded-card">Show {filtered.length} Results</button>
          </div>
        </div>
      )}
    </div>
  );
}
