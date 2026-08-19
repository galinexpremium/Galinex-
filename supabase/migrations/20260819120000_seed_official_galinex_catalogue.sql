-- ====================================================================
-- GALINEX OFFICIAL CATALOGUE MIGRATION (IDEMPOTENT & NON-DESTRUCTIVE)
-- Source of Truth: Official 14-Page Galinex PDF Catalogue
-- ====================================================================

-- 1. Schema Adjustment: Allow NULL base_price for Price on Request items
ALTER TABLE products ALTER COLUMN base_price DROP NOT NULL;

-- 2. Safely Deactivate / Archive Demo Products
-- Note: Does NOT delete any records to preserve foreign key references
-- in orders, order_items, customer profiles, reviews, cart, and wishlist.
UPDATE products
SET is_active = false
WHERE slug IN (
  '3d-crystal-photo-cube-small',
  '3d-crystal-heart-pendant',
  '3d-crystal-diamond-tower',
  'personalized-wooden-photo-plaque',
  'engraved-wooden-name-plate',
  'acrylic-led-photo-frame',
  'acrylic-led-couple-frame',
  'personalized-moon-lamp',
  'moon-lamp-with-stand',
  'mdf-photo-cutout',
  'mdf-anniversary-plaque',
  'crystal-photo-keychain'
);

