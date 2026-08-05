import type { CartItem, ShippingAddress, Order } from '@/types';
import { formatPrice } from './format';
import { WHATSAPP_NUMBER } from './supabase';

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
  lines.push('*GALINEX - New Order*');
  if (orderNumber) lines.push(`Order: ${orderNumber}`);
  lines.push('');
  lines.push('*Customer Details*');
  lines.push(`Name: ${address.full_name}`);
  lines.push(`Phone: ${address.phone}`);
  if (address.email) lines.push(`Email: ${address.email}`);
  lines.push('');
  lines.push('*Shipping Address*');
  lines.push(`${address.address_line1}`);
  if (address.address_line2) lines.push(`${address.address_line2}`);
  lines.push(`${address.city}, ${address.state} - ${address.pincode}`);
  if (address.landmark) lines.push(`Landmark: ${address.landmark}`);
  lines.push('');
  lines.push('*Products*');
  items.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.product?.name || 'Product'}`);
    if (item.variant_name) lines.push(`   Variant: ${item.variant_name}`);
    lines.push(`   Qty: ${item.quantity}`);
    lines.push(`   Price: ${formatPrice((item.product?.sale_price ?? item.product?.base_price ?? 0) * item.quantity)}`);
    if (item.customization_text) lines.push(`   Customization: ${item.customization_text}`);
    if (item.photo_url) lines.push(`   Photo: ${item.photo_url}`);
  });
  lines.push('');
  lines.push('*Order Summary*');
  lines.push(`Subtotal: ${formatPrice(subtotal)}`);
  if (discount > 0) {
    lines.push(`Discount${couponCode ? ` (${couponCode})` : ''}: -${formatPrice(discount)}`);
  }
  lines.push(`Shipping: ${shipping === 0 ? 'FREE' : formatPrice(shipping)}`);
  lines.push(`*Total: ${formatPrice(total)}*`);
  lines.push('');
  lines.push(`Payment: ${paymentMethod.toUpperCase()}`);
  lines.push('');
  lines.push('Please confirm my order. Thank you!');

  return lines.join('\n');
}

export function openWhatsApp(message: string, number: string = WHATSAPP_NUMBER): void {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${number}?text=${encoded}`;
  window.open(url, '_blank');
}

export function buildOrderTrackingMessage(orderNumber: string): string {
  return `Hi GALINEX, I'd like to track my order: ${orderNumber}`;
}
