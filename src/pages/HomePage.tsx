import { useEffect, useState } from 'react';
import {
  ArrowRight, Sparkles, Gift, Truck, Shield, Star, ChevronRight,
  Award, Gem, Package, Heart, Scissors, Camera, Instagram,
  CheckCircle, Clock, Smile, Crown, Palette, Home as HomeIcon, Baby, GraduationCap, PartyPopper, Briefcase, Calendar, Upload, Wrench,
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';

export default function HomePage() {
  const { navigate } = useStore();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<{reviewer_name: string; reviewer_location: string | null; rating: number; body: string; title: string | null; helpful_count: number}[]>([]);

  useEffect(() => {
    (async () => {
      const [feat, best, recent, cats, revs] = await Promise.all([
        supabase.from('products').select('*, category:categories(*)').eq('is_featured', true).eq('is_active', true).limit(8),
        supabase.from('products').select('*, category:categories(*)').eq('badge', 'best_seller').eq('is_active', true).limit(4),
        supabase.from('products').select('*, category:categories(*)').eq('badge', 'new').eq('is_active', true).limit(4),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('reviews').select('reviewer_name, reviewer_location, rating, body, title').eq('is_approved', true).order('helpful_count', { ascending: false }).limit(3),
      ]);
      if (feat.data) setFeatured(feat.data as Product[]);
      if (best.data) setBestSellers(best.data as Product[]);
      if (recent.data) setNewArrivals(recent.data as Product[]);
      if (cats.data) setCategories(cats.data as Category[]);
      if (revs.data) setReviews(revs.data as typeof reviews);
    })();
  }, []);

  const occasions = [
    { icon: PartyPopper, label: 'Birthday', img: 'https://images.pexels.com/photos/12997241/pexels-photo-12997241.jpeg?auto=compress&cs=tinysrgb&w=600&h=800' },
    { icon: Heart, label: 'Wedding', img: 'https://images.pexels.com/photos/15249926/pexels-photo-15249926.jpeg?auto=compress&cs=tinysrgb&w=600&h=800' },
    { icon: Calendar, label: 'Anniversary', img: 'https://images.pexels.com/photos/19203826/pexels-photo-19203826.jpeg?auto=compress&cs=tinysrgb&w=600&h=800' },
    { icon: Briefcase, label: 'Corporate', img: 'https://images.pexels.com/photos/37326553/pexels-photo-37326553.jpeg?auto=compress&cs=tinysrgb&w=600&h=800' },
    { icon: Baby, label: 'Baby Shower', img: 'https://images.pexels.com/photos/30691631/pexels-photo-30691631.jpeg?auto=compress&cs=tinysrgb&w=600&h=800' },
    { icon: Sparkles, label: 'Festivals', img: 'https://images.pexels.com/photos/34473414/pexels-photo-34473414.jpeg?auto=compress&cs=tinysrgb&w=600&h=800' },
    { icon: GraduationCap, label: 'Graduation', img: 'https://images.pexels.com/photos/8106686/pexels-photo-8106686.jpeg?auto=compress&cs=tinysrgb&w=600&h=800' },
    { icon: HomeIcon, label: 'Housewarming', img: 'https://images.pexels.com/photos/7578984/pexels-photo-7578984.jpeg?auto=compress&cs=tinysrgb&w=600&h=800' },
  ];

  const processSteps = [
    { num: '01', icon: Gift, title: 'Choose Product', desc: 'Browse our premium collection and select the perfect personalized gift.' },
    { num: '02', icon: Upload, title: 'Upload Photo', desc: 'Share your favorite memory — a photo, text, or special message.' },
    { num: '03', icon: Palette, title: 'Customize', desc: 'Add names, dates, or messages. Preview your design before ordering.' },
    { num: '04', icon: Wrench, title: 'Crafted Carefully', desc: 'Our master artisans engrave and hand-finish your gift with precision.' },
    { num: '05', icon: Truck, title: 'Delivered', desc: 'Premium packaged and delivered to your doorstep across India.' },
  ];

  const whyGalinex = [
    { icon: Award, title: 'Premium Craftsmanship', desc: 'Each piece is crafted by master artisans with 15+ years of laser engraving expertise.' },
    { icon: Gem, title: 'High Quality Materials', desc: 'We use only the finest optical crystal, sustainably sourced wood, and premium acrylic.' },
    { icon: Palette, title: 'Personalized Designs', desc: 'Every gift is unique — engraved with your photos, names, and messages.' },
    { icon: Truck, title: 'Fast Delivery', desc: 'Pan-India delivery in 5-9 days. Free shipping on orders above ₹999.' },
    { icon: Smile, title: 'Customer Satisfaction', desc: '100% satisfaction guarantee. We treat your memories with the care they deserve.' },
  ];

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-ivory dark:bg-walnut-950">
      {/* ============ HERO ============ */}
      <section className="relative h-[92vh] min-h-[640px] overflow-hidden">
        {/* Parallax Background */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `translate3d(0, ${Math.min(scrollY * 0.22, 120)}px, 0)`,
          }}
        >
          <img
            src="https://images.pexels.com/photos/1050283/pexels-photo-1050283.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
            alt="Luxury personalized gifts on a warm wooden table"
            className="w-full h-full object-cover hero-bg-settle"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-walnut-950/75 via-walnut-950/45 to-walnut-950/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-walnut-950/60 to-transparent" />
        </div>

        {/* Foreground Content with Staggered Entrance and Scroll Fade */}
        <div
          className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center will-change-transform"
          style={{
            transform: `translate3d(0, -${Math.min(scrollY * 0.12, 60)}px, 0)`,
            opacity: Math.max(0, 1 - scrollY / 650),
          }}
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 glass rounded-btn text-cream text-xs font-light tracking-luxury uppercase mb-8 hero-fade-1">
              <Sparkles size={13} className="text-gold-400" />
              Premium Personalized Gifts
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-cream leading-[1.05] mb-6 hero-fade-2 font-light">
              Memories,
              <br />
              <span className="text-gold-gradient italic">Crafted Forever</span>
            </h1>
            <p className="text-lg text-cream/80 mb-10 max-w-lg leading-relaxed font-light hero-fade-3">
              Premium personalized gifts that tell your story. Laser-engraved crystal, wood, and acrylic masterpieces crafted with precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 hero-fade-4">
              <button
                onClick={() => navigate('shop')}
                className="group px-10 py-4 bg-gold-600 hover:bg-gold-500 text-ivory font-medium text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 hover:shadow-[0_15px_40px_-10px_rgba(176,141,87,0.5)] rounded-btn btn-shimmer cursor-pointer active:scale-98"
              >
                <span>Explore Collection</span>
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
              <button
                onClick={() => navigate('about')}
                className="px-10 py-4 border border-cream/30 text-cream font-medium text-sm tracking-wide hover:bg-cream/10 transition-all duration-300 rounded-btn cursor-pointer active:scale-98"
              >
                Our Story
              </button>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="absolute bottom-0 left-0 right-0 hero-fade-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Truck, title: 'Pan India Delivery', desc: 'Free shipping above ₹999' },
                { icon: Shield, title: 'Secure Checkout', desc: '100% safe payment' },
                { icon: Package, title: 'Premium Packaging', desc: 'Gift-ready every time' },
                { icon: Sparkles, title: 'Custom Crafted', desc: 'Made just for you' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3.5 text-cream">
                  <item.icon size={22} className="text-gold-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium tracking-wide">{item.title}</p>
                    <p className="text-xs text-cream/60 font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ GIFT COLLECTIONS ============ */}
      <section className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-gold-600 text-xs font-medium uppercase tracking-wider2 mb-3">Explore</p>
          <h2 className="font-display text-4xl sm:text-5xl text-walnut-900 dark:text-cream font-light">Gift Collections</h2>
          <div className="gold-divider-animated w-24 mx-auto mt-6" />
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate('shop', { category: cat.slug })}
                className="group relative aspect-[3/4.5] rounded-card overflow-hidden bg-cream dark:bg-walnut-800"
              >
                <img
                  src={cat.image_url || {
                    '3d-crystal-gifts': '/products/3d-crystal-gifts/6x6x10-3d-crystal-couple-image.webp',
                    'crystal-keychains': '/products/crystal-keychains/heart-crystal-keychain.webp',
                    'wooden-engraving': '/products/wooden-engraving/12x8-wooden-engraving-plaque.webp',
                    'acrylic-led': '/products/acrylic-led/6x8-acrylic-wood-frame-with-light.webp',
                    'moon-lamps': '/products/moon-lamps/3d-15-cm-moon-lamp.webp',
                    'mdf-decor': '/products/mdf-decor/mdf-custom-cutout-and-collage-collection.webp',
                  }[cat.slug] || '/products/3d-crystal-gifts/6x6x10-3d-crystal-couple-image.webp'}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/90 via-walnut-950/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                  <p className="text-cream font-display text-base leading-tight">{cat.name}</p>
                  <p className="text-cream/0 group-hover:text-gold-400 text-[10px] uppercase tracking-wider mt-1.5 transition-all duration-500">Shop Now</p>
                </div>
                <div className="absolute inset-0 border border-gold-400/0 group-hover:border-gold-400/40 transition-all duration-500 rounded-card" />
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ BEST SELLERS ============ */}
      <section className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex items-end justify-between mb-12">
          <div>
            <p className="text-gold-600 text-xs font-medium uppercase tracking-wider2 mb-3">Customer Favorites</p>
            <h2 className="font-display text-4xl sm:text-5xl text-walnut-900 dark:text-cream font-light">Best Sellers</h2>
          </div>
          <button
            onClick={() => navigate('shop')}
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-walnut-600 dark:text-cream/70 hover:text-gold-600 hover:gap-3 transition-all duration-300"
          >
            View All <ArrowRight size={16} />
          </button>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ OUR CRAFTSMANSHIP ============ */}
      <section className="py-28 bg-walnut-900 dark:bg-walnut-950 text-cream relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div className="relative">
                <div className="aspect-[4/5] rounded-card overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/19208268/pexels-photo-19208268.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000"
                    alt="Artisan engraving wood"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 border border-gold-500/30 rounded-card hidden sm:block" />
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div>
                <p className="text-gold-500 text-xs font-medium uppercase tracking-wider2 mb-3">Our Craftsmanship</p>
                <h2 className="font-display text-4xl sm:text-5xl text-cream mb-6 font-light leading-tight">
                  Where Precision<br />Meets Passion
                </h2>
                <p className="text-cream/70 leading-relaxed mb-8 font-light">
                  Every GALINEX creation begins with a memory and ends with a masterpiece. Our master artisans combine traditional craftsmanship with cutting-edge laser technology to capture your most precious moments in crystal, wood, and acrylic.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Scissors, text: 'Hand-finished by master artisans with 15+ years of experience' },
                    { icon: Gem, text: 'Premium-grade optical crystal and sustainably sourced materials' },
                    { icon: Award, text: 'Precision laser engraving with 0.1mm accuracy' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                        <item.icon size={16} className="text-gold-400" />
                      </div>
                      <p className="text-sm text-cream/80 pt-2 font-light leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('about')}
                  className="mt-10 inline-flex items-center gap-2 text-gold-500 text-sm font-medium tracking-wide hover:gap-4 transition-all duration-300"
                >
                  Discover Our Story <ArrowRight size={16} />
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ OUR PROCESS TIMELINE ============ */}
      <section className="py-28 bg-cream dark:bg-walnut-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <p className="text-gold-600 text-xs font-medium uppercase tracking-wider2 mb-3">How It Works</p>
            <h2 className="font-display text-4xl sm:text-5xl text-walnut-900 dark:text-cream font-light">Our Process</h2>
            <div className="gold-divider-animated w-24 mx-auto mt-6" />
          </Reveal>

          {/* Desktop timeline */}
          <div className="hidden lg:block relative">
            {/* Center line */}
            <div className="absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
            <div className="grid grid-cols-5 gap-6">
              {processSteps.map((step, i) => (
                <Reveal key={i} delay={i * 120}>
                  <div className="text-center group">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full border border-gold-400/30 group-hover:border-gold-500 transition-colors duration-500" />
                      <div className="absolute inset-2 rounded-full bg-ivory dark:bg-walnut-800 flex items-center justify-center group-hover:bg-gold-600 transition-colors duration-500">
                        <step.icon size={26} className="text-gold-600 group-hover:text-ivory transition-colors duration-500" />
                      </div>
                      <span className="absolute -top-1 -right-1 text-xs font-display text-gold-600 bg-ivory dark:bg-walnut-900 px-1.5">{step.num}</span>
                    </div>
                    <h3 className="font-display text-xl text-walnut-900 dark:text-cream mb-2">{step.title}</h3>
                    <p className="text-sm text-walnut-500 dark:text-beige-400 leading-relaxed font-light max-w-[200px] mx-auto">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Mobile timeline */}
          <div className="lg:hidden space-y-8">
            {processSteps.map((step, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <div className="absolute inset-0 rounded-full border border-gold-400/30" />
                      <div className="absolute inset-2 rounded-full bg-ivory dark:bg-walnut-800 flex items-center justify-center">
                        <step.icon size={22} className="text-gold-600" />
                      </div>
                    </div>
                    {i < processSteps.length - 1 && <div className="w-px flex-1 bg-gold-400/20 mt-3 min-h-[40px]" />}
                  </div>
                  <div className="pt-3 pb-2">
                    <span className="text-xs font-display text-gold-600">{step.num}</span>
                    <h3 className="font-display text-xl text-walnut-900 dark:text-cream mb-2">{step.title}</h3>
                    <p className="text-sm text-walnut-500 dark:text-beige-400 leading-relaxed font-light">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex items-end justify-between mb-12">
          <div>
            <p className="text-gold-600 text-xs font-medium uppercase tracking-wider2 mb-3">Handpicked</p>
            <h2 className="font-display text-4xl sm:text-5xl text-walnut-900 dark:text-cream font-light">Featured Collection</h2>
          </div>
          <button
            onClick={() => navigate('shop')}
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-walnut-600 dark:text-cream/70 hover:text-gold-600 hover:gap-3 transition-all duration-300"
          >
            View All <ArrowRight size={16} />
          </button>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ GIFT OCCASIONS ============ */}
      <section className="py-28 bg-cream dark:bg-walnut-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <p className="text-gold-600 text-xs font-medium uppercase tracking-wider2 mb-3">Find The Perfect Gift</p>
            <h2 className="font-display text-4xl sm:text-5xl text-walnut-900 dark:text-cream font-light">Gift Occasions</h2>
            <div className="gold-divider-animated w-24 mx-auto mt-6" />
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {occasions.map((occ, i) => (
              <Reveal key={i} delay={(i % 4) * 80}>
                <button
                  onClick={() => navigate('shop', { occasion: occ.label })}
                  className="group relative w-full aspect-[3/4] rounded-card overflow-hidden bg-walnut-800"
                >
                  <img
                    src={occ.img}
                    alt={occ.label}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/90 via-walnut-950/30 to-walnut-950/10" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                    <div className="w-11 h-11 rounded-full bg-gold-600/90 flex items-center justify-center mx-auto mb-3 group-hover:bg-gold-500 transition-colors duration-500">
                      <occ.icon size={20} className="text-ivory" />
                    </div>
                    <p className="text-cream font-display text-lg leading-tight">{occ.label}</p>
                    <p className="text-cream/0 group-hover:text-gold-400 text-[10px] uppercase tracking-wider mt-1.5 transition-all duration-500">Shop Now</p>
                  </div>
                  <div className="absolute inset-0 border border-gold-400/0 group-hover:border-gold-400/40 transition-all duration-500 rounded-card" />
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PREMIUM PACKAGING ============ */}
      <section className="py-28 bg-walnut-900 dark:bg-walnut-950 text-cream relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal className="order-2 lg:order-1">
              <div>
                <p className="text-gold-500 text-xs font-medium uppercase tracking-wider2 mb-3">Premium Packaging</p>
                <h2 className="font-display text-4xl sm:text-5xl text-cream mb-6 font-light leading-tight">
                  Every Gift,<br />Beautifully Presented
                </h2>
                <p className="text-cream/70 leading-relaxed mb-8 font-light">
                  We believe the unboxing experience should be as memorable as the gift itself. Each GALINEX creation is presented in premium packaging — elegant boxes, tissue wrapping, and a personalized note that makes every moment special.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {['Luxury Gift Box', 'Tissue Wrapping', 'Personalized Note', 'Ribbon Detail'].map(tag => (
                    <span key={tag} className="px-4 py-2 border border-gold-500/30 text-xs font-light tracking-wide rounded-btn">{tag}</span>
                  ))}
                </div>
                <button
                  onClick={() => navigate('gallery')}
                  className="inline-flex items-center gap-2 text-gold-500 text-sm font-medium tracking-wide hover:gap-4 transition-all duration-300"
                >
                  View Gallery <ArrowRight size={16} />
                </button>
              </div>
            </Reveal>
            <Reveal delay={150} className="order-1 lg:order-2">
              <div className="relative">
                <div className="aspect-square rounded-card overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/31496295/pexels-photo-31496295.jpeg?auto=compress&cs=tinysrgb&w=800&h=800"
                    alt="Premium gift packaging"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-6 -left-6 w-48 h-48 border border-gold-500/30 rounded-card hidden sm:block" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ NEW ARRIVALS ============ */}
      {newArrivals.length > 0 && (
        <section className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex items-end justify-between mb-12">
            <div>
              <p className="text-gold-600 text-xs font-medium uppercase tracking-wider2 mb-3">Fresh Arrivals</p>
              <h2 className="font-display text-4xl sm:text-5xl text-walnut-900 dark:text-cream font-light">New This Week</h2>
            </div>
            <button onClick={() => navigate('shop')} className="hidden sm:flex items-center gap-2 text-sm font-medium text-walnut-600 dark:text-cream/70 hover:text-gold-600 hover:gap-3 transition-all duration-300">
              View All <ArrowRight size={16} />
            </button>
          </Reveal>
          <Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {newArrivals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ============ WHY GALINEX ============ */}
      <section className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-gold-600 text-xs font-medium uppercase tracking-wider2 mb-3">Why GALINEX</p>
          <h2 className="font-display text-4xl sm:text-5xl text-walnut-900 dark:text-cream font-light">The GALINEX Difference</h2>
          <div className="gold-divider-animated w-24 mx-auto mt-6" />
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyGalinex.map((item, i) => (
            <Reveal key={i} delay={(i % 3) * 100}>
              <div className={`group p-8 border border-gold-200/30 dark:border-gold-900/20 hover:border-gold-400/50 dark:hover:border-gold-700/40 transition-all duration-500 rounded-card bg-ivory dark:bg-walnut-900 h-full ${i === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                <div className="w-14 h-14 rounded-full border border-gold-400/30 flex items-center justify-center mb-5 group-hover:bg-gold-600 transition-colors duration-500">
                  <item.icon size={22} className="text-gold-600 group-hover:text-ivory transition-colors duration-500" />
                </div>
                <h3 className="font-display text-2xl text-walnut-900 dark:text-cream mb-3">{item.title}</h3>
                <p className="text-sm text-walnut-500 dark:text-beige-400 leading-relaxed font-light">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CUSTOMER STORIES ============ */}
      <section className="py-28 bg-cream dark:bg-walnut-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <p className="text-gold-600 text-xs font-medium uppercase tracking-wider2 mb-3">Customer Stories</p>
            <h2 className="font-display text-4xl sm:text-5xl text-walnut-900 dark:text-cream font-light">What Our Customers Say</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((rev, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="bg-ivory dark:bg-walnut-800 p-8 border border-gold-200/30 dark:border-gold-900/20 rounded-card h-full">
                  <div className="flex gap-1 mb-5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} className={s <= rev.rating ? 'text-gold-500 fill-gold-500' : 'text-beige-300'} />
                    ))}
                  </div>
                  {rev.title && <h4 className="font-display text-xl text-walnut-900 dark:text-cream mb-3">{rev.title}</h4>}
                  <p className="text-sm text-walnut-600 dark:text-beige-300 leading-relaxed mb-6 font-light italic">"{rev.body}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gold-200/30 dark:border-gold-900/20">
                    <div className="w-11 h-11 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center text-gold-600 font-display text-lg">
                      {rev.reviewer_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-walnut-900 dark:text-cream">{rev.reviewer_name}</p>
                      <p className="text-xs text-walnut-400 font-light">{rev.reviewer_location}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INSTAGRAM GALLERY ============ */}
      <section className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <p className="text-gold-600 text-xs font-medium uppercase tracking-wider2 mb-3">@galinex</p>
          <h2 className="font-display text-4xl sm:text-5xl text-walnut-900 dark:text-cream font-light">Follow Our Journey</h2>
          <p className="text-sm text-walnut-500 mt-3 font-light">Tag us in your unboxing moments for a chance to be featured.</p>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'https://images.pexels.com/photos/6127875/pexels-photo-6127875.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
              'https://images.pexels.com/photos/3976458/pexels-photo-3976458.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
              'https://images.pexels.com/photos/9838131/pexels-photo-9838131.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
              'https://images.pexels.com/photos/17108551/pexels-photo-17108551.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
            ].map((src, i) => (
              <a key={i} href="https://instagram.com/galinex" target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-card">
                <img src={src} alt={`Instagram ${i + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-walnut-950/0 group-hover:bg-walnut-950/40 transition-colors duration-500 flex items-center justify-center">
                  <Instagram size={28} className="text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="font-display text-4xl sm:text-5xl text-walnut-900 dark:text-cream mb-5 font-light">Ready to Create Something Beautiful?</h2>
          <p className="text-walnut-500 dark:text-beige-400 mb-10 max-w-xl mx-auto font-light leading-relaxed">
            Join thousands of happy customers who've turned their memories into timeless gifts.
          </p>
          <button
            onClick={() => navigate('shop')}
            className="px-12 py-4 bg-walnut-900 dark:bg-cream text-ivory dark:text-walnut-900 font-medium text-sm tracking-wide inline-flex items-center gap-2.5 hover:bg-gold-600 dark:hover:bg-gold-500 dark:hover:text-ivory transition-all duration-500 hover:shadow-[0_15px_40px_-10px_rgba(176,141,87,0.4)] rounded-btn btn-shimmer"
          >
            Start Shopping <ChevronRight size={18} />
          </button>
        </Reveal>
      </section>
    </div>
  );
}
