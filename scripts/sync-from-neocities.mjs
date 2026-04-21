#!/usr/bin/env node
// sync-from-neocities.mjs
// Lee meowrhino.neocities.org, parsea la lista de proyectos y
// regenera proyectos.json. Se ejecuta desde GitHub Actions 1x/semana.
//
// Uso local:
//   node scripts/sync-from-neocities.mjs
//
// Salida: escribe proyectos.json (solo si hay cambios).

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { parse } from "node-html-parser";

const NEOCITIES_URL = "https://meowrhino.neocities.org/";
const OUT_PATH = "proyectos.json";

function parseNeocities(htmlString) {
  // comment: true preserva los <!--…--> que marcan las categorías
  const root = parse(htmlString, { comment: true });
  const container = root.querySelector("#proyectes");
  if (!container) throw new Error("no encontré #proyectes en el HTML");

  const byCat = {};
  let currentCat = "uncategorized";
  let cur = null;

  function flush() {
    if (!cur) return;
    if (cur.links.length || cur.name) (byCat[cur.cat] ||= []).push({ name: cur.name, links: cur.links });
    cur = null;
  }

  for (const node of container.childNodes) {
    // en node-html-parser los comentarios son CommentNode (nodeType === 8)
    // y rawText ya viene sin los <!-- -->
    if (node.nodeType === 8) {
      const t = (node.rawText || "").trim();
      if (t) currentCat = t;
      continue;
    }
    if (!node.tagName) continue;
    const tag = node.tagName.toLowerCase();
    if (tag === "ainfo") {
      flush();
      const style = node.getAttribute("style") || "";
      const isHidden = /cursor:\s*default/i.test(style) || /color:\s*black/i.test(style);
      cur = { name: node.text.trim(), cat: isHidden ? "hidden" : currentCat, links: [] };
    } else if (tag === "a" && cur) {
      const href = node.getAttribute("href");
      if (href) cur.links.push(href);
    }
  }
  flush();
  return byCat;
}

async function main() {
  console.log(`[sync] fetch ${NEOCITIES_URL}`);
  const r = await fetch(NEOCITIES_URL, { cache: "no-store" });
  if (!r.ok) throw new Error("fetch falló: " + r.status);
  const html = await r.text();

  console.log(`[sync] parsing ${html.length} bytes`);
  const data = parseNeocities(html);
  const cats = Object.keys(data);
  const total = cats.reduce((s, c) => s + data[c].length, 0);
  console.log(`[sync] ${cats.length} categorías, ${total} proyectos`);

  const nextJson = JSON.stringify(data, null, 2) + "\n";
  const currJson = existsSync(OUT_PATH) ? readFileSync(OUT_PATH, "utf8") : "";
  if (nextJson === currJson) {
    console.log("[sync] sin cambios — no reescribo");
    return;
  }
  writeFileSync(OUT_PATH, nextJson);
  console.log("[sync] proyectos.json actualizado");
}

main().catch((e) => {
  console.error("[sync] error:", e.message);
  process.exit(1);
});
