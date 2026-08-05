import { X, Check, BarChart3 } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { formatPrice, getEffectivePrice, getDiscountPercent, badgeLabel } from '@/lib/format';

export default function ComparePage() {
  const { compareItems, toggleCompare, navigate, clearCompare } = useStore();

  if (compareItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-card bg-cream dark:bg-walnut-900 flex items-center justify-center mb-6 border border-champagne-200/30">
            <BarChart3 size={40} className="text-champagne-400" />
          </div>
          <h1 className="text-3xl font-display text-walnut-900 dark:text-ivory mb-3 tracking-tight">No Products to Compare</h1>
          <div className="w-16 h-px bg-champagne-300 mx-auto mb-4" />
          <p className="text-walnut-500 dark:text-beige-400 mb-8 max-w-md mx-auto">Add products to compare their features side by side.</p>
          <button onClick={() => navigate('shop')} className="px-10 py-3.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory font-medium tracking-wide transition-colors">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const features = [
    { key: 'price', label: 'Price', render: (p: typeof compareItems[0]) => formatPrice(getEffectivePrice(p)) },
    { key: 'discount', label: 'Discount', render: (p: typeof compareItems[0]) => `${getDiscountPercent(p)}%` },
    { key: 'rating', label: 'Rating', render: (p: typeof compareItems[0]) => `${p.rating} (${p.review_count})` },
    { key: 'material', label: 'Material', render: (p: typeof compareItems[0]) => p.material ?? '-' },
    { key: 'dimensions', label: 'Dimensions', render: (p: typeof compareItems[0]) => p.dimensions ?? '-' },
    { key: 'weight', label: 'Weight', render: (p: typeof compareItems[0]) => `${p.weight_grams}g` },
    { key: 'production', label: 'Production Time', render: (p: typeof compareItems[0]) => `${p.production_days} days` },
    { key: 'badge', label: 'Badge', render: (p: typeof compareItems[0]) => p.badge ? badgeLabel(p.badge) : '-' },
    { key: 'stock', label: 'Stock', render: (p: typeof compareItems[0]) => `${p.stock_quantity} units` },
  ];

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display text-walnut-900 dark:text-ivory tracking-tight">Compare Products</h1>
          <div className="mt-3 h-px bg-gradient-to-r from-champagne-400 via-champagne-200 to-transparent" />
        </div>
        <button onClick={clearCompare} className="text-sm text-walnut-500 hover:text-rose-500 transition-colors tracking-wide">
          Clear All
        </button>
      </div>

      <div className="overflow-x-auto rounded-card border border-champagne-200/30 dark:border-champagne-900/20">
        <table className="w-full">
          <thead>
            <tr className="bg-cream/50 dark:bg-walnut-800/30">
              <th className="w-40 p-5 text-left text-sm font-medium text-walnut-500 dark:text-beige-400 tracking-wide"></th>
              {compareItems.map(product => (
                <th key={product.id} className="p-5 align-top min-w-[200px] border-l border-champagne-200/20 dark:border-champagne-900/20">
                  <div className="relative">
                    <button
                      onClick={() => toggleCompare(product)}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-500 text-ivory flex items-center justify-center z-10 hover:bg-rose-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <button onClick={() => navigate('product', { slug: product.slug })} className="block w-full">
                      <div className="aspect-square rounded-card overflow-hidden bg-cream dark:bg-walnut-800 mb-3 border border-champagne-200/20">
                        <img src={product.image_url ?? ''} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-medium text-sm text-walnut-900 dark:text-ivory text-left hover:text-champagne-600 transition-colors line-clamp-2 tracking-wide">{product.name}</h3>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feat, i) => (
              <tr key={feat.key} className={i % 2 === 0 ? 'bg-cream/30 dark:bg-walnut-800/20' : ''}>
                <td className="p-5 text-sm font-medium text-walnut-500 dark:text-beige-400 tracking-wide">{feat.label}</td>
                {compareItems.map(product => (
                  <td key={product.id} className="p-5 text-sm text-walnut-900 dark:text-ivory text-center border-l border-champagne-200/20 dark:border-champagne-900/20">
                    {feat.render(product)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-cream/50 dark:bg-walnut-800/30">
              <td className="p-5 border-l border-champagne-200/20 dark:border-champagne-900/20"></td>
              {compareItems.map(product => (
                <td key={product.id} className="p-5 text-center border-l border-champagne-200/20 dark:border-champagne-900/20">
                  <button
                    onClick={() => navigate('product', { slug: product.slug })}
                    className="px-6 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory text-sm font-medium tracking-wide transition-colors"
                  >
                    View Product
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
