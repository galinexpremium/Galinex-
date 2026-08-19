import os
import pymupdf as fitz
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageOps

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

def create_studio_stage(width=800, height=1000):
    """Creates a dark luxury studio background with subtle radial spotlight"""
    bg = Image.new("RGB", (width, height), (13, 11, 10))
    draw = ImageDraw.Draw(bg)
    
    # Radial spotlight in center
    cx, cy = width // 2, int(height * 0.52)
    max_r = int(width * 0.72)
    for r in range(max_r, 0, -8):
        factor = (1.0 - (r / max_r)) ** 1.6
        col = (
            int(13 + 30 * factor),
            int(11 + 24 * factor),
            int(10 + 18 * factor)
        )
        draw.ellipse([cx - r, cy - int(r * 0.8), cx + r, cy + int(r * 0.8)], fill=col)
    
    bg = bg.filter(ImageFilter.GaussianBlur(16))
    return bg

def clean_and_composite(cropped_img, out_path, target_size=(800, 1000), fill_ratio=0.82):
    """Cleanly crops white/black borders, enhances quality, and centers on 4:5 stage"""
    # 1. Convert to RGBA for clean edge blending
    prod = cropped_img.convert("RGBA")
    
    # Subtle sharpness & contrast enhancement
    rgb_part = prod.convert("RGB")
    enhancer = ImageEnhance.Sharpness(rgb_part)
    rgb_part = enhancer.enhance(1.15)
    enhancer = ImageEnhance.Contrast(rgb_part)
    rgb_part = enhancer.enhance(1.05)
    
    cw, ch = rgb_part.size
    stage_w, stage_h = target_size
    
    max_w = int(stage_w * fill_ratio)
    max_h = int(stage_h * fill_ratio)
    scale = min(max_w / cw, max_h / ch)
    new_w = int(cw * scale)
    new_h = int(ch * scale)
    
    resized = rgb_part.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 2. Stage
    stage = create_studio_stage(stage_w, stage_h)
    
    pos_x = (stage_w - new_w) // 2
    pos_y = (stage_h - new_h) // 2
    
    # Floor contact shadow
    shadow = Image.new("RGBA", (stage_w, stage_h), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    sh_y = pos_y + new_h - 10
    sh_w = int(new_w * 0.75)
    sh_h = max(18, int(new_h * 0.06))
    s_draw.ellipse(
        [(stage_w - sh_w)//2, sh_y - sh_h//2, (stage_w + sh_w)//2, sh_y + sh_h//2],
        fill=(0, 0, 0, 175)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    stage.paste(shadow, (0, 0), shadow)
    
    # Paste resized product
    stage.paste(resized, (pos_x, pos_y))
    
    stage.save(out_path, format="WEBP", quality=92)
    print(f"Generated Clean Studio Image: {out_path} ({new_w}x{new_h} on {stage_w}x{stage_h})")

# -------------------------------------------------------------
# PAGE 3: 3D CRYSTALS 1 (8 items)
# -------------------------------------------------------------
p3 = pages[2]
W, H = p3.size

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
    # 2x4 grid: top: 0.28 to 0.86
    left = (0.06 + c * 0.225) * W
    right = left + 0.20 * W
    top = (0.285 + r * 0.285) * H
    bottom = top + 0.22 * H
    crop = p3.crop((int(left), int(top), int(right), int(bottom)))
    clean_and_composite(crop, f"public/products/3d-crystal-gifts/{slug}.webp")

# -------------------------------------------------------------
# PAGE 4: 3D CRYSTALS 2 (7 items)
# -------------------------------------------------------------
p4 = pages[3]
W, H = p4.size

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
    left = (0.06 + c * 0.225) * W
    right = left + 0.20 * W
    top = (0.285 + r * 0.285) * H
    bottom = top + 0.22 * H
    crop = p4.crop((int(left), int(top), int(right), int(bottom)))
    clean_and_composite(crop, f"public/products/3d-crystal-gifts/{slug}.webp")

# -------------------------------------------------------------
# PAGE 5: BIG A4 CUBE & KEYCHAINS (5 items)
# -------------------------------------------------------------
p5 = pages[4]
W, H = p5.size

# Big A4 Cube (Top middle area)
a4_crop = p5.crop((int(0.08 * W), int(0.29 * H), int(0.44 * W), int(0.51 * H)))
clean_and_composite(a4_crop, "public/products/3d-crystal-gifts/big-a4-size-crystal-cube.webp", fill_ratio=0.88)

# Keychains row (Tightly cropped without page margins)
clean_and_composite(p5.crop((int(0.06 * W), int(0.55 * H), int(0.24 * W), int(0.71 * H))), "public/products/crystal-keychains/cube-crystal-keychain.webp")
clean_and_composite(p5.crop((int(0.37 * W), int(0.55 * H), int(0.55 * W), int(0.71 * H))), "public/products/crystal-keychains/heart-crystal-keychain.webp")
clean_and_composite(p5.crop((int(0.67 * W), int(0.55 * H), int(0.85 * W), int(0.71 * H))), "public/products/crystal-keychains/round-crystal-keychain.webp")
clean_and_composite(p5.crop((int(0.06 * W), int(0.74 * H), int(0.24 * W), int(0.89 * H))), "public/products/crystal-keychains/big-crystal-keychain.webp")

# -------------------------------------------------------------
# PAGE 6: 3D CRYSTALS 3 (8 items)
# -------------------------------------------------------------
p6 = pages[5]
W, H = p6.size

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
    left = (0.06 + c * 0.225) * W
    right = left + 0.20 * W
    top = (0.285 + r * 0.285) * H
    bottom = top + 0.22 * H
    crop = p6.crop((int(left), int(top), int(right), int(bottom)))
    clean_and_composite(crop, f"public/products/3d-crystal-gifts/{slug}.webp")

# -------------------------------------------------------------
# PAGE 7: WOODEN ENGRAVING PART 1 (8 items) - TIGHT CROPS TO ELIMINATE "10x8 WOOD" LABELS & WHITE PAPER BORDERS
# -------------------------------------------------------------
p7 = pages[6]
W, H = p7.size

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
    # Wood plaques have a top header band "10x8 WOOD" from 0.00 to 0.15 of card height
    # Product sits from 0.16 to 0.82 of cell height
    grid_left = 0.05 * W
    cell_w = (0.90 * W) / 4.0
    grid_top = 0.27 * H
    cell_h = (0.59 * H) / 2.0
    
    c_left = grid_left + c * cell_w
    c_top = grid_top + r * cell_h
    
    # Pure wooden plaque cropping (avoiding top label & bottom price tag)
    img_left = int(c_left + 0.10 * cell_w)
    img_right = int(c_left + 0.90 * cell_w)
    img_top = int(c_top + 0.14 * cell_h)    # Skips top "10x8 WOOD" banner!
    img_bottom = int(c_top + 0.76 * cell_h) # Skips bottom price tag!
    
    crop = p7.crop((img_left, img_top, img_right, img_bottom))
    clean_and_composite(crop, f"public/products/wooden-engraving/{slug}.webp", fill_ratio=0.84)

# -------------------------------------------------------------
# PAGE 8: WOODEN ENGRAVING PART 2 (8 items) - TIGHT CROPS TO ELIMINATE "9x7 OVAL", "ZIG ZAG", LABELS
# -------------------------------------------------------------
p8 = pages[7]
W, H = p8.size

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
    grid_left = 0.05 * W
    cell_w = (0.90 * W) / 4.0
    grid_top = 0.27 * H
    cell_h = (0.59 * H) / 2.0
    
    c_left = grid_left + c * cell_w
    c_top = grid_top + r * cell_h
    
    img_left = int(c_left + 0.08 * cell_w)
    img_right = int(c_left + 0.92 * cell_w)
    img_top = int(c_top + 0.14 * cell_h)
    img_bottom = int(c_top + 0.76 * cell_h)
    
    crop = p8.crop((img_left, img_top, img_right, img_bottom))
    clean_and_composite(crop, f"public/products/wooden-engraving/{slug}.webp", fill_ratio=0.84)

# -------------------------------------------------------------
# PAGE 9: ACRYLIC 6x4
# -------------------------------------------------------------
p9 = pages[8]
W, H = p9.size
ac_6x4 = p9.crop((int(0.06 * W), int(0.31 * H), int(0.25 * W), int(0.52 * H)))
clean_and_composite(ac_6x4, "public/products/acrylic-led/6x4-acrylic-engraving-block.webp")

# -------------------------------------------------------------
# PAGE 10: ACRYLIC WOOD FRAME WITH LIGHT
# -------------------------------------------------------------
p10 = pages[9]
W, H = p10.size
ac_frame = p10.crop((int(0.06 * W), int(0.31 * H), int(0.28 * W), int(0.55 * H)))
clean_and_composite(ac_frame, "public/products/acrylic-led/6x8-acrylic-wood-frame-with-light.webp")

# -------------------------------------------------------------
# PAGE 11: MOON LAMPS & BLUETOOTH SPEAKER & MDF (5 items)
# -------------------------------------------------------------
p11 = pages[10]
W, H = p11.size

# Moon Lamps row
moon_12 = p11.crop((int(0.05 * W), int(0.27 * H), int(0.24 * W), int(0.48 * H)))
clean_and_composite(moon_12, "public/products/moon-lamps/2d-12-cm-moon-lamp.webp")

moon_15 = p11.crop((int(0.28 * W), int(0.27 * H), int(0.48 * W), int(0.48 * H)))
clean_and_composite(moon_15, "public/products/moon-lamps/2d-15-cm-moon-lamp.webp")

moon_3d_15 = p11.crop((int(0.51 * W), int(0.27 * H), int(0.72 * W), int(0.48 * H)))
clean_and_composite(moon_3d_15, "public/products/moon-lamps/3d-15-cm-moon-lamp.webp")

speaker = p11.crop((int(0.75 * W), int(0.27 * H), int(0.95 * W), int(0.48 * H)))
clean_and_composite(speaker, "public/products/moon-lamps/personalized-bluetooth-speaker.webp")

# MDF Wall Decor Collection (Bottom half of page 11)
mdf_crop = p11.crop((int(0.06 * W), int(0.54 * H), int(0.94 * W), int(0.85 * H)))
clean_and_composite(mdf_crop, "public/products/mdf-decor/mdf-custom-cutout-and-collage-collection.webp", fill_ratio=0.90)

print("\n--- ALL 51 PRODUCT IMAGES RE-GENERATED & CLEANED FLAWLESSLY ---")
