#!/usr/bin/env python3
"""7FX — sosyal paylaşım (OG) görseli üretir: assets/img/og.jpg (1200x630).
Kullanım: python3 scripts/og-uret.py   (Pillow gerekir: python3 -m pip install pillow)"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG, SRC = f"{P}/assets/img", f"{P}/_src"
W, H = 1200, 630
GD, INK = (46, 158, 30), (18, 33, 15)

def font(names, size):
    ttc = "/System/Library/Fonts/HelveticaNeue.ttc"
    for i in range(20):
        try:
            f = ImageFont.truetype(ttc, size, index=i)
            if f.getname()[1] in names:
                return f
        except Exception:
            break
    fb = "Arial Bold.ttf" if "Bold" in names else "Arial.ttf"
    return ImageFont.truetype(f"/System/Library/Fonts/Supplemental/{fb}", size)

# yumuşak yeşil gradyan zemin
og = Image.new("RGB", (W, H)); px = og.load()
for y in range(H):
    for x in range(W):
        t = x / W * 0.6 + y / H * 0.4
        px[x, y] = (round(255 - 22 * t), round(255 - 10 * t), round(255 - 27 * t))
d = ImageDraw.Draw(og)

# sağda poster kartı + gölge
poster = Image.open(f"{SRC}/poster.jpg").convert("RGB")
ph = 470; pw = round(poster.width * ph / poster.height)
poster = poster.resize((pw, ph), Image.LANCZOS).crop((pw - 520, 0, pw, ph))
rm = Image.new("L", poster.size, 0)
ImageDraw.Draw(rm).rounded_rectangle((0, 0, poster.width - 1, poster.height - 1), radius=28, fill=255)
sh = Image.new("RGBA", (poster.width + 80, poster.height + 80), (0, 0, 0, 0))
ImageDraw.Draw(sh).rounded_rectangle((40, 52, poster.width + 40, poster.height + 52), radius=28, fill=(30, 80, 20, 70))
sh = sh.filter(ImageFilter.GaussianBlur(22))
og.paste(sh, (W - 640, 40), sh); og.paste(poster, (W - 600, 80), rm)

# sol: logo + metinler
lm = Image.open(f"{IMG}/logo@3x.png").convert("RGBA")
lcol = Image.new("RGBA", lm.size, GD + (255,)); lcol.putalpha(lm.split()[3])
lcol = lcol.resize((round(lm.width * 56 / lm.height), 56), Image.LANCZOS)
og.paste(lcol, (80, 84), lcol)
d.text((80 + lcol.width + 18, 98), "7FX", font=font(("Bold",), 30), fill=GD)
d.text((80, 210), "AYRICALIKLI YATIRIMCI PROGRAMI", font=font(("Bold",), 20), fill=(38, 128, 22))
fr, fb = font(("Regular",), 66), font(("Bold",), 66)
d.text((80, 250), "Sermayenizin", font=fr, fill=INK)
d.text((80, 330), "Ölçeği,", font=fb, fill=GD)
d.text((80, 410), "Gücünüzdür.", font=fr, fill=INK)
d.text((80, 520), "Yüksek hacimli portföyler için ayrıcalıklı program.", font=font(("Medium", "Bold"), 23), fill=(40, 55, 38))
d.rounded_rectangle((80, 572, 250, 576), radius=2, fill=GD)
og.save(f"{IMG}/og.jpg", quality=86, optimize=True, progressive=True)
print("og.jpg", os.path.getsize(f"{IMG}/og.jpg"), "bytes")
