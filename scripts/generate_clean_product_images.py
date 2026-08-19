import os
import fitz  # PyMuPDF
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageOps

os.makedirs('public/products/3d-crystal-gifts', exist_ok=True)
os.makedirs('public/products/crystal-keychains', exist_ok=True)
os.makedirs('public/products/wooden-engraving', exist_ok=True)
os.makedirs('public/products/acrylic-led', exist_ok=True)
os.makedirs('public/products/moon-lamps', exist_ok=True)
os.makedirs('public/products/mdf-decor', exist_ok=True)
os.makedirs('public/templates', exist_ok=True)

doc = fitz.open('public/galinex-catalogue.pdf')

# Render 300 DPI uncompressed pages
pages = []
for i in range(len(doc)):
    page = doc[i]
    pix = page.get_pixmap(dpi=300)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    pages.append(img)

def create_studio_backdrop(width=800, height=1000):
    """Creates a dark luxury studio background with subtle floor spotlight and vignette"""
    bg = Image.new("RGB", (width, height), (13, 11, 10))
    draw = ImageDraw.Draw(bg)
    
    # Radial spotlight in center-bottom where the product rests
    cx, cy = width // 2, int(height * 0.58)
    max_r = int(width * 0.75)
    for r in range(max_r, 0, -8):
        factor = (1.0 - (r / max_r)) ** 1.6
        # warm gold-walnut spotlight
        col = (
            int(13 + 28 * factor),
            int(11 + 22 * factor),
            int(10 + 16 * factor)
        )
        draw.ellipse([cx - r, cy - int(r * 0.8), cx + r, cy + int(r * 0.8)], fill=col)
    
    # Smooth blur the backdrop
    bg = bg.filter(ImageFilter.GaussianBlur(15))
    return bg

