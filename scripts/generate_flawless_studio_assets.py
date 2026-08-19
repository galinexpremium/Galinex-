import os
import pymupdf as fitz
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

os.makedirs('public/products/3d-crystal-gifts', exist_ok=True)
os.makedirs('public/products/crystal-keychains', exist_ok=True)
os.makedirs('public/products/wooden-engraving', exist_ok=True)
os.makedirs('public/products/acrylic-led', exist_ok=True)
os.makedirs('public/products/moon-lamps', exist_ok=True)
os.makedirs('public/products/mdf-decor', exist_ok=True)

doc = fitz.open('public/galinex-catalogue.pdf')

# Render 300 DPI uncompressed pages (2480x2480)
pages = []
for i in range(len(doc)):
    page = doc[i]
    pix = page.get_pixmap(dpi=300)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    pages.append(img)

def create_studio_canvas(width=800, height=1000):
    """Creates a dark luxury studio background with subtle warm radial spotlight"""
    bg = Image.new("RGB", (width, height), (15, 11, 9))
    draw = ImageDraw.Draw(bg)
    
    # Warm radial spotlight in center
    cx, cy = width // 2, int(height * 0.50)
    max_r = int(width * 0.70)
    for r in range(max_r, 0, -6):
        factor = (1.0 - (r / max_r)) ** 1.5
        col = (
            int(15 + 32 * factor),
            int(11 + 24 * factor),
            int(9 + 18 * factor)
        )
        draw.ellipse([cx - r, cy - int(r * 0.85), cx + r, cy + int(r * 0.85)], fill=col)
    
    bg = bg.filter(ImageFilter.GaussianBlur(16))
    return bg

def trim_catalogue_banners(crop_img):
    """Detects and trims bright banner labels at the top or bottom of a cell without cutting the physical product"""
    w, h = crop_img.size
    
    # 1. Scan from bottom upwards for bright horizontal text banner
    trim_bot = h
    for y in range(h - 1, int(h * 0.65), -2):
        row = [crop_img.getpixel((x, y)) for x in range(int(w * 0.1), int(w * 0.9), 4)]
        avg = sum(sum(p) for p in row) / (3 * len(row))
        if avg > 175: # Bright cream/white text banner detected
            trim_bot = y - 4
        elif avg < 120 and trim_bot < h:
            # Reached dark product/floor above banner
            break
            
    # 2. Scan from top downwards for bright header banner (e.g. on wood plaques)
    trim_top = 0
    for y in range(0, int(h * 0.35), 2):
        row = [crop_img.getpixel((x, y)) for x in range(int(w * 0.1), int(w * 0.9), 4)]
        avg = sum(sum(p) for p in row) / (3 * len(row))
        if avg > 175:
            trim_top = y + 4
        elif avg < 120 and trim_top > 0:
            break
            
    # Trim 4px side boundaries to remove potential cell borders
    trim_left = 4
    trim_right = w - 4
    
    if trim_top >= trim_bot - 20:
        trim_top = 0
        trim_bot = h
        
    return crop_img.crop((trim_left, trim_top, trim_right, trim_bot))

