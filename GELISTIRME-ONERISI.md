# 7FX Landing Page — Geliştirme Önerisi

Tarih: 20 Ekim 2026 · Kaynak: ~/Desktop/7FX-Landing-Page (index.html 7,7 KB, logo.png 110 KB, poster.jpg 90 KB, video.mp4 19,1 MB)

## 1. Mevcut durum

- Tek sayfa: Hero + video, 3 istatistik, 3 avantaj kartı, CTA, footer. Inline CSS, JS yok, sistem fontu. Sade ve hızlı bir iskelet — iyi başlangıç.
- CTA `mailto:info@llvad.com` → form yok, takip yok, farklı marka alanı (llvad) görünüyor.
- Video 19,1 MB (1080p30, 2,2 Mbps, 69 sn) tek kaynak, WebM yok, CDN yok → mobilde ilk yükleme ağır.
- Logo 640×384 PNG (110 KB) 38 px yükseklikte gösteriliyor; işaret “A7 / Λ7” okunuyor, yanındaki “7FX” yazısı telafi ediyor.
- Favicon, OG/Twitter meta, canonical, sitemap, robots, 404, analytics, çerez/KVKK metni, yasal sayfalar yok.
- Mobilde nav gizli, alt sabit CTA yok. Footer uyarı metni düşük kontrast (opacity .45).
- Yayında değil (llvad.com/7fx → 404). Klasör kendi git deposu değil; üst klasörün “voiceclone” deposuna bağlı görünüyor.

## 2. Riskler (önce bunlar)

| Risk | Neden önemli | Öneri |
|---|---|---|
| “4.7× ortalama bileşik getiri”, “portföy danışmanı”, “profesyonel yönetim” ifadeleri | Türkiye’de portföy yönetimi / yatırım danışmanlığı SPK lisansı gerektirir; dayanaksız getiri vaadi hem hukuki hem reklam platformu (Google/Meta finans doğrulaması) açısından sayfayı reddettirir | Getiri rakamını kaldır veya kaynaklı/“geçmiş dönem, garanti değildir” dipnotlu yap; “danışmanlık” yerine “özel müşteri temsilcisi”, “yönetim” yerine “program” gibi ifadeler; Risk Bildirimi sayfası |
| Marka çakışması: “7FX” adı sietefx.com (LatAm broker), 7fx.co.uk (UK), WikiFX’te “Seven FX / 7xFx” dolandırıcılık uyarılarıyla dolu | “7FX” aramasında bu sonuçlar çıkar, güven kaybı + SEO rekabeti | Ayırt edici alan adı ve ek (örn. “7FX Private”, “7FX Capital”), Google Business + LinkedIn profilini erken sahiplen |
| KVKK / İYS | Randevu formu kişisel veri toplar; ticari ileti için açık rıza + İYS kaydı gerekir | Aydınlatma metni, onay kutusu, çerez bildirimi |
| Marka tutarsızlığı (mailto llvad.com) | Kullanıcı farklı bir alan adı görür | 7FX alan adına bağlı posta kutusu |

## 3. Faz 1 — Hızlı kazanımlar (1 gün)

1. **Video**: `ffmpeg -crf 28 -preset slow -movflags +faststart` ile 1080p ≈ 6–7 MB; 720p mobil varyant ≈ 3,5 MB; WebM (VP9) alternatif; `preload="none"` + poster; Türkçe altyazı (.vtt). Tercihen Cloudflare Stream / Bunny / YouTube unlisted’a taşı.
2. **Logo**: SVG’ye çevir (veya 2× PNG ≈ 8 KB). Poster → WebP (~40 KB).
3. **Form**: mailto yerine gerçek form — ad, telefon, e‑posta, portföy aralığı (segmentasyon), uygun saat. Backend: Natro PHP (mevcut hosting) → e‑posta + CSV/DB + CRM webhook (PrimeGroup) + Telegram bildirimi. Honeypot + Turnstile anti‑spam.
4. **WhatsApp** `wa.me` butonu (ön yazılı mesaj) ve mobilde **sabit alt CTA çubuğu** (Randevu Al · WhatsApp).
5. **Meta**: favicon seti + webmanifest, OG görseli 1200×630, Twitter card, canonical, robots.txt, sitemap.xml, 404.
6. **Ölçüm**: GA4 (+ Meta Pixel gerekiyorsa) — olaylar: form_submit, whatsapp_click, video_play %25/50/75/100, cta_click. Onaya bağlı yükleme.
7. **Yasal**: Gizlilik, KVKK Aydınlatma, Çerez, Risk Bildirimi sayfaları; footer’a şirket unvanı/adres/iletişim.

## 4. Faz 2 — Dönüşüm ve güven (1 hafta)

- **Yeni bölümler**: “Nasıl İşler” (Talep → Ön görüşme → Program planı), “Kimler İçin” (portföy eşiği, bireysel/kurumsal), “Güven” (şirket bilgileri, ekip, lisans/regülasyon varsa), SSS (5–6 soru), müşteri/süreç kanıtları.
- **Gerçek randevu**: Cal.com / Calendly gömme — “Randevu Al” vaadini sayfa içinde karşıla.
- **EN sürümü** (`/en/`, hreflang) — forex kitlesi uluslararası.
- **Tasarım**: neon yeşil (#6DF84D) beyazda kontrast yetersiz (≈1.4:1) → yalnız koyu yüzeylerde (footer, video çerçevesi ışıma) kullan, metin/buton #2E9E1E kalsın; h1 300 ağırlık sistem fontunda Windows’ta düşmüyor → self‑hosted Inter/Manrope; istatistik sayaçları ve kart reveal animasyonları; footer uyarı opaklığı .65.
- **Nav**: mobil hamburger gerekmez; “Tanıtım / Avantajlar / SSS / Randevu” + dil anahtarı.

## 5. Faz 3 — Büyüme (sürekli)

- Reklam varyantları (`/lp/a`, `/lp/b`) ve A/B testi; UTM’e göre başlık değişimi.
- İçerik: “Piyasa notları” / haftalık bülten → e‑posta listesi.
- Müşteri portalı/broker girişine yönlendirme (varsa), referans programı.
- Lighthouse hedefi: mobil 95+, LCP < 2 sn, CLS 0.

## 6. Teknik yol haritası

- Ayrı repo: `llvad/7fx-landing` (klasörü üst depodan ayır).
- Yapı: `index.html`, `/en/`, `/legal/*`, `/assets/{img,video,css,js}`, `sitemap.xml`, `robots.txt`, `404.html`, `site.webmanifest`.
- Hosting: Cloudflare Pages (ücretsiz, global CDN) veya mevcut Natro; video için ayrı CDN. Alan adı: 7FX’e özel (örn. 7fx.com.tr / 7fxprivate.com) + CF proxy.
- Form backend: Natro PHP veya Cloudflare Worker → e‑posta + CRM.
- Kalite: HTML/CSS lint, Lighthouse CI, görsel regresyon (mobil/masaüstü).