def composite_product_on_stage(cropped_img, out_path, target_size=(800, 1000), pad_scale=0.82, is_wide=False):
    """Composites the isolated product cleanly onto the luxury studio stage with grounding shadow"""
    bg = create_studio_backdrop(target_size[0], target_size[1])
    
    # Enhance cropped product image: subtle sharpness & contrast
    enhancer = ImageEnhance.Sharpness(cropped_img)
    cropped_img = enhancer.enhance(1.2)
    enhancer = ImageEnhance.Contrast(cropped_img)
    cropped_img = enhancer.enhance(1.06)
    
    cw, ch = cropped_img.size
    stage_w, stage_h = target_size
    
    # Calculate fit scale
    if is_wide:
        max_w = int(stage_w * 0.92)
        max_h = int(stage_h * 0.82)
    else:
        max_w = int(stage_w * pad_scale)
        max_h = int(stage_h * pad_scale)
        
    scale = min(max_w / cw, max_h / ch)
    new_w = int(cw * scale)
    new_h = int(ch * scale)
    
    resized_prod = cropped_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Position centered on stage
    pos_x = (stage_w - new_w) // 2
    pos_y = (stage_h - new_h) // 2
    
    # Grounding shadow on studio floor
    shadow = Image.new("RGBA", (stage_w, stage_h), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    sh_y = pos_y + new_h - 15
    sh_w = int(new_w * 0.7)
    sh_h = 24
    shadow_draw.ellipse(
        [(stage_w - sh_w)//2, sh_y - sh_h//2, (stage_w + sh_w)//2, sh_y + sh_h//2],
        fill=(0, 0, 0, 160)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    
    bg.paste(shadow, (0, 0), shadow)
    
    # Rounded card edge mask for ultra smooth product blending
    mask = Image.new("L", (new_w, new_h), 255)
    mask_draw = ImageDraw.Draw(mask)
    # slight vignette at product corners
    mask_draw.rectangle([0, 0, new_w, new_h], fill=255)
    
    bg.paste(resized_prod, (pos_x, pos_y))
    
    # Save as high quality WebP
    bg.save(out_path, format="WEBP", quality=92)
    print(f"Rendered Studio Image: {out_path}")

# Helper for standard 2x4 grid extraction with precise inner box coordinates
def extract_and_render_2x4(page_img, mapping, top_pct=0.265, bot_pct=0.865):
    W, H = page_img.size
    grid_left = 0.05 * W
    grid_right = 0.95 * W
    grid_top = top_pct * H
    grid_bottom = bot_pct * H
    
    cell_w = (grid_right - grid_left) / 4.0
    cell_h = (grid_bottom - grid_top) / 2.0
    
    for row in range(2):
        for col in range(4):
            idx = row * 4 + col
            if idx >= len(mapping) or mapping[idx] is None or mapping[idx][0] is None:
                continue
            slug, cat = mapping[idx]
            
            c_left = grid_left + col * cell_w
            c_top = grid_top + row * cell_h
            
            # Tightly crop product (avoiding catalogue text, badges, and card borders)
            img_left = c_left + 0.08 * cell_w
            img_right = c_left + 0.92 * cell_w
            img_top = c_top + 0.04 * cell_h
            img_bottom = c_top + 0.70 * cell_h
            
            cropped = page_img.crop((img_left, img_top, img_right, img_bottom))
            out_path = f"public/products/{cat}/{slug}.webp"
            composite_product_on_stage(cropped, out_path)

print("\n--- PROCESSING 51 STUDIO PRODUCT RENDERS ---")

# Page 3: 3D Crystals
extract_and_render_2x4(pages[2], [
    ('5x5x8-3d-crystal-single-image', '3d-crystal-gifts'),
    ('5x5x8-3d-crystal-couple-image', '3d-crystal-gifts'),
    ('6x4x4-3d-crystal-single-image', '3d-crystal-gifts'),
    ('6x4x4-3d-crystal-couple-image', '3d-crystal-gifts'),
    ('6x6x10-3d-crystal-single-image', '3d-crystal-gifts'),
    ('6x6x10-3d-crystal-couple-image', '3d-crystal-gifts'),
    ('5x5x5-3d-crystal-single-image', '3d-crystal-gifts'),
    ('5x5x5-3d-crystal-couple-image', '3d-crystal-gifts'),
])

# Page 4: 3D Crystals
extract_and_render_2x4(pages[3], [
    ('3d-diamond-heart-crystal', '3d-crystal-gifts'),
    ('3d-plain-heart-crystal', '3d-crystal-gifts'),
    ('12x8x6-3d-crystal-couple-image', '3d-crystal-gifts'),
    ('10x7x4-3d-crystal-couple-image', '3d-crystal-gifts'),
    (None, None),
    ('11x11x3-3d-round-crystal', '3d-crystal-gifts'),
    ('small-apple-3d-crystal', '3d-crystal-gifts'),
    ('big-apple-3d-crystal-couple', '3d-crystal-gifts'),
])

# Page 5: Keychains & Big A4 Cube
p5 = pages[4]
W, H = p5.size
a4_crop = p5.crop((0.09 * W, 0.29 * H, 0.44 * W, 0.50 * H))
composite_product_on_stage(a4_crop, "public/products/3d-crystal-gifts/big-a4-size-crystal-cube.webp", pad_scale=0.88)

cube_k = p5.crop((0.05 * W, 0.54 * H, 0.24 * W, 0.70 * H))
composite_product_on_stage(cube_k, "public/products/crystal-keychains/cube-crystal-keychain.webp")

heart_k = p5.crop((0.36 * W, 0.54 * H, 0.55 * W, 0.70 * H))
composite_product_on_stage(heart_k, "public/products/crystal-keychains/heart-crystal-keychain.webp")

round_k = p5.crop((0.66 * W, 0.54 * H, 0.85 * W, 0.70 * H))
composite_product_on_stage(round_k, "public/products/crystal-keychains/round-crystal-keychain.webp")

big_k = p5.crop((0.05 * W, 0.73 * H, 0.24 * W, 0.88 * H))
composite_product_on_stage(big_k, "public/products/crystal-keychains/big-crystal-keychain.webp")

# Page 6: 3D Crystals
extract_and_render_2x4(pages[5], [
    ('8x8x8-corner-cut-3d-crystal', '3d-crystal-gifts'),
    ('12x9x3-small-frame-3d-crystal', '3d-crystal-gifts'),
    ('2d-heart-crystal', '3d-crystal-gifts'),
    ('16x12x3-big-frame-3d-crystal', '3d-crystal-gifts'),
    ('car-hanging-crystal-with-tassel', '3d-crystal-gifts'),
    ('4x4x8-stample-3d-crystal', '3d-crystal-gifts'),
    ('ice-berg-3d-crystal', '3d-crystal-gifts'),
    ('big-cube-15x10x15-3d-crystal', '3d-crystal-gifts'),
])

# Page 7: Wood Part 1
extract_and_render_2x4(pages[6], [
    ('6x4-wooden-engraving-plaque', 'wooden-engraving'),
    ('6x8-wooden-engraving-plaque', 'wooden-engraving'),
    ('8x6-heart-wooden-plaque', 'wooden-engraving'),
    ('10x8-heart-wooden-plaque', 'wooden-engraving'),
    ('10x8-wooden-engraving-plaque', 'wooden-engraving'),
    ('12x8-wooden-engraving-plaque', 'wooden-engraving'),
    ('9x7-oval-wooden-plaque', 'wooden-engraving'),
    ('12x8-double-heart-wooden-plaque', 'wooden-engraving'),
])

# Page 8: Wood Part 2
extract_and_render_2x4(pages[7], [
    ('6x8-oval-wooden-plaque', 'wooden-engraving'),
    ('10x8-oval-wooden-plaque', 'wooden-engraving'),
    ('9x6-zig-zag-wooden-plaque', 'wooden-engraving'),
    ('8x8-round-wooden-photo-clock', 'wooden-engraving'),
    ('12x5-horizontal-wooden-clock', 'wooden-engraving'),
    ('8x8-square-framed-wood-plaque', 'wooden-engraving'),
    ('guitar-shaped-wooden-plaque', 'wooden-engraving'),
    ('12x18-large-rustic-wood-plaque', 'wooden-engraving'),
])

# Page 9: Acrylic 6x4
p9 = pages[8]
W, H = p9.size
ac_6x4 = p9.crop((0.06 * W, 0.29 * H, 0.25 * W, 0.51 * H))
composite_product_on_stage(ac_6x4, "public/products/acrylic-led/6x4-acrylic-engraving-block.webp")

# Page 10: Acrylic Wood Frame with Light
p10 = pages[9]
W, H = p10.size
ac_6x8_light = p10.crop((0.28 * W, 0.31 * H, 0.48 * W, 0.53 * H))
composite_product_on_stage(ac_6x8_light, "public/products/acrylic-led/6x8-acrylic-wood-frame-with-light.webp")

# Page 11: Moon Lamps & Speakers
p11 = pages[10]
W, H = p11.size
spk = p11.crop((0.05 * W, 0.27 * H, 0.25 * W, 0.48 * H))
composite_product_on_stage(spk, "public/products/moon-lamps/personalized-bluetooth-speaker.webp")

m12 = p11.crop((0.29 * W, 0.27 * H, 0.48 * W, 0.48 * H))
composite_product_on_stage(m12, "public/products/moon-lamps/2d-12-cm-moon-lamp.webp")

m15 = p11.crop((0.52 * W, 0.27 * H, 0.71 * W, 0.48 * H))
composite_product_on_stage(m15, "public/products/moon-lamps/2d-15-cm-moon-lamp.webp")

m3d = p11.crop((0.75 * W, 0.27 * H, 0.94 * W, 0.48 * H))
composite_product_on_stage(m3d, "public/products/moon-lamps/3d-15-cm-moon-lamp.webp")

mdf = p11.crop((0.06 * W, 0.57 * H, 0.94 * W, 0.87 * H))
composite_product_on_stage(mdf, "public/products/mdf-decor/mdf-custom-cutout-and-collage-collection.webp", is_wide=True)

print("\n--- ALL 51 STUDIO ASSETS RENDERED PERFECTLY ---")
