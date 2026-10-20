/* 7FX — site davranışları: ayar uygulama, varyantlar, video ölçümü, sayaçlar, SSS, form zinciri, çerez onayı. Bağımlılık yok. */
(function () {
  "use strict";
  var C = window.FX_CONFIG || {};
  var doc = document, html = doc.documentElement;
  var root = html.getAttribute("data-root") || "";
  var lang = (html.lang || "tr").slice(0, 2);
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var enc = encodeURIComponent;

  var T = {
    tr: { sending: "Gönderiliyor…", ok: "Talebiniz alındı. Temsilciniz 24 saat içinde sizinle iletişime geçecek.",
          okBulten: "Kaydınız alındı. Teşekkürler.", mail: "Sunucuya ulaşılamadı; e-posta uygulamanız açıldı — hazır mesajı göndermeniz yeterli.",
          err: "Gönderilemedi. Lütfen tekrar deneyin.", subject: "7FX Randevu Talebi", subjectB: "7FX Bülten Kaydı" },
    en: { sending: "Sending…", ok: "Request received. Your representative will contact you within 24 hours.",
          okBulten: "Subscribed. Thank you.", mail: "Server unreachable; your e-mail app opened — just send the prepared message.",
          err: "Could not send. Please try again.", subject: "7FX Appointment Request", subjectB: "7FX Newsletter" }
  }[lang] || {};

  /* ---------- ölçüm (GA4 / Meta Pixel), onaya bağlı ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  function hasAnalytics() { return !!(C.GA4_ID || C.META_PIXEL_ID); }
  function loadAnalytics() {
    if (C.GA4_ID && !window.__fxGA) {
      window.__fxGA = 1;
      var s = doc.createElement("script"); s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + enc(C.GA4_ID); doc.head.appendChild(s);
      gtag("js", new Date()); gtag("config", C.GA4_ID, { anonymize_ip: true });
    }
    if (C.META_PIXEL_ID && !window.fbq) {
      /* resmi pixel yükleyici */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, doc, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", C.META_PIXEL_ID); window.fbq("track", "PageView");
    }
  }
  function track(name, params) {
    params = params || {};
    try {
      if (window.__fxGA) gtag("event", name, params); else window.dataLayer.push(Object.assign({ event: name }, params));
      if (window.fbq && name === "generate_lead") window.fbq("track", "Lead", { content_name: params.type || "randevu" });
    } catch (e) { /* sessiz */ }
  }
  window.fxTrack = track;

  var banner = $("#consent");
  if (banner && hasAnalytics()) {
    var consent = null; try { consent = localStorage.getItem("fx_consent"); } catch (e) {}
    if (consent === "granted") loadAnalytics(); else if (!consent) banner.classList.add("show");
    $("[data-consent=accept]", banner).addEventListener("click", function () {
      try { localStorage.setItem("fx_consent", "granted"); } catch (e) {} banner.classList.remove("show"); loadAnalytics(); });
    $("[data-consent=reject]", banner).addEventListener("click", function () {
      try { localStorage.setItem("fx_consent", "denied"); } catch (e) {} banner.classList.remove("show"); });
  }

  /* ---------- UTM / varyant ---------- */
  var q = new URLSearchParams(location.search);
  var attrib = {};
  try { attrib = JSON.parse(sessionStorage.getItem("fx_attrib") || "{}"); } catch (e) {}
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach(function (k) { if (q.get(k)) attrib[k] = q.get(k); });
  if (!attrib.referrer && doc.referrer && doc.referrer.indexOf(location.host) < 0) attrib.referrer = doc.referrer;
  if (!attrib.landing) attrib.landing = location.pathname + location.search;
  try { sessionStorage.setItem("fx_attrib", JSON.stringify(attrib)); } catch (e) {}

  var vk = q.get("v") || q.get("utm_content");
  if (vk && C.VARIANTS && C.VARIANTS[vk]) {
    var v = C.VARIANTS[vk];
    var h1 = $("[data-var=h1]"), ld = $("[data-var=lead]");
    if (h1 && v.h1) h1.innerHTML = v.h1;
    if (ld && v.lead) ld.textContent = v.lead;
    html.setAttribute("data-variant", vk); attrib.variant = vk;
  } else if (html.getAttribute("data-variant")) { attrib.variant = html.getAttribute("data-variant"); }

  /* ---------- ayarları uygula ---------- */
  var co = C.COMPANY || {};
  $$("[data-co]").forEach(function (el) {
    var val = co[el.getAttribute("data-co")];
    if (val) { el.textContent = val; if (el.tagName === "A") el.href = (el.getAttribute("data-co") === "email" ? "mailto:" : el.getAttribute("data-co") === "phone" ? "tel:" : "") + val.replace(/\s+/g, el.getAttribute("data-co") === "phone" ? "" : " "); }
    else if (!el.hasAttribute("data-co-keep")) { var item = el.closest("[data-corp-item]"); if (item) item.remove(); else el.remove(); }
  });
  $$("[data-corp]").forEach(function (box) { if (!$("[data-corp-item]", box)) box.hidden = true; });

  $$("[data-wa]").forEach(function (el) {
    if (!C.WHATSAPP) { el.remove(); return; }
    el.href = "https://wa.me/" + String(C.WHATSAPP).replace(/\D/g, "") + "?text=" + enc(C.WHATSAPP_TEXT || "");
    el.target = "_blank"; el.rel = "noopener";
    el.addEventListener("click", function () { track("whatsapp_click", { location: el.getAttribute("data-wa") || "page" }); });
  });
  $$("[data-portal]").forEach(function (el) { if (C.PORTAL_URL) { el.href = C.PORTAL_URL; el.target = "_blank"; el.rel = "noopener"; } else el.remove(); });
  $$("[data-mailto]").forEach(function (el) { if (C.MAILTO) el.href = "mailto:" + C.MAILTO + "?subject=" + enc(el.getAttribute("data-mailto") || T.subject); });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var cal = $("#cal");
  if (cal && C.CALENDAR_URL) {
    var f = doc.createElement("iframe"); f.src = C.CALENDAR_URL; f.loading = "lazy"; f.title = "Randevu takvimi"; cal.appendChild(f); cal.hidden = false;
  }
  if (C.TURNSTILE_SITEKEY && $("[data-turnstile]")) {
    $$("[data-turnstile]").forEach(function (p) { var d = doc.createElement("div"); d.className = "cf-turnstile"; d.setAttribute("data-sitekey", C.TURNSTILE_SITEKEY); d.setAttribute("data-theme", "light"); p.appendChild(d); });
    var ts = doc.createElement("script"); ts.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"; ts.async = true; ts.defer = true; doc.head.appendChild(ts);
  }

  /* ---------- video ---------- */
  var vid = $("video[data-hero]");
  if (vid) {
    if (window.innerWidth <= 720) {
      var mob = $("source[data-mobile]", vid);
      if (mob) { $$("source", vid).forEach(function (s) { if (s !== mob) s.remove(); }); vid.load(); }
    }
    var marks = {};
    vid.addEventListener("play", function () { if (!vid.__started) { vid.__started = 1; track("video_start", { video_title: "7FX tanitim" }); } });
    vid.addEventListener("timeupdate", function () {
      if (!vid.duration) return; var p = Math.floor(vid.currentTime / vid.duration * 100);
      [25, 50, 75].forEach(function (m) { if (p >= m && !marks[m]) { marks[m] = 1; track("video_progress", { video_percent: m }); } });
    });
    vid.addEventListener("ended", function () { track("video_complete", { video_title: "7FX tanitim" }); });
  }

  /* ---------- görünürlük: reveal + sayaçlar ---------- */
  function count(el) {
    var end = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var pre = el.getAttribute("data-pre") || "", suf = el.getAttribute("data-suf") || "", t0 = null, dur = 1200, sep = lang === "tr" ? "," : ".";
    function step(ts) {
      if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / dur); k = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + (end * k).toFixed(dec).replace(".", sep) + suf; if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function show(el, instant) { if (instant) el.classList.add("now"); el.classList.add("in"); if (el.hasAttribute("data-count")) count(el); }
  var vh = window.innerHeight || 800;
  var later = [];
  $$(".reveal, [data-count]").forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) show(el, true); else later.push(el);   /* görünür olanlar hemen, beklemeden */
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) return; show(e.target, false); io.unobserve(e.target); });
    }, { threshold: 0.2 });
    later.forEach(function (el) { io.observe(el); });
  } else { later.forEach(function (el) { show(el, true); }); }
  setTimeout(function () { $$(".reveal:not(.in)").forEach(function (el) { el.classList.add("in"); }); }, 1500);

  /* ---------- SSS + CTA ölçümü ---------- */
  $$(".faq details").forEach(function (d) { d.addEventListener("toggle", function () { if (d.open) track("faq_open", { question: ($("summary", d) || {}).textContent.trim().slice(0, 80) }); }); });
  $$("[data-cta]").forEach(function (el) { el.addEventListener("click", function () { track("cta_click", { cta: el.getAttribute("data-cta") }); }); });

  /* ---------- formlar: PHP → formsubmit.co → mailto ---------- */
  function postJSON(url, data) {
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { var ct = r.headers.get("content-type") || ""; if (!r.ok || ct.indexOf("json") < 0) throw new Error("http " + r.status); return r.json(); })
      .then(function (j) { if (j && (j.ok === true || j.success === true || j.success === "true")) return j; throw new Error((j && (j.error || j.message)) || "rejected"); });
  }
  function submitChain(data) {
    return postJSON(root + (C.FORM_ENDPOINT || "api/randevu.php"), data).then(function () { return "php"; })
      .catch(function () {
        if (!C.FORM_FALLBACK_EMAIL) throw new Error("no-fallback");
        var fs = Object.assign({}, data, { _subject: (data.type === "bulten" ? T.subjectB : T.subject) + " — " + (data.name || data.email || ""), _template: "table", _captcha: "false" });
        return postJSON("https://formsubmit.co/ajax/" + C.FORM_FALLBACK_EMAIL, fs).then(function () { return "formsubmit"; });
      });
  }
  function labelOf(form, k) { var el = form.elements[k]; var lab = el && el.id && $("label[for=" + el.id + "]", form); return lab ? lab.textContent.replace(/\*/g, "").trim() : k; }

  $$("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var msg = $(".msg", form), btn = $("button[type=submit]", form); if (msg) msg.className = "msg";
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {}; new FormData(form).forEach(function (val, k) { data[k] = val; });
      var type = form.getAttribute("data-lead") || "randevu";
      if (data._honey) { if (msg) { msg.textContent = type === "bulten" ? T.okBulten : T.ok; msg.className = "msg ok"; } form.reset(); return; } /* bot */
      data.type = type; data.lang = lang; data.page = location.href; data.ts = new Date().toISOString();
      Object.keys(attrib).forEach(function (k) { data[k] = attrib[k]; });
      var old = btn ? btn.textContent : ""; if (btn) { btn.disabled = true; btn.textContent = T.sending; }
      submitChain(data).then(function (via) {
        if (msg) { msg.textContent = type === "bulten" ? T.okBulten : T.ok; msg.className = "msg ok"; }
        track(type === "bulten" ? "sign_up" : "generate_lead", { method: via, type: type, variant: attrib.variant || "" });
        form.reset();
      }).catch(function () {
        /* son çare: kullanıcının e-posta uygulaması */
        var lines = []; Object.keys(data).forEach(function (k) {
          if (k.charAt(0) === "_" || ["type", "lang", "page", "ts"].indexOf(k) > -1 || !data[k]) return; lines.push(labelOf(form, k) + ": " + data[k]); });
        lines.push("", "Sayfa: " + location.href);
        if (C.MAILTO) {
          location.href = "mailto:" + C.MAILTO + "?subject=" + enc(type === "bulten" ? T.subjectB : T.subject) + "&body=" + enc(lines.join("\n"));
          if (msg) { msg.textContent = T.mail; msg.className = "msg ok"; }
        } else if (msg) { msg.textContent = T.err; msg.className = "msg err"; }
        track("lead_fallback", { method: "mailto", type: type });
      }).then(function () { if (btn) { btn.disabled = false; btn.textContent = old; } });
    });
  });
})();
