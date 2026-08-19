import { useState, useEffect, useRef } from 'react';
import {
  X, Printer, Download, Sparkles, MessageCircle, Phone, Mail,
  MapPin, CheckCircle, ExternalLink, Filter, Search, BookOpen,
} from 'lucide-react';
import { supabase, BRAND_NAME, BRAND_PHONE, BRAND_EMAIL, BRAND_ADDRESS, WHATSAPP_NUMBER } from '@/lib/supabase';
import { formatPrice, getEffectivePrice, getProductImageUrl } from '@/lib/format';
import type { Product, Category } from '@/types';

interface PdfCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PdfCatalogueModal({ isOpen, onClose }: PdfCatalogueModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const catalogueContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*, category:categories(*)').eq('is_active', true).order('sort_order', { ascending: true, nullsFirst: false }),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      ]);
      if (prodRes.data) setProducts(prodRes.data as Product[]);
      if (catRes.data) setCategories(catRes.data as Category[]);
      setLoading(false);
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category?.slug === selectedCategory;
    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.material?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handlePrintOrDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-walnut-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-ivory dark:bg-walnut-950 w-full max-w-5xl rounded-card shadow-2xl border border-champagne-200/60 dark:border-champagne-900/40 flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:w-full">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="px-6 py-4 border-b border-champagne-200/50 dark:border-champagne-900/30 flex items-center justify-between print:hidden flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-champagne-100 dark:bg-champagne-900/40 flex items-center justify-center text-champagne-700 dark:text-champagne-300">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="font-display font-medium text-lg text-walnut-900 dark:text-cream">
                {BRAND_NAME} Official Product Catalogue
              </h2>
              <p className="text-xs text-walnut-500 dark:text-beige-400 font-light">
                Browse & download the complete personalized gifts collection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/galinex-catalogue.pdf"
              download="GALINEX_Product_Catalogue_2026.pdf"
              className="px-4 py-2 bg-walnut-800 hover:bg-walnut-700 text-cream text-xs font-medium rounded-btn flex items-center gap-2 transition-all duration-300 border border-champagne-500/30"
              title="Download Original PDF"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Download PDF</span>
            </a>
            <button
              onClick={handlePrintOrDownloadPdf}
              className="px-4 py-2 bg-champagne-600 hover:bg-champagne-500 text-ivory text-xs font-medium rounded-btn flex items-center gap-2 transition-all duration-300 shadow-sm"
              title="Save as PDF or Print"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-walnut-400 hover:text-walnut-700 dark:hover:text-cream transition-colors rounded-full"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter controls (Hidden in Print) */}
        <div className="p-4 sm:px-6 bg-cream/50 dark:bg-walnut-900/40 border-b border-champagne-200/40 dark:border-champagne-900/30 flex flex-wrap items-center gap-3 print:hidden flex-shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-walnut-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalogue items..."
              className="w-full pl-9 pr-3 py-1.5 bg-ivory dark:bg-walnut-950 text-xs rounded-input border border-champagne-200 dark:border-champagne-900/50 text-walnut-900 dark:text-cream outline-none focus:border-champagne-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs rounded-btn whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-walnut-900 text-ivory dark:bg-cream dark:text-walnut-900 font-medium'
                  : 'bg-ivory dark:bg-walnut-800 text-walnut-600 dark:text-beige-300 border border-champagne-200/40 dark:border-champagne-900/30'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 text-xs rounded-btn whitespace-nowrap transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-walnut-900 text-ivory dark:bg-cream dark:text-walnut-900 font-medium'
                    : 'bg-ivory dark:bg-walnut-800 text-walnut-600 dark:text-beige-300 border border-champagne-200/40 dark:border-champagne-900/30'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Printable Catalogue Content */}
        <div
          ref={catalogueContentRef}
          className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-12 print:overflow-visible print:p-0 print:space-y-8"
        >
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-champagne-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-walnut-500 font-light">Loading catalogue pieces…</p>
            </div>
          ) : (
            <>
              {/* Catalogue Cover / Header Section */}
              <div className="text-center border-b-2 border-champagne-300 dark:border-champagne-800 pb-8 print:pb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-champagne-100 dark:bg-champagne-900/40 text-champagne-800 dark:text-champagne-300 text-[10px] uppercase tracking-wider2 rounded-full mb-3 print:border print:border-champagne-300">
                  <Sparkles size={12} />
                  Product Catalogue 2026
                </div>
                <h1 className="font-display text-4xl sm:text-5xl text-walnut-950 dark:text-cream font-light tracking-wide mb-2 print:text-black">
                  {BRAND_NAME}
                </h1>
                <p className="text-xs sm:text-sm text-champagne-700 dark:text-champagne-400 font-light uppercase tracking-widest mb-4 print:text-gray-700">
                  Memories, Crafted Forever — Crystal, Wood & Acrylic Keepsakes
                </p>
                <div className="flex flex-wrap justify-center items-center gap-4 text-[11px] text-walnut-600 dark:text-beige-400 font-light print:text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Phone size={12} className="text-champagne-600" /> {BRAND_PHONE}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle size={12} className="text-champagne-600" /> WhatsApp: +{WHATSAPP_NUMBER}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Mail size={12} className="text-champagne-600" /> {BRAND_EMAIL}
                  </span>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
                {filteredProducts.map((p) => {
                  const effectivePrice = getEffectivePrice(p);
                  return (
                    <div
                      key={p.id}
                      className="bg-cream/30 dark:bg-walnut-900/40 p-4 rounded-card border border-champagne-200/50 dark:border-champagne-900/30 flex flex-col justify-between print:border-gray-200 print:bg-white print:break-inside-avoid"
                    >
                      <div>
                        {/* Image */}
                        <div className="aspect-[4/3] rounded-card overflow-hidden bg-cream dark:bg-walnut-800 mb-3 relative">
                          <img
                            src={getProductImageUrl(p)}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                          {p.badge && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-walnut-950/80 text-champagne-300 text-[9px] uppercase font-medium tracking-wide rounded">
                              {p.badge.replace('_', ' ')}
                            </span>
                          )}
                        </div>

                        {/* Title & Category */}
                        <p className="text-[10px] uppercase tracking-wider text-champagne-600 dark:text-champagne-400 font-medium mb-0.5">
                          {p.category?.name ?? 'Keepsake'}
                        </p>
                        <h3 className="font-display text-base text-walnut-900 dark:text-cream font-medium leading-snug mb-1.5 print:text-black">
                          {p.name}
                        </h3>
                        <p className="text-xs text-walnut-500 dark:text-beige-400 font-light line-clamp-2 leading-relaxed mb-3 print:text-gray-600">
                          {p.short_description || p.description}
                        </p>
                      </div>

                      {/* Specs and Price */}
                      <div className="pt-3 border-t border-champagne-200/40 dark:border-champagne-900/30 space-y-2">
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-walnut-600 dark:text-beige-400 print:text-gray-600">
                          {p.material && (
                            <div>
                              <span className="text-walnut-400 block text-[9px] uppercase">Material</span>
                              <span className="font-medium truncate block">{p.material}</span>
                            </div>
                          )}
                          {p.dimensions && (
                            <div>
                              <span className="text-walnut-400 block text-[9px] uppercase">Dimensions</span>
                              <span className="font-medium truncate block">{p.dimensions}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-baseline justify-between pt-1">
                          <div>
                            <span className="font-display text-lg font-semibold text-champagne-700 dark:text-champagne-400 print:text-black">
                              {formatPrice(effectivePrice)}
                            </span>
                            {p.sale_price && p.sale_price < p.base_price && (
                              <span className="ml-2 text-xs line-through text-walnut-400">
                                {formatPrice(p.base_price)}
                              </span>
                            )}
                          </div>
                          {p.is_customizable && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                              Customizable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-walnut-500">No items match your search in this catalogue.</p>
                </div>
              )}

              {/* Ordering Info Footer in Catalogue */}
              <div className="p-6 bg-cream dark:bg-walnut-900 rounded-card border border-champagne-200 dark:border-champagne-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 print:border-gray-200 print:bg-white print:break-inside-avoid">
                <div>
                  <h4 className="font-display text-base text-walnut-900 dark:text-cream font-medium mb-1 print:text-black">
                    Ready to Order Your Personalized Piece?
                  </h4>
                  <p className="text-xs text-walnut-600 dark:text-beige-400 font-light print:text-gray-600">
                    Send product names & your photos directly via WhatsApp to +{WHATSAPP_NUMBER}.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi GALINEX, I was viewing your PDF catalogue and would like to order.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-ivory text-xs font-medium rounded-btn flex items-center gap-2 transition-colors print:hidden flex-shrink-0"
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
