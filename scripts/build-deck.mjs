// Junta app/deck-parts/*.json en app/deck.json y valida el contenido.
// Uso: node scripts/build-deck.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const partsDir = join(root, "app/deck-parts");
const html = readFileSync(join(root, "app/index.html"), "utf8");
// Orden fijo: primero las tarjetas originales (mantienen sus ids y el progreso)
const order = ["base.json", "words.json", "preps.json", "verbs-basic.json", "verbs-advanced.json", "phrases.json"];
const files = readdirSync(partsDir).filter(f => f.endsWith(".json"))
  .sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));

const errors = [], warnings = [], cards = [], ids = new Set(), answers = new Map();
const norm = s => s.replace(/\*\*/g, "").toLowerCase().replace(/[^a-z0-9' ]/g, "").trim();

for (const f of files) {
  let list;
  try { list = JSON.parse(readFileSync(join(partsDir, f), "utf8")); }
  catch (e) { errors.push(`${f}: JSON no válido (${e.message})`); continue; }
  for (const c of list) {
    const where = `${f} ${c.id}`;
    if (!c.id || ids.has(c.id)) { errors.push(`${where}: id vacío o repetido`); continue; }
    if (!["W", "P", "V", "F"].includes(c.t)) errors.push(`${where}: tipo "${c.t}" no válido`);
    if (![1, 2, 3].includes(c.lvl)) errors.push(`${where}: nivel "${c.lvl}" no válido`);
    if (!c.q || !c.a) errors.push(`${where}: falta q o a`);
    if (c.t === "P") {
      const gaps = (c.q.match(/___/g) || []).length;
      if (!c.qsub) errors.push(`${where}: falta la traducción (qsub)`);
      if (gaps === 0 || gaps !== c.a.split(" … ").length) errors.push(`${where}: huecos (${gaps}) y respuestas no cuadran`);
    }
    if (c.ref && !html.includes(`id="r-${c.ref}"`)) errors.push(`${where}: la chuleta no tiene la sección "${c.ref}"`);
    if ((c.a.match(/\*\*/g) || []).length % 2) errors.push(`${where}: ** sin cerrar`);
    // Respuestas repetidas: se quita la segunda (palabras y frases)
    const key = c.t + ":" + norm(c.t === "P" ? c.q + c.a : c.a);
    if (answers.has(key)) { warnings.push(`${where}: repite a ${answers.get(key)} ("${c.a}"), se descarta`); continue; }
    answers.set(key, c.id);
    ids.add(c.id);
    const o = { id: c.id, t: c.t, lvl: c.lvl, cat: c.cat || "", q: c.q };
    if (c.t === "P") o.qsub = c.qsub;
    o.a = c.a;
    if (c.note) o.note = c.note;
    if (c.hint) o.hint = c.hint;
    if (c.ref) o.ref = c.ref;
    cards.push(o);
  }
}

warnings.forEach(w => console.log("AVISO  " + w));
if (errors.length) { errors.forEach(e => console.log("ERROR  " + e)); process.exit(1); }

writeFileSync(join(root, "app/deck.json"), "[\n" + cards.map(c => JSON.stringify(c)).join(",\n") + "\n]\n");
const by = k => cards.reduce((m, c) => (m[c[k]] = (m[c[k]] || 0) + 1, m), {});
console.log(`deck.json: ${cards.length} tarjetas`, "por nivel", by("lvl"), "por tipo", by("t"));
