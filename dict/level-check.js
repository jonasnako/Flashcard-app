#!/usr/bin/env node
// CEFR level cross-check against the KELLY Italian frequency list (SPEC §7).
//   node dict/level-check.js path/to/kelly_it.tsv          # report only
//   node dict/level-check.js path/to/kelly_it.tsv --apply  # also lower single-word over-levels
// KELLY TSV columns: lemma <tab> pos <tab> level (A1..C2). Convert the .xls with e.g.
//   python3 -c "import xlrd,csv; b=xlrd.open_workbook('it_m3.xls'); s=b.sheet_by_index(0); \
//     w=csv.writer(open('kelly_it.tsv','w'),delimiter='\t'); [w.writerow([s.cell_value(r,0),s.cell_value(r,1),s.cell_value(r,2)]) for r in range(1,s.nrows)]"
// See dict/LEVELS.md for the caveat: KELLY is frequency-based, so it is used only to lower
// over-leveled common words, never to raise basic concrete vocabulary.
const fs = require("fs"), path = require("path");
const tsv = process.argv[2], APPLY = process.argv.includes("--apply");
if (!tsv) { console.error("usage: node dict/level-check.js <kelly.tsv> [--apply]"); process.exit(2); }

const ORD = { A1:2, A2:2, B1:3, B2:4, C1:4, C2:4 }, NAME = { 2:"A2", 3:"B1", 4:"B2" };
const kelly = new Map();
for (const line of fs.readFileSync(tsv, "utf8").split("\n")) {
  if (!line.trim()) continue;
  const p = line.split("\t"), o = ORD[(p[2]||"").trim()];
  if (!o) continue;
  for (let l of p[0].split(",")) { l = l.trim().toLowerCase(); if (l && (!kelly.has(l) || o < kelly.get(l))) kelly.set(l, o); }
}
const stripArt = s => s.replace(/^(l'|un'|il |lo |la |i |gli |le |un |uno |una |dei |degli |delle |del |dello |della |dell')/, "").trim();
function lemmaLevel(word) {
  let s = stripArt(word.toLowerCase().trim());
  const multi = /\s/.test(s);
  const c = new Set([s]);
  if (/arsi$/.test(s)) c.add(s.slice(0,-3)+"are");
  if (/ersi$/.test(s)) c.add(s.slice(0,-3)+"ere");
  if (/irsi$/.test(s)) c.add(s.slice(0,-3)+"ire");
  for (const x of c) if (kelly.has(x)) return { multi, k: kelly.get(x) };
  return { multi, k: null };
}

const files = ["words.json", "dict/master.json"].map(f => path.join(__dirname, "..", f));
let matched=0, agree=0, over=0, under=0, corrected=0;
for (const f of files) {
  const arr = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const e of arr) {
    const { multi, k } = lemmaLevel(e.it.word);
    if (k == null) continue;
    if (f.endsWith("words.json")) { matched++; const our = ORD[e.level]; if (our===k) agree++; else if (our>k) over++; else under++; }
    if (!multi && ORD[e.level] > k) { corrected++; if (APPLY) e.level = NAME[k]; }
  }
  if (APPLY) fs.writeFileSync(f, JSON.stringify(arr, null, 2) + "\n");
}
matched = Math.round(matched/1); // words.json pass only counted
console.log(`Matched to KELLY: ${matched} | agree ${agree} | over-leveled ${over} | under-leveled ${under}`);
console.log(`Single-word over-level corrections ${APPLY ? "APPLIED" : "available"}: ${corrected/2}`);
