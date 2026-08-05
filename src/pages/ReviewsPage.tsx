import { useEffect, useState, useMemo } from 'react';
import { Star, BadgeCheck, MessageSquare, ThumbsUp, Filter, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Review } from '@/types';

const SAMPLE_REVIEWS: Review[] = [
  { id: 's1', product_id: null, reviewer_name: 'Priya Sharma', reviewer_location: 'Mumbai, MH', rating: 5, title: 'Absolutely stunning!', body: 'The crystal photo came out even better than I imagined. The engraving is so detailed and the packaging felt luxurious. My mom cried happy tears on her birthday. Will order again!', is_verified: true, is_sample: true, is_approved: true, helpful_count: 42, created_at: '2024-09-15T10:00:00Z' },
  { id: 's2', product_id: null, reviewer_name: 'Rahul Verma', reviewer_location: 'Delhi, DL', rating: 5, title: 'Perfect anniversary gift', body: 'Got the wooden photo frame engraved with our wedding date. The craftsmanship is top-notch and delivery was faster than expected. Highly recommend GALINEX for special occasions.', is_verified: true, is_sample: true, is_approved: true, helpful_count: 38, created_at: '2024-09-10T10:00:00Z' },
  { id: 's3', product_id: null, reviewer_name: 'Ananya Iyer', reviewer_location: 'Bangalore, KA', rating: 4, title: 'Great quality, slight delay', body: 'The acrylic photo block is beautiful and the engraving is crisp. Took a day longer than promised but the team kept me updated via WhatsApp. The product itself is worth the wait.', is_verified: true, is_sample: true, is_approved: true, helpful_count: 21, created_at: '2024-09-05T10:00:00Z' },
  { id: 's4', product_id: null, reviewer_name: 'Karan Mehta', reviewer_location: 'Pune, MH', rating: 5, title: 'Impressed with the detail', body: 'Ordered a personalized crystal cube for my brother. The 3D engraving inside the crystal is mind-blowing. Comes with a LED base which makes it look premium. Five stars!', is_verified: true, is_sample: true, is_approved: true, helpful_count: 35, created_at: '2024-08-28T10:00:00Z' },
  { id: 's5', product_id: null, reviewer_name: 'Sneha Reddy', reviewer_location: 'Hyderabad, TS', rating: 5, title: 'Best personalized gift store', body: 'This is my third order from GALINEX and they never disappoint. The photo quality on the wooden plaque is sharp and the colors are true to the original. Customer for life.', is_verified: true, is_sample: true, is_approved: true, helpful_count: 29, created_at: '2024-08-20T10:00:00Z' },
  { id: 's6', product_id: null, reviewer_name: 'Vikram Singh', reviewer_location: 'Jaipur, RJ', rating: 4, title: 'Good but pricey', body: 'The engraved keychain is well-made and the personalization is accurate. A bit on the expensive side but the quality justifies it. Would have liked more font options.', is_verified: true, is_sample: true, is_approved: true, helpful_count: 14, created_at: '2024-08-12T10:00:00Z' },
  { id: 's7', product_id: null, reviewer_name: 'Meera Nair', reviewer_location: 'Kochi, KL', rating: 5, title: 'Exceeded expectations', body: 'The LED crystal night lamp with our family photo is now the centerpiece of our living room. Everyone who visits asks where I got it made. Truly a premium product.', is_verified: true, is_sample: true, is_approved: true, helpful_count: 47, created_at: '2024-08-05T10:00:00Z' },
  { id: 's8', product_id: null, reviewer_name: 'Arjun Kapoor', reviewer_location: 'Chandigarh, CH', rating: 5, title: 'Fantastic service', body: 'Ordered a custom plaque for my coach. The team sent a design preview on WhatsApp before production and even fixed a typo I had missed. Professional and caring service.', is_verified: true, is_sample: true, is_approved: true, helpful_count: 31, created_at: '2024-07-28T10:00:00Z' },
  { id: 's9', product_id: null, reviewer_name: 'Divya Patel', reviewer_location: 'Ahmedabad, GJ', rating: 4, title: 'Beautiful keepsake', body: 'The photo engraving on the wooden clock is lovely and works perfectly. The only small issue was the gift box had a minor scratch but the product inside was flawless.', is_verified: true, is_sample: true, is_approved: true, helpful_count: 18, created_at: '2024-07-20T10:00:00Z' },
];

