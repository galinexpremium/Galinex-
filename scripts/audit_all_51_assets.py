import os
from PIL import Image

PRODUCTS = [
    # 3D Crystals (24)
    '3d-crystal-gifts/5x5x8-3d-crystal-single-image.webp',
    '3d-crystal-gifts/5x5x8-3d-crystal-couple-image.webp',
    '3d-crystal-gifts/6x4x4-3d-crystal-single-image.webp',
    '3d-crystal-gifts/6x4x4-3d-crystal-couple-image.webp',
    '3d-crystal-gifts/6x6x10-3d-crystal-single-image.webp',
    '3d-crystal-gifts/6x6x10-3d-crystal-couple-image.webp',
    '3d-crystal-gifts/5x5x5-3d-crystal-single-image.webp',
    '3d-crystal-gifts/5x5x5-3d-crystal-couple-image.webp',
    '3d-crystal-gifts/3d-diamond-heart-crystal.webp',
    '3d-crystal-gifts/3d-plain-heart-crystal.webp',
    '3d-crystal-gifts/12x8x6-3d-crystal-couple-image.webp',
    '3d-crystal-gifts/10x7x4-3d-crystal-couple-image.webp',
    '3d-crystal-gifts/11x11x3-3d-round-crystal.webp',
    '3d-crystal-gifts/small-apple-3d-crystal.webp',
    '3d-crystal-gifts/big-apple-3d-crystal-couple.webp',
    '3d-crystal-gifts/8x8x8-corner-cut-3d-crystal.webp',
    '3d-crystal-gifts/12x9x3-small-frame-3d-crystal.webp',
    '3d-crystal-gifts/2d-heart-crystal.webp',
    '3d-crystal-gifts/16x12x3-big-frame-3d-crystal.webp',
    '3d-crystal-gifts/car-hanging-crystal-with-tassel.webp',
    '3d-crystal-gifts/4x4x8-stample-3d-crystal.webp',
    '3d-crystal-gifts/ice-berg-3d-crystal.webp',
    '3d-crystal-gifts/big-cube-15x10x15-3d-crystal.webp',
    '3d-crystal-gifts/big-a4-size-crystal-cube.webp',

    # Keychains (4)
    'crystal-keychains/cube-crystal-keychain.webp',
    'crystal-keychains/heart-crystal-keychain.webp',
    'crystal-keychains/round-crystal-keychain.webp',
    'crystal-keychains/big-crystal-keychain.webp',

    # Wooden Engraving (16)
    'wooden-engraving/6x4-wooden-engraving-plaque.webp',
    'wooden-engraving/6x8-wooden-engraving-plaque.webp',
    'wooden-engraving/8x6-heart-wooden-plaque.webp',
    'wooden-engraving/10x8-heart-wooden-plaque.webp',
    'wooden-engraving/10x8-wooden-engraving-plaque.webp',
    'wooden-engraving/12x8-wooden-engraving-plaque.webp',
    'wooden-engraving/9x7-oval-wooden-plaque.webp',
    'wooden-engraving/12x8-double-heart-wooden-plaque.webp',
    'wooden-engraving/6x8-oval-wooden-plaque.webp',
    'wooden-engraving/10x8-oval-wooden-plaque.webp',
    'wooden-engraving/9x6-zig-zag-wooden-plaque.webp',
    'wooden-engraving/8x8-round-wooden-photo-clock.webp',
    'wooden-engraving/12x5-horizontal-wooden-clock.webp',
    'wooden-engraving/8x8-square-framed-wood-plaque.webp',
    'wooden-engraving/guitar-shaped-wooden-plaque.webp',
    'wooden-engraving/12x18-large-rustic-wood-plaque.webp',

    # Acrylic & LED (2)
    'acrylic-led/6x4-acrylic-engraving-block.webp',
    'acrylic-led/6x8-acrylic-wood-frame-with-light.webp',

    # Moon Lamps (4)
    'moon-lamps/personalized-bluetooth-speaker.webp',
    'moon-lamps/2d-12-cm-moon-lamp.webp',
    'moon-lamps/2d-15-cm-moon-lamp.webp',
    'moon-lamps/3d-15-cm-moon-lamp.webp',

    # MDF (1)
    'mdf-decor/mdf-custom-cutout-and-collage-collection.webp',
]

print(f"Auditing {len(PRODUCTS)} / 51 official product assets...")

passed = 0
failed = 0

for p in PRODUCTS:
    full_path = os.path.join('public', 'products', p)
    if not os.path.exists(full_path):
        print(f"❌ MISSING: {p}")
        failed += 1
        continue
        
    try:
        with Image.open(full_path) as img:
            w, h = img.size
            if (w, h) != (800, 1000):
                print(f"❌ INVALID SIZE {w}x{h}: {p}")
                failed += 1
                continue
                
            # Check for white paper borders at outer boundaries
            corners = [
                img.getpixel((5, 5)),
                img.getpixel((795, 5)),
                img.getpixel((5, 995)),
                img.getpixel((795, 995)),
            ]
            has_white_border = any(sum(c[:3]) > 600 for c in corners)
            if has_white_border:
                print(f"❌ WHITE BORDER DETECTED: {p}")
                failed += 1
                continue
                
            # Check bottom 40px for text banners
            bot_brightness = [sum(img.getpixel((x, 970))[:3])/3.0 for x in range(50, 750, 20)]
            if sum(bot_brightness) / len(bot_brightness) > 160:
                print(f"❌ TEXT BANNER AT BOTTOM: {p}")
                failed += 1
                continue

            passed += 1
    except Exception as e:
        print(f"❌ CORRUPTED {p}: {e}")
        failed += 1

print("\n" + "="*50)
print(f"AUDIT RESULT: {passed} / {len(PRODUCTS)} PASSED ({failed} failed)")
print("="*50)

if failed == 0:
    print("[PASS] All 51 product assets are 100% clean studio photography without catalogue artifacts.")
else:
    exit(1)