-- 3. Upsert Official Categories
INSERT INTO categories (id, name, slug, description, sort_order, is_active)
VALUES
  ('c1111111-1111-1111-1111-111111111111', '3D Crystal Gifts', '3d-crystal-gifts', 'Premium 3D laser-engraved optical crystal keepsakes crafted with precision.', 1, true),
  ('c2222222-2222-2222-2222-222222222222', 'Crystal Keychains', 'crystal-keychains', 'Carry your memories wherever you go with elegant 3D laser-engraved crystal keychains.', 2, true),
  ('c3333333-3333-3333-3333-333333333333', 'Wooden Engraving Gifts', 'wooden-engraving', 'Custom laser-engraved natural wood plaques, heart keepsakes, and photo clocks.', 3, true),
  ('c4444444-4444-4444-4444-444444444444', 'Acrylic & LED Frames', 'acrylic-led', 'High-clarity acrylic engraving with warm LED illumination wooden bases.', 4, true),
  ('c5555555-5555-5555-5555-555555555555', 'Moon Lamps & Speakers', 'moon-lamps', 'Touch-controlled personalized photo moon lamps and light-up bluetooth speakers.', 5, true),
  ('c6666666-6666-6666-6666-666666666666', 'MDF Decor Collection', 'mdf-decor', 'Artistic MDF family tree collages, love standees, and custom wall frames.', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- 4. Upsert All 51 Official Galinex Catalogue Products

-- --- CATEGORY 1: 3D Crystal Gifts (Pages 3, 4, 6) ---
INSERT INTO products (
  category_id, name, slug, description, short_description,
  base_price, sale_price, dimensions, material, badge,
  tags, is_active, is_featured, is_customizable, requires_photo
)
VALUES
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '5X5X8 3D Crystal (Single Image)', '5x5x8-3d-crystal-single-image', 'High precision laser-engraved 3D optical crystal tower for single person portraits.', '5x5x8 cm Single Image 3D Crystal', 1000, 1000, '5x5x8 cm', 'Optical Crystal', 'best_seller', ARRAY['3d', 'crystal', 'tower'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '5X5X8 3D Crystal (Couple Image)', '5x5x8-3d-crystal-couple-image', 'High precision laser-engraved 3D optical crystal tower for couple portraits.', '5x5x8 cm Couple Image 3D Crystal', 1100, 1100, '5x5x8 cm', 'Optical Crystal', NULL, ARRAY['3d', 'crystal', 'couple', 'tower'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '6X4X4 3D Crystal (Single Image)', '6x4x4-3d-crystal-single-image', 'Compact 6x4x4 cm laser-engraved crystal cube for single portraits.', '6x4x4 cm Single Image 3D Crystal', 700, 700, '6x4x4 cm', 'Optical Crystal', NULL, ARRAY['3d', 'crystal', 'cube'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '6X4X4 3D Crystal (Couple Image)', '6x4x4-3d-crystal-couple-image', 'Compact 6x4x4 cm laser-engraved crystal cube for couple portraits.', '6x4x4 cm Couple Image 3D Crystal', 900, 900, '6x4x4 cm', 'Optical Crystal', NULL, ARRAY['3d', 'crystal', 'couple'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '6X6X10 3D Crystal (Single Image)', '6x6x10-3d-crystal-single-image', 'Premium large 6x6x10 cm optical crystal tower with vivid 3D sub-surface laser engraving.', '6x6x10 cm Single Image 3D Crystal', 1400, 1400, '6x6x10 cm', 'Optical Crystal', 'trending', ARRAY['3d', 'crystal', 'tower', 'large'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '6X6X10 3D Crystal (Couple Image)', '6x6x10-3d-crystal-couple-image', 'Premium large 6x6x10 cm optical crystal tower for couple and wedding memories.', '6x6x10 cm Couple Image 3D Crystal', 1600, 1600, '6x6x10 cm', 'Optical Crystal', 'best_seller', ARRAY['3d', 'crystal', 'couple', 'large'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '5X5X5 3D Crystal (Single Image)', '5x5x5-3d-crystal-single-image', 'Classic 5x5x5 cm optical crystal cube with 3D laser engraved portrait.', '5x5x5 cm Single Image 3D Crystal', 800, 800, '5x5x5 cm', 'Optical Crystal', NULL, ARRAY['3d', 'crystal', 'cube'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '5X5X5 3D Crystal (Couple Image)', '5x5x5-3d-crystal-couple-image', 'Classic 5x5x5 cm optical crystal cube with 3D laser engraved couple portrait.', '5x5x5 cm Couple Image 3D Crystal', 1000, 1000, '5x5x5 cm', 'Optical Crystal', NULL, ARRAY['3d', 'crystal', 'couple', 'cube'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '3D Diamond Heart Crystal', '3d-diamond-heart-crystal', 'Exquisite diamond-faceted heart crystal with sub-surface 3D laser engraving.', 'Diamond Faceted Heart 3D Crystal', 3600, 3600, 'Diamond Cut Heart', 'Faceted Optical Crystal', 'best_seller', ARRAY['3d', 'crystal', 'heart', 'diamond'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '3D Plain Heart Crystal', '3d-plain-heart-crystal', 'Romantic smooth contoured heart crystal with sub-surface 3D laser engraving.', 'Smooth Heart 3D Crystal', 2800, 2800, 'Smooth Heart Shape', 'Optical Crystal', NULL, ARRAY['3d', 'crystal', 'heart'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '12X8X6 3D Crystal (Couple Image)', '12x8x6-3d-crystal-couple-image', 'Spacious landscape 3D optical crystal block for couples and family portraits.', '12x8x6 cm Couple 3D Crystal', 3600, 3600, '12x8x6 cm', 'Optical Crystal', 'new', ARRAY['3d', 'crystal', 'landscape', 'couple'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '10X7X4 3D Crystal (Couple Image)', '10x7x4-3d-crystal-couple-image', 'Medium landscape optical crystal block with 3D engraving for couples.', '10x7x4 cm Couple 3D Crystal', 1800, 1800, '10x7x4 cm', 'Optical Crystal', NULL, ARRAY['3d', 'crystal', 'landscape'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '11X11X3 3D Round Crystal', '11x11x3-3d-round-crystal', 'Circular optical crystal plaque with faceted rim and 3D sub-surface laser engraving.', '11x11x3 cm Round 3D Crystal', 2200, 2200, '11x11x3 cm', 'Optical Crystal', NULL, ARRAY['3d', 'crystal', 'round'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), 'Small Apple 3D Crystal', 'small-apple-3d-crystal', 'Charming apple-shaped crystal keepsake with personalized 3D portrait engraving.', 'Small Apple Shape 3D Crystal', 1400, 1400, 'Apple Shape (Small)', 'Optical Crystal', NULL, ARRAY['3d', 'crystal', 'apple'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), 'Big Apple 3D Crystal (Couple)', 'big-apple-3d-crystal-couple', 'Large apple-shaped crystal keepsake with 3D couple engraving and message.', 'Big Apple Shape 3D Crystal', 2600, 2600, 'Apple Shape (Big)', 'Optical Crystal', NULL, ARRAY['3d', 'crystal', 'apple', 'couple'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '8X8X8 Corner Cut 3D Crystal', '8x8x8-corner-cut-3d-crystal', 'Modern corner-standing optical crystal cube that balances on its cut facet.', '8x8x8 cm Corner Cut 3D Crystal', 2800, 2800, '8x8x8 cm', 'Optical Crystal', 'trending', ARRAY['3d', 'crystal', 'corner_cut'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '12X9X3 Small Frame 3D Crystal', '12x9x3-small-frame-3d-crystal', 'Crystal photo frame with ornate scalloped border and sub-surface 3D engraving.', '12x9x3 cm Small Crystal Frame', 3000, 3000, '12x9x3 cm', 'Optical Crystal Frame', NULL, ARRAY['3d', 'crystal', 'frame'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '2D Heart Crystal', '2d-heart-crystal', 'Delicate heart crystal with precision 2D sub-surface photo engraving.', '2D Engraved Heart Crystal', 1400, 1400, 'Heart Shape', 'Optical Crystal', NULL, ARRAY['2d', 'crystal', 'heart'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '16X12X3 Big Frame 3D Crystal', '16x12x3-big-frame-3d-crystal', 'Grand crystal frame with faceted beveled borders for prestigious family memories.', '16x12x3 cm Big Crystal Frame', 4800, 4800, '16x12x3 cm', 'Optical Crystal Frame', 'limited_edition', ARRAY['3d', 'crystal', 'frame', 'large'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), 'Car Hanging Crystal with Tassel', 'car-hanging-crystal-with-tassel', 'Miniature crystal pendant with silk tassel for car rear-view mirror display.', 'Car Hanging 3D Crystal', 800, 800, 'Compact with Tassel', 'Optical Crystal + Silk Tassel', 'best_seller', ARRAY['3d', 'crystal', 'car_hanging'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), '4X4X8 Stample 3D Crystal', '4x4x8-stample-3d-crystal', 'Arch-topped optical crystal pillar with 3D monument/portrait laser engraving.', '4x4x8 cm Arch Pillar 3D Crystal', 1400, 1400, '4x4x8 cm', 'Optical Crystal', NULL, ARRAY['3d', 'crystal', 'pillar'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), 'Ice Berg 3D Crystal', 'ice-berg-3d-crystal', 'Dramatic multi-faceted iceberg cut crystal with radiant optical light refraction.', 'Faceted Iceberg 3D Crystal', 3600, 3600, 'Faceted Iceberg Cut', 'Faceted Optical Crystal', 'trending', ARRAY['3d', 'crystal', 'iceberg'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), 'Big Cube 15X10X15 3D Crystal', 'big-cube-15x10x15-3d-crystal', 'Extra-large optical crystal showcase cube for multi-figure and family photos.', '15x10x15 cm Big 3D Crystal Cube', 6000, 6000, '15x10x15 cm', 'Optical Crystal', 'limited_edition', ARRAY['3d', 'crystal', 'cube', 'large'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = '3d-crystal-gifts'), 'Big A4 Size Crystal Cube', 'big-a4-size-crystal-cube', 'The masterpiece grand A4 crystal block (5 cm thick) with high-density laser engraving.', 'A4 (21 x 29.7 cm), 5 cm Thickness', 24000, 24000, '21 x 29.7 cm (5 cm thick)', 'Premium Optical Crystal', 'limited_edition', ARRAY['3d', 'crystal', 'a4', 'masterpiece'], true, true, true, true)

ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  base_price = EXCLUDED.base_price,
  sale_price = EXCLUDED.sale_price,
  dimensions = EXCLUDED.dimensions,
  material = EXCLUDED.material,
  badge = EXCLUDED.badge,
  tags = EXCLUDED.tags,
  is_active = true;


-- --- CATEGORY 2: Crystal Keychains (Page 5) ---
INSERT INTO products (
  category_id, name, slug, description, short_description,
  base_price, sale_price, dimensions, material, badge,
  tags, is_active, is_featured, is_customizable, requires_photo
)
VALUES
  ((SELECT id FROM categories WHERE slug = 'crystal-keychains'), 'Cube Crystal Keychain', 'cube-crystal-keychain', 'Elegant cube crystal keychain with laser photo engraving. Small in size, big in memories.', '3x3x3 cm, Thickness 2 cm', 500, 500, '3 x 3 x 3 cm (Thickness: 2 cm)', 'Optical Crystal', 'best_seller', ARRAY['3d', 'keychain', 'cube'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'crystal-keychains'), 'Heart Crystal Keychain', 'heart-crystal-keychain', 'Heart-shaped crystal keychain to keep your favorite memories close wherever you go.', '3.5x3.5 cm, Thickness 2 cm', 500, 500, '3.5 x 3.5 cm (Thickness: 2 cm)', 'Optical Crystal', 'trending', ARRAY['3d', 'keychain', 'heart'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'crystal-keychains'), 'Round Crystal Keychain', 'round-crystal-keychain', 'Round crystal keychain with beautiful sub-surface 3D engraving and metallic chain.', 'Ø 3.5 cm, Thickness 2 cm', 500, 500, 'Ø 3.5 cm (Thickness: 2 cm)', 'Optical Crystal', NULL, ARRAY['3d', 'keychain', 'round'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'crystal-keychains'), 'Big Crystal Keychain', 'big-crystal-keychain', 'Larger rectangular crystal keychain for bold laser engraved portraits.', '2.5x4x2 cm', 700, 700, '2.5 x 4 x 2 cm', 'Optical Crystal', NULL, ARRAY['3d', 'keychain', 'rectangular'], true, false, true, true)

ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  base_price = EXCLUDED.base_price,
  sale_price = EXCLUDED.sale_price,
  dimensions = EXCLUDED.dimensions,
  material = EXCLUDED.material,
  badge = EXCLUDED.badge,
  tags = EXCLUDED.tags,
  is_active = true;


-- --- CATEGORY 3: Wooden Engraving Gifts (Pages 7 & 8) ---
INSERT INTO products (
  category_id, name, slug, description, short_description,
  base_price, sale_price, dimensions, material, badge,
  tags, is_active, is_featured, is_customizable, requires_photo
)
VALUES
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '6×4" Wooden Engraving Plaque', '6x4-wooden-engraving-plaque', 'Laser-engraved natural wood photo plaque with easel stand included.', '6x4" Natural Wood Photo Plaque', 600, 600, '6 x 4 inch', 'Natural Wood', 'best_seller', ARRAY['2d', 'wood', 'plaque'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '6×8" Wooden Engraving Plaque', '6x8-wooden-engraving-plaque', 'Classic portrait 6x8 inch engraved wood plaque with personalized message.', '6x8" Natural Wood Photo Plaque', 800, 800, '6 x 8 inch', 'Natural Wood', NULL, ARRAY['2d', 'wood', 'plaque'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '8×6" Heart Wooden Plaque', '8x6-heart-wooden-plaque', 'Heart-shaped natural wood keepsake plaque with detailed photo engraving.', '8x6" Heart Wood Plaque', 1200, 1200, '8 x 6 inch', 'Heart Shaped Wood', 'trending', ARRAY['2d', 'wood', 'heart'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '10×8" Heart Wooden Plaque', '10x8-heart-wooden-plaque', 'Large heart-shaped wood plaque with engraved floral border and custom photo.', '10x8" Heart Wood Plaque', 1800, 1800, '10 x 8 inch', 'Floral Border Wood', NULL, ARRAY['2d', 'wood', 'heart'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '10×8" Wooden Engraving Plaque', '10x8-wooden-engraving-plaque', 'Spacious 10x8 inch natural wood plaque for family memories and custom quotes.', '10x8" Natural Wood Photo Plaque', 1400, 1400, '10 x 8 inch', 'Natural Wood', NULL, ARRAY['2d', 'wood', 'plaque'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '12×8" Wooden Engraving Plaque', '12x8-wooden-engraving-plaque', 'Wide landscape 12x8 inch wood plaque with high precision laser photo engraving.', '12x8" Natural Wood Photo Plaque', 1600, 1600, '12 x 8 inch', 'Natural Wood', 'best_seller', ARRAY['2d', 'wood', 'plaque', 'landscape'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '9×7" Oval Wooden Plaque', '9x7-oval-wooden-plaque', 'Graceful oval contoured wood plaque with smooth laser engraved portrait.', '9x7" Oval Wood Plaque', 1600, 1600, '9 x 7 inch', 'Oval Wood', NULL, ARRAY['2d', 'wood', 'oval'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '12×8" Double Heart Wooden Plaque', '12x8-double-heart-wooden-plaque', 'Interlocking double-heart wooden standee with Together Forever engraving.', '12x8" Double Heart Wood Plaque', 2000, 2000, '12 x 8 inch', 'Dual Heart Wood', 'trending', ARRAY['2d', 'wood', 'heart', 'double_heart'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '6×8" Oval Wooden Plaque', '6x8-oval-wooden-plaque', 'Medium oval wood plaque with delicate beveled rim and custom portrait.', '6x8" Oval Wood Plaque', 1200, 1200, '6 x 8 inch', 'Oval Wood', NULL, ARRAY['2d', 'wood', 'oval'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '10×8" Oval Wooden Plaque', '10x8-oval-wooden-plaque', 'Large oval wood plaque ideal for family portraits and golden jubilee anniversaries.', '10x8" Oval Wood Plaque', 1800, 1800, '10 x 8 inch', 'Oval Wood', NULL, ARRAY['2d', 'wood', 'oval'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '9×6" Zig Zag Wooden Plaque', '9x6-zig-zag-wooden-plaque', 'Stylized scalloped zig-zag edge wood plaque with custom laser engraved photo.', '9x6" Zig Zag Wood Plaque', 1300, 1300, '9 x 6 inch', 'Scalloped Edge Wood', NULL, ARRAY['2d', 'wood', 'zig_zag'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '8×8" Round Wooden Photo Clock', '8x8-round-wooden-photo-clock', 'Functional round wall clock with personalized laser engraved photo dial.', '8x8" Wooden Photo Wall Clock', 2000, 2000, '8 x 8 inch', 'Wood Clock', 'best_seller', ARRAY['2d', 'wood', 'clock'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '12×5" Horizontal Wooden Clock', '12x5-horizontal-wooden-clock', 'Desktop wooden photo frame combined with analog clock movement.', '12x5" Desktop Wood Photo Clock', 2000, 2000, '12 x 5 inch', 'Wood Clock Frame', NULL, ARRAY['2d', 'wood', 'clock'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '8×8" Square Framed Wood Plaque', '8x8-square-framed-wood-plaque', 'Square wooden plaque surrounded by raised solid wood border moulding.', '8x8" Framed Square Wood Plaque', 1600, 1600, '8 x 8 inch', 'Framed Wood', NULL, ARRAY['2d', 'wood', 'framed'], true, false, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), 'Guitar Shaped Wooden Plaque', 'guitar-shaped-wooden-plaque', 'Unique guitar silhouette wooden plaque with romantic couple laser engraving.', 'Guitar Cutout Wood Plaque', 2200, 2200, 'Guitar Shape Cutout', 'Specialty Cutout Wood', 'trending', ARRAY['2d', 'wood', 'guitar'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'wooden-engraving'), '12×18" Large Rustic Wood Plaque', '12x18-large-rustic-wood-plaque', 'Grand 12x18 inch rustic plaque with natural live bark edging.', '12x18" Rustic Bark Wood Plaque', 3200, 3200, '12 x 18 inch', 'Live Edge Bark Wood', 'limited_edition', ARRAY['2d', 'wood', 'rustic'], true, true, true, true)

ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  base_price = EXCLUDED.base_price,
  sale_price = EXCLUDED.sale_price,
  dimensions = EXCLUDED.dimensions,
  material = EXCLUDED.material,
  badge = EXCLUDED.badge,
  tags = EXCLUDED.tags,
  is_active = true;


-- --- CATEGORY 4: Acrylic & LED Frames (Pages 9 & 10) ---
INSERT INTO products (
  category_id, name, slug, description, short_description,
  base_price, sale_price, dimensions, material, badge,
  tags, is_active, is_featured, is_customizable, requires_photo
)
VALUES
  ((SELECT id FROM categories WHERE slug = 'acrylic-led'), '6×4 Acrylic Engraving Block', '6x4-acrylic-engraving-block', 'Crystal-clear acrylic block with precision laser engraving. Available for portraits, couples, family, and anniversaries.', '6x4" Clear Acrylic Engraving Block', 1800, 1800, '6 x 4 inch', 'High-Clarity Acrylic', 'best_seller', ARRAY['2d', 'acrylic', 'block'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'acrylic-led'), '6×8 Acrylic Wood Frame with Light', '6x8-acrylic-wood-frame-with-light', 'Thick acrylic photo block illuminated by a solid wooden LED light base. Radiant warm glow brings your memories to life.', '6x8" Acrylic Frame with Wooden LED Light Base', 2000, 2000, '6 x 8 inch (Start Size)', 'Acrylic + Wooden LED Base', 'best_seller', ARRAY['2d', 'acrylic', 'led_light', 'wooden_base'], true, true, true, true)

ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  base_price = EXCLUDED.base_price,
  sale_price = EXCLUDED.sale_price,
  dimensions = EXCLUDED.dimensions,
  material = EXCLUDED.material,
  badge = EXCLUDED.badge,
  tags = EXCLUDED.tags,
  is_active = true;


-- --- CATEGORY 5: Moon Lamps & Speakers (Page 11) ---
INSERT INTO products (
  category_id, name, slug, description, short_description,
  base_price, sale_price, dimensions, material, badge,
  tags, is_active, is_featured, is_customizable, requires_photo
)
VALUES
  ((SELECT id FROM categories WHERE slug = 'moon-lamps'), 'Personalized Bluetooth Speaker', 'personalized-bluetooth-speaker', 'Multicolor LED touch lamp and high-fidelity bluetooth speaker with 360-degree laser photo wrap.', 'Cylindrical Touch LED Bluetooth Speaker', 1200, 1200, 'Cylindrical 15 cm', 'Touch LED Speaker', 'trending', ARRAY['speaker', 'bluetooth', 'led', 'music'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'moon-lamps'), '2D 12 CM Moon Lamp', '2d-12-cm-moon-lamp', '12 cm diameter lunar texture lamp with 2D photo lithophane and wooden geometric stand.', '12 cm 2D Photo Moon Lamp with Wooden Stand', 1400, 1400, '12 cm Diameter', 'Lithophane + Wood Stand', 'best_seller', ARRAY['2d', 'moon_lamp', '12cm'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'moon-lamps'), '2D 15 CM Moon Lamp', '2d-15-cm-moon-lamp', '15 cm diameter lunar texture lamp with 2D photo lithophane, touch dimmer, and wooden stand.', '15 cm 2D Photo Moon Lamp with Wooden Stand', 1800, 1800, '15 cm Diameter', 'Lithophane + Wood Stand', NULL, ARRAY['2d', 'moon_lamp', '15cm'], true, true, true, true),
  ((SELECT id FROM categories WHERE slug = 'moon-lamps'), '3D 15 CM Moon Lamp', '3d-15-cm-moon-lamp', '15 cm premium 3D relief engraved moon lamp that creates realistic depth and texture when lit.', '15 cm 3D Relief Moon Lamp with Wooden Stand', 3000, 3000, '15 cm Diameter', '3D Relief Lithophane + Wood Stand', 'limited_edition', ARRAY['3d', 'moon_lamp', '15cm', 'relief'], true, true, true, true)

ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  base_price = EXCLUDED.base_price,
  sale_price = EXCLUDED.sale_price,
  dimensions = EXCLUDED.dimensions,
  material = EXCLUDED.material,
  badge = EXCLUDED.badge,
  tags = EXCLUDED.tags,
  is_active = true;


-- --- CATEGORY 6: MDF Decor Collection (Page 11) ---
INSERT INTO products (
  category_id, name, slug, description, short_description,
  base_price, sale_price, dimensions, material, badge,
  tags, is_active, is_featured, is_customizable, requires_photo
)
VALUES
  ((SELECT id FROM categories WHERE slug = 'mdf-decor'), 'MDF Custom Cutout & Collage Collection', 'mdf-custom-cutout-and-collage-collection', 'Custom multi-frame MDF standees, family tree collages, clock frames, and love silhouettes. Contact us on WhatsApp for custom sizing and pricing.', 'Custom MDF Collages, Standees & Wall Frames (Price on Request)', NULL, NULL, 'Custom Sizing', 'Premium MDF Wood', 'new', ARRAY['price_on_request', 'custom_inquiry', 'mdf'], true, true, true, true)

ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  base_price = EXCLUDED.base_price,
  sale_price = EXCLUDED.sale_price,
  dimensions = EXCLUDED.dimensions,
  material = EXCLUDED.material,
  badge = EXCLUDED.badge,
  tags = EXCLUDED.tags,
  is_active = true;
