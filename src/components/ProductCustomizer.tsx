import { useRef, useState, useCallback, useEffect } from 'react';
import {
  Upload, ZoomIn, ZoomOut, RotateCw, Check, Trash2,
  Type, Sparkles, Wand2, ShieldCheck, Sun, Contrast,
  Layers, Move
} from 'lucide-react';
import type { CustomizationData, Product } from '@/types';

const FONTS = [
  { value: "'Cormorant Garamond', serif", label: 'Cormorant (Luxury Serif)' },
  { value: "'Cinzel', serif", label: 'Cinzel (Classical Engraved)' },
  { value: "'Playfair Display', serif", label: 'Playfair (Editorial)' },
  { value: "'Inter', sans-serif", label: 'Inter (Modern Clean)' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat (Bold Clean)' },
];

export const DEFAULT_CUSTOMIZATION: CustomizationData = {
  photo_url: null,
  processed_photo_url: null,
  preview_thumbnail: null,
  text: '',
  font: FONTS[0].value,
  text_color: '#FFFFFF',
  filter: 'laser_bw',
  brightness: 105,
  contrast: 135,
  rotation: 0,
  approved: false,
  text_position: { x: 50, y: 78 },
  photo_transform: { x: 50, y: 45, scale: 1.0, rotation: 0 },
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
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slug = product?.slug || '';
  const categorySlug = product?.category?.slug || '';
  
  const isCrystal = categorySlug.includes('crystal') || categorySlug.includes('3d');
  const isWood = categorySlug.includes('wood');
  const isAcrylic = categorySlug.includes('acrylic');
  const isMoonLamp = categorySlug.includes('moon');
  const isHeartShape = slug.includes('heart');
  const isOvalShape = slug.includes('oval');
  const isRoundShape = slug.includes('round') || slug.includes('clock') || isMoonLamp;

  // Material-specific available filters
  const availableFilters = [
    ...(isCrystal ? [{ id: 'laser_bw', name: '3D Laser Point Cloud', desc: 'Sub-surface crystal laser dot etching', icon: '✨' }] : []),
    ...(isWood ? [{ id: 'wood_etch', name: 'Laser Scorched Wood', desc: 'Laser burned into natural wood grain', icon: '🪵' }] : []),
    ...(isAcrylic ? [{ id: 'acrylic_glow', name: 'Acrylic Edge Illumination', desc: 'Glowing laser contour with LED base lighting', icon: '💡' }] : []),
    ...(isMoonLamp ? [{ id: 'lithophane', name: 'Lunar Lithophane Glow', desc: 'Spherical textured diffusion with internal glow', icon: '🌕' }] : []),
    { id: 'hd_boost', name: 'HD Portrait Clarity', desc: 'Sharpened contrast & edge definition', icon: '🔍' },
    { id: 'original', name: 'Original Natural Photo', desc: 'Full spectrum original colors', icon: '📸' },
  ];

  // Set default material filter and colors
  useEffect(() => {
    const defaultFilter = isWood ? 'wood_etch' : isAcrylic ? 'acrylic_glow' : isMoonLamp ? 'lithophane' : 'laser_bw';
    setData(prev => ({
      ...prev,
      filter: prev.filter || defaultFilter,
      text_color: isWood ? '#2b180d' : '#FFFFFF'
    }));
  }, [categorySlug, isWood, isAcrylic, isMoonLamp]);

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
        filter: isWood ? 'wood_etch' : isAcrylic ? 'acrylic_glow' : isMoonLamp ? 'lithophane' : 'laser_bw',
        approved: false,
      });
      setActiveStep(2);
    };
    reader.readAsDataURL(file);
  };

  const handleSamplePhoto = () => {
    // Ultra high resolution couple portrait reference
    const sample = 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800';
    update({
      photo_url: sample,
      processed_photo_url: sample,
      text: data.text || 'Forever Together',
      filter: isWood ? 'wood_etch' : isAcrylic ? 'acrylic_glow' : isMoonLamp ? 'lithophane' : 'laser_bw',
      approved: false,
    });
    setActiveStep(2);
  };

  const applyFilter = (filterId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      let b = 105;
      let c = 135;
      let textColor = '#FFFFFF';

      if (filterId === 'laser_bw') {
        b = 115;
        c = 150;
        textColor = '#FFFFFF';
      } else if (filterId === 'wood_etch') {
        b = 90;
        c = 160;
        textColor = '#2b180d';
      } else if (filterId === 'acrylic_glow') {
        b = 120;
        c = 140;
        textColor = '#ffe6a3';
      } else if (filterId === 'lithophane') {
        b = 115;
        c = 140;
        textColor = '#ffe8c2';
      } else if (filterId === 'hd_boost') {
        b = 105;
        c = 130;
        textColor = isWood ? '#2b180d' : '#FFFFFF';
      }

      update({
        filter: filterId,
        brightness: b,
        contrast: c,
        text_color: textColor,
      });
      setIsProcessing(false);
    }, 150);
  };

  // Compute CSS filter styling for live laser simulation
  const getPhotoFilterStyle = () => {
    const b = data.brightness ?? 105;
    const c = data.contrast ?? 135;
    let filterString = `brightness(${b}%) contrast(${c}%)`;

    if (data.filter === 'laser_bw') {
      filterString += ' grayscale(100%) drop-shadow(0 0 10px rgba(255,255,255,0.7))';
    } else if (data.filter === 'wood_etch') {
      filterString += ' sepia(90%) grayscale(30%) contrast(165%) brightness(88%)';
    } else if (data.filter === 'acrylic_glow') {
      filterString += ' grayscale(80%) brightness(125%) drop-shadow(0 0 12px rgba(255,225,150,0.65))';
    } else if (data.filter === 'lithophane') {
      filterString += ' sepia(35%) grayscale(45%) contrast(140%) brightness(115%)';
    }
    return filterString;
  };

  // Compute product-specific soft feathered mask (NO square or rectangular photo border)
  const getEngravingMaskStyle = () => {
    if (isHeartShape) {
      return {
        maskImage: 'radial-gradient(ellipse 52% 52% at 50% 46%, black 35%, rgba(0,0,0,0.85) 55%, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse 52% 52% at 50% 46%, black 35%, rgba(0,0,0,0.85) 55%, transparent 85%)',
      };
    }
    if (isOvalShape) {
      return {
        maskImage: 'radial-gradient(ellipse 50% 60% at 50% 50%, black 40%, rgba(0,0,0,0.8) 60%, transparent 88%)',
        WebkitMaskImage: 'radial-gradient(ellipse 50% 60% at 50% 50%, black 40%, rgba(0,0,0,0.8) 60%, transparent 88%)',
      };
    }
    if (isRoundShape) {
      return {
        maskImage: 'radial-gradient(circle at 50% 50%, black 45%, rgba(0,0,0,0.75) 65%, transparent 90%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 45%, rgba(0,0,0,0.75) 65%, transparent 90%)',
      };
    }
    // Crystal tower or standard plaque
    return {
      maskImage: 'radial-gradient(ellipse 48% 54% at 50% 46%, black 42%, rgba(0,0,0,0.8) 62%, transparent 88%)',
      WebkitMaskImage: 'radial-gradient(ellipse 48% 54% at 50% 46%, black 42%, rgba(0,0,0,0.8) 62%, transparent 88%)',
    };
  };

  // Engraving geometry placement on the physical product
  const getEngravingZone = () => {
    if (isHeartShape) {
      return { top: '24%', left: '20%', width: '60%', height: '52%' };
    }
    if (isOvalShape) {
      return { top: '22%', left: '22%', width: '56%', height: '54%' };
    }
    if (isMoonLamp) {
      return { top: '18%', left: '22%', width: '56%', height: '56%' };
    }
    if (isCrystal) {
      return { top: '20%', left: '20%', width: '60%', height: '54%' };
    }
    // Standard wood plaque / frame
    return { top: '22%', left: '20%', width: '60%', height: '52%' };
  };

  const handleApprove = () => {
    update({ approved: true, approved_at: new Date().toISOString() });
    if (onApprove) onApprove({ ...data, approved: true });
  };

  const engravingZone = getEngravingZone();
  const maskStyle = getEngravingMaskStyle();

  return (
    <div className="space-y-6">
      {/* Studio Step Indicator */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2 pb-2 border-b border-gold-200/30 dark:border-gold-900/30">
        {[
          { num: 1, title: 'Photo' },
          { num: 2, title: 'Style' },
          { num: 3, title: 'Adjust' },
          { num: 4, title: 'Text' },
          { num: 5, title: 'Approve' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setActiveStep(s.num as any)}
            className={`py-2 px-1 sm:px-2 rounded-lg text-center transition-all duration-300 ${
              activeStep === s.num
                ? 'bg-gold-600 text-ivory font-semibold shadow-md scale-[1.02]'
                : 'bg-cream/40 dark:bg-walnut-900/40 text-walnut-600 dark:text-beige-400 hover:bg-gold-500/10'
            }`}
          >
            <span className="block text-[9px] uppercase tracking-wider opacity-80">Step {s.num}</span>
            <span className="block text-[11px] sm:text-xs truncate font-medium">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Main Studio Area */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left / Top: Interactive Live Engraving Preview */}
        <div className="lg:col-span-6 bg-[#0a0908] rounded-2xl p-4 sm:p-5 border border-gold-500/20 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[380px]">
          {/* Studio Stage Spotlight */}
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-60" />

          {/* Physical Product Simulation Viewport */}
          <div className="relative w-full aspect-[4/5] max-w-[340px] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center bg-[#0e0c0a] border border-gold-400/20">
            {/* Base Physical Product Photography (Authentic wood grain, crystal bevels, floral motifs) */}
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-contain pointer-events-none select-none z-10 opacity-95 transition-opacity duration-500"
            />

            {/* Customer's Uploaded Photo Transformed and Masked Directly Into the Physical Engraving Region */}
            {data.photo_url ? (
              <div
                className="absolute z-20 pointer-events-none transition-all duration-300 flex items-center justify-center overflow-hidden"
                style={{
                  top: engravingZone.top,
                  left: engravingZone.left,
                  width: engravingZone.width,
                  height: engravingZone.height,
                  ...maskStyle,
                  mixBlendMode: isWood ? 'multiply' : 'screen',
                  opacity: isWood ? 0.92 : 0.96,
                }}
              >
                <div
                  className="w-full h-full flex items-center justify-center transition-transform duration-300"
                  style={{
                    transform: `scale(${data.photo_transform.scale}) rotate(${data.rotation ?? 0}deg)`,
                  }}
                >
                  <img
                    src={data.photo_url}
                    alt="Engraved Portrait"
                    style={{ filter: getPhotoFilterStyle() }}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ) : (
              /* Helpful upload guide when empty */
              <div className="absolute z-20 inset-0 flex flex-col items-center justify-center p-6 text-center bg-walnut-950/40 backdrop-blur-[2px]">
                <div className="w-12 h-12 rounded-full bg-gold-600/20 border border-gold-400/40 flex items-center justify-center text-gold-400 mb-2 animate-pulse">
                  <Upload size={20} />
                </div>
                <p className="text-xs font-medium text-cream mb-1">Upload Your Portrait</p>
                <p className="text-[10px] text-beige-400 max-w-[200px]">
                  Watch your face seamlessly laser-engraved into this {isWood ? 'wooden grain plaque' : isCrystal ? '3D optical crystal' : 'gift'}.
                </p>
              </div>
            )}

            {/* Customer Custom Text Physically Engraved Overlay */}
            {data.text && (
              <div
                className="absolute z-30 pointer-events-none text-center px-4 transition-all duration-300 w-full"
                style={{
                  top: isHeartShape ? '76%' : isWood ? '78%' : `${data.text_position.y}%`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: data.font,
                  color: isWood ? '#2b180d' : isAcrylic ? '#fff6df' : '#FFFFFF',
                  textShadow: isWood
                    ? '0 1px 1px rgba(255,255,255,0.4), inset 0 1px 2px rgba(0,0,0,0.6)'
                    : isAcrylic
                    ? '0 0 8px rgba(255,220,130,0.9), 0 0 16px rgba(255,200,80,0.5)'
                    : '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(196,163,90,0.6)',
                }}
              >
                <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase truncate max-w-[260px] mx-auto">
                  {data.text}
                </p>
              </div>
            )}

            {/* Physical Material Refraction Highlights */}
            {isCrystal && (
              <div className="absolute inset-0 z-15 pointer-events-none bg-gradient-to-tr from-cyan-400/10 via-transparent to-gold-400/15 mix-blend-overlay" />
            )}
            {isAcrylic && (
              <div className="absolute bottom-0 inset-x-0 h-16 z-15 pointer-events-none bg-gradient-to-t from-amber-400/30 to-transparent blur-sm" />
            )}
          </div>

          {/* Status Bar */}
          <div className="mt-3 flex items-center gap-2 text-[10px] text-beige-300 bg-walnut-900/90 px-3.5 py-1.5 rounded-full border border-gold-400/20">
            <Sparkles size={12} className="text-gold-400" />
            <span>
              {isCrystal
                ? 'Sub-Surface 3D Laser Point Cloud Engraving'
                : isWood
                ? 'Laser Scorched Natural Wood Grain Engraving'
                : isAcrylic
                ? 'Illuminated Acrylic Edge Engraving'
                : 'Spherical Lithophane Engraving'}
            </span>
          </div>
        </div>

        {/* Right / Bottom: Compact Step Controls */}
        <div className="lg:col-span-6 space-y-4">
          {/* STEP 1: Upload */}
          {activeStep === 1 && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-walnut-900 dark:text-cream tracking-wider uppercase flex items-center gap-1.5">
                  <Upload size={14} className="text-gold-600" /> 1. Upload Your Photo
                </h4>
                {data.photo_url && (
                  <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                    <Check size={11} /> Photo Loaded
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gold-400/40 hover:border-gold-500 bg-gold-50/20 dark:bg-walnut-900/40 rounded-xl p-5 text-center cursor-pointer transition-all duration-300 group"
              >
                <Upload className="mx-auto text-gold-600 group-hover:scale-110 transition-transform duration-300 mb-1.5" size={24} />
                <p className="text-xs font-medium text-walnut-900 dark:text-cream">Click or Drag & Drop Photo Here</p>
                <p className="text-[10px] text-walnut-400 mt-0.5">JPG, PNG, WebP up to 25MB</p>
              </div>

              <div className="flex items-center gap-2">
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

              {data.photo_url && (
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="w-full py-2.5 bg-gold-600 hover:bg-gold-500 text-ivory text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                >
                  Continue to Engraving Style →
                </button>
              )}
            </div>
          )}

          {/* STEP 2: Engraving Style */}
          {activeStep === 2 && (
            <div className="space-y-3.5 animate-fade-in">
              <h4 className="text-xs font-semibold text-walnut-900 dark:text-cream tracking-wider uppercase flex items-center gap-1.5">
                <Layers size={14} className="text-gold-600" /> 2. Select Engraving Style
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableFilters.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => applyFilter(f.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-300 ${
                      data.filter === f.id
                        ? 'border-gold-500 bg-gold-50/50 dark:bg-gold-900/30 shadow-sm ring-1 ring-gold-500'
                        : 'border-gold-200/30 dark:border-gold-900/20 hover:border-gold-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm">{f.icon}</span>
                      <p className="text-xs font-semibold text-walnut-900 dark:text-cream">{f.name}</p>
                    </div>
                    <p className="text-[10px] text-walnut-500 dark:text-beige-400 line-clamp-1">{f.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="py-2 px-3 border border-gold-200/30 text-xs font-medium text-walnut-600 dark:text-beige-400 rounded-lg hover:bg-gold-500/10"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="flex-1 py-2 bg-gold-600 hover:bg-gold-500 text-ivory text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                >
                  Continue to Adjustments →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Adjustments */}
          {activeStep === 3 && (
            <div className="space-y-3.5 animate-fade-in">
              <h4 className="text-xs font-semibold text-walnut-900 dark:text-cream tracking-wider uppercase flex items-center gap-1.5">
                <Sun size={14} className="text-gold-600" /> 3. Fine-Tune Engraving
              </h4>

              <div className="space-y-2.5 bg-cream/30 dark:bg-walnut-900/40 p-3 rounded-xl border border-gold-200/20">
                <div className="flex items-center justify-between text-xs text-walnut-600 dark:text-beige-300">
                  <span className="flex items-center gap-1.5"><Sun size={12} /> Laser Brightness</span>
                  <span>{data.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="150"
                  value={data.brightness ?? 105}
                  onChange={e => update({ brightness: Number(e.target.value) })}
                  className="w-full accent-gold-600 cursor-pointer"
                />

                <div className="flex items-center justify-between text-xs text-walnut-600 dark:text-beige-300 pt-1">
                  <span className="flex items-center gap-1.5"><Contrast size={12} /> Laser Contrast</span>
                  <span>{data.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="180"
                  value={data.contrast ?? 135}
                  onChange={e => update({ contrast: Number(e.target.value) })}
                  className="w-full accent-gold-600 cursor-pointer"
                />

                <div className="flex items-center gap-2 pt-2 border-t border-gold-200/20">
                  <button
                    type="button"
                    onClick={() => update({ rotation: ((data.rotation ?? 0) + 90) % 360 })}
                    className="flex-1 py-1.5 text-xs font-medium border border-gold-200/40 rounded-lg hover:bg-gold-500/10 flex items-center justify-center gap-1 text-walnut-700 dark:text-beige-300"
                  >
                    <RotateCw size={12} /> Rotate 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => update({
                      photo_transform: {
                        ...data.photo_transform,
                        scale: Math.min(1.5, Number(((data.photo_transform.scale || 1.0) + 0.1).toFixed(1)))
                      }
                    })}
                    className="p-1.5 border border-gold-200/40 rounded-lg hover:bg-gold-500/10 text-walnut-700 dark:text-beige-300"
                    title="Zoom In"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => update({
                      photo_transform: {
                        ...data.photo_transform,
                        scale: Math.max(0.6, Number(((data.photo_transform.scale || 1.0) - 0.1).toFixed(1)))
                      }
                    })}
                    className="p-1.5 border border-gold-200/40 rounded-lg hover:bg-gold-500/10 text-walnut-700 dark:text-beige-300"
                    title="Zoom Out"
                  >
                    <ZoomOut size={13} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="py-2 px-3 border border-gold-200/30 text-xs font-medium text-walnut-600 dark:text-beige-400 rounded-lg hover:bg-gold-500/10"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="flex-1 py-2 bg-gold-600 hover:bg-gold-500 text-ivory text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                >
                  Continue to Engraving Text →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Engraving Message */}
          {activeStep === 4 && (
            <div className="space-y-3.5 animate-fade-in">
              <h4 className="text-xs font-semibold text-walnut-900 dark:text-cream tracking-wider uppercase flex items-center gap-1.5">
                <Type size={14} className="text-gold-600" /> 4. Custom Laser Text
              </h4>

              <div>
                <label className="text-[10px] font-medium text-walnut-400 uppercase tracking-wider block mb-1">
                  Engraved Message / Names / Date
                </label>
                <input
                  type="text"
                  maxLength={36}
                  placeholder="e.g. Forever Together 14.02.2026"
                  value={data.text}
                  onChange={e => update({ text: e.target.value })}
                  className="w-full px-3.5 py-2 bg-ivory dark:bg-walnut-900 border border-gold-300/40 dark:border-gold-900/40 rounded-xl text-xs text-walnut-900 dark:text-cream focus:outline-none focus:border-gold-500 shadow-inner"
                />
                <span className="text-[9px] text-walnut-400 mt-1 block text-right">
                  {data.text.length} / 36 chars
                </span>
              </div>

              <div>
                <label className="text-[10px] font-medium text-walnut-400 uppercase tracking-wider block mb-1">
                  Typography Font
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {FONTS.map(f => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => update({ font: f.value })}
                      className={`w-full px-3 py-1.5 text-left rounded-lg text-xs border transition-all ${
                        data.font === f.value
                          ? 'border-gold-500 bg-gold-50/50 dark:bg-gold-900/30 text-gold-600 font-semibold'
                          : 'border-gold-200/20 text-walnut-600 dark:text-beige-300 hover:border-gold-400'
                      }`}
                      style={{ fontFamily: f.value }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="py-2 px-3 border border-gold-200/30 text-xs font-medium text-walnut-600 dark:text-beige-400 rounded-lg hover:bg-gold-500/10"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(5)}
                  className="flex-1 py-2 bg-gold-600 hover:bg-gold-500 text-ivory text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                >
                  Review & Approve →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Final Review & Approval */}
          {activeStep === 5 && (
            <div className="space-y-3.5 animate-fade-in">
              <h4 className="text-xs font-semibold text-walnut-900 dark:text-cream tracking-wider uppercase flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" /> 5. Review & Confirm
              </h4>

              <div className="p-3.5 bg-cream/40 dark:bg-walnut-900/50 rounded-xl border border-gold-200/30 space-y-1.5 text-xs text-walnut-700 dark:text-beige-300">
                <p><span className="font-semibold text-walnut-900 dark:text-cream">Product:</span> {productName}</p>
                <p><span className="font-semibold text-walnut-900 dark:text-cream">Photo:</span> {data.photo_url ? 'Custom Portrait Engraved' : 'None'}</p>
                <p><span className="font-semibold text-walnut-900 dark:text-cream">Message:</span> {data.text || 'None'}</p>
                <p><span className="font-semibold text-walnut-900 dark:text-cream">Engraving Style:</span> {data.filter?.toUpperCase()}</p>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={Boolean(data.approved)}
                  onChange={e => update({ approved: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-gold-600 rounded cursor-pointer"
                />
                <span className="text-xs text-walnut-600 dark:text-beige-300 font-medium leading-tight">
                  I approve this personalization simulation for laser craftsmanship.
                </span>
              </label>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="py-2 px-3 border border-gold-200/30 text-xs font-medium text-walnut-600 dark:text-beige-400 rounded-lg hover:bg-gold-500/10"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="flex-1 py-2.5 bg-gold-600 hover:bg-gold-500 text-ivory text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check size={14} /> Confirm Personalization
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
