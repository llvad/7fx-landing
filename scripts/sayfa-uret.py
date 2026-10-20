#!/usr/bin/env python3
"""7FX — sayfa üretici.
1) Tüm HTML dosyalarında logo işaretini ({{LOGO}} veya <!--logo-->…<!--/logo-->) assets/img/logo.svg ile günceller.
2) index.html'den reklam varyantlarını üretir: lp/a/index.html, lp/b/index.html (noindex, canonical ana sayfa,
   başlık/alt metin assets/js/config.js → VARIANTS'tan).
Kullanım: python3 scripts/sayfa-uret.py
"""
import os, re, glob, html

P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(P)

# --- 1) logo ---
svg = open("assets/img/logo.svg", encoding="utf-8").read()
m = re.search(r"<svg[^>]*viewBox=\"([^\"]+)\"[^>]*>(.*)</svg>", svg, re.S)
inner = m.group(2).strip()
logo = '<!--logo--><svg class="logo" viewBox="%s" aria-hidden="true" focusable="false">%s</svg><!--/logo-->' % (m.group(1), inner)

files = [f for f in glob.glob("**/*.html", recursive=True) if not f.startswith(("_src/", "node_modules/"))]
for f in files:
    s = open(f, encoding="utf-8").read()
    n = s.replace("{{LOGO}}", logo)
    n = re.sub(r"<!--logo-->.*?<!--/logo-->", lambda _: logo, n, flags=re.S)
    if n != s:
        open(f, "w", encoding="utf-8").write(n); print("logo:", f)

# --- 2) varyantlar ---
cfg = open("assets/js/config.js", encoding="utf-8").read()
variants = {}
for key, body in re.findall(r"\n\s+([a-z0-9_]+):\s*\{(.*?)\}", cfg[cfg.find("VARIANTS"):], re.S):
    h1 = re.search(r'h1:\s*"((?:[^"\\]|\\.)*)"', body); lead = re.search(r'lead:\s*"((?:[^"\\]|\\.)*)"', body)
    variants[key] = {"h1": h1.group(1) if h1 else None, "lead": lead.group(1) if lead else None}

src = open("index.html", encoding="utf-8").read()
for key, v in variants.items():
    out = src.replace('<html lang="tr" data-root="">', '<html lang="tr" data-root="../../" data-variant="%s">' % key)
    out = re.sub(r'(href|src|poster)="(assets/|yasal/|notlar/|en/|site\.webmanifest|tesekkurler\.html)', r'\1="../../\2', out)
    out = out.replace('<link rel="canonical" href="https://llvad.github.io/7fx-landing/">',
                      '<link rel="canonical" href="https://llvad.github.io/7fx-landing/">\n<meta name="robots" content="noindex,follow">')
    if v["h1"]:
        out = re.sub(r'(<h1 data-var="h1">).*?(</h1>)', lambda mm: mm.group(1) + v["h1"] + mm.group(2), out, flags=re.S)
    if v["lead"]:
        out = re.sub(r'(<p class="lead" data-var="lead">).*?(</p>)', lambda mm: mm.group(1) + html.escape(v["lead"], quote=False) + mm.group(2), out, flags=re.S)
    out = out.replace("<title>7FX — Ayrıcalıklı Yatırımcı Programı | Yüksek Hacimli Portföyler</title>",
                      "<title>7FX — Ayrıcalıklı Yatırımcı Programı (%s)</title>" % key.upper())
    os.makedirs("lp/%s" % key, exist_ok=True)
    open("lp/%s/index.html" % key, "w", encoding="utf-8").write(out); print("varyant:", "lp/%s/index.html" % key)

# --- 3) etiket dengesi kontrolü ---
bad = 0
for f in files + ["lp/%s/index.html" % k for k in variants]:
    s = open(f, encoding="utf-8").read()
    for tag in ("div", "section", "details", "form", "main", "header", "footer", "ul", "li", "table", "svg", "a", "p", "label", "select"):
        o = len(re.findall(r"<%s[\s>]" % tag, s)); c = len(re.findall(r"</%s>" % tag, s))
        if o != c: print("UYARI etiket dengesi %s: <%s> %d açık / %d kapalı" % (f, tag, o, c)); bad += 1
print("etiket kontrolü:", "sorun yok" if not bad else "%d sorun" % bad)