def isolate_and_composite(crop_img, out_path, is_white_bg=False, fill_ratio=0.82):
    """Cleanly isolates physical product, enhances studio quality, and centers on 800x1000 stage"""
    # 1. Trim catalogue text banners
    cleaned = trim_catalogue_banners(crop_img)
    cw, ch = cleaned.size
    
    # 2. Convert to RGBA
    rgba = cleaned.convert("RGBA")
    
    if is_white_bg:
        # Wood plaque segmentation: remove white/light paper background
        datas = list(rgba.getdata())
        new_data = []
        for item in datas:
            r, g, b, a = item
            # White/light gray paper detection (r,g,b > 215 with low saturation)
            brightness = (r + g + b) / 3.0
            max_diff = max(abs(r - g), abs(g - b), abs(b - r))
            if brightness > 220 and max_diff < 20:
                new_data.append((r, g, b, 0))
            elif brightness > 195 and max_diff < 25:
                alpha = int(255 * (1.0 - (brightness - 195) / 25.0))
                new_data.append((r, g, b, alpha))
            else:
                new_data.append((r, g, b, 255))
        rgba.putdata(new_data)
        
        # Crop tight to non-transparent bounding box with 6px padding
        bbox = rgba.getbbox()
        if bbox:
            bx1 = max(0, bbox[0] - 6)
            by1 = max(0, bbox[1] - 6)
            bx2 = min(cw, bbox[2] + 6)
            by2 = min(ch, bbox[3] + 6)
            rgba = rgba.crop((bx1, by1, bx2, by2))
            cw, ch = rgba.size
    else:
        # Dark studio background product (crystals, moon lamps, acrylic, speaker, MDF)
        mask = Image.new("L", (cw, ch), 255)
        draw_m = ImageDraw.Draw(mask)
        # Soft 6px edge vignette
        for i in range(8):
            alpha = int(255 * (i / 8.0))
            draw_m.rectangle([i, i, cw - 1 - i, ch - 1 - i], outline=alpha)
        mask = mask.filter(ImageFilter.GaussianBlur(3))
        rgba.putalpha(mask)
        
    # 3. Enhance clarity and contrast subtly without altering physical product photography
    r, g, b, a = rgba.split()
    rgb = Image.merge("RGB", (r, g, b))
    enhancer = ImageEnhance.Sharpness(rgb)
    rgb = enhancer.enhance(1.15)
    enhancer = ImageEnhance.Contrast(rgb)
    rgb = enhancer.enhance(1.05)
    r, g, b = rgb.split()
    rgba = Image.merge("RGBA", (r, g, b, a))
    
    # 4. Proportional Scaling onto 800x1000 Canvas
    stage_w, stage_h = 800, 1000
    max_w = int(stage_w * fill_ratio)
    max_h = int(stage_h * fill_ratio)
    scale = min(max_w / cw, max_h / ch)
    new_w = max(10, int(cw * scale))
    new_h = max(10, int(ch * scale))
    
    resized = rgba.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 5. Studio Stage & Floor Contact Shadow
    stage = create_studio_canvas(stage_w, stage_h)
    pos_x = (stage_w - new_w) // 2
    pos_y = (stage_h - new_h) // 2
    
    # Floor contact shadow under base
    shadow = Image.new("RGBA", (stage_w, stage_h), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    sh_y = pos_y + new_h - 8
    sh_w = int(new_w * 0.72)
    sh_h = max(14, int(new_h * 0.05))
    s_draw.ellipse(
        [(stage_w - sh_w)//2, sh_y - sh_h//2, (stage_w + sh_w)//2, sh_y + sh_h//2],
        fill=(0, 0, 0, 185)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    stage.paste(shadow, (0, 0), shadow)
    
    # Paste product
    stage.paste(resized, (pos_x, pos_y), resized)
    
    # Save as high-quality WebP
    stage.save(out_path, format="WEBP", quality=92, method=6)
    print(f"Generated: {out_path} ({new_w}x{new_h} on 800x1000)")

# =============================================================
# PAGE 3: 3D CRYSTALS 1 (8 products)
# =============================================================
p3 = pages[2]
W3, H3 = p3.size
p3_items = [
    ('5x5x8-3d-crystal-single-image', 0, 0),
    ('5x5x8-3d-crystal-couple-image', 0, 1),
    ('6x4x4-3d-crystal-single-image', 0, 2),
    ('6x4x4-3d-crystal-couple-image', 0, 3),
    ('6x6x10-3d-crystal-single-image', 1, 0),
    ('6x6x10-3d-crystal-couple-image', 1, 1),
    ('5x5x5-3d-crystal-single-image', 1, 2),
    ('5x5x5-3d-crystal-couple-image', 1, 3),
]
for slug, r, c in p3_items:
    left = int((0.055 + c * 0.225) * W3)
    right = int(left + 0.205 * W3)
    top = int((0.285 + r * 0.285) * H3)
    bottom = int(top + 0.198 * H3)
    crop = p3.crop((left, top, right, bottom))
    isolate_and_composite(crop, f"public/products/3d-crystal-gifts/{slug}.webp", is_white_bg=False, fill_ratio=0.82)

# =============================================================
# PAGE 4: 3D CRYSTALS 2 (7 products)
# =============================================================
p4 = pages[3]
W4, H4 = p4.size
p4_items = [
    ('3d-diamond-heart-crystal', 0, 0),
    ('3d-plain-heart-crystal', 0, 1),
    ('12x8x6-3d-crystal-couple-image', 0, 2),
    ('10x7x4-3d-crystal-couple-image', 0, 3),
    ('11x11x3-3d-round-crystal', 1, 1),
    ('small-apple-3d-crystal', 1, 2),
    ('big-apple-3d-crystal-couple', 1, 3),
]
for slug, r, c in p4_items:
    left = int((0.055 + c * 0.225) * W4)
    right = int(left + 0.205 * W4)
    top = int((0.285 + r * 0.285) * H4)
    bottom = int(top + 0.198 * H4)
    crop = p4.crop((left, top, right, bottom))
    isolate_and_composite(crop, f"public/products/3d-crystal-gifts/{slug}.webp", is_white_bg=False, fill_ratio=0.82)

# =============================================================
# PAGE 5: BIG A4 CUBE & KEYCHAINS (5 products)
# =============================================================
p5 = pages[4]
W5, H5 = p5.size

# Big A4 Cube (Top middle area)
a4_crop = p5.crop((int(0.08 * W5), int(0.285 * H5), int(0.44 * W5), int(0.495 * H5)))
isolate_and_composite(a4_crop, "public/products/3d-crystal-gifts/big-a4-size-crystal-cube.webp", is_white_bg=False, fill_ratio=0.86)

# Keychains (Row 1: Cube, Heart, Round; Row 2: Big Rectangle)
isolate_and_composite(p5.crop((int(0.06 * W5), int(0.55 * H5), int(0.24 * W5), int(0.685 * H5))), "public/products/crystal-keychains/cube-crystal-keychain.webp", is_white_bg=False, fill_ratio=0.84)
isolate_and_composite(p5.crop((int(0.37 * W5), int(0.55 * H5), int(0.55 * W5), int(0.685 * H5))), "public/products/crystal-keychains/heart-crystal-keychain.webp", is_white_bg=False, fill_ratio=0.84)
isolate_and_composite(p5.crop((int(0.67 * W5), int(0.55 * H5), int(0.85 * W5), int(0.685 * H5))), "public/products/crystal-keychains/round-crystal-keychain.webp", is_white_bg=False, fill_ratio=0.84)
isolate_and_composite(p5.crop((int(0.06 * W5), int(0.74 * H5), int(0.24 * W5), int(0.865 * H5))), "public/products/crystal-keychains/big-crystal-keychain.webp", is_white_bg=False, fill_ratio=0.84)

# =============================================================
# PAGE 6: 3D CRYSTALS 3 (8 products)
# =============================================================
p6 = pages[5]
W6, H6 = p6.size
p6_items = [
    ('8x8x8-corner-cut-3d-crystal', 0, 0),
    ('12x9x3-small-frame-3d-crystal', 0, 1),
    ('2d-heart-crystal', 0, 2),
    ('16x12x3-big-frame-3d-crystal', 0, 3),
    ('car-hanging-crystal-with-tassel', 1, 0),
    ('4x4x8-stample-3d-crystal', 1, 1),
    ('ice-berg-3d-crystal', 1, 2),
    ('big-cube-15x10x15-3d-crystal', 1, 3),
]
for slug, r, c in p6_items:
    left = int((0.055 + c * 0.225) * W6)
    right = int(left + 0.205 * W6)
    top = int((0.285 + r * 0.285) * H6)
    bottom = int(top + 0.198 * H6)
    crop = p6.crop((left, top, right, bottom))
    isolate_and_composite(crop, f"public/products/3d-crystal-gifts/{slug}.webp", is_white_bg=False, fill_ratio=0.82)

# =============================================================
# PAGE 7: WOODEN ENGRAVING PART 1 (8 products)
# =============================================================
p7 = pages[6]
W7, H7 = p7.size
p7_items = [
    ('6x4-wooden-engraving-plaque', 0, 0),
    ('6x8-wooden-engraving-plaque', 0, 1),
    ('8x6-heart-wooden-plaque', 0, 2),
    ('10x8-heart-wooden-plaque', 0, 3),
    ('10x8-wooden-engraving-plaque', 1, 0),
    ('12x8-wooden-engraving-plaque', 1, 1),
    ('9x7-oval-wooden-plaque', 1, 2),
    ('12x8-double-heart-wooden-plaque', 1, 3),
]
for slug, r, c in p7_items:
    grid_left = 0.05 * W7
    cell_w = (0.90 * W7) / 4.0
    grid_top = 0.27 * H7
    cell_h = (0.59 * H7) / 2.0
    
    c_left = int(grid_left + c * cell_w + 0.06 * cell_w)
    c_right = int(grid_left + (c + 1) * cell_w - 0.06 * cell_w)
    c_top = int(grid_top + r * cell_h + 0.15 * cell_h)
    c_bottom = int(grid_top + r * cell_h + 0.77 * cell_h)
    
    crop = p7.crop((c_left, c_top, c_right, c_bottom))
    isolate_and_composite(crop, f"public/products/wooden-engraving/{slug}.webp", is_white_bg=True, fill_ratio=0.84)

# =============================================================
# PAGE 8: WOODEN ENGRAVING PART 2 (8 products)
# =============================================================
p8 = pages[7]
W8, H8 = p8.size
p8_items = [
    ('6x8-oval-wooden-plaque', 0, 0),
    ('10x8-oval-wooden-plaque', 0, 1),
    ('9x6-zig-zag-wooden-plaque', 0, 2),
    ('8x8-round-wooden-photo-clock', 0, 3),
    ('12x5-horizontal-wooden-clock', 1, 0),
    ('8x8-square-framed-wood-plaque', 1, 1),
    ('guitar-shaped-wooden-plaque', 1, 2),
    ('12x18-large-rustic-wood-plaque', 1, 3),
]
for slug, r, c in p8_items:
    grid_left = 0.05 * W8
    cell_w = (0.90 * W8) / 4.0
    grid_top = 0.27 * H8
    cell_h = (0.59 * H8) / 2.0
    
    c_left = int(grid_left + c * cell_w + 0.06 * cell_w)
    c_right = int(grid_left + (c + 1) * cell_w - 0.06 * cell_w)
    c_top = int(grid_top + r * cell_h + 0.15 * cell_h)
    c_bottom = int(grid_top + r * cell_h + 0.77 * cell_h)
    
    crop = p8.crop((c_left, c_top, c_right, c_bottom))
    isolate_and_composite(crop, f"public/products/wooden-engraving/{slug}.webp", is_white_bg=True, fill_ratio=0.84)

# =============================================================
# PAGE 9: ACRYLIC 6x4 ENGRAVING BLOCK (Page index 8)
# =============================================================
p9 = pages[8]
W9, H9 = p9.size
crop_p9 = p9.crop((int(0.06 * W9), int(0.31 * H9), int(0.28 * W9), int(0.55 * H9)))
isolate_and_composite(crop_p9, "public/products/acrylic-led/6x4-acrylic-engraving-block.webp", is_white_bg=False, fill_ratio=0.84)

# =============================================================
# PAGE 10: 6x8 ACRYLIC WOOD FRAME WITH LIGHT (Page index 9)
# =============================================================
p10 = pages[9]
W10, H10 = p10.size
crop_p10 = p10.crop((int(0.06 * W10), int(0.31 * H10), int(0.30 * W10), int(0.55 * H10)))
isolate_and_composite(crop_p10, "public/products/acrylic-led/6x8-acrylic-wood-frame-with-light.webp", is_white_bg=False, fill_ratio=0.84)

# =============================================================
# PAGE 11: MOON LAMPS, BLUETOOTH SPEAKER & MDF (Page index 10)
# =============================================================
p11 = pages[10]
W11, H11 = p11.size

# Col 0: 2D 12 CM Moon Lamp
crop_moon_12 = p11.crop((int(0.05 * W11), int(0.27 * H11), int(0.25 * W11), int(0.48 * H11)))
isolate_and_composite(crop_moon_12, "public/products/moon-lamps/2d-12-cm-moon-lamp.webp", is_white_bg=False, fill_ratio=0.84)

# Col 1: 2D 15 CM Moon Lamp
crop_moon_15 = p11.crop((int(0.28 * W11), int(0.27 * H11), int(0.48 * W11), int(0.48 * H11)))
isolate_and_composite(crop_moon_15, "public/products/moon-lamps/2d-15-cm-moon-lamp.webp", is_white_bg=False, fill_ratio=0.84)

# Col 2: 3D 15 CM Moon Lamp
crop_moon_3d = p11.crop((int(0.51 * W11), int(0.27 * H11), int(0.72 * W11), int(0.48 * H11)))
isolate_and_composite(crop_moon_3d, "public/products/moon-lamps/3d-15-cm-moon-lamp.webp", is_white_bg=False, fill_ratio=0.84)

# Col 3: Personalized Bluetooth Speaker
crop_speaker = p11.crop((int(0.74 * W11), int(0.27 * H11), int(0.95 * W11), int(0.48 * H11)))
isolate_and_composite(crop_speaker, "public/products/moon-lamps/personalized-bluetooth-speaker.webp", is_white_bg=False, fill_ratio=0.84)

# Bottom: MDF Custom Cutout and Collage Collection
crop_mdf = p11.crop((int(0.06 * W11), int(0.54 * H11), int(0.94 * W11), int(0.85 * H11)))
isolate_and_composite(crop_mdf, "public/products/mdf-decor/mdf-custom-cutout-and-collage-collection.webp", is_white_bg=False, fill_ratio=0.88)

print("\n--- ALL 51 PRODUCT ASSETS EXTRACTED FROM AUTHENTIC OFFICIAL CATALOGUE PAGES ---")
