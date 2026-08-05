import { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Sparkles, Camera, Package, Heart } from 'lucide-react';
import { useStore } from '@/store/StoreContext';

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
  span?: boolean;
}

const GALLERY: GalleryImage[] = [
  { src: '/images/gallery/photo_6300965092413084536_w.jpg', alt: 'GALINEX personalized crystal keepsake', category: 'Products', span: true },
  { src: '/images/gallery/photo_6300965092413084537_y.jpg', alt: 'GALINEX engraved wood photo frame', category: 'Products' },
  { src: 'https://images.pexels.com/photos/3856052/pexels-photo-3856052.jpeg?auto=compress&cs=tinysrgb&w=900', alt: 'Crystal photo gift with light reflection', category: 'Products' },
  { src: 'https://images.pexels.com/photos/7109995/pexels-photo-7109995.jpeg?auto=compress&cs=tinysrgb&w=900', alt: 'Artisan hands planing wood in workshop', category: 'Workshop', span: true },
  { src: 'https://images.pexels.com/photos/4452519/pexels-photo-4452519.jpeg?auto=compress&cs=tinysrgb&w=900', alt: 'Close-up of leather crafting hands', category: 'Workshop' },
  { src: 'https://images.pexels.com/photos/6611179/pexels-photo-6611179.jpeg?auto=compress&cs=tinysrgb&w=900', alt: 'Craftsman operating workshop machine', category: 'Crafting' },
  { src: 'https://images.pexels.com/photos/9145541/pexels-photo-9145541.jpeg?auto=compress&cs=tinysrgb&w=900', alt: 'Potter hands shaping clay on wheel', category: 'Crafting' },
  { src: 'https://images.pexels.com/photos/749344/pexels-photo-749344.jpeg?auto=compress&cs=tinysrgb&w=900', alt: 'Luxury gold gift box with ribbon', category: 'Packaging', span: true },
  { src: 'https://images.pexels.com/photos/3373176/pexels-photo-3373176.jpeg?auto=compress&cs=tinysrgb&w=900', alt: 'Stack of gold and white wrapped gifts', category: 'Packaging' },
  { src: 'https://images.pexels.com/photos/6699470/pexels-photo-6699470.jpeg?auto=compress&cs=tinysrgb&w=900', alt: 'Woman opening a gift box with ribbon', category: 'Lifestyle' },
  { src: 'https://images.pexels.com/photos/27086364/pexels-photo-27086364.jpeg?auto=compress&cs=tinysrgb&w=900', alt: 'Woman in red dress opening Christmas gift', category: 'Lifestyle', span: true },
  { src: 'https://images.pexels.com/photos/9451132/pexels-photo-9451132.jpeg?auto=compress&cs=tinysrgb&w=900', alt: 'Happy couple looking at Polaroid photos', category: 'Moments' },
  { src: 'https://images.pexels.com/photos/27087041/pexels-photo-27087041.jpeg?auto=compress&cs=tinysrgb&w=900', alt: 'Joyful couple exchanging gifts', category: 'Moments' },
];

const FILTERS = ['All', 'Products', 'Workshop', 'Crafting', 'Packaging', 'Lifestyle', 'Moments'];

