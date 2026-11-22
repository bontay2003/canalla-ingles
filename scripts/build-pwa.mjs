// Genera la versión pública (PWA) en docs/ a partir de app/index.html.
// Uso: node scripts/build-pwa.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "app/index.html"), "utf8");
const docs = join(root, "docs");
mkdirSync(docs, { recursive: true });

// Lo que va antes del <style> (title, metas, fuentes) va al <head>
const cut = src.indexOf("<style>");
const headExtra = src.slice(0, cut).replace(/<meta name="claude:[^>]*>\s*/g, "");
const body = src.slice(cut);
const deck = readFileSync(join(root, "app/deck.json"), "utf8");
const version = createHash("sha1").update(src + deck).digest("hex").slice(0, 10);
copyFileSync(join(root, "app/deck.json"), join(docs, "deck.json"));

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${headExtra.trim()}
<meta name="description" content="Canalla Inglés: 10 minutos al día de inglés práctico para trabajar en un taller de motores de avión. Tarjetas de palabras, preposiciones, verbos y frases, nivel A1–A2.">
<meta name="theme-color" content="#16212B">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Canalla Inglés">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
<script>window.CANALLA_PWA=true;if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));</script>
</head>
<body>
${body.trim()}
</body>
</html>
`;
writeFileSync(join(docs, "index.html"), html);

writeFileSync(join(docs, "manifest.webmanifest"), JSON.stringify({
  name: "Canalla Inglés",
  short_name: "Canalla",
  description: "10 minutos al día de inglés práctico para el taller de motores de avión.",
  lang: "es",
  start_url: "./",
  scope: "./",
  display: "standalone",
  orientation: "portrait",
  background_color: "#ECEFF1",
  theme_color: "#16212B",
  icons: [
    { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
  ]
}, null, 2) + "\n");

// Service worker: la página se pide primero a la red (así llegan las mejoras) y si no hay conexión sale de la caché
writeFileSync(join(docs, "sw.js"), `const CACHE = "canalla-${version}";
const SHELL = ["./", "./index.html", "./deck.json", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  // Las tarjetas también se piden primero a la red, para que lleguen las nuevas
  if (new URL(req.url).pathname.endsWith("/deck.json")) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./deck.json", copy)); return r; })
      .catch(() => caches.match("./deck.json")));
    return;
  }
  // Resto (iconos, fuentes): caché primero y se refresca por detrás
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
`);

writeFileSync(join(docs, ".nojekyll"), "");
console.log("PWA generada en docs/ (versión " + version + ")");
