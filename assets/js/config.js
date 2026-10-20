/* 7FX — tek yerden ayarlar. Bu dosyayı düzenlemeniz yeterli; HTML'e dokunmanız gerekmez. */
window.FX_CONFIG = {
  /* Canlı adres (canonical/OG için HTML içinde de geçer; alan adı değişince scripts/alan-adi-degistir.sh çalıştırın) */
  SITE_URL: "https://llvad.github.io/7fx-landing/",

  /* Form hedefi: PHP destekli hostingde api/randevu.php çalışır.
     PHP yoksa (GitHub Pages gibi) FORM_FALLBACK_EMAIL doluysa formsubmit.co üzerinden e-posta gider
     (ilk gönderimde o adrese tek seferlik bir onay e-postası gelir — bağlantıya tıklayın).
     O da başarısız olursa kullanıcının e-posta uygulaması (mailto) açılır. */
  FORM_ENDPOINT: "api/randevu.php",
  FORM_FALLBACK_EMAIL: "info@llvad.com",
  MAILTO: "info@llvad.com",

  /* WhatsApp numarası, ülke koduyla, boşluksuz (ör. "905321234567"). Boşsa WhatsApp butonları gizlenir. */
  WHATSAPP: "",
  WHATSAPP_TEXT: "Merhaba, 7FX Ayrıcalıklı Yatırımcı Programı için ön görüşme talep ediyorum.",

  /* Yatırımcı/müşteri girişi (ör. "https://7fx.customer.org.tr/"). Boşsa bağlantı gizlenir. */
  PORTAL_URL: "",

  /* Takvim gömme (Cal.com / Calendly). Boşsa form tek başına gösterilir.
     Örn: "https://cal.com/7fx/on-gorusme" veya "https://calendly.com/7fx/on-gorusme" */
  CALENDAR_URL: "",

  /* Ölçüm. Doluysa çerez onay çubuğu görünür ve onaydan sonra yüklenir. */
  GA4_ID: "",          // "G-XXXXXXXXXX"
  META_PIXEL_ID: "",   // "1234567890"

  /* Cloudflare Turnstile anti-spam (site anahtarı; gizli anahtar api/config.php'de) */
  TURNSTILE_SITEKEY: "",

  /* Kurumsal bilgiler — doluysa "Güven" bölümünde ve footer'da gösterilir */
  COMPANY: {
    name: "",      // "7FX Finansal Teknolojiler A.Ş."
    address: "",   // "Levent, İstanbul"
    mersis: "",    // "0123456789012345"
    licence: "",   // lisans/yetki bilgisi varsa
    phone: "",     // "+90 212 000 00 00"
    email: "info@llvad.com"
  },

  /* Reklam varyantları: ?v=a veya utm_content=a ile başlık/alt metin değişir */
  VARIANTS: {
    a: { h1: "Büyük Sermaye, <b>Farklı Kurallar.</b>",
         lead: "Yüksek hacimli yatırımcılar için davetle açılan program: düşük işlem maliyeti, özel müşteri temsilcisi, öncelikli erişim." },
    b: { h1: "Portföyünüz <b>Ayrıcalığı</b> Hak Ediyor.",
         lead: "Kurumsal standartlarda risk kontrolü ve size özel koşullar. Ön görüşme için 24 saat içinde dönüş." }
  }
};
