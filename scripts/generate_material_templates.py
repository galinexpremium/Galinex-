import os
from PIL import Image, ImageDraw, ImageFilter

os.makedirs('public/templates', exist_ok=True)

def create_crystal_stage():
    # 600x750 crystal chassis stage
    img = Image.new("RGBA", (600, 750), (13, 11, 10, 255))
    draw = ImageDraw.Draw(img)
    
    # Studio lighting on base
    draw.ellipse([150, 580, 450, 680], fill=(28, 24, 20, 255))
    
    # Crystal block outline with beveled glass facets
    # Base rectangle
    cx, cy, cw, ch = 300, 360, 320, 420
    x1, y1, x2, y2 = cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2
    
    # Dark optical crystal volume
    draw.rounded_rectangle([x1, y1, x2, y2], radius=16, fill=(18, 22, 28, 240), outline=(196, 163, 90, 80), width=2)
    # Inner refraction lines
    draw.line([x1+12, y1+12, x1+12, y2-12], fill=(255, 255, 255, 40), width=1)
    draw.line([x1+12, y1+12, x2-12, y1+12], fill=(255, 255, 255, 60), width=2)
    draw.line([x2-12, y1+12, x2-12, y2-12], fill=(100, 150, 255, 30), width=1)
    
    # Top corner specular glint
    draw.ellipse([x1+8, y1+8, x1+28, y1+28], fill=(255, 255, 255, 90))
    
    img = img.filter(ImageFilter.SMOOTH_MORE)
    img.save("public/templates/crystal_chassis.webp", format="WEBP", quality=92)
    print("Created crystal_chassis.webp")

def create_wood_stage():
    # 600x750 rich natural wood grain plaque stage
    img = Image.new("RGBA", (600, 750), (13, 11, 10, 255))
    draw = ImageDraw.Draw(img)
    
    # Warm studio spotlight
    draw.ellipse([120, 540, 480, 690], fill=(32, 24, 18, 255))
    
    # Wooden plaque with beveled bark edge
    cx, cy, cw, ch = 300, 360, 340, 440
    x1, y1, x2, y2 = cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2
    
    # Outer dark walnut bevel
    draw.rounded_rectangle([x1, y1, x2, y2], radius=24, fill=(45, 28, 16, 255), outline=(90, 55, 30, 255), width=4)
    # Inner light oak / birch face
    draw.rounded_rectangle([x1+16, y1+16, x2-16, y2-16], radius=16, fill=(215, 185, 145, 255), outline=(130, 85, 45, 200), width=3)
    
    # Draw subtle natural wood grain lines across the face
    for y in range(y1+20, y2-20, 18):
        draw.line([x1+20, y, x2-20, y+4], fill=(195, 165, 125, 120), width=2)
        
    img.save("public/templates/wood_chassis.webp", format="WEBP", quality=92)
    print("Created wood_chassis.webp")

def create_acrylic_stage():
    # 600x750 Acrylic with wooden LED base
    img = Image.new("RGBA", (600, 750), (13, 11, 10, 255))
    draw = ImageDraw.Draw(img)
    
    # LED base glow
    draw.ellipse([140, 500, 460, 680], fill=(50, 35, 15, 255))
    
    # Acrylic glass sheet
    cx, cy, cw, ch = 300, 320, 300, 380
    x1, y1, x2, y2 = cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2
    
    draw.rounded_rectangle([x1, y1, x2, y2], radius=12, fill=(16, 20, 26, 220), outline=(220, 240, 255, 90), width=2)
    
    # Wooden LED base slot
    bx1, by1, bx2, by2 = 120, y2 - 20, 480, y2 + 60
    draw.rounded_rectangle([bx1, by1, bx2, by2], radius=10, fill=(60, 40, 22, 255), outline=(120, 80, 45, 255), width=2)
    # LED light slot beam
    draw.rectangle([x1+20, y2-25, x2-20, y2-15], fill=(255, 220, 130, 240))
    
    img.save("public/templates/acrylic_chassis.webp", format="WEBP", quality=92)
    print("Created acrylic_chassis.webp")

def create_moon_stage():
    # 600x750 Moon lamp on wooden stand
    img = Image.new("RGBA", (600, 750), (13, 11, 10, 255))
    draw = ImageDraw.Draw(img)
    
    # Ambient floor glow
    draw.ellipse([150, 560, 450, 690], fill=(35, 30, 20, 255))
    
    # Triangular wooden tripod stand
    draw.polygon([(300, 520), (200, 660), (230, 660)], fill=(70, 45, 25, 255))
    draw.polygon([(300, 520), (400, 660), (370, 660)], fill=(60, 38, 20, 255))
    draw.polygon([(300, 520), (290, 680), (310, 680)], fill=(80, 52, 30, 255))
    
    # Spherical moon body
    cx, cy, r = 300, 340, 190
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(245, 235, 210, 255), outline=(210, 195, 160, 255), width=3)
    
    # Moon craters
    craters = [(260, 270, 30), (350, 290, 40), (280, 380, 45), (370, 420, 35), (220, 400, 25)]
    for (kx, ky, kr) in craters:
        draw.ellipse([kx-kr, ky-kr, kx+kr, ky+kr], fill=(225, 215, 185, 200))
        
    img.save("public/templates/moon_chassis.webp", format="WEBP", quality=92)
    print("Created moon_chassis.webp")

create_crystal_stage()
create_wood_stage()
create_acrylic_stage()
create_moon_stage()
