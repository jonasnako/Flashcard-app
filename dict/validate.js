#!/usr/bin/env node
// Validate a lessico batch against dict/master.json per SPEC.md §8.
//   node dict/validate.js dict/batches/food.json
// Exits non-zero on any error. Warnings don't fail the batch but should be reviewed.
const fs = require("fs");
const path = require("path");

const batchPath = process.argv[2];
if (!batchPath) { console.error("usage: node dict/validate.js <batch.json>"); process.exit(2); }
const masterPath = path.join(__dirname, "master.json");

const master = JSON.parse(fs.readFileSync(masterPath, "utf8"));
const batch = JSON.parse(fs.readFileSync(batchPath, "utf8"));
if (!Array.isArray(batch)) { console.error("batch is not a JSON array"); process.exit(2); }

const errors = [], warns = [];
const E = (i, m) => errors.push(`  [${i}] ${m}`);
const W = (i, m) => warns.push(`  [${i}] ${m}`);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LEVELS = new Set(["A1", "A2", "B1", "B2"]);
const norm = s => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
const words = s => (s || "").trim().split(/\s+/).filter(Boolean).length;

// indexes over master
const mById = new Map(master.map(w => [w.id, w]));
const mPair = new Set(master.map(w => norm(w.it && w.it.word) + " ||| " + norm(w.de && w.de.word)));
const mIt = new Map(), mDe = new Map();
master.forEach(w => {
  (mIt.get(norm(w.it && w.it.word)) || mIt.set(norm(w.it && w.it.word), []).get(norm(w.it && w.it.word))).push(w);
  (mDe.get(norm(w.de && w.de.word)) || mDe.set(norm(w.de && w.de.word), []).get(norm(w.de && w.de.word))).push(w);
});

const seenId = new Set(), seenPair = new Set();
const topics = {}, levels = {};
let questions = 0, imperativeish = 0;

batch.forEach((w, i) => {
  // ---- format (§1) ----
  if (!w.id || !UUID.test(w.id)) E(i, `bad/missing uuid id: ${w.id}`);
  if (seenId.has(w.id)) E(i, `duplicate id within batch: ${w.id}`);
  seenId.add(w.id);
  if (mById.has(w.id)) E(i, `id already in master (would be an update, not a new entry): ${w.id}`);
  if (!LEVELS.has(w.level)) E(i, `level must be A2/B1/B2, got: ${w.level}`);
  if (!w.topic || typeof w.topic !== "string") E(i, `missing topic`);
  for (const side of ["it", "de"]) {
    const o = w[side];
    if (!o || typeof o.word !== "string" || !o.word.trim()) E(i, `${side}.word missing`);
    if (!o || typeof o.sentence !== "string" || !o.sentence.trim()) E(i, `${side}.sentence missing`);
  }
  for (const k of ["streak", "correct", "seen"]) {
    if ((w[k] || 0) !== 0) E(i, `${k} must be 0 in a new batch, got ${w[k]}`);
  }

  // ---- Swiss orthography (§2) ----
  const blob = [w.it && w.it.word, w.it && w.it.sentence, w.de && w.de.word, w.de && w.de.sentence].join(" ");
  if (blob.includes("ß")) E(i, `contains ß (use ss): ${w.de && w.de.word}`);

  // ---- sentence length gradient (§3.1) ----
  for (const side of ["it", "de"]) {
    const n = words(w[side] && w[side].sentence);
    if (n > 13) E(i, `${side} sentence too long (${n} words, ceiling ~12): "${w[side].sentence}"`);
    else {
      const [lo, hi] = w.level === "B2" ? [9, 12] : w.level === "B1" ? [7, 9] : w.level === "A2" ? [5, 8] : [4, 7];
      if (n < lo - 1 || n > hi + 1) W(i, `${side} sentence ${n} words, outside ${w.level} target ${lo}–${hi}`);
    }
  }

  // ---- dedup (§6) ----
  const it = norm(w.it && w.it.word), de = norm(w.de && w.de.word);
  const pair = it + " ||| " + de;
  if (seenPair.has(pair)) E(i, `internal duplicate pair in batch: ${it} / ${de}`);
  seenPair.add(pair);
  if (mPair.has(pair)) E(i, `exact pair already in master: ${it} / ${de}`);
  else {
    if (mIt.has(it)) W(i, `same Italian headword in master (review sense): ${it}`);
    if (mDe.has(de)) W(i, `same German headword in master (review synonym): ${de}`);
  }

  // ---- spread signal (§3.2, informational) ----
  const its = (w.it && w.it.sentence) || "";
  if (its.includes("?")) questions++;
  if (its.includes("!") || /^[A-ZÀ-Ù][a-zà-ù]+[ai]!?\b/.test(its.trim())) imperativeish++;

  topics[w.topic] = (topics[w.topic] || 0) + 1;
  levels[w.level] = (levels[w.level] || 0) + 1;
});

// ---- report ----
console.log(`Batch: ${batchPath}  (${batch.length} entries)`);
console.log("Topics:", JSON.stringify(topics));
console.log("Levels:", JSON.stringify(levels));
console.log(`Questions: ${questions} (${Math.round(100 * questions / batch.length)}%)  ~imperatives/exclamations: ${imperativeish}`);
if (warns.length) { console.log(`\nWarnings (${warns.length}) — review, not blocking:`); console.log(warns.join("\n")); }
if (errors.length) { console.log(`\nERRORS (${errors.length}):`); console.log(errors.join("\n")); console.log("\nFAIL"); process.exit(1); }
console.log("\nPASS (mechanical checks). Authoring judgement — §3.2 spread, §5 topic rule — still on you.");
