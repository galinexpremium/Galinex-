import { useState, type FormEvent } from 'react';
import {
  Phone, MessageCircle, Instagram, Mail, MapPin, Clock,
  Send, CheckCircle, Loader2, Sparkles, ChevronRight,
} from 'lucide-react';
import { supabase, BRAND_PHONE, BRAND_EMAIL, BRAND_INSTAGRAM, BRAND_ADDRESS, BUSINESS_HOURS, WHATSAPP_NUMBER } from '@/lib/supabase';

interface ContactMethod {
  icon: typeof Phone;
  label: string;
  value: string;
  href: string;
  desc: string;
}

const CONTACT_METHODS: ContactMethod[] = [
  { icon: Phone, label: 'Phone', value: BRAND_PHONE, href: `tel:${BRAND_PHONE.replace(/\s/g, '')}`, desc: 'Mon–Sat, 10 AM – 7 PM' },
  { icon: MessageCircle, label: 'WhatsApp', value: `+${WHATSAPP_NUMBER}`, href: `https://wa.me/${WHATSAPP_NUMBER}`, desc: 'Fastest response' },
  { icon: Instagram, label: 'Instagram', value: '@galinex', href: BRAND_INSTAGRAM, desc: 'DM us anytime' },
  { icon: Mail, label: 'Email', value: BRAND_EMAIL, href: `mailto:${BRAND_EMAIL}`, desc: 'We reply within 24 hours' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error');
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        message: form.message.trim(),
      });
      if (error) throw error;
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again or WhatsApp us directly.');
    }
  };

  return (
    <div className="min-h-screen bg-ivory dark:bg-walnut-950">
      {/* Hero */}
      <section className="relative py-20 bg-walnut-900 text-ivory overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-champagne-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-champagne-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-champagne-600/20 border border-champagne-500/30 text-champagne-200 text-xs font-medium mb-6">
            <Sparkles size={14} /> We Are Here To Help
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Get In <span className="bg-gradient-to-r from-champagne-400 to-champagne-200 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-beige-300 max-w-2xl mx-auto">
            Questions about an order, a custom design, or a bulk inquiry? Reach out — we usually respond within a few hours.
          </p>
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-6">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Contact method cards */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_METHODS.map((m, i) => (
            <a
              key={i}
              href={m.href}
              target={m.href.startsWith('http') ? '_blank' : undefined}
              rel={m.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group bg-ivory dark:bg-walnut-900 rounded-card p-6 border border-champagne-200 dark:border-champagne-900/50 hover:shadow-lg hover:-translate-y-1 hover:border-champagne-400 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-card bg-champagne-100 dark:bg-champagne-900/30 flex items-center justify-center mb-4 group-hover:bg-champagne-600 transition-colors">
                <m.icon size={22} className="text-champagne-600 dark:text-champagne-400 group-hover:text-ivory transition-colors" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-champagne-600 dark:text-champagne-400 mb-1">{m.label}</p>
              <p className="font-display font-semibold text-walnut-900 dark:text-ivory mb-1">{m.value}</p>
              <p className="text-xs text-walnut-500 dark:text-beige-400">{m.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Gold divider */}
      <div className="flex justify-center py-2">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-champagne-400 to-transparent" />
      </div>

      {/* Form + info */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-ivory dark:bg-walnut-900 rounded-card p-8 shadow-sm border border-champagne-200 dark:border-champagne-900/50">
            <h2 className="font-display text-2xl font-bold text-walnut-900 dark:text-ivory mb-2">Send Us A Message</h2>
            <p className="text-sm text-walnut-500 dark:text-beige-400 mb-6">Fill out the form and we will get back to you shortly.</p>

            {status === 'success' ? (
              <div className="text-center py-10">
                <CheckCircle size={56} className="mx-auto text-champagne-500 mb-4" />
                <h3 className="font-display text-xl font-bold text-walnut-900 dark:text-ivory mb-2">Message Sent!</h3>
                <p className="text-sm text-walnut-500 dark:text-beige-400 mb-6">Thank you for reaching out. We will respond within 24 hours.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-6 py-3 rounded-full bg-champagne-600 hover:bg-champagne-500 text-ivory font-semibold text-sm transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-walnut-700 dark:text-beige-300 mb-1.5">Name *</label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 border border-gold-200/40 dark:border-gold-900/30 text-walnut-900 dark:text-ivory placeholder-walnut-300 dark:placeholder-beige-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-walnut-700 dark:text-beige-300 mb-1.5">Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 border border-gold-200/40 dark:border-gold-900/30 text-walnut-900 dark:text-ivory placeholder-walnut-300 dark:placeholder-beige-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-walnut-700 dark:text-beige-300 mb-1.5">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 93604 82480"
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 border border-gold-200/40 dark:border-gold-900/30 text-walnut-900 dark:text-ivory placeholder-walnut-300 dark:placeholder-beige-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-walnut-700 dark:text-beige-300 mb-1.5">Message *</label>
                  <textarea
                    id="message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 rounded-input bg-cream/50 dark:bg-walnut-800/50 border border-gold-200/40 dark:border-gold-900/30 text-walnut-900 dark:text-ivory placeholder-walnut-300 dark:placeholder-beige-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                {status === 'error' && (
                  <p className="text-sm text-red-500 flex items-center gap-1.5">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full px-6 py-3.5 rounded-full bg-champagne-600 hover:bg-champagne-500 text-ivory font-semibold inline-flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-champagne-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <><Loader2 size={18} className="animate-spin" /> Sending...</>
                  ) : (
                    <>Send Message <Send size={18} /></>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Info cards */}
          <div className="space-y-5">
            {/* Address */}
            <div className="bg-ivory dark:bg-walnut-900 rounded-card p-6 border border-champagne-200 dark:border-champagne-900/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-card bg-champagne-100 dark:bg-champagne-900/30 flex items-center justify-center flex-shrink-0">
                  <MapPin size={22} className="text-champagne-600 dark:text-champagne-400" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-walnut-900 dark:text-ivory mb-1">Visit Us</h3>
                  <p className="text-sm text-walnut-600 dark:text-beige-400 leading-relaxed">{BRAND_ADDRESS}</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="relative rounded-card overflow-hidden h-56 border border-gold-200/30 dark:border-gold-900/20 group">
              <iframe
                title="GALINEX Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120617.025647!2d72.75!3d19.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306665cbab%3A0x4f6d7b3e1e0e0e0!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(0.3) sepia(0.1)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-gold-600/5 to-walnut-800/10 pointer-events-none" />
            </div>

            {/* Business hours */}
            <div className="bg-ivory dark:bg-walnut-900 rounded-card p-6 border border-champagne-200 dark:border-champagne-900/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-card bg-champagne-100 dark:bg-champagne-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock size={22} className="text-champagne-600 dark:text-champagne-400" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-walnut-900 dark:text-ivory mb-1">Business Hours</h3>
                  <p className="text-sm text-walnut-600 dark:text-beige-400 leading-relaxed">{BUSINESS_HOURS}</p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-r from-walnut-800 to-walnut-900 rounded-card p-6 hover:shadow-lg hover:shadow-champagne-500/20 transition-all group border border-champagne-700/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-card bg-champagne-600/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={22} className="text-champagne-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-ivory mb-0.5">Chat On WhatsApp</h3>
                  <p className="text-sm text-ivory/75">Quick replies, order updates, and design previews</p>
                </div>
                <ChevronRight size={20} className="text-champagne-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
