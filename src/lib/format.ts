export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || price <= 0) {
    return 'Price on Request';
  }
  return '₹' + price.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getEffectivePrice(product: { base_price: number | null; sale_price: number | null }): number {
  return (product.sale_price && product.sale_price > 0) ? product.sale_price : (product.base_price ?? 0);
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

export function getProductImageUrl(product?: { slug?: string; image_url?: string | null; category?: { slug?: string } | null } | null): string {
  if (!product) return '/products/3d-crystal-gifts/5x5x8-3d-crystal-single-image.webp';
  if (product.image_url && (product.image_url.startsWith('http://') || product.image_url.startsWith('https://') || product.image_url.startsWith('/products/'))) {
    return product.image_url;
  }
  const cat = product.category?.slug || '3d-crystal-gifts';
  if (product.slug) {
    return `/products/${cat}/${product.slug}.webp`;
  }
  return '/products/3d-crystal-gifts/5x5x8-3d-crystal-single-image.webp';
}
