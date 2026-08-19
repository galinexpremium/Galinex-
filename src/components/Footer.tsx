import { useState } from 'react';
import { Instagram, Mail, Phone, MapPin, Send, Heart, ArrowRight, MessageCircle, Shield, Truck, RotateCcw, Lock } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { supabase, BRAND_NAME, BRAND_PHONE, BRAND_EMAIL, BRAND_INSTAGRAM, BRAND_ADDRESS, BUSINESS_HOURS, WHATSAPP_NUMBER } from '@/lib/supabase';
import { buildDirectWhatsAppUrl } from '@/lib/whatsapp';

export default function Footer() {
  const { navigate, setCatalogueOpen } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await supabase.from('newsletter_subscribers').insert({ email });
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const quickLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'About Us', page: 'about' as const },
    { label: 'Gallery', page: 'gallery' as const },
    { label: 'Reviews', page: 'reviews' as const },
    { label: 'FAQ', page: 'faq' as const },
    { label: 'Contact', page: 'contact' as const },
  ];

  const collectionLinks = [
    { label: 'All Collections', page: 'shop' as const },
    { label: 'Best Sellers', page: 'shop' as const },
    { label: 'New Arrivals', page: 'shop' as const },
    { label: 'Crystal Gifts', page: 'shop' as const },
    { label: 'Wooden Gifts', page: 'shop' as const },
    { label: 'Personalized Gifts', page: 'shop' as const },
  ];

  const supportLinks = [
    { label: 'My Account', page: 'account' as const },
    { label: 'Wishlist', page: 'wishlist' as const },
    { label: 'Shopping Cart', page: 'cart' as const },
    { label: 'Compare Products', page: 'compare' as const },
    { label: 'Track Order', page: 'track-order' as const },
  ];

  const policyLinks = [
    { label: 'Privacy Policy', page: 'faq' as const },
    { label: 'Return Policy', page: 'faq' as const },
    { label: 'Shipping Info', page: 'faq' as const },
    { label: 'Terms of Service', page: 'faq' as const },
  ];

  return (
    <footer className="bg-walnut-950 text-cream/60 mt-24">
      {/* Trust bar */}
      <div className="border-b border-gold-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On all orders above ₹999' },
              { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: Lock, title: 'Secure Payment', desc: '100% protected checkout' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 justify-center sm:justify-start">
                <div className="w-12 h-12 rounded-full border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                  <item.icon size={20} className="text-gold-400" />
                </div>
                <div>
                  <p className="text-cream text-sm font-medium tracking-wide">{item.title}</p>
                  <p className="text-xs text-cream/50 font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-b border-gold-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold-500 text-xs font-medium uppercase tracking-wider2 mb-4">Newsletter</p>
              <h3 className="font-display text-3xl sm:text-4xl text-cream mb-4 font-light">Join the {BRAND_NAME} Family</h3>
              <p className="text-sm font-light leading-relaxed max-w-md">Subscribe for exclusive offers, new arrivals, and gifting inspiration delivered to your inbox.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 bg-walnut-900/50 text-cream border border-gold-900/30 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all duration-300 text-sm rounded-input"
                required
              />
              <button
                type="submit"
                className="px-7 py-4 bg-gold-600 hover:bg-gold-500 text-ivory font-medium text-sm tracking-wide transition-colors duration-500 flex items-center gap-2.5 whitespace-nowrap rounded-btn btn-shimmer"
              >
                <Send size={15} /> Subscribe
              </button>
            </form>
            {subscribed && (
              <p className="md:col-span-2 text-gold-400 text-sm font-light tracking-wide">Thank you for subscribing. Check your inbox for a welcome offer.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h4 className="font-display text-2xl text-cream tracking-wider2 mb-5 font-medium">{BRAND_NAME}</h4>
            <p className="text-sm leading-relaxed mb-7 font-light max-w-xs">
              Premium personalized gifts crafted with precision and love. Your memories, our craftsmanship.
            </p>
            <div className="flex gap-3">
              <a href={BRAND_INSTAGRAM} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full border border-gold-900/30 hover:border-gold-500 hover:bg-gold-600 flex items-center justify-center transition-all duration-500 hover:scale-110" aria-label="Instagram">
                <Instagram size={17} />
              </a>
              <a href={buildDirectWhatsAppUrl('Hi GALINEX, I would like to inquire about your personalized gifts.')} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full border border-gold-900/30 hover:border-gold-500 hover:bg-gold-600 flex items-center justify-center transition-all duration-500 hover:scale-110" aria-label="WhatsApp">
                <MessageCircle size={17} />
              </a>
              <a href={`mailto:${BRAND_EMAIL}`} className="w-11 h-11 rounded-full border border-gold-900/30 hover:border-gold-500 hover:bg-gold-600 flex items-center justify-center transition-all duration-500 hover:scale-110" aria-label="Email">
                <Mail size={17} />
              </a>
              <a href={`tel:${BRAND_PHONE}`} className="w-11 h-11 rounded-full border border-gold-900/30 hover:border-gold-500 hover:bg-gold-600 flex items-center justify-center transition-all duration-500 hover:scale-110" aria-label="Phone">
                <Phone size={17} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-cream font-medium mb-6 text-xs uppercase tracking-wider2">Quick Links</h5>
            <ul className="space-y-3.5">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <button onClick={() => navigate(link.page)} className="text-sm font-light hover:text-gold-400 transition-colors duration-300 flex items-center gap-2 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gold-500" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h5 className="text-cream font-medium mb-6 text-xs uppercase tracking-wider2">Collections</h5>
            <ul className="space-y-3.5">
              {collectionLinks.map(link => (
                <li key={link.label}>
                  <button onClick={() => navigate(link.page)} className="text-sm font-light hover:text-gold-400 transition-colors duration-300 flex items-center gap-2 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gold-500" />
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setCatalogueOpen(true)}
                  className="text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors duration-300 flex items-center gap-2 group"
                >
                  <ArrowRight size={12} className="text-gold-400" />
                  PDF Catalogue
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="text-cream font-medium mb-6 text-xs uppercase tracking-wider2">Customer Support</h5>
            <ul className="space-y-3.5">
              {supportLinks.map(link => (
                <li key={link.label}>
                  <button onClick={() => navigate(link.page)} className="text-sm font-light hover:text-gold-400 transition-colors duration-300 flex items-center gap-2 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gold-500" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Policies */}
          <div>
            <h5 className="text-cream font-medium mb-6 text-xs uppercase tracking-wider2">Get in Touch</h5>
            <ul className="space-y-3.5 text-sm font-light mb-6">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-gold-500" />
                <span className="leading-relaxed">{BRAND_ADDRESS}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="flex-shrink-0 text-gold-500" />
                <a href={`tel:${BRAND_PHONE}`} className="hover:text-gold-400 transition-colors">{BRAND_PHONE}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="flex-shrink-0 text-gold-500" />
                <a href={`mailto:${BRAND_EMAIL}`} className="hover:text-gold-400 transition-colors">{BRAND_EMAIL}</a>
              </li>
            </ul>
            <p className="text-xs text-cream/40 font-light leading-relaxed mb-5">{BUSINESS_HOURS}</p>

            <h6 className="text-cream/80 font-medium mb-3 text-[10px] uppercase tracking-wider2">Policies</h6>
            <ul className="space-y-2.5">
              {policyLinks.map(link => (
                <li key={link.label}>
                  <button onClick={() => navigate(link.page)} className="text-xs font-light hover:text-gold-400 transition-colors duration-300">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gold-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/40 font-light tracking-wide">
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Shield size={14} className="text-gold-500/60" />
            <p className="text-xs text-cream/40 font-light flex items-center gap-2 tracking-wide">
              Crafted with <Heart size={11} className="text-gold-500 fill-gold-500" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
