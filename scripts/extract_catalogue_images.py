import os
import fitz  # PyMuPDF
from PIL import Image, ImageEnhance, ImageFilter

os.makedirs('public/products/3d-crystal-gifts', exist_ok=True)
os.makedirs('public/products/crystal-keychains', exist_ok=True)
os.makedirs('public/products/wooden-engraving', exist_ok=True)
os.makedirs('public/products/acrylic-led', exist_ok=True)
os.makedirs('public/products/moon-lamps', exist_ok=True)
os.makedirs('public/products/mdf-decor', exist_ok=True)

doc = fitz.open('public/galinex-catalogue.pdf')
print(f"Total PDF pages: {len(doc)}")

# Render pages at 300 DPI (approx 4x zoom for ultra crisp extraction)
pages = []
for i in range(len(doc)):
    page = doc[i]
    pix = page.get_pixmap(dpi=300)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    pages.append(img)
    print(f"Page {i+1} rendered at {img.size[0]}x{img.size[1]}")

def clean_and_save(img, out_path):
    # Enhance slightly: sharpness & contrast
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(1.15)
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.05)
    img.save(out_path, format="WEBP", quality=92)
    print(f"Saved: {out_path} ({img.size[0]}x{img.size[1]})")

# Helper for standard 2x4 grid on Pages 3, 4, 6, 7, 8
def extract_2x4_grid(page_img, mapping):
    W, H = page_img.size
    # Grid margins in normalized percentages
    # On catalogue pages:
    # Header takes top ~26%, Footer takes bottom ~14%
    # Grid area is approx: X: 5% to 95%, Y: 26% to 86%
    grid_left = 0.05 * W
    grid_right = 0.95 * W
    grid_top = 0.265 * H
    grid_bottom = 0.865 * H
    
    cell_w = (grid_right - grid_left) / 4.0
    cell_h = (grid_bottom - grid_top) / 2.0
    
    # Within each cell, the image area is the upper 72% of the card
    for row in range(2):
        for col in range(4):
            idx = row * 4 + col
            if idx >= len(mapping) or mapping[idx] is None or mapping[idx][0] is None:
                continue
            slug, cat = mapping[idx]
            
            c_left = grid_left + col * cell_w
            c_top = grid_top + row * cell_h
            
            # Crop card inner image (avoid text and price tags at bottom)
            img_left = c_left + 0.06 * cell_w
            img_right = c_left + 0.94 * cell_w
            img_top = c_top + 0.03 * cell_h
            img_bottom = c_top + 0.73 * cell_h
            
            cropped = page_img.crop((img_left, img_top, img_right, img_bottom))
            out_path = f"public/products/{cat}/{slug}.webp"
            clean_and_save(cropped, out_path)

# --- PAGE 3: 3D Crystal Gifts ---
p3_mapping = [
    ('5x5x8-3d-crystal-single-image', '3d-crystal-gifts'),
    ('5x5x8-3d-crystal-couple-image', '3d-crystal-gifts'),
    ('6x4x4-3d-crystal-single-image', '3d-crystal-gifts'),
    ('6x4x4-3d-crystal-couple-image', '3d-crystal-gifts'),
    ('6x6x10-3d-crystal-single-image', '3d-crystal-gifts'),
    ('6x6x10-3d-crystal-couple-image', '3d-crystal-gifts'),
    ('5x5x5-3d-crystal-single-image', '3d-crystal-gifts'),
    ('5x5x5-3d-crystal-couple-image', '3d-crystal-gifts'),
]
extract_2x4_grid(pages[2], p3_mapping)

# --- PAGE 4: 3D Crystal Gifts ---
p4_mapping = [
    ('3d-diamond-heart-crystal', '3d-crystal-gifts'),
    ('3d-plain-heart-crystal', '3d-crystal-gifts'),
    ('12x8x6-3d-crystal-couple-image', '3d-crystal-gifts'),
    ('10x7x4-3d-crystal-couple-image', '3d-crystal-gifts'),
    (None, None), # 6x6x10 light base
    ('11x11x3-3d-round-crystal', '3d-crystal-gifts'),
    ('small-apple-3d-crystal', '3d-crystal-gifts'),
    ('big-apple-3d-crystal-couple', '3d-crystal-gifts'),
]
extract_2x4_grid(pages[3], p4_mapping)

# --- PAGE 5: Crystal Keychains & Big A4 Cube ---
p5 = pages[4]
W, H = p5.size
# Top Hero A4 Cube
a4_cube = p5.crop((0.08 * W, 0.28 * H, 0.46 * W, 0.51 * H))
clean_and_save(a4_cube, "public/products/3d-crystal-gifts/big-a4-size-crystal-cube.webp")

# Bottom row 1 keychains: Cube, Heart, Round
cube_key = p5.crop((0.04 * W, 0.53 * H, 0.25 * W, 0.71 * H))
clean_and_save(cube_key, "public/products/crystal-keychains/cube-crystal-keychain.webp")

heart_key = p5.crop((0.35 * W, 0.53 * H, 0.56 * W, 0.71 * H))
clean_and_save(heart_key, "public/products/crystal-keychains/heart-crystal-keychain.webp")

