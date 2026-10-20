<?php
/**
 * 7FX — randevu / bülten form alıcısı (PHP 7.4+).
 * JSON veya klasik form POST kabul eder. Honeypot, hız sınırı, (isteğe bağlı) Turnstile doğrulaması,
 * CSV kaydı, e-posta, (isteğe bağlı) webhook ve Telegram bildirimi.
 * Ayarlar: config.php (yoksa config.example.php'deki varsayılanlar).
 */
declare(strict_types=1);
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

$cfg = require file_exists(__DIR__ . '/config.php') ? __DIR__ . '/config.php' : __DIR__ . '/config.example.php';
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) { @mkdir($dataDir, 0750, true); }

$isJson = stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false;
$wantsJson = $isJson || stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function respond(bool $ok, string $msg, int $code = 200): void {
    global $wantsJson, $cfg;
    if ($wantsJson) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $msg], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: ' . ($ok ? $cfg['THANKS_URL'] : ($cfg['ERROR_URL'] ?: $cfg['THANKS_URL'])));
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { respond(false, 'POST bekleniyor', 405); }

/* Aynı kaynak kontrolü (Origin/Referer) */
$origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
if ($cfg['ALLOWED_HOSTS'] && $origin) {
    $host = parse_url($origin, PHP_URL_HOST) ?: '';
    if (!in_array($host, $cfg['ALLOWED_HOSTS'], true)) { respond(false, 'Kaynak reddedildi', 403); }
}

$in = $isJson ? (json_decode(file_get_contents('php://input'), true) ?: []) : $_POST;
$clean = static function ($v, int $max = 500): string {
    $v = is_string($v) ? $v : '';
    $v = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $v) ?? '');
    return mb_substr($v, 0, $max);
};

/* Honeypot: bot ise sessizce "başarılı" dön */
if ($clean($in['_honey'] ?? '') !== '') { respond(true, 'ok'); }

/* Hız sınırı: IP başına dakikada en fazla N istek */
$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$rlFile = $dataDir . '/rl_' . md5($ip) . '.txt';
$hits = array_filter(array_map('intval', @file($rlFile, FILE_IGNORE_NEW_LINES) ?: []), fn($t) => $t > time() - 60);
if (count($hits) >= $cfg['RATE_LIMIT_PER_MIN']) { respond(false, 'Çok fazla istek, lütfen biraz sonra deneyin', 429); }
$hits[] = time(); @file_put_contents($rlFile, implode("\n", $hits));

/* Turnstile (isteğe bağlı) */
if ($cfg['TURNSTILE_SECRET']) {
    $token = $clean($in['cf-turnstile-response'] ?? '', 2048);
    $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8,
        CURLOPT_POSTFIELDS => http_build_query(['secret' => $cfg['TURNSTILE_SECRET'], 'response' => $token, 'remoteip' => $ip])]);
    $vr = json_decode((string) curl_exec($ch), true); curl_close($ch);
    if (empty($vr['success'])) { respond(false, 'Doğrulama başarısız', 400); }
}

