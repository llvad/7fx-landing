<?php
/* 7FX form alıcısı ayarları. Bu dosyayı config.php olarak kopyalayıp doldurun (config.php git'e girmez). */
return [
    'MAIL_TO'            => 'info@llvad.com',                 // Taleplerin gideceği adres
    'MAIL_FROM'          => '7FX Web <no-reply@llvad.com>',   // Hostingte tanımlı bir gönderen adresi kullanın
    'THANKS_URL'         => '../tesekkurler.html',            // JS kapalıyken yönlendirme
    'ERROR_URL'          => '',                               // Boşsa hata durumunda da teşekkür sayfasına döner
    'ALLOWED_HOSTS'      => [],                               // Örn: ['llvad.com','www.llvad.com'] — boşsa kontrol yapılmaz
    'RATE_LIMIT_PER_MIN' => 5,
    'TURNSTILE_SECRET'   => '',                               // Cloudflare Turnstile gizli anahtarı (site anahtarı assets/js/config.js'de)
    'WEBHOOK_URL'        => '',                               // CRM webhook (JSON POST), örn. PrimeGroup / Zapier / Make
    'WEBHOOK_HEADERS'    => [],                               // Örn: ['Authorization: Bearer XXX']
    'TELEGRAM_BOT_TOKEN' => '',                               // @BotFather token
    'TELEGRAM_CHAT_ID'   => '',                               // Bildirimin düşeceği sohbet/grup ID'si
];
