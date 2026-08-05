import { useRef, useState, useCallback, useEffect } from 'react';
import {
  Upload, ZoomIn, ZoomOut, RotateCw, RotateCcw, Crop, Check, X, Trash2,
  Type, Move, Sparkles, RefreshCw,
} from 'lucide-react';
import type { CustomizationData } from '@/types';

const FONTS = [
  { value: "'Cormorant Garamond', serif", label: 'Elegant Serif' },
  { value: "'Inter', sans-serif", label: 'Modern Sans' },
  { value: "'Playfair Display', serif", label: 'Classic Display' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Arial', sans-serif", label: 'Arial' },
  { value: "'Courier New', monospace", label: 'Monospace' },
];

const TEXT_COLORS = [
  { value: '#1a1a1a', label: 'Black' },
  { value: '#8B7355', label: 'Bronze' },
  { value: '#C4A35A', label: 'Gold' },
  { value: '#FFFFFF', label: 'White' },
  { value: '#8B0000', label: 'Maroon' },
  { value: '#2F4F4F', label: 'Slate' },
];

const DEFAULT_CUSTOMIZATION: CustomizationData = {
  photo_url: null,
  text: '',
  font: FONTS[0].value,
  text_color: '#1a1a1a',
  text_position: { x: 50, y: 85 },
  photo_transform: { x: 50, y: 50, scale: 1, rotation: 0 },
  crop: null,
};

interface ProductCustomizerProps {
  productImage: string;
  productName: string;
  onChange: (data: CustomizationData) => void;
}

export default function ProductCustomizer({ productImage, productName, onChange }: ProductCustomizerProps) {
  const [data, setData] = useState<CustomizationData>(DEFAULT_CUSTOMIZATION);
  const [rawPhoto, setRawPhoto] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [draggingPhoto, setDraggingPhoto] = useState(false);
  const [draggingText, setDraggingText] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  useEffect(() => { onChange(data); }, [data, onChange]);

  const update = useCallback((patch: Partial<CustomizationData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawPhoto(reader.result as string);
      setCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (crop: { x: number; y: number; width: number; height: number }) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      update({ photo_url: croppedDataUrl, crop, photo_transform: { x: 50, y: 50, scale: 1, rotation: 0 } });
      setRawPhoto(null);
      setCropping(false);
    };
    img.src = rawPhoto!;
  };

  const removePhoto = () => {
    update({ photo_url: null, crop: null });
    setRawPhoto(null);
  };

  const resetAll = () => {
    setData(DEFAULT_CUSTOMIZATION);
    setRawPhoto(null);
  };

  // Drag handlers for repositioning photo and text on the preview
  const handlePointerDown = (e: React.PointerEvent, target: 'photo' | 'text') => {
    e.preventDefault();
    e.stopPropagation();
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: target === 'photo' ? data.photo_transform.x : data.text_position.x,
      posY: target === 'photo' ? data.photo_transform.y : data.text_position.y,
    };
    if (target === 'photo') setDraggingPhoto(true);
    else setDraggingText(true);
  };

  useEffect(() => {
    if (!draggingPhoto && !draggingText) return;
    const handleMove = (e: PointerEvent) => {
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
      const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
      if (draggingPhoto) {
        update({ photo_transform: { ...data.photo_transform, x: Math.max(0, Math.min(100, dragStart.current.posX + dx)), y: Math.max(0, Math.min(100, dragStart.current.posY + dy)) } });
      } else if (draggingText) {
        update({ text_position: { x: Math.max(0, Math.min(100, dragStart.current.posX + dx)), y: Math.max(0, Math.min(100, dragStart.current.posY + dy)) } });
      }
    };
    const handleUp = () => { setDraggingPhoto(false); setDraggingText(false); };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [draggingPhoto, draggingText, data.photo_transform, data.text_position, update]);

  const hasPhoto = !!data.photo_url;
  const hasText = !!data.text;

  return (
    <div className="space-y-5">
      {/* Live Preview */}
      <div>
        <p className="text-xs font-medium text-walnut-500 dark:text-beige-400 mb-2 tracking-wide uppercase flex items-center gap-1.5">
          <Sparkles size={12} className="text-champagne-600" /> Live Preview
        </p>
        <div
          ref={previewRef}
          className="relative aspect-square rounded-card overflow-hidden bg-cream dark:bg-walnut-800 border border-champagne-200/30 dark:border-champagne-900/20 select-none"
        >
          {/* Product base image */}
          <img src={productImage} alt={productName} className="absolute inset-0 w-full h-full object-cover" draggable={false} />

          {/* Photo overlay */}
          {hasPhoto && (
            <div
              onPointerDown={(e) => handlePointerDown(e, 'photo')}
              className="absolute cursor-move"
              style={{
                left: `${data.photo_transform.x}%`,
                top: `${data.photo_transform.y}%`,
                transform: `translate(-50%, -50%) scale(${data.photo_transform.scale}) rotate(${data.photo_transform.rotation}deg)`,
                width: '45%',
                aspectRatio: '1',
              }}
            >
              <img
                src={data.photo_url!}
                alt="Custom"
                className="w-full h-full object-cover rounded-full shadow-2xl ring-2 ring-white/60 pointer-events-none"
                draggable={false}
              />
            </div>
          )}

          {/* Text overlay */}
          {hasText && (
            <div
              onPointerDown={(e) => handlePointerDown(e, 'text')}
              className="absolute cursor-move px-3 py-1 text-center max-w-[80%]"
              style={{
                left: `${data.text_position.x}%`,
                top: `${data.text_position.y}%`,
                transform: 'translate(-50%, -50%)',
                fontFamily: data.font,
                color: data.text_color,
                fontSize: 'clamp(14px, 3vw, 22px)',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.2,
              }}
            >
              {data.text}
            </div>
          )}

          {/* Hint */}
          {!hasPhoto && !hasText && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-walnut-400 dark:text-walnut-500 font-light px-4 text-center">
                Upload a photo and add text to see your design
              </p>
            </div>
          )}

          {/* Drag hint badge */}
          {(hasPhoto || hasText) && (
            <div className="absolute bottom-2 right-2 text-[10px] px-2 py-1 rounded-full bg-walnut-950/60 text-cream/80 flex items-center gap-1 pointer-events-none">
              <Move size={10} /> Drag to reposition
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Photo upload + controls */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-walnut-600 dark:text-beige-300 tracking-wide uppercase">Photo</label>
            {hasPhoto && (
              <button onClick={removePhoto} className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors">
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>
          {!hasPhoto ? (
            <label className="flex flex-col items-center justify-center w-full h-24 rounded-card border-2 border-dashed border-champagne-300 dark:border-champagne-800 cursor-pointer hover:border-champagne-500 hover:bg-champagne-50/50 dark:hover:bg-champagne-900/10 transition-colors">
              <Upload size={20} className="text-champagne-400 mb-1.5" />
              <span className="text-xs text-walnut-400 font-light">Click to upload your photo</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          ) : (
            <div className="space-y-2.5">
              {/* Zoom + Rotate */}
              <div className="flex items-center gap-2">
                <button onClick={() => update({ photo_transform: { ...data.photo_transform, scale: Math.max(0.3, data.photo_transform.scale - 0.1) } })} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-card bg-cream/60 dark:bg-walnut-800/50 border border-champagne-200/40 dark:border-champagne-900/30 text-xs text-walnut-600 dark:text-beige-300 hover:border-champagne-500 transition-colors">
                  <ZoomOut size={14} /> Zoom Out
                </button>
                <button onClick={() => update({ photo_transform: { ...data.photo_transform, scale: Math.min(3, data.photo_transform.scale + 0.1) } })} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-card bg-cream/60 dark:bg-walnut-800/50 border border-champagne-200/40 dark:border-champagne-900/30 text-xs text-walnut-600 dark:text-beige-300 hover:border-champagne-500 transition-colors">
                  <ZoomIn size={14} /> Zoom In
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => update({ photo_transform: { ...data.photo_transform, rotation: data.photo_transform.rotation - 15 } })} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-card bg-cream/60 dark:bg-walnut-800/50 border border-champagne-200/40 dark:border-champagne-900/30 text-xs text-walnut-600 dark:text-beige-300 hover:border-champagne-500 transition-colors">
                  <RotateCcw size={14} /> Rotate L
                </button>
                <button onClick={() => update({ photo_transform: { ...data.photo_transform, rotation: data.photo_transform.rotation + 15 } })} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-card bg-cream/60 dark:bg-walnut-800/50 border border-champagne-200/40 dark:border-champagne-900/30 text-xs text-walnut-600 dark:text-beige-300 hover:border-champagne-500 transition-colors">
                  <RotateCw size={14} /> Rotate R
                </button>
              </div>
              <button onClick={() => { if (rawPhoto) setCropping(true); else if (data.photo_url) { setRawPhoto(data.photo_url); setCropping(true); } }} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-card bg-cream/60 dark:bg-walnut-800/50 border border-champagne-200/40 dark:border-champagne-900/30 text-xs text-walnut-600 dark:text-beige-300 hover:border-champagne-500 transition-colors">
                <Crop size={14} /> Re-crop Photo
              </button>
            </div>
          )}
        </div>

        {/* Text controls */}
        <div>
          <label className="text-xs font-medium text-walnut-600 dark:text-beige-300 mb-2 block tracking-wide uppercase flex items-center gap-1.5">
            <Type size={12} /> Custom Text
          </label>
          <input
            type="text"
            value={data.text}
            onChange={e => update({ text: e.target.value })}
            placeholder="Enter names, date, or message..."
            maxLength={60}
            className="w-full px-4 py-2.5 bg-ivory dark:bg-walnut-900 text-sm text-walnut-900 dark:text-cream border border-champagne-200/40 dark:border-champagne-900/30 outline-none focus:border-champagne-400 rounded-card font-light"
          />
          {hasText && (
            <div className="grid grid-cols-2 gap-2 mt-2.5">
              <div>
                <label className="text-[10px] text-walnut-400 mb-1 block tracking-wide">Font</label>
                <select
                  value={data.font}
                  onChange={e => update({ font: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-card bg-cream/60 dark:bg-walnut-800/50 text-xs text-walnut-900 dark:text-cream border border-champagne-200/40 dark:border-champagne-900/30 outline-none focus:border-champagne-400"
                >
                  {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-walnut-400 mb-1 block tracking-wide">Color</label>
                <div className="flex gap-1.5 flex-wrap">
                  {TEXT_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => update({ text_color: c.value })}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${data.text_color === c.value ? 'border-champagne-500 scale-110' : 'border-champagne-200/40'}`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reset */}
        {(hasPhoto || hasText) && (
          <button onClick={resetAll} className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-walnut-400 hover:text-rose-500 transition-colors">
            <RefreshCw size={12} /> Reset Design
          </button>
        )}
      </div>

      {/* Crop Modal */}
      {cropping && rawPhoto && (
        <CropModal
          imageSrc={rawPhoto}
          onCancel={() => { setCropping(false); setRawPhoto(null); }}
          onConfirm={handleCropComplete}
        />
      )}
    </div>
  );
}

/* ---------- Crop Modal ---------- */
function CropModal({ imageSrc, onCancel, onConfirm }: { imageSrc: string; onCancel: () => void; onConfirm: (crop: { x: number; y: number; width: number; height: number }) => void }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState<string | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, box: { x: 0, y: 0, width: 0, height: 0 } });

  useEffect(() => {
    if (!dragging && !resizing) return;
    const handleMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dxPct = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const dyPct = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;
      if (dragging) {
        setCropBox(prev => ({
          ...prev,
          x: Math.max(0, Math.min(100 - prev.width, dragStartRef.current.box.x + dxPct)),
          y: Math.max(0, Math.min(100 - prev.height, dragStartRef.current.box.y + dyPct)),
        }));
      } else if (resizing) {
        const box = dragStartRef.current.box;
        if (resizing === 'br') {
          const newW = Math.max(20, Math.min(100 - box.x, box.width + dxPct));
          const newH = Math.max(20, Math.min(100 - box.y, box.height + dyPct));
          const size = Math.min(newW, newH);
          setCropBox({ ...box, width: size, height: size });
        } else if (resizing === 'tl') {
          const newW = Math.max(20, box.width - dxPct);
          const newH = Math.max(20, box.height - dyPct);
          const size = Math.min(newW, newH);
          setCropBox({
            x: Math.min(box.x + box.width - 20, box.x + (box.width - size)),
            y: Math.min(box.y + box.height - 20, box.y + (box.height - size)),
            width: size,
            height: size,
          });
        }
      }
    };
    const handleUp = () => { setDragging(false); setResizing(null); };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragging, resizing]);

  const handleConfirm = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    onConfirm({
      x: (cropBox.x / 100) * naturalWidth,
      y: (cropBox.y / 100) * naturalHeight,
      width: (cropBox.width / 100) * naturalWidth,
      height: (cropBox.height / 100) * naturalHeight,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-walnut-950/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-walnut-900 rounded-card p-5 border border-champagne-900/20 shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-cream flex items-center gap-2"><Crop size={18} className="text-champagne-500" /> Crop Your Photo</h3>
          <button onClick={onCancel} className="p-2 text-walnut-400 hover:text-cream"><X size={18} /></button>
        </div>
        <div
          ref={containerRef}
          className="relative w-full aspect-square rounded-card overflow-hidden bg-walnut-800 mb-4"
        >
          <img ref={imgRef} src={imageSrc} alt="Crop" className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable={false} />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-walnut-950/50 pointer-events-none" style={{ clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${cropBox.x}% ${cropBox.y}%, ${cropBox.x}% ${cropBox.y + cropBox.height}%, ${cropBox.x + cropBox.width}% ${cropBox.y + cropBox.height}%, ${cropBox.x + cropBox.width}% ${cropBox.y}%, ${cropBox.x}% ${cropBox.y}%)` }} />
          {/* Crop box */}
          <div
            onPointerDown={(e) => { e.preventDefault(); dragStartRef.current = { x: e.clientX, y: e.clientY, box: { ...cropBox } }; setDragging(true); }}
            className="absolute border-2 border-champagne-500 cursor-move"
            style={{ left: `${cropBox.x}%`, top: `${cropBox.y}%`, width: `${cropBox.width}%`, height: `${cropBox.height}%` }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/3 left-0 right-0 border-t border-champagne-400/30" />
              <div className="absolute top-2/3 left-0 right-0 border-t border-champagne-400/30" />
              <div className="absolute left-1/3 top-0 bottom-0 border-l border-champagne-400/30" />
              <div className="absolute left-2/3 top-0 bottom-0 border-l border-champagne-400/30" />
            </div>
            {/* Corner handles */}
            <div onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); dragStartRef.current = { x: e.clientX, y: e.clientY, box: { ...cropBox } }; setResizing('tl'); }} className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-champagne-500 rounded-sm cursor-nwse-resize" />
            <div onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); dragStartRef.current = { x: e.clientX, y: e.clientY, box: { ...cropBox } }; setResizing('br'); }} className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-champagne-500 rounded-sm cursor-nwse-resize" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory text-sm font-medium flex items-center justify-center gap-2 transition-colors">
            <Check size={16} /> Apply Crop
          </button>
          <button onClick={onCancel} className="px-5 py-2.5 rounded-card bg-walnut-800 text-beige-300 text-sm font-medium">Cancel</button>
        </div>
      </div>
    </div>
  );
}
