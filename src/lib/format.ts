export function formatPrice(price: number): string {
  return '₹' + price.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getEffectivePrice(product: { base_price: number; sale_price: number | null }): number {
  return product.sale_price ?? product.base_price;
}

export function getDiscountPercent(product: { base_price: number; sale_price: number | null }): number {
  if (!product.sale_price) return 0;
  return Math.round(((product.base_price - product.sale_price) / product.base_price) * 100);
}

export function badgeLabel(badge: string | null): string {
  switch (badge) {
    case 'new': return 'New';
    case 'sale': return 'Sale';
    case 'trending': return 'Trending';
    case 'best_seller': return 'Best Seller';
    case 'limited_edition': return 'Limited Edition';
    default: return '';
  }
}

export function badgeColor(badge: string | null): string {
  switch (badge) {
    case 'new': return 'bg-emerald-500';
    case 'sale': return 'bg-rose-500';
    case 'trending': return 'bg-amber-500';
    case 'best_seller': return 'bg-blue-600';
    case 'limited_edition': return 'bg-gradient-to-r from-amber-600 to-yellow-500';
    default: return 'bg-gray-500';
  }
}
