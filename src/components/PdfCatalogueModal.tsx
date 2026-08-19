import { useState, useEffect, useRef, useMemo } from 'react';
import {
  X, Printer, Download, Sparkles, MessageCircle, Phone, Mail,
  Search, BookOpen, ExternalLink,
} from 'lucide-react';
import { supabase, BRAND_NAME, BRAND_PHONE, BRAND_EMAIL, WHATSAPP_NUMBER } from '@/lib/supabase';
import { formatPrice, getEffectivePrice, getProductImageUrl } from '@/lib/format';
import { buildDirectWhatsAppUrl } from '@/lib/whatsapp';
import { useStore } from '@/store/StoreContext';
import type { Product, Category } from '@/types';

interface PdfCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PdfCatalogueModal({ isOpen, onClose }: PdfCatalogueModalProps) {
  const { navigate } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const catalogueContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    (async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          supabase.from('products').select('*, category:categories(*)').eq('is_active', true),
          supabase.from('categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
        ]);

        if (isMounted) {
          const catList = (catRes.data as Category[]) || [];
          const catOrderMap = new Map(catList.map((c, i) => [c.id, c.sort_order ?? i]));

          // Sort products by category sort order, then by product name
          const prodList = ((prodRes.data as Product[]) || []).sort((a, b) => {
            const catOrderA = a.category_id ? (catOrderMap.get(a.category_id) ?? 99) : 99;
            const catOrderB = b.category_id ? (catOrderMap.get(b.category_id) ?? 99) : 99;
            if (catOrderA !== catOrderB) return catOrderA - catOrderB;
            return (a.name || '').localeCompare(b.name || '');
          });

          setProducts(prodList);
          setCategories(catList);
        }
      } catch (err) {
        console.error('Failed to load catalogue data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Category counts calculated directly from active products
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const slug = p.category?.slug;
      if (slug) {
        map.set(slug, (map.get(slug) ?? 0) + 1);
      }
    });
    return map;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category?.slug === selectedCategory;
      const matchSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.dimensions && p.dimensions.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, search]);

  if (!isOpen) return null;

  const handleProductClick = (slug: string) => {
    onClose();
    navigate('product', { slug });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-walnut-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-ivory dark:bg-walnut-950 w-full max-w-5xl rounded-2xl shadow-2xl border border-gold-400/20 flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:w-full overflow-hidden">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-gold-500/20 bg-walnut-900/40 flex items-center justify-between print:hidden flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gold-600/20 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
              <BookOpen size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-medium text-base sm:text-lg text-cream truncate">
                {BRAND_NAME} Official Product Catalogue
              </h2>
              <p className="text-[11px] text-walnut-400 font-light truncate">
                51 Handcrafted Keepsakes · Optical Crystal, Natural Wood & Acrylic
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/galinex-catalogue.pdf"
              download="GALINEX_Official_Catalogue_2026.pdf"
              className="px-3 sm:px-4 py-2 bg-walnut-800 hover:bg-walnut-700 text-cream text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors border border-gold-500/30 cursor-pointer"
              title="Download Original Catalogue PDF"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download PDF</span>
            </a>
            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-2 bg-gold-600 hover:bg-gold-500 text-ivory text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Print or Save Catalogue"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-walnut-400 hover:text-cream transition-colors rounded-lg hover:bg-walnut-800/60 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar (Hidden in Print) */}
        <div className="p-3 sm:px-6 bg-[#16100c] border-b border-gold-500/15 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 print:hidden flex-shrink-0">
          <div className="relative flex-1 max-w-full sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-walnut-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 51 products, materials, sizes…"
              className="w-full pl-8 pr-3 py-1.5 bg-[#0d0b0a] text-xs rounded-lg border border-gold-500/20 text-cream placeholder:text-walnut-500 outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-gold-600 text-ivory font-semibold'
                  : 'bg-walnut-800/60 text-walnut-300 hover:text-cream hover:bg-walnut-800 border border-gold-500/20'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((cat) => {
              const count = categoryCounts.get(cat.slug) ?? 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-gold-600 text-ivory font-semibold'
                      : 'bg-walnut-800/60 text-walnut-300 hover:text-cream hover:bg-walnut-800 border border-gold-500/20'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Printable Catalogue Content */}
        <div
          ref={catalogueContentRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 print:overflow-visible print:p-0 print:space-y-6"
        >
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-display text-lg text-cream mb-1">{BRAND_NAME} Official Product Catalogue</p>
              <p className="text-xs text-walnut-400 font-light">Loading luxury collection...</p>
            </div>
          ) : (
            <>
              {/* Catalogue Cover / Header Section */}
              <div className="text-center border-b border-gold-500/20 pb-6 print:pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[10px] uppercase tracking-widest rounded-full mb-2">
                  <Sparkles size={11} />
                  Official Catalogue 2026
                </div>
                <h1 className="font-display text-3xl sm:text-4xl text-cream font-medium tracking-wide mb-1.5 print:text-black">
                  {BRAND_NAME}
                </h1>
                <p className="text-xs sm:text-sm text-gold-400/90 font-light uppercase tracking-widest mb-3 print:text-gray-700">
                  Memories, Crafted Forever — Crystal, Wood & Acrylic Keepsakes
                </p>
                <div className="flex flex-wrap justify-center items-center gap-3 text-[11px] text-walnut-400 font-light print:text-gray-600">
                  <span className="flex items-center gap-1">
                    <Phone size={11} className="text-gold-500" /> {BRAND_PHONE}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={11} className="text-gold-500" /> WhatsApp: +{WHATSAPP_NUMBER}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail size={11} className="text-gold-500" /> {BRAND_EMAIL}
                  </span>
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 print:grid-cols-2 print:gap-4">
                  {filteredProducts.map((p) => {
                    const effectivePrice = getEffectivePrice(p);
                    const isPriced = effectivePrice > 0;
                    const isMdf = p.slug.includes('mdf') || !isPriced;

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleProductClick(p.slug)}
                        className={`group bg-[#130e0b] p-3.5 rounded-xl border border-gold-500/20 hover:border-gold-500/50 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 print:border-gray-300 print:bg-white print:break-inside-avoid ${
                          isMdf ? 'sm:col-span-2' : ''
                        }`}
                      >
                        <div>
                          {/* Image Stage */}
                          <div className={`rounded-lg overflow-hidden bg-[#0d0b0a] mb-3 relative border border-gold-500/10 ${
                            isMdf ? 'aspect-[16/9]' : 'aspect-[4/5]'
                          }`}>
                            <img
                              src={getProductImageUrl(p)}
                              alt={p.name}
                              loading="lazy"
                              className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                            {p.badge && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 bg-walnut-950/90 text-gold-300 text-[8px] uppercase font-semibold tracking-wider rounded border border-gold-500/30">
                                {p.badge.replace('_', ' ')}
                              </span>
                            )}
                          </div>

                          {/* Category & Title */}
                          <p className="text-[10px] uppercase tracking-wider text-gold-500 font-medium mb-0.5">
                            {p.category?.name ?? 'Personalized Keepsake'}
                          </p>
                          <h3 className="font-display text-sm sm:text-base text-cream font-medium leading-snug mb-1 group-hover:text-gold-400 transition-colors print:text-black">
                            {p.name}
                          </h3>
                          <p className="text-[11px] text-walnut-400 font-light line-clamp-2 leading-relaxed mb-3 print:text-gray-600">
                            {p.short_description || p.description}
                          </p>
                        </div>

                        {/* Specs and Price */}
                        <div className="pt-2.5 border-t border-gold-500/15 space-y-2">
                          <div className="grid grid-cols-2 gap-1 text-[10px] text-walnut-400 print:text-gray-600">
                            {p.material && (
                              <div>
                                <span className="text-walnut-500 block text-[8px] uppercase tracking-wider">Material</span>
                                <span className="font-medium truncate block text-beige-300">{p.material}</span>
                              </div>
                            )}
                            {p.dimensions && (
                              <div>
                                <span className="text-walnut-500 block text-[8px] uppercase tracking-wider">Dimensions</span>
                                <span className="font-medium truncate block text-beige-300">{p.dimensions}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-baseline justify-between pt-1">
                            <div>
                              <span className={`font-display font-semibold ${
                                isPriced
                                  ? 'text-base text-gold-400 print:text-black'
                                  : 'text-xs text-gold-500 font-sans uppercase tracking-wide font-medium'
                              }`}>
                                {formatPrice(effectivePrice)}
                              </span>
                              {isPriced && p.sale_price && p.base_price && p.sale_price < p.base_price && (
                                <span className="ml-1.5 text-[10px] line-through text-walnut-500">
                                  {formatPrice(p.base_price)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gold-400/80 group-hover:text-gold-300 font-medium flex items-center gap-1">
                              <span>View Product</span>
                              <ExternalLink size={10} />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#130e0b] rounded-xl border border-gold-500/15 p-6">
                  <p className="font-display text-lg text-cream mb-1">No matching products found</p>
                  <p className="text-xs text-walnut-400 font-light mb-4">
                    No items in the catalogue match "{search}".
                  </p>
                  <button
                    onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                    className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-ivory text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    View All 51 Products
                  </button>
                </div>
              )}

              {/* Ordering Info Footer in Catalogue */}
              <div className="p-5 bg-[#130e0b] rounded-xl border border-gold-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 print:border-gray-200 print:bg-white print:break-inside-avoid">
                <div>
                  <h4 className="font-display text-sm sm:text-base text-cream font-medium mb-0.5 print:text-black">
                    Ready to Order Your Personalized Piece?
                  </h4>
                  <p className="text-xs text-walnut-400 font-light print:text-gray-600">
                    Send product names & photos directly via WhatsApp to +91 93604 82480.
                  </p>
                </div>
                <a
                  href={buildDirectWhatsAppUrl('Hi GALINEX, I was viewing your PDF catalogue and would like to order.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-ivory text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors print:hidden flex-shrink-0 cursor-pointer shadow-md"
                >
                  <MessageCircle size={15} />
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
