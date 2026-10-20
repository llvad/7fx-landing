# 7FX — Ayrıcalıklı Yatırımcı Programı · Landing Page

Statik site (HTML/CSS/JS) + isteğe bağlı PHP form alıcısı. Faz 1–3 uygulanmış hâli; ayrıntılı gerekçe için `GELISTIRME-ONERISI.md`.

## Yapı

```
index.html            TR ana sayfa          en/index.html   EN sürüm        en/legal.html  EN yasal özet
yasal/                Risk Bildirimi, KVKK, Gizlilik, Çerez (TR)
lp/a/ lp/b/           Reklam varyantları (noindex) — scripts/sayfa-uret.py üretir
notlar/               Piyasa notları (index + _sablon.html)
tesekkurler.html      Form sonrası (JS kapalıysa PHP buraya yönlendirir)      404.html
assets/css/site.css   Tüm stil           assets/js/config.js  TÜM AYARLAR      assets/js/site.js  davranış
assets/img/           logo.svg, favicon seti, og.jpg (1200×630), poster.webp
assets/video/         7fx-1080.mp4 (5,1 MB) · 7fx-720.mp4 (2,8 MB, mobil) · 7fx-1080.webm (3,6 MB) · 7fx-tr.vtt (altyazı)
assets/fonts/         Inter (değişken ağırlık, latin + latin-ext)
api/randevu.php       Form alıcısı (PHP 7.4+)   api/config.example.php → api/config.php olarak kopyalayıp doldurun
scripts/              medya-isle.sh · og-uret.py · sayfa-uret.py · alan-adi-degistir.sh
sitemap.xml robots.txt site.webmanifest lighthouserc.json .github/workflows/lighthouse.yml
_src/                 Kaynak medya (git'e girmez): orijinal video.mp4, logo.png, poster.jpg, eski index-v1.html
```

## İlk yapılacaklar (5 dakika)

`assets/js/config.js` dosyasını açın ve doldurun — HTML'e dokunmanıza gerek yok:

| Alan | Ne işe yarar |
|---|---|
| `WHATSAPP` | `"905xxxxxxxxx"` yazınca tüm WhatsApp butonları görünür (boşsa gizli) |
| `MAILTO`, `FORM_FALLBACK_EMAIL` | Taleplerin düşeceği e-posta |
| `COMPANY.*` | Unvan, adres, MERSİS → Güven bölümü, footer ve KVKK metninde otomatik görünür |
| `PORTAL_URL` | Yatırımcı girişi bağlantısı (ör. CRM adresi) |
| `CALENDAR_URL` | Cal.com / Calendly adresi → randevu bölümüne takvim gömülür |
| `GA4_ID`, `META_PIXEL_ID` | Ölçüm; doluysa çerez onay çubuğu çıkar, onaydan sonra yüklenir |
| `TURNSTILE_SITEKEY` | Cloudflare Turnstile anti-spam (gizli anahtar `api/config.php`) |
| `VARIANTS` | Reklam varyant başlıkları; `?v=a` ile test edin, `python3 scripts/sayfa-uret.py` ile `lp/` sayfalarını yenileyin |

## Form nasıl çalışır

1. `api/randevu.php` (PHP hosting: Natro / Hostinger) → CSV kaydı (`api/data/`), e-posta, isteğe bağlı CRM webhook + Telegram.
2. PHP yoksa (GitHub Pages) → `formsubmit.co` üzerinden `FORM_FALLBACK_EMAIL` adresine e-posta. **İlk gönderimde o adrese tek seferlik onay e-postası gelir; bağlantıya tıklayın.**
3. O da olmazsa kullanıcının e-posta uygulaması hazır mesajla açılır (`mailto:`).

Her yolda GA4 `generate_lead` olayı (bülten için `sign_up`) gönderilir. Diğer olaylar: `cta_click`, `whatsapp_click`, `video_start`, `video_progress` (25/50/75), `video_complete`, `faq_open`.

## Yayınlama

- **GitHub Pages (mevcut):** `main` dalına push → birkaç dakika içinde yayında. Form 2. yolla çalışır.
- **PHP hosting (Natro/Hostinger):** Tüm klasörü (`_src/` hariç) FTP ile yükleyin, `api/config.example.php` → `api/config.php` kopyalayıp doldurun. `api/data/` yazılabilir olmalı (755/775).
- **Alan adı değişince:** `scripts/alan-adi-degistir.sh https://yeni-alan.com/` — canonical, OG, sitemap, robots ve config'i günceller.

## Bakım

- Yeni piyasa notu: `notlar/_sablon.html` kopyala → doldur → `notlar/index.html` listesine `<article>` ekle.
- Logo değişirse: `assets/img/logo.svg` güncelle → `python3 scripts/sayfa-uret.py` (tüm sayfalara gömer).
- Video değişirse: `_src/video.mp4` değiştir → `scripts/medya-isle.sh` (sıkıştırma + WebM + whisper altyazı taslağı; altyazıyı elle düzeltin).
- OG görseli: `python3 scripts/og-uret.py`.
- Yasal metinler **taslaktır**; yayından önce hukuk danışmanı incelemesi gerekir. Faaliyet lisansa tabi ise resmi risk bildirim formu ayrıca imzalatılmalıdır.

## Kalite

Lighthouse CI her push'ta çalışır (`lighthouserc.json`: erişilebilirlik ≥ 0.95, SEO ≥ 0.95 zorunlu; performans ≥ 0.9 uyarı). Yerelde: `python3 -m http.server 8793` → `npx lighthouse http://127.0.0.1:8793/ --view`.