/* Alanlar */
$type   = in_array($in['type'] ?? '', ['randevu', 'bulten'], true) ? $in['type'] : 'randevu';
$email  = mb_strtolower($clean($in['email'] ?? '', 120));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { respond(false, 'Geçerli bir e-posta girin', 422); }
$row = [
    'ts' => date('c'), 'type' => $type, 'name' => $clean($in['name'] ?? '', 80), 'phone' => $clean($in['phone'] ?? '', 30),
    'email' => $email, 'portfolio' => $clean($in['portfolio'] ?? '', 60), 'time' => $clean($in['time'] ?? '', 60),
    'message' => $clean($in['message'] ?? '', 1000), 'kvkk' => $clean($in['kvkk'] ?? '', 5), 'marketing' => $clean($in['marketing'] ?? '', 5),
    'lang' => $clean($in['lang'] ?? 'tr', 5), 'variant' => $clean($in['variant'] ?? '', 20),
    'utm_source' => $clean($in['utm_source'] ?? '', 80), 'utm_medium' => $clean($in['utm_medium'] ?? '', 80),
    'utm_campaign' => $clean($in['utm_campaign'] ?? '', 120), 'utm_content' => $clean($in['utm_content'] ?? '', 80),
    'referrer' => $clean($in['referrer'] ?? '', 200), 'page' => $clean($in['page'] ?? '', 300), 'ip' => $ip,
    'ua' => $clean($_SERVER['HTTP_USER_AGENT'] ?? '', 200),
];
if ($type === 'randevu') {
    if (mb_strlen($row['name']) < 3) { respond(false, 'Ad soyad gerekli', 422); }
    if (!preg_match('/^[+0-9 ()-]{10,20}$/', $row['phone'])) { respond(false, 'Geçerli bir telefon girin', 422); }
    if ($row['portfolio'] === '') { respond(false, 'Portföy aralığı seçin', 422); }
}
if ($row['kvkk'] === '') { respond(false, 'KVKK onayı gerekli', 422); }

/* CSV kaydı (data/ dizini .htaccess ile dışarıya kapalı) */
$csv = $dataDir . '/' . ($type === 'bulten' ? 'bulten' : 'randevu') . '.csv';
$new = !file_exists($csv);
if ($fh = fopen($csv, 'a')) {
    if (flock($fh, LOCK_EX)) {
        if ($new) { fputcsv($fh, array_keys($row)); }
        fputcsv($fh, array_values($row)); fflush($fh); flock($fh, LOCK_UN);
    }
    fclose($fh);
}

/* E-posta */
$subject = ($type === 'bulten' ? '7FX Bülten Kaydı — ' : '7FX Randevu Talebi — ') . ($row['name'] ?: $row['email']);
$lines = [];
foreach (['name' => 'Ad Soyad', 'phone' => 'Telefon', 'email' => 'E-posta', 'portfolio' => 'Portföy', 'time' => 'Uygun zaman', 'message' => 'Mesaj',
          'marketing' => 'Ticari ileti onayı', 'lang' => 'Dil', 'variant' => 'Varyant', 'utm_source' => 'Kaynak', 'utm_medium' => 'Kanal',
          'utm_campaign' => 'Kampanya', 'referrer' => 'Yönlendiren', 'page' => 'Sayfa', 'ip' => 'IP', 'ts' => 'Zaman'] as $k => $label) {
    if ($row[$k] !== '') { $lines[] = $label . ': ' . $row[$k]; }
}
$body = implode("\n", $lines);
if ($cfg['MAIL_TO']) {
    $headers = "From: " . $cfg['MAIL_FROM'] . "\r\nReply-To: " . $row['email'] . "\r\nContent-Type: text/plain; charset=UTF-8\r\nX-Mailer: 7FX-Form";
    @mail($cfg['MAIL_TO'], '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
}

/* Webhook (CRM) — JSON POST */
if ($cfg['WEBHOOK_URL']) {
    $ch = curl_init($cfg['WEBHOOK_URL']);
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => array_merge(['Content-Type: application/json'], $cfg['WEBHOOK_HEADERS']),
        CURLOPT_POSTFIELDS => json_encode($row, JSON_UNESCAPED_UNICODE)]);
    curl_exec($ch); curl_close($ch);
}

/* Telegram */
if ($cfg['TELEGRAM_BOT_TOKEN'] && $cfg['TELEGRAM_CHAT_ID']) {
    $ch = curl_init('https://api.telegram.org/bot' . $cfg['TELEGRAM_BOT_TOKEN'] . '/sendMessage');
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8,
        CURLOPT_POSTFIELDS => ['chat_id' => $cfg['TELEGRAM_CHAT_ID'], 'text' => "📩 " . $subject . "\n\n" . $body]]);
    curl_exec($ch); curl_close($ch);
}

respond(true, 'ok');
