#!/bin/bash
# Canlı adresi tüm dosyalarda değiştirir (canonical, OG, sitemap, robots, config).
# Kullanım: scripts/alan-adi-degistir.sh https://7fx.example.com/
# Not: Adres / ile bitmeli. Alt dizinde yayınlanıyorsa onu da yazın: https://llvad.com/7fx/
set -e
NEW="${1:?Yeni adres gerekli, örn: https://7fx.example.com/}"
cd "$(dirname "$0")/.."
OLD=$(grep -o 'SITE_URL: "[^"]*"' assets/js/config.js | sed 's/SITE_URL: "\(.*\)"/\1/')
[ -n "$OLD" ] || { echo "Mevcut SITE_URL bulunamadı"; exit 1; }
echo "$OLD  →  $NEW"
grep -rl --exclude-dir=_src --exclude-dir=.git --exclude-dir=node_modules -F "$OLD" . | while read -r f; do
  sed -i '' "s#${OLD}#${NEW}#g" "$f"; echo "  güncellendi: $f"
done
# 404 sayfasındaki alt dizin yolu
SUB=$(printf '%s' "$NEW" | sed -E 's#https?://[^/]+##')
[ -z "$SUB" ] && SUB="/"
sed -i '' "s#/7fx-landing/#${SUB}#g" 404.html && echo "  404.html yolu: $SUB"
echo "Bitti. Kontrol: grep -rn \"$NEW\" index.html | head"
