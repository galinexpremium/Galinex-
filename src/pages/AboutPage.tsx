import { useState } from 'react';
import {
  Sparkles, Award, Heart, Eye, Gem, Package, Shield, Truck,
  Clock, Users, Leaf, Star, ArrowRight, ChevronRight,
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';

export default function AboutPage() {
  const { navigate } = useStore();
  const [activeStep, setActiveStep] = useState(0);

  const processSteps = [
    { icon: Gem, title: 'Choose Your Gift', desc: 'Browse our curated collection of premium personalized gifts and select the perfect piece for your loved one.' },
    { icon: Sparkles, title: 'Personalize It', desc: 'Upload your favorite photo and add custom text. Our designers review every detail for perfection.' },
    { icon: Award, title: 'Crafted With Precision', desc: 'Our master artisans laser-engrave your design using state-of-the-art technology and time-honored techniques.' },
    { icon: Package, title: 'Premium Delivery', desc: 'Your finished gift is carefully packaged in our signature luxury box and delivered to your doorstep.' },
  ];

  const features = [
    { icon: Award, title: 'Master Craftsmanship', desc: 'Every piece is crafted by skilled artisans with 10+ years of experience in precision engraving.' },
    { icon: Gem, title: 'Premium Materials', desc: 'We use only the finest crystal, wood, and acrylic sourced from trusted suppliers worldwide.' },
    { icon: Package, title: 'Luxury Packaging', desc: 'Each gift arrives in our signature gift-ready box with a personalized note card included.' },
    { icon: Shield, title: 'Quality Guarantee', desc: 'Not perfect? We will remake it free of charge. Your satisfaction is our promise.' },
    { icon: Truck, title: 'Fast & Safe Shipping', desc: 'Free insured shipping on orders above ₹999. Delivered across India in 5-7 business days.' },
    { icon: Heart, title: 'Made With Love', desc: 'Every gift carries a piece of your story. We treat each order as if it were our own.' },
  ];

  return (
    <div className="min-h-screen bg-ivory dark:bg-walnut-950">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/824205/pexels-photo-824205.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="GALINEX premium personalized gifts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-walnut-950/50 via-walnut-950/40 to-walnut-950/70" />
        </div>
        <div className="relative h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ivory/10 backdrop-blur-md border border-champagne-400/30 text-champagne-200 text-xs font-medium mb-6">
            <Sparkles size={14} /> Est. 2021 · Mumbai, India
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ivory leading-tight mb-4">
            The <span className="bg-gradient-to-r from-champagne-400 to-champagne-200 bg-clip-text text-transparent">GALINEX</span> Story
          </h1>
          <p className="text-lg text-ivory/85 max-w-2xl leading-relaxed">
            Crafting memories into timeless keepsakes. Every gift tells a story — yours.
          </p>
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-6">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Story / Mission / Vision */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {[
            { icon: Heart, label: 'Our Story', title: 'Born From A Love Of Craft', body: 'GALINEX began in a small Mumbai workshop in 2021, founded by a duo passionate about blending technology with traditional craftsmanship. What started as a passion project — engraving a single photo onto crystal for a friend — has grown into India’s trusted name for premium personalized gifts.' },
            { icon: Eye, label: 'Our Vision', title: 'Every Memory, Preserved', body: 'We envision a world where every cherished memory can be transformed into a tangible, lasting keepsake. Our goal is to make premium personalized gifting accessible, meaningful, and unforgettable — one story at a time.' },
            { icon: Sparkles, label: 'Our Mission', title: 'Craft Joy, Deliver Delight', body: 'Our mission is to craft joy. We combine precision laser technology, premium materials, and human artistry to deliver gifts that make people feel truly special — gifts that are kept, displayed, and treasured for a lifetime.' },
          ].map((c, i) => (
            <article key={i} className="bg-ivory dark:bg-walnut-900 rounded-card p-8 shadow-sm border border-champagne-200 dark:border-champagne-900/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-card bg-champagne-100 dark:bg-champagne-900/30 flex items-center justify-center mb-5">
                <c.icon size={26} className="text-champagne-600 dark:text-champagne-400" />
              </div>
              <p className="text-champagne-600 dark:text-champagne-400 text-xs font-semibold uppercase tracking-wider mb-2">{c.label}</p>
              <h2 className="font-display text-xl font-bold text-walnut-900 dark:text-ivory mb-3">{c.title}</h2>
              <p className="text-sm text-walnut-600 dark:text-beige-400 leading-relaxed">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Craftsmanship */}
      <section className="py-20 bg-walnut-900 text-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-champagne-400 text-sm font-semibold uppercase tracking-wider mb-2">Craftsmanship</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">Where Technology Meets Tradition</h2>
            <p className="text-beige-300 leading-relaxed mb-6">
              Every GALINEX piece is a marriage of precision engineering and human artistry. Our master artisans
              operate state-of-the-art laser engraving systems, yet each finished piece is hand-inspected,
              hand-polished, and hand-packaged. We believe technology should enhance craft, not replace it.
            </p>
            <ul className="space-y-3">
              {['Precision laser engraving to 0.01mm accuracy', 'Hand-finished by master artisans', 'Premium grade-A crystal, wood & acrylic', 'Rigorous 5-point quality inspection'].map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-beige-200">
                  <span className="w-6 h-6 rounded-full bg-champagne-600/20 border border-champagne-500/40 flex items-center justify-center flex-shrink-0">
                    <Star size={12} className="text-champagne-400 fill-champagne-400" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-card overflow-hidden aspect-[4/3]">
            <img
              src="https://images.pexels.com/photos/4452519/pexels-photo-4452519.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Artisan crafting a personalized gift"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Our Process */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-champagne-600 dark:text-champagne-400 text-sm font-semibold uppercase tracking-wider mb-2">How It Works</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-walnut-900 dark:text-ivory">Our 4-Step Process</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {processSteps.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`text-left p-6 rounded-card border transition-all duration-300 ${
                activeStep === i
                  ? 'bg-champagne-600 text-ivory border-champagne-600 shadow-lg shadow-champagne-500/20 -translate-y-1'
                  : 'bg-ivory dark:bg-walnut-900 border-champagne-200 dark:border-champagne-900/50 hover:border-champagne-400'
              }`}
            >
              <div className={`w-14 h-14 rounded-card flex items-center justify-center mb-4 transition-colors ${
                activeStep === i ? 'bg-ivory/20' : 'bg-champagne-100 dark:bg-champagne-900/30'
              }`}>
                <step.icon size={26} className={activeStep === i ? 'text-ivory' : 'text-champagne-600 dark:text-champagne-400'} />
              </div>
              <p className={`text-xs font-bold mb-1 ${activeStep === i ? 'text-champagne-200' : 'text-champagne-600 dark:text-champagne-400'}`}>
                STEP {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className={`font-display text-lg font-semibold mb-2 ${activeStep === i ? 'text-ivory' : 'text-walnut-900 dark:text-ivory'}`}>
                {step.title}
              </h3>
              <p className={`text-sm leading-relaxed ${activeStep === i ? 'text-ivory/90' : 'text-walnut-600 dark:text-beige-400'}`}>
                {step.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Premium Packaging */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-card overflow-hidden bg-gradient-to-br from-walnut-800 via-walnut-700 to-walnut-900 p-8 sm:p-12 lg:p-16 border border-champagne-700/30">
          <div className="absolute top-0 right-0 w-72 h-72 bg-champagne-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-champagne-300/20 rounded-full blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-champagne-200 text-sm font-semibold uppercase tracking-wider mb-3">Premium Packaging</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory mb-4">Unboxing Is An Experience</h2>
              <p className="text-ivory/85 leading-relaxed mb-6">
                Every GALINEX gift arrives in our signature luxury gift box — complete with a satin ribbon,
                protective foam insert, and a handwritten-style note card. The unboxing moment should feel
                as special as the gift inside.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Signature gift box', 'Satin ribbon tie', 'Personalized note card', 'Protective foam insert'].map((t, i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-ivory/15 backdrop-blur-sm text-ivory text-sm font-medium border border-champagne-400/30">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative rounded-card overflow-hidden aspect-[4/3]">
              <img
                src="https://images.pexels.com/photos/3373176/pexels-photo-3373176.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Premium GALINEX gift packaging"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Why Choose GALINEX */}
      <section className="py-20 bg-cream dark:bg-walnut-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-champagne-600 dark:text-champagne-400 text-sm font-semibold uppercase tracking-wider mb-2">Why GALINEX</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-walnut-900 dark:text-ivory">Six Reasons To Choose Us</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-ivory dark:bg-walnut-800 rounded-card p-6 border border-champagne-200 dark:border-champagne-900/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-card bg-champagne-100 dark:bg-champagne-900/30 flex items-center justify-center mb-4">
                  <f.icon size={24} className="text-champagne-600 dark:text-champagne-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-walnut-900 dark:text-ivory mb-2">{f.title}</h3>
                <p className="text-sm text-walnut-600 dark:text-beige-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Stats */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, value: '50,000+', label: 'Happy Customers' },
            { icon: Gem, value: '1,200+', label: 'Designs Crafted' },
            { icon: Star, value: '4.9/5', label: 'Average Rating' },
            { icon: Clock, value: '5-7 Days', label: 'Delivery Time' },
          ].map((s, i) => (
            <div key={i} className="p-6">
              <s.icon size={28} className="mx-auto text-champagne-600 dark:text-champagne-400 mb-3" />
              <p className="font-display text-3xl font-bold text-walnut-900 dark:text-ivory">{s.value}</p>
              <p className="text-sm text-walnut-500 dark:text-beige-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* CTA */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-walnut-900 dark:text-ivory mb-4">Ready To Create Something Beautiful?</h2>
          <p className="text-walnut-600 dark:text-beige-400 mb-8 max-w-xl mx-auto">
            Join thousands of happy customers who have turned their memories into timeless gifts.
          </p>
          <button
            onClick={() => navigate('shop')}
            className="px-10 py-4 rounded-full bg-champagne-600 hover:bg-champagne-500 text-ivory font-semibold inline-flex items-center gap-2 transition-all hover:scale-105 hover:shadow-xl hover:shadow-champagne-500/30"
          >
            Start Shopping <ChevronRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