const FILTERS = [
  { label: 'All', value: 0 },
  { label: '5 Stars', value: 5 },
  { label: '4 Stars', value: 4 },
  { label: '3 Stars', value: 3 },
  { label: '2 Stars', value: 2 },
  { label: '1 Star', value: 1 },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(0);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && data && data.length > 0) {
          setReviews(data as Review[]);
        } else {
          setReviews(SAMPLE_REVIEWS);
        }
      } catch {
        setReviews(SAMPLE_REVIEWS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(
    () => (filter === 0 ? reviews : reviews.filter((r) => r.rating === filter)),
    [reviews, filter]
  );

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const totalReviews = reviews.length;
  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { if (counts[r.rating] !== undefined) counts[r.rating]++; });
    return counts;
  }, [reviews]);
  const hasSamples = reviews.some((r) => r.is_sample);

  const toggleHelpful = (id: string) => {
    setHelpfulIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-ivory dark:bg-walnut-950">
      {/* Hero */}
      <section className="relative py-20 bg-walnut-900 text-ivory overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-champagne-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-champagne-600/20 border border-champagne-500/30 text-champagne-200 text-xs font-medium mb-6">
            <MessageSquare size={14} /> Customer Reviews
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            What Our <span className="bg-gradient-to-r from-champagne-400 to-champagne-200 bg-clip-text text-transparent">Customers Say</span>
          </h1>
          <p className="text-beige-300 max-w-2xl mx-auto">
            Real stories from people who turned their memories into GALINEX keepsakes.
          </p>
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-6">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Overall rating */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-ivory dark:bg-walnut-900 rounded-card p-8 shadow-sm border border-champagne-200 dark:border-champagne-900/50">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <span className="font-display text-5xl font-bold text-walnut-900 dark:text-ivory">{avgRating.toFixed(1)}</span>
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={18} className={s <= Math.round(avgRating) ? 'text-champagne-500 fill-champagne-500' : 'text-beige-300'} />
                    ))}
                  </div>
                  <p className="text-sm text-walnut-500 dark:text-beige-400">Based on {totalReviews} reviews</p>
                </div>
              </div>
              {hasSamples && (
                <p className="text-xs text-champagne-600 dark:text-champagne-400 mt-2 flex items-center gap-1.5 justify-center md:justify-start">
                  <Sparkles size={12} /> Showing sample reviews until verified reviews are added
                </p>
              )}
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const pct = totalReviews > 0 ? (ratingCounts[star] / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-walnut-600 dark:text-beige-400 w-16 flex items-center gap-1">
                      {star} <Star size={12} className="text-champagne-500 fill-champagne-500" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-cream dark:bg-walnut-800 overflow-hidden">
                      <div className="h-full bg-champagne-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm text-walnut-500 dark:text-beige-400 w-8 text-right">{ratingCounts[star]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-walnut-700 dark:text-beige-300 mr-2">
            <Filter size={16} /> Filter:
          </span>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f.value
                  ? 'bg-champagne-600 text-ivory shadow-md shadow-champagne-500/20'
                  : 'bg-ivory dark:bg-walnut-900 text-walnut-700 dark:text-beige-300 border border-champagne-200 dark:border-champagne-900/50 hover:border-champagne-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Reviews grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-ivory dark:bg-walnut-900 rounded-card p-6 border border-champagne-200 dark:border-champagne-900/50 animate-pulse">
                <div className="h-4 bg-cream dark:bg-walnut-800 rounded w-2/3 mb-4" />
                <div className="h-3 bg-cream dark:bg-walnut-800 rounded w-full mb-2" />
                <div className="h-3 bg-cream dark:bg-walnut-800 rounded w-5/6 mb-4" />
                <div className="h-8 w-8 bg-cream dark:bg-walnut-800 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-walnut-500 dark:text-beige-400 py-12">No reviews match this filter.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((rev) => (
              <article key={rev.id} className="bg-ivory dark:bg-walnut-900 rounded-card p-6 shadow-sm border border-champagne-200 dark:border-champagne-900/50 hover:shadow-lg hover:-translate-y-1 hover:border-champagne-400 transition-all duration-300 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={15} className={s <= rev.rating ? 'text-champagne-500 fill-champagne-500' : 'text-beige-300'} />
                    ))}
                  </div>
                  {rev.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-champagne-600 dark:text-champagne-400 font-medium">
                      <BadgeCheck size={14} /> Verified
                    </span>
                  )}
                </div>
                {rev.title && <h3 className="font-display font-semibold text-lg text-walnut-900 dark:text-ivory mb-2">{rev.title}</h3>}
                <p className="text-sm text-walnut-600 dark:text-beige-400 leading-relaxed mb-4 flex-1">"{rev.body}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-champagne-100 dark:border-champagne-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-champagne-100 dark:bg-champagne-900/30 flex items-center justify-center text-champagne-600 dark:text-champagne-400 font-bold text-sm">
                      {rev.reviewer_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-walnut-900 dark:text-ivory">{rev.reviewer_name}</p>
                      {rev.reviewer_location && <p className="text-xs text-walnut-500">{rev.reviewer_location}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleHelpful(rev.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                      helpfulIds.has(rev.id) ? 'text-champagne-600 dark:text-champagne-400' : 'text-walnut-400 hover:text-champagne-600'
                    }`}
                  >
                    <ThumbsUp size={14} className={helpfulIds.has(rev.id) ? 'fill-champagne-400 text-champagne-500' : ''} />
                    {(rev.helpful_count ?? 0) + (helpfulIds.has(rev.id) ? 1 : 0)}
                  </button>
                </div>
                {rev.is_sample && (
                  <p className="mt-3 text-xs text-champagne-600 dark:text-champagne-400 flex items-center gap-1">
                    <Sparkles size={11} /> Sample review
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
