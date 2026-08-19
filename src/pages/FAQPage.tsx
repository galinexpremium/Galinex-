import { useState, useMemo } from 'react';
import {
  Search, ChevronDown, ShoppingBag, Palette, Image, Clock,
  Truck, RefreshCw, CreditCard, MapPin, HelpCircle, MessageCircle,
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { WHATSAPP_NUMBER } from '@/lib/supabase';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const CATEGORIES = [
  { name: 'All', icon: HelpCircle },
  { name: 'Ordering', icon: ShoppingBag },
  { name: 'Customization', icon: Palette },
  { name: 'Photo Upload', icon: Image },
  { name: 'Production Time', icon: Clock },
  { name: 'Shipping', icon: Truck },
  { name: 'Returns', icon: RefreshCw },
  { name: 'Payment', icon: CreditCard },
  { name: 'Delivery', icon: MapPin },
];

const FAQS: FAQItem[] = [
  { id: 'f1', category: 'Ordering', question: 'How do I place an order?', answer: 'Browse our collection, select your product, and click "Add to Cart". Once you are ready, proceed to checkout, enter your shipping details, and complete the payment. You will receive an order confirmation via WhatsApp and email.' },
  { id: 'f2', category: 'Ordering', question: 'Can I modify or cancel my order after placing it?', answer: 'Yes, orders can be modified or cancelled within 2 hours of placing them, as long as production has not started. Contact us immediately via WhatsApp or email with your order number.' },
  { id: 'f3', category: 'Ordering', question: 'Do you offer bulk or corporate gifting?', answer: 'Absolutely. We offer special pricing and dedicated support for bulk and corporate orders. Contact us with your requirements and we will share a custom quote within 24 hours.' },
  { id: 'f4', category: 'Customization', question: 'What can I personalize on my gift?', answer: 'Most products support photo engraving, custom text (names, dates, messages), and design choices. The available options are shown on each product page under the "Personalize" section.' },
  { id: 'f5', category: 'Customization', question: 'Is there a limit to the text I can engrave?', answer: 'Yes, each product has a character limit that depends on the engraving area. The limit is displayed on the product page. We recommend keeping messages concise for the best visual result.' },
  { id: 'f6', category: 'Customization', question: 'Can I see a preview before ordering?', answer: 'Yes, most products show a live preview as you type your custom text. For photo engraving, our design team will send a digital mockup via WhatsApp for your approval before production begins.' },
  { id: 'f7', category: 'Photo Upload', question: 'What photo format and quality do you accept?', answer: 'We accept JPG, JPEG, and PNG files. For the best engraving result, please upload high-resolution images (at least 1000 x 1000 pixels). Avoid blurry, dark, or heavily filtered photos.' },
  { id: 'f8', category: 'Photo Upload', question: 'Can I upload multiple photos?', answer: 'Some products support multiple photos (like photo collages). The number of allowed photos is specified on each product page. For single-photo products, only the first uploaded image will be used.' },
  { id: 'f9', category: 'Photo Upload', question: 'Will my photo be stored or shared?', answer: 'Your uploaded photo is used solely to craft your gift and is deleted from our servers 30 days after delivery. We never share customer photos with third parties.' },
  { id: 'f10', category: 'Production Time', question: 'How long does production take?', answer: 'Most products take 2-4 business days to craft after design approval. Complex or bulk orders may take 5-7 days. You will receive updates at each stage via WhatsApp.' },
  { id: 'f11', category: 'Production Time', question: 'Can I request rush production?', answer: 'Yes, we offer rush production (1-2 business days) for an additional fee, subject to product availability. Select the rush option at checkout or contact us right after placing your order.' },
  { id: 'f12', category: 'Shipping', question: 'Do you ship across India?', answer: 'Yes, we ship to all serviceable pin codes across India. Free insured shipping is included on orders above ₹999. A flat shipping fee of ₹79 applies to orders below that amount.' },
  { id: 'f13', category: 'Shipping', question: 'Do you ship internationally?', answer: 'Currently we ship within India only. International shipping is coming soon — follow us on Instagram for updates.' },
  { id: 'f14', category: 'Shipping', question: 'How is my order packed for shipping?', answer: 'Every order is packed in our signature luxury gift box with protective foam, then placed inside a sturdy corrugated carton with bubble wrap for safe transit.' },
  { id: 'f15', category: 'Returns', question: 'What is your return policy?', answer: 'Since each product is personalized, we accept returns only for damaged or defective items. If your gift arrives damaged, contact us within 48 hours with a photo and we will replace it free of charge.' },
  { id: 'f16', category: 'Returns', question: 'What if there is a spelling mistake in my engraving?', answer: 'If the mistake is on our end (different from what you approved), we will remake the product free of charge. Please double-check all custom text before approving your design mockup.' },
  { id: 'f17', category: 'Payment', question: 'What payment methods do you accept?', answer: 'We accept UPI, all major credit and debit cards, net banking, and popular wallets. All payments are processed through secure, encrypted payment gateways.' },
  { id: 'f18', category: 'Payment', question: 'Is Cash on Delivery (COD) available?', answer: 'COD is available for orders up to ₹5,000 in select pin codes. A small COD handling fee of ₹49 applies. You will see the COD option at checkout if it is available for your address.' },
  { id: 'f19', category: 'Payment', question: 'Is my payment information secure?', answer: 'Yes. We never store your card or banking details. All payments are handled by PCI-DSS compliant gateways. We only see the order status, never your sensitive payment data.' },
  { id: 'f20', category: 'Delivery', question: 'How can I track my order?', answer: 'Once your order ships, you will receive a tracking link via WhatsApp and email. You can also track your order anytime using the "Track Order" page on our website.' },
  { id: 'f21', category: 'Delivery', question: 'What if I am not home during delivery?', answer: 'Our courier partners will attempt delivery three times. You will receive a delivery attempt notification with rescheduling options. You can also authorize a neighbor or guard to receive the package.' },
  { id: 'f22', category: 'Delivery', question: 'My package shows delivered but I have not received it. What do I do?', answer: 'Please check with neighbors and your building security first. If you still cannot locate it, contact us within 24 hours with your order number and we will initiate a courier investigation.' },
];

export default function FAQPage() {
  const { navigate } = useStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAQS.filter((f) => {
      const matchesCat = activeCategory === 'All' || f.category === activeCategory;
      const matchesSearch = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-ivory dark:bg-walnut-950">
      {/* Hero */}
      <section className="relative py-20 bg-walnut-900 text-ivory overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-champagne-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-champagne-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-champagne-600/20 border border-champagne-500/30 text-champagne-200 text-xs font-medium mb-6">
            <HelpCircle size={14} /> Help Center
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-champagne-400 to-champagne-200 bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-beige-300 max-w-2xl mx-auto">
            Everything you need to know about ordering, personalizing, and receiving your GALINEX gift.
          </p>
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-6">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Search */}
      <section className="py-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-champagne-600 dark:text-champagne-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-12 pr-4 py-4 rounded-full bg-ivory dark:bg-walnut-900 border border-champagne-200 dark:border-champagne-900/50 text-walnut-900 dark:text-ivory placeholder-beige-400 focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-transparent transition-all"
          />
        </div>
      </section>

      {/* Category pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.name
                  ? 'bg-champagne-600 text-ivory shadow-md shadow-champagne-500/20'
                  : 'bg-ivory dark:bg-walnut-900 text-walnut-700 dark:text-beige-300 border border-champagne-200 dark:border-champagne-900/50 hover:border-champagne-400'
              }`}
            >
              <cat.icon size={16} /> {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ list */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-walnut-500 dark:text-beige-400">No questions match your search. Try a different keyword.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((f) => {
              const isOpen = openId === f.id;
              return (
                <div
                  key={f.id}
                  className={`rounded-card border transition-all duration-300 ${
                    isOpen
                      ? 'bg-ivory dark:bg-walnut-900 border-champagne-400 shadow-md'
                      : 'bg-ivory dark:bg-walnut-900 border-champagne-200 dark:border-champagne-900/50'
                  }`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : f.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full bg-champagne-100 dark:bg-champagne-900/30 text-champagne-700 dark:text-champagne-300 text-xs font-medium whitespace-nowrap">
                        {f.category}
                      </span>
                      <h3 className="font-display font-semibold text-walnut-900 dark:text-ivory">{f.question}</h3>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`flex-shrink-0 text-champagne-600 dark:text-champagne-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-walnut-600 dark:text-beige-400 leading-relaxed">
                        {f.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Still have questions CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-card overflow-hidden bg-gradient-to-br from-walnut-800 via-champagne-700 to-walnut-900 p-8 sm:p-12 text-center border border-champagne-700/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-champagne-400/20 rounded-full blur-3xl" />
          <div className="relative">
            <MessageCircle size={40} className="mx-auto text-ivory mb-4" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ivory mb-3">Still Have Questions?</h2>
            <p className="text-ivory/85 max-w-xl mx-auto mb-8">
              Our team is here to help. Reach out and we will get back to you within a few hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('contact')}
                className="px-8 py-3.5 rounded-full bg-ivory text-champagne-700 font-semibold hover:bg-champagne-50 transition-colors"
              >
                Contact Us
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-full bg-ivory/15 backdrop-blur-sm border border-champagne-400/30 text-ivory font-semibold hover:bg-ivory/25 transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
