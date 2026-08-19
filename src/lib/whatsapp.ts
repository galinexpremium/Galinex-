import type { CartItem, ShippingAddress, Product, CustomizationData } from '@/types';
import { formatPrice, getEffectivePrice, getProductImageUrl } from './format';
import { WHATSAPP_NUMBER } from './supabase';

export function buildDirectWhatsAppUrl(message: string, number: string = WHATSAPP_NUMBER): string {
  const sanitized = number.replace(/[^0-9]/g, '');
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string, number: string = WHATSAPP_NUMBER): void {
  const url = buildDirectWhatsAppUrl(message, number);
  window.open(url, '_blank');
}

export function buildWhatsAppOrderMessage(
  items: CartItem[],
  address: ShippingAddress,
  subtotal: number,
  discount: number,
  shipping: number,
  total: number,
  couponCode: string | null,
  paymentMethod: string,
  orderNumber?: string
): string {
  const lines: string[] = [];
  lines.push('*GALINEX LUXURY GIFTS - NEW ORDER*');
  if (orderNumber) lines.push(`Order ID: ${orderNumber}`);
  lines.push('----------------------------------------');
  lines.push('*Customer Details:*');
  lines.push(`Name: ${address.full_name}`);
  lines.push(`Phone: ${address.phone}`);
  if (address.email) lines.push(`Email: ${address.email}`);
  lines.push('');
  lines.push('*Delivery Address:*');
  lines.push(`${address.address_line1}`);
  if (address.address_line2) lines.push(`${address.address_line2}`);
  lines.push(`${address.city}, ${address.state} - ${address.pincode}`);
  if (address.landmark) lines.push(`Landmark: ${address.landmark}`);
  lines.push('');
  lines.push('*Ordered Items:*');
  items.forEach((item, i) => {
    lines.push(`${i + 1}. *${item.product?.name || 'Product'}*`);
    if (item.product?.dimensions) lines.push(`   Dimensions: ${item.product.dimensions}`);
    if (item.variant_name) lines.push(`   Variant: ${item.variant_name}`);
    lines.push(`   Quantity: ${item.quantity}`);
    lines.push(`   Price: ${formatPrice((item.product?.sale_price ?? item.product?.base_price ?? 0) * item.quantity)}`);
    if (item.customization_text) lines.push(`   Engraving Text: "${item.customization_text}"`);
    if (item.customization_data?.filter) lines.push(`   Engraving Style: ${item.customization_data.filter.toUpperCase()}`);
    if (item.photo_url) lines.push(`   Photo Upload: Attached / Confirmed`);
  });
  lines.push('');
  lines.push('----------------------------------------');
  lines.push('*Order Summary:*');
  lines.push(`Subtotal: ${formatPrice(subtotal)}`);
  if (discount > 0) {
    lines.push(`Discount${couponCode ? ` (${couponCode})` : ''}: -${formatPrice(discount)}`);
  }
  lines.push(`Shipping: ${shipping === 0 ? 'FREE' : formatPrice(shipping)}`);
  lines.push(`*Total Amount: ${formatPrice(total)}*`);
  lines.push(`Payment Method: ${paymentMethod.toUpperCase()}`);
  lines.push('----------------------------------------');
  lines.push('Please confirm my order and share estimated dispatch details. Thank you!');

  return lines.join('\n');
}

export function buildProductInquiryMessage(
  product: Product,
  customizationData?: CustomizationData | null
): string {
  const lines: string[] = [];
  lines.push('*GALINEX PRODUCT INQUIRY*');
  lines.push('');
  lines.push(`Product: *${product.name}*`);
  lines.push(`Model / Slug: ${product.slug}`);
  const price = getEffectivePrice(product);
  lines.push(`Price: ${formatPrice(price)}`);
  if (product.dimensions) lines.push(`Dimensions: ${product.dimensions}`);
  if (product.material) lines.push(`Material: ${product.material}`);
  
  const imgPath = getProductImageUrl(product);
  const fullImgUrl = typeof window !== 'undefined' ? `${window.location.origin}${imgPath}` : imgPath;
  lines.push(`Image: ${fullImgUrl}`);
  
  if (customizationData?.text) {
    lines.push(`Custom Engraving Text: "${customizationData.text}"`);
  }
  lines.push('');
  lines.push('Hello GALINEX, I am interested in this product. Please share availability and ordering details.');
  return lines.join('\n');
}

export function buildMdfQuoteRequestMessage(product: Product): string {
  const lines: string[] = [];
  lines.push('*GALINEX CUSTOM QUOTATION REQUEST*');
  lines.push('');
  lines.push(`Product: *${product.name}*`);
  lines.push(`Model / Slug: ${product.slug}`);
  lines.push('Price: Price on Request');
  if (product.dimensions) lines.push(`Dimensions: ${product.dimensions}`);
  if (product.material) lines.push(`Material: ${product.material || 'MDF / Engineered Wood'}`);
  
  const imgPath = getProductImageUrl(product);
  const fullImgUrl = typeof window !== 'undefined' ? `${window.location.origin}${imgPath}` : imgPath;
  lines.push(`Image: ${fullImgUrl}`);
  lines.push('');
  lines.push('Hi GALINEX team, I would like to request a custom price quote for MDF Cutout / Collage wall decor framing.');
  lines.push('- Required Dimensions: (e.g. 2x3 ft, 3x4 ft, custom shape)');
  lines.push('- Number of Photos / Design Concept:');
  lines.push('- Delivery Location / Pincode:');
  return lines.join('\n');
}

export function buildOrderTrackingMessage(orderNumber: string): string {
  return `Hi GALINEX, I would like to track my order: *${orderNumber}*`;
}