round_key = p5.crop((0.65 * W, 0.53 * H, 0.86 * W, 0.71 * H))
clean_and_save(round_key, "public/products/crystal-keychains/round-crystal-keychain.webp")

# Bottom row 2: Big Key
big_key = p5.crop((0.04 * W, 0.72 * H, 0.25 * W, 0.89 * H))
clean_and_save(big_key, "public/products/crystal-keychains/big-crystal-keychain.webp")

# --- PAGE 6: 3D Crystal Gifts ---
p6_mapping = [
    ('8x8x8-corner-cut-3d-crystal', '3d-crystal-gifts'),
    ('12x9x3-small-frame-3d-crystal', '3d-crystal-gifts'),
    ('2d-heart-crystal', '3d-crystal-gifts'),
    ('16x12x3-big-frame-3d-crystal', '3d-crystal-gifts'),
    ('car-hanging-crystal-with-tassel', '3d-crystal-gifts'),
    ('4x4x8-stample-3d-crystal', '3d-crystal-gifts'),
    ('ice-berg-3d-crystal', '3d-crystal-gifts'),
    ('big-cube-15x10x15-3d-crystal', '3d-crystal-gifts'),
]
extract_2x4_grid(pages[5], p6_mapping)

# --- PAGE 7: Wooden Engraving Gifts Part 1 ---
p7_mapping = [
    ('6x4-wooden-engraving-plaque', 'wooden-engraving'),
    ('6x8-wooden-engraving-plaque', 'wooden-engraving'),
    ('8x6-heart-wooden-plaque', 'wooden-engraving'),
    ('10x8-heart-wooden-plaque', 'wooden-engraving'),
    ('10x8-wooden-engraving-plaque', 'wooden-engraving'),
    ('12x8-wooden-engraving-plaque', 'wooden-engraving'),
    ('9x7-oval-wooden-plaque', 'wooden-engraving'),
    ('12x8-double-heart-wooden-plaque', 'wooden-engraving'),
]
extract_2x4_grid(pages[6], p7_mapping)

# --- PAGE 8: Wooden Engraving Gifts Part 2 ---
p8_mapping = [
    ('6x8-oval-wooden-plaque', 'wooden-engraving'),
    ('10x8-oval-wooden-plaque', 'wooden-engraving'),
    ('9x6-zig-zag-wooden-plaque', 'wooden-engraving'),
    ('8x8-round-wooden-photo-clock', 'wooden-engraving'),
    ('12x5-horizontal-wooden-clock', 'wooden-engraving'),
    ('8x8-square-framed-wood-plaque', 'wooden-engraving'),
    ('guitar-shaped-wooden-plaque', 'wooden-engraving'),
    ('12x18-large-rustic-wood-plaque', 'wooden-engraving'),
]
extract_2x4_grid(pages[7], p8_mapping)

# --- PAGE 9: Acrylic Engraving Block ---
p9 = pages[8]
W, H = p9.size
# Take the primary hero 6x4 Acrylic Engraving Block
acrylic_6x4 = p9.crop((0.05 * W, 0.28 * H, 0.26 * W, 0.52 * H))
clean_and_save(acrylic_6x4, "public/products/acrylic-led/6x4-acrylic-engraving-block.webp")

# --- PAGE 10: Acrylic Wood Frame with Light ---
p10 = pages[9]
W, H = p10.size
# Take the primary 6x8 Acrylic Wood Frame with Light
acrylic_6x8_light = p10.crop((0.27 * W, 0.30 * H, 0.49 * H, 0.56 * H)) if False else p10.crop((0.27 * W, 0.30 * H, 0.49 * W, 0.54 * H))
clean_and_save(acrylic_6x8_light, "public/products/acrylic-led/6x8-acrylic-wood-frame-with-light.webp")

# --- PAGE 11: Moon Lamps, Bluetooth Speaker & MDF Decor ---
p11 = pages[10]
W, H = p11.size
# Top row 4 items: Speaker, 2D 12cm, 2D 15cm, 3D 15cm
speaker = p11.crop((0.04 * W, 0.26 * H, 0.26 * W, 0.49 * H))
clean_and_save(speaker, "public/products/moon-lamps/personalized-bluetooth-speaker.webp")

moon_12cm = p11.crop((0.28 * W, 0.26 * H, 0.49 * W, 0.49 * H))
clean_and_save(moon_12cm, "public/products/moon-lamps/2d-12-cm-moon-lamp.webp")

moon_15cm = p11.crop((0.51 * W, 0.26 * H, 0.72 * W, 0.49 * H))
clean_and_save(moon_15cm, "public/products/moon-lamps/2d-15-cm-moon-lamp.webp")

moon_3d_15cm = p11.crop((0.74 * W, 0.26 * H, 0.95 * W, 0.49 * H))
clean_and_save(moon_3d_15cm, "public/products/moon-lamps/3d-15-cm-moon-lamp.webp")

# Bottom section: MDF Decor Collection
mdf_collage = p11.crop((0.05 * W, 0.56 * H, 0.95 * W, 0.88 * H))
clean_and_save(mdf_collage, "public/products/mdf-decor/mdf-custom-cutout-and-collage-collection.webp")

print("\n--- ALL 51 CATALOGUE ASSETS EXTRACTED SUCCESSFULLY ---")