export default function GalleryPage() {
  const { navigate } = useStore();
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const images = filter === 'All' ? GALLERY : GALLERY.filter((g) => g.category === filter);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const nextImage = useCallback(() => {
    setLightbox((prev) => (prev === null ? prev : (prev + 1) % images.length));
  }, [images.length]);
  const prevImage = useCallback(() => {
    setLightbox((prev) => (prev === null ? prev : (prev - 1 + images.length) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [lightbox, closeLightbox, nextImage, prevImage]);

  return (
    <div className="min-h-screen bg-ivory dark:bg-walnut-950">
      {/* Hero */}
      <section className="relative py-20 bg-walnut-900 text-ivory overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-champagne-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-champagne-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-champagne-600/20 border border-champagne-500/30 text-champagne-200 text-xs font-medium mb-6">
            <Camera size={14} /> Visual Showcase
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            The <span className="bg-gradient-to-r from-champagne-400 to-champagne-200 bg-clip-text text-transparent">Gallery</span>
          </h1>
          <p className="text-beige-300 max-w-2xl mx-auto">
            A glimpse into our craft, our workshop, and the moments our gifts help create.
          </p>
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-6">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Filter pills */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-champagne-600 text-ivory shadow-md shadow-champagne-500/20'
                  : 'bg-ivory dark:bg-walnut-900 text-walnut-700 dark:text-beige-300 border border-champagne-200 dark:border-champagne-900/50 hover:border-champagne-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Masonry-style grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] sm:auto-rows-[240px] gap-3">
          {images.map((img, i) => (
            <button
              key={img.src + i}
              onClick={() => setLightbox(i)}
              className={`group relative overflow-hidden rounded-card bg-cream dark:bg-walnut-800 border border-champagne-200 dark:border-champagne-900/50 hover:border-champagne-500 transition-all duration-500 ${img.span ? 'row-span-2 col-span-2' : ''}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/824205/pexels-photo-824205.jpeg?auto=compress&cs=tinysrgb&w=900';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="inline-block px-2 py-0.5 rounded-full bg-champagne-600/90 text-ivory text-xs font-medium mb-1">
                  {img.category}
                </span>
                <p className="text-ivory text-sm font-medium line-clamp-1">{img.alt}</p>
              </div>
              <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ivory/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ZoomIn size={16} className="text-ivory" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Workshop section */}
      <section className="py-16 bg-walnut-900 text-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-card overflow-hidden aspect-[4/3] border border-champagne-700/30">
            <img
              src="https://images.pexels.com/photos/37358118/pexels-photo-37358118.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="GALINEX workshop"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-champagne-400 text-sm font-semibold uppercase tracking-wider mb-2">Inside Our Workshop</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Where Every Story Begins</h2>
            <p className="text-beige-300 leading-relaxed mb-6">
              Step inside our Mumbai workshop where master artisans transform raw crystal, wood, and acrylic
              into personalized masterpieces. Every piece is laser-engraved with precision, hand-finished with
              care, and inspected to meet our exacting standards.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Laser engraving', 'Hand finishing', '5-point inspection'].map((t, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-ivory/10 border border-champagne-400/30 text-sm font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Crafting process strip */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-champagne-600 dark:text-champagne-400 text-sm font-semibold uppercase tracking-wider mb-2">Crafting Process</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-walnut-900 dark:text-ivory">From Raw Material To Keepsake</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { img: 'https://images.pexels.com/photos/7109995/pexels-photo-7109995.jpeg?auto=compress&cs=tinysrgb&w=600', label: '01 · Selecting Materials' },
            { img: 'https://images.pexels.com/photos/6611179/pexels-photo-6611179.jpeg?auto=compress&cs=tinysrgb&w=600', label: '02 · Precision Engraving' },
            { img: 'https://images.pexels.com/photos/4452519/pexels-photo-4452519.jpeg?auto=compress&cs=tinysrgb&w=600', label: '03 · Hand Finishing' },
            { img: 'https://images.pexels.com/photos/749344/pexels-photo-749344.jpeg?auto=compress&cs=tinysrgb&w=600', label: '04 · Luxury Packaging' },
          ].map((s, i) => (
            <div key={i} className="group relative rounded-card overflow-hidden aspect-[4/5] border border-champagne-200 dark:border-champagne-900/50 hover:border-champagne-500 transition-colors">
              <img src={s.img} alt={s.label} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/70 to-transparent" />
              <p className="absolute bottom-0 left-0 right-0 p-4 text-ivory font-semibold text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Packaging highlight */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-card overflow-hidden bg-gradient-to-br from-walnut-800 via-champagne-700 to-walnut-900 p-8 sm:p-12 border border-champagne-700/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-champagne-400/20 rounded-full blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Package size={36} className="text-ivory mb-4" />
              <h2 className="font-display text-3xl font-bold text-ivory mb-4">Signature Packaging</h2>
              <p className="text-ivory/85 leading-relaxed mb-6">
                Every GALINEX gift is presented in our signature luxury box — a satin-tied experience
                that makes unboxing as memorable as the gift itself.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['https://images.pexels.com/photos/749344/pexels-photo-749344.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/3373176/pexels-photo-3373176.jpeg?auto=compress&cs=tinysrgb&w=600'].map((src, i) => (
                <div key={i} className="rounded-card overflow-hidden aspect-square border border-champagne-400/30">
                  <img src={src} alt="Premium packaging" loading="lazy" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Heart size={32} className="mx-auto text-champagne-600 dark:text-champagne-400 mb-4" />
        <h2 className="font-display text-3xl font-bold text-walnut-900 dark:text-ivory mb-4">Create Your Own Gallery Moment</h2>
        <p className="text-walnut-600 dark:text-beige-400 mb-8 max-w-xl mx-auto">Browse our collection and craft a gift worth photographing.</p>
        <button
          onClick={() => navigate('shop')}
          className="px-10 py-4 rounded-full bg-champagne-600 hover:bg-champagne-500 text-ivory font-semibold inline-flex items-center gap-2 transition-all hover:scale-105 hover:shadow-xl hover:shadow-champagne-500/30"
        >
          <Sparkles size={18} /> Shop Collection
        </button>
      </section>

      {/* Lightbox */}
      {lightbox !== null && images[lightbox] && (
        <div
          className="fixed inset-0 z-50 bg-walnut-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-4 right-4 w-11 h-11 rounded-full bg-ivory/10 hover:bg-ivory/20 flex items-center justify-center text-ivory transition-colors" aria-label="Close">
            <X size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-2 sm:left-6 w-11 h-11 rounded-full bg-ivory/10 hover:bg-ivory/20 flex items-center justify-center text-ivory transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>
          <figure className="max-w-5xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img src={images[lightbox].src} alt={images[lightbox].alt} className="max-w-full max-h-[78vh] object-contain rounded-card" />
            <figcaption className="mt-4 text-center text-ivory">
              <span className="inline-block px-3 py-1 rounded-full bg-champagne-600/90 text-ivory text-xs font-medium mr-2">{images[lightbox].category}</span>
              <span className="text-sm text-ivory/80">{images[lightbox].alt}</span>
            </figcaption>
          </figure>
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-2 sm:right-6 w-11 h-11 rounded-full bg-ivory/10 hover:bg-ivory/20 flex items-center justify-center text-ivory transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
