import { useRef, useState, useCallback, useEffect } from 'react';
import {
  Upload, ZoomIn, ZoomOut, RotateCw, Check, Trash2,
  Type, Sparkles, RefreshCw, Wand2, Eye, ShieldCheck, Sun, Contrast
} from 'lucide-react';
import type { CustomizationData, Product } from '@/types';

const FONTS = [
  { value: "'Cormorant Garamond', serif", label: 'Cormorant (Luxury Serif)' },
  { value: "'Cinzel', serif", label: 'Cinzel (Classical Engraved)' },
  { value: "'Playfair Display', serif", label: 'Playfair (Editorial)' },
  { value: "'Inter', sans-serif", label: 'Inter (Modern Clean)' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat (Bold Clean)' },
];

const AI_FILTERS = [
  { id: 'original', name: 'Original', desc: 'Natural photo colors', icon: '📸' },
  { id: 'laser_bw', name: '3D Laser B&W', desc: 'Optimized high-contrast sub-surface laser point etching', icon: '✨' },
  { id: 'wood_etch', name: 'Wood Engraving', desc: 'Laser burned sepia tone on natural wood grain', icon: '🪵' },
  { id: 'hd_boost', name: 'HD Portrait Clarity', desc: 'Sharpened edges and balanced exposure', icon: '🔍' },
  { id: 'lithophane', name: 'Moon Lamp Glow', desc: 'Warm internal lithophane diffusion', icon: '🌕' },
] as const;

export const DEFAULT_CUSTOMIZATION: CustomizationData = {
  photo_url: null,
  processed_photo_url: null,
  preview_thumbnail: null,
  text: '',
  font: FONTS[0].value,
  text_color: '#FFFFFF',
  filter: 'laser_bw',
  brightness: 100,
  contrast: 110,
  rotation: 0,
  approved: false,
  text_position: { x: 50, y: 84 },
  photo_transform: { x: 50, y: 48, scale: 1, rotation: 0 },
  crop: null,
};

interface ProductCustomizerProps {
  product?: Product;
  productImage: string;
  productName: string;
  onChange: (data: CustomizationData) => void;
  onApprove?: (data: CustomizationData) => void;
}

export default function ProductCustomizer({
  product,
  productImage,
  productName,
  onChange,
  onApprove,
}: ProductCustomizerProps) {
  const [data, setData] = useState<CustomizationData>(DEFAULT_CUSTOMIZATION);
  const [activeTab, setActiveTab] = useState<'upload' | 'ai_prep' | 'engraving' | 'preview'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categorySlug = product?.category?.slug || '';
  const isCrystal = categorySlug.includes('crystal') || categorySlug.includes('3d');
  const isWood = categorySlug.includes('wood');
  const isAcrylic = categorySlug.includes('acrylic');
  const isMoonLamp = categorySlug.includes('moon');

  useEffect(() => {
    onChange(data);
  }, [data, onChange]);

  const update = useCallback((patch: Partial<CustomizationData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      update({
        photo_url: result,
        processed_photo_url: result,
        filter: isWood ? 'wood_etch' : isMoonLamp ? 'lithophane' : 'laser_bw',
        approved: false,
      });
      setActiveTab('ai_prep');
    };
    reader.readAsDataURL(file);
  };

  const handleSamplePhoto = () => {
    // High quality couple portrait sample for instant preview
    const sample = 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800';
    update({
      photo_url: sample,
      processed_photo_url: sample,
      text: 'Forever Together',
      filter: isWood ? 'wood_etch' : isMoonLamp ? 'lithophane' : 'laser_bw',
      approved: false,
    });
    setActiveTab('ai_prep');
  };

  const applyAIFilter = (filterId: typeof AI_FILTERS[number]['id']) => {
    setIsProcessing(true);
    setTimeout(() => {
      let b = 100;
      let c = 110;
      let textColor = '#FFFFFF';

      if (filterId === 'laser_bw') {
        b = 105;
        c = 135;
        textColor = '#FFFFFF';
      } else if (filterId === 'wood_etch') {
        b = 95;
        c = 125;
        textColor = '#3a2012';
      } else if (filterId === 'hd_boost') {
        b = 110;
        c = 120;
        textColor = isWood ? '#3a2012' : '#FFFFFF';
      } else if (filterId === 'lithophane') {
        b = 115;
        c = 130;
        textColor = '#ffe8c2';
      }

      update({
        filter: filterId,
        brightness: b,
        contrast: c,
        text_color: textColor,
      });
      setIsProcessing(false);
    }, 250);
  };

  const generatePreviewSnapshot = () => {
    update({ approved: true, approved_at: new Date().toISOString() });
    if (onApprove) onApprove({ ...data, approved: true });
  };

  // Compute CSS filter style
  const getPhotoFilterStyle = () => {
    const b = data.brightness ?? 100;
    const c = data.contrast ?? 110;
    let filterString = `brightness(${b}%) contrast(${c}%)`;

    if (data.filter === 'laser_bw') {
      filterString += ' grayscale(100%) drop-shadow(0 0 8px rgba(255,255,255,0.4))';
    } else if (data.filter === 'wood_etch') {
      filterString += ' sepia(70%) grayscale(40%) contrast(140%)';
    } else if (data.filter === 'lithophane') {
      filterString += ' sepia(30%) grayscale(50%) brightness(115%)';
    }
    return filterString;
  };

  return (
    <div className="space-y-6">
      {/* Step Navigation Bar */}
      <div className="flex items-center justify-between border-b border-gold-200/30 dark:border-gold-900/30 pb-3 overflow-x-auto gap-2">
        {[
          { key: 'upload', label: '1. Photo Upload' },
          { key: 'ai_prep', label: '2. AI Preparation' },
          { key: 'engraving', label: '3. Text & Message' },
          { key: 'preview', label: '4. Final Approval' },
        ].map((step, idx) => (
          <button
            key={step.key}
            onClick={() => setActiveTab(step.key as any)}
            className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase rounded-full transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === step.key
                ? 'bg-gold-600 text-ivory shadow-md'
                : 'text-walnut-500 dark:text-beige-400 hover:text-gold-600'
            }`}
          >
            {data.photo_url && idx === 0 ? <Check size={12} className="text-emerald-300" /> : null}
            {step.label}
          </button>
        ))}
      </div>

      {/* Main Studio Viewport */}
      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Interactive Preview Canvas */}
        <div className="md:col-span-7 bg-walnut-950 rounded-2xl p-4 border border-gold-400/20 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[360px]">
          {/* Base Product Mockup */}
          <div className="relative w-full aspect-square max-w-[340px] rounded-xl overflow-hidden shadow-inner flex items-center justify-center bg-walnut-900/60">
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-contain pointer-events-none select-none z-10 opacity-85"
            />

            {/* Customer Photo Laser Engraving Simulation Overlay */}
            {data.photo_url && (
              <div
                className="absolute z-20 pointer-events-none transition-all duration-300 flex items-center justify-center overflow-hidden"
                style={{
                  top: `${data.photo_transform.y - 25}%`,
                  left: `${data.photo_transform.x - 25}%`,
                  width: '50%',
                  height: '50%',
                  transform: `scale(${data.photo_transform.scale}) rotate(${data.rotation ?? 0}deg)`,
                  mixBlendMode: isWood ? 'multiply' : isAcrylic ? 'screen' : 'screen',
                  opacity: isWood ? 0.88 : 0.92,
                }}
              >
                <img
                  src={data.photo_url}
                  alt="Customer Upload"
                  style={{ filter: getPhotoFilterStyle() }}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Laser Engraved Custom Text Overlay */}
            {data.text && (
              <div
                className="absolute z-30 pointer-events-none text-center px-4 transition-all duration-300"
                style={{
                  top: `${data.text_position.y}%`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: data.font,
                  color: isWood ? '#3a2012' : '#FFFFFF',
                  textShadow: isWood
                    ? '0 1px 1px rgba(255,255,255,0.4)'
                    : '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(196,163,90,0.6)',
                }}
              >
                <p className="text-sm font-semibold tracking-widest uppercase truncate max-w-[280px]">
                  {data.text}
                </p>
              </div>
            )}

            {/* Material Glow Simulation Frame */}
            {isCrystal && (
              <div className="absolute inset-0 z-15 pointer-events-none bg-gradient-to-tr from-cyan-500/10 via-transparent to-gold-500/10 mix-blend-overlay" />
            )}
            {isAcrylic && (
              <div className="absolute bottom-0 inset-x-0 h-12 z-15 pointer-events-none bg-gradient-to-t from-amber-500/25 to-transparent blur-sm" />
            )}
            {isMoonLamp && (
              <div className="absolute inset-0 z-15 pointer-events-none rounded-full bg-gradient-to-tr from-amber-400/20 via-yellow-200/10 to-transparent blur-md" />
            )}
          </div>

          {/* Canvas status pill */}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-beige-300/80 bg-walnut-900/80 px-3 py-1 rounded-full border border-gold-400/20">
            <Sparkles size={13} className="text-gold-400" />
            <span>
              {isCrystal
                ? '3D Sub-Surface Laser Simulation'
                : isWood
                ? 'Laser Scorched Wood Grain Simulation'
                : isAcrylic
                ? 'Illuminated Acrylic Edge Simulation'
                : 'Lithophane Texture Simulation'}
            </span>
          </div>
        </div>

        {/* Right: Step Controls */}
        <div className="md:col-span-5 space-y-5">
          {/* TAB 1: Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-semibold text-walnut-900 dark:text-cream tracking-wide uppercase flex items-center gap-2">
                <Upload size={16} className="text-gold-600" /> Upload Your Photo
              </h4>
              <p className="text-xs text-walnut-500 dark:text-beige-400 leading-relaxed font-light">
                High resolution portraits with clear lighting produce the sharpest 3D laser engraving results.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gold-400/40 hover:border-gold-500 bg-gold-50/20 dark:bg-walnut-900/40 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group"
              >
                <Upload className="mx-auto text-gold-600 group-hover:scale-110 transition-transform duration-300 mb-2" size={28} />
                <p className="text-xs font-medium text-walnut-900 dark:text-cream">Click or Drag & Drop Photo Here</p>
                <p className="text-[10px] text-walnut-400 mt-1">JPG, PNG, WebP up to 25MB</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSamplePhoto}
                  className="flex-1 py-2 text-xs font-medium text-gold-600 border border-gold-400/40 rounded-lg hover:bg-gold-500/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Wand2 size={13} /> Try Sample Photo
                </button>
                {data.photo_url && (
                  <button
                    type="button"
                    onClick={() => update({ photo_url: null, processed_photo_url: null })}
                    className="p-2 text-rose-500 border border-rose-500/30 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI Prep & Filters */}
          {activeTab === 'ai_prep' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-semibold text-walnut-900 dark:text-cream tracking-wide uppercase flex items-center gap-2">
                <Wand2 size={16} className="text-gold-600" /> AI Photo Preparation
              </h4>

              {/* Filter Cards */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-walnut-400 uppercase tracking-wider">Engraving Filter</label>
                <div className="grid grid-cols-2 gap-2">
                  {AI_FILTERS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => applyAIFilter(f.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all duration-300 ${
                        data.filter === f.id
                          ? 'border-gold-500 bg-gold-50/40 dark:bg-gold-900/30 shadow-sm'
                          : 'border-gold-200/30 dark:border-gold-900/20 hover:border-gold-400'
                      }`}
                    >
                      <div className="text-base mb-1">{f.icon}</div>
                      <p className="text-xs font-semibold text-walnut-900 dark:text-cream">{f.name}</p>
                      <p className="text-[10px] text-walnut-400 line-clamp-1">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine Tuning Sliders */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-walnut-600 dark:text-beige-300">
                  <span className="flex items-center gap-1.5"><Sun size={13} /> Brightness</span>
                  <span>{data.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="160"
                  value={data.brightness ?? 100}
                  onChange={e => update({ brightness: Number(e.target.value) })}
                  className="w-full accent-gold-600"
                />

                <div className="flex items-center justify-between text-xs text-walnut-600 dark:text-beige-300">
                  <span className="flex items-center gap-1.5"><Contrast size={13} /> Contrast</span>
                  <span>{data.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="180"
                  value={data.contrast ?? 110}
                  onChange={e => update({ contrast: Number(e.target.value) })}
                  className="w-full accent-gold-600"
                />

                {/* Transform tools */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => update({ rotation: ((data.rotation ?? 0) + 90) % 360 })}
                    className="flex-1 py-2 text-xs font-medium border border-gold-200/40 rounded-lg hover:bg-gold-500/10 flex items-center justify-center gap-1"
                  >
                    <RotateCw size={13} /> Rotate 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => update({
                      photo_transform: {
                        ...data.photo_transform,
                        scale: Math.min(1.5, (data.photo_transform.scale || 1) + 0.1)
                      }
                    })}
                    className="p-2 border border-gold-200/40 rounded-lg hover:bg-gold-500/10"
                    title="Zoom In"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => update({
                      photo_transform: {
                        ...data.photo_transform,
                        scale: Math.max(0.6, (data.photo_transform.scale || 1) - 0.1)
                      }
                    })}
                    className="p-2 border border-gold-200/40 rounded-lg hover:bg-gold-500/10"
                    title="Zoom Out"
                  >
                    <ZoomOut size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Text Engraving */}
          {activeTab === 'engraving' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-semibold text-walnut-900 dark:text-cream tracking-wide uppercase flex items-center gap-2">
                <Type size={16} className="text-gold-600" /> Custom Laser Engraving Text
              </h4>

              <div>
                <label className="text-[11px] font-medium text-walnut-400 uppercase tracking-wider block mb-1.5">
                  Engraving Message / Names / Date
                </label>
                <input
                  type="text"
                  maxLength={36}
                  placeholder="e.g. Forever Together 14.02.2026"
                  value={data.text}
                  onChange={e => update({ text: e.target.value })}
                  className="w-full px-4 py-2.5 bg-ivory dark:bg-walnut-900 border border-gold-200/40 dark:border-gold-900/40 rounded-xl text-sm text-walnut-900 dark:text-cream focus:outline-none focus:border-gold-500"
                />
                <span className="text-[10px] text-walnut-400 mt-1 block text-right">
                  {data.text.length} / 36 chars
                </span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-walnut-400 uppercase tracking-wider block mb-1.5">
                  Engraving Typography Font
                </label>
                <div className="space-y-1.5">
                  {FONTS.map(f => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => update({ font: f.value })}
                      className={`w-full px-3 py-2 text-left rounded-lg text-xs border transition-all ${
                        data.font === f.value
                          ? 'border-gold-500 bg-gold-50/40 dark:bg-gold-900/30 text-gold-600 font-semibold'
                          : 'border-gold-200/20 text-walnut-600 dark:text-beige-300 hover:border-gold-400'
                      }`}
                      style={{ fontFamily: f.value }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Final Approval */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-semibold text-walnut-900 dark:text-cream tracking-wide uppercase flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" /> Review & Approve
              </h4>

              <div className="p-4 bg-gold-50/30 dark:bg-walnut-900/50 rounded-xl border border-gold-200/30 space-y-2 text-xs text-walnut-700 dark:text-beige-300">
                <p><span className="font-semibold text-walnut-900 dark:text-cream">Product:</span> {productName}</p>
                <p><span className="font-semibold text-walnut-900 dark:text-cream">Photo:</span> {data.photo_url ? 'Uploaded & AI Optimized' : 'None'}</p>
                <p><span className="font-semibold text-walnut-900 dark:text-cream">Message:</span> {data.text || 'None'}</p>
                <p><span className="font-semibold text-walnut-900 dark:text-cream">Filter Style:</span> {data.filter?.toUpperCase()}</p>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={Boolean(data.approved)}
                  onChange={e => update({ approved: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-gold-600 rounded"
                />
                <span className="text-xs text-walnut-600 dark:text-beige-300 font-medium leading-tight">
                  I approve this personalization preview for laser craftsmanship.
                </span>
              </label>

              <button
                type="button"
                onClick={generatePreviewSnapshot}
                disabled={!data.photo_url && !data.text}
                className="w-full py-3 bg-gold-600 hover:bg-gold-500 disabled:opacity-50 text-ivory text-xs font-semibold uppercase tracking-wider2 rounded-btn transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                <Check size={14} /> Confirm Personalization
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
