export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  base_price: number;
  sale_price: number | null;
  sku: string | null;
  stock_quantity: number;
  image_url: string | null;
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_customizable: boolean;
  requires_photo: boolean;
  production_days: number;
  weight_grams: number;
  dimensions: string | null;
  material: string | null;
  occasions: string[] | null;
  tags: string[] | null;
  rating: number;
  review_count: number;
  sold_count: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  category?: Category;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface Review {
  id: string;
  product_id: string | null;
  reviewer_name: string;
  reviewer_location: string | null;
  rating: number;
  title: string | null;
  body: string;
  is_verified: boolean;
  is_sample: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  valid_until: string | null;
}

export interface CustomizationData {
  photo_url: string | null;
  text: string;
  font: string;
  text_color: string;
  text_position: { x: number; y: number };
  photo_transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  crop: { x: number; y: number; width: number; height: number } | null;
}

export interface CartItem {
  id: string;
  product_id: string;
  product?: Product;
  variant_name: string | null;
  quantity: number;
  customization_text: string | null;
  photo_url: string | null;
  customization_data: CustomizationData | null;
  saved_for_later: boolean;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product?: Product;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: ShippingAddress;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  coupon_code: string | null;
  payment_method: string;
  payment_status: string;
  order_status: string;
  notes: string | null;
  estimated_delivery: string | null;
  tracking_number: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  customization_text: string | null;
  photo_url: string | null;
  customization_data: CustomizationData | null;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export type Page =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'wishlist'
  | 'compare'
  | 'account'
  | 'login'
  | 'register'
  | 'orders'
  | 'about'
  | 'gallery'
  | 'reviews'
  | 'faq'
  | 'contact'
  | 'admin'
  | 'track-order';

export type SortOption = 'popularity' | 'newest' | 'best_selling' | 'price_low' | 'price_high';
