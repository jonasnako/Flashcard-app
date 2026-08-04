# lessico — Dictionary Authoring Spec

Rules for generating Italian↔German vocabulary batches. Every batch must satisfy these
before being merged into `master.json`. `validate.js` checks the mechanical rules;
the rest is authoring judgement.

---

## 1. Entry format

Entries match the app's library format exactly:

```json
{
  "id": "uuid-v4",
  "level": "A2" | "B1" | "B2",
  "topic": "Food",
  "it": { "word": "tagliare", "sentence": "Taglia il pane, io preparo il formaggio." },
  "de": { "word": "schneiden", "sentence": "Schneid das Brot, ich mache den Käse bereit." },
  "streak": 0,
  "correct": 0,
  "seen": 0
}
```

- `id`: fresh UUID per entry. Never reuse.
- Nouns carry their article (`la casa`, `der Schrank`), verbs the infinitive.
- Multi-word entries are fine and encouraged for chunks (`fare a meno di`, `vale la pena`).
- `streak`/`correct`/`seen` always 0 in a new batch. **Never ship non-zero values** —
  an id-matched update import would overwrite real progress.

---

## 2. German orthography — Swiss

**Never use ß. Always ss.** `gross`, `heisst`, `weiss`, `Fuss`, `Strasse`, `Grösse`,
`draussen`, `Mass`, `Spass`.

This is a hard check in `validate.js`; a single ß fails the batch.

---

## 3. Example sentences — the actual lesson

The word pair is the hook; the sentence is where learning happens. Sentences teach
grammar **implicitly**, so a batch must show deliberate variety rather than defaulting
to third-person-singular present-tense statements.

### 3.1 Level-graded complexity

| | B1 | B2 |
|---|---|---|
| Length | 7–9 words | 9–12 words |
| Structure | one clause, or two joined by `e / ma / perché / quando / se` | one real subordinate clause |
| Grammar | presente, passato prossimo, imperfetto, futuro semplice, imperativo, modals, reflexives, direct/indirect pronouns, `ne`/`ci`, piacere-type (`mi piace`, `mi manca`, `mi serve`), `stare` + gerundio, comparatives, `se` + presente, negations (`non… mai / più / ancora / nessuno`) | congiuntivo after `credere / pensare / sperare / nonostante / benché / prima che / purché / affinché / a meno che`, condizionale presente & passato, periodo ipotetico II (`se avessi… farei`), `si` impersonale & passivante, passive with `essere`/`venire`, trapassato prossimo, `dopo aver` + participio, `senza / prima di` + infinito, combined pronouns (`glielo`, `me ne`), relatives with `cui` / `il quale` |

**B2 earns its level through mood and subordination, not length.** A2 entries follow
B1 rules but simpler still (5–8 words, present/perfect only).

Hard ceiling: no sentence over ~12 words. Long sentences were a past failure mode.

### 3.2 Spread across a batch

Aim, per ~130-entry batch:

- **Tense/mood**: at least 10 each of imperfetto, congiuntivo, condizionale, futuro;
  some trapassato; several `dopo aver` / `prima che` / `senza` + infinitive.
- **Sentence type**: 15–25% questions, 10–20% imperatives/exclamations. Not all statements.
- **Person**: vary `io / tu / noi / voi` — do not default to third person.
  `voi` is naturally rare in some domains (Body, Person); force it where it fits
  (Work, Kommunikation, City, Travel) rather than writing unnatural sentences.
- **Connectives**: a modest share of sentences carry conversational glue
  (`allora, insomma, comunque, magari, anzi, cioè, quindi, però, invece, in effetti,
  secondo me, mi sa che, meno male, per fortuna, purtroppo, ci vuole`).
  Roughly 5–15% is fine — do not force it to a quota.

### 3.3 Content of sentences

- Everyday, concrete, plausible. Prefer situations the learner actually lives in
  (family with young children, Zurich, professional facilitation/mediation work,
  hiking and Alpine settings, cooking) over textbook abstractions.
- The German side is a **natural translation, not a gloss** — it should carry its own
  grammar variety (Perfekt vs. Präteritum, Konjunktiv II, subordinate word order,
  passive with `werden`, modal constructions).
- Both sentences express the same idea; neither is a word-for-word calque.

---

## 4. Level assignment

- **A2**: backfilled only where conversationally essential and likely half-known
  (`di solito`, `per esempio`, `volentieri`, `a volte`). Not a systematic layer.
- **B1**: concrete, high-frequency, everyday. The bulk of nouns and basic verbs.
- **B2**: abstract nouns, nuanced character/quality adjectives, lower-frequency verbs,
  idiomatic chunks, register-marked items.

Level assignments are provisional until the final cross-check (see §7).

---

## 5. Topic assignment — the general-vs-home rule

The recurring risk is a cross-cutting bin (Verbs, Expressions) absorbing words that
belong to a content topic, leaving that topic thin when it is built later.

**Rule: if the book gives a word a home chapter, it goes to the matching topic.
If the book files it under a general chapter — Allgemeine Tätigkeiten, Häufige
Redewendungen, Klassifizierung, Strukturwörter — it stays cross-cutting.**

So `tagliare`, `riempire`, `spingere`, `coprire` legitimately sit in Verbs;
`innamorarsi` belongs to Relationships and `prendere appunti` to Education.

**Reservation lists** (see TOPICS.md) hold vocabulary back for its home topic. Consult
them before authoring any cross-cutting batch.

---

## 6. Deduplication

Before shipping, check the batch against `master.json`:

1. **Exact pair** (it.word + de.word) — remove from batch.
2. **Same Italian headword, different German** — review by hand. Sometimes a legitimate
   second sense; usually a duplicate.
3. **Same German headword, different Italian** — review by hand. Often a genuine synonym
   pair worth keeping (`schneiden` = `tagliare` / `affettare`), sometimes a duplicate.
4. **Internal duplicates** within the batch — always remove.

A word deliberately taught in two topics with two different sentences is acceptable
*only* if the senses genuinely differ; otherwise one topic wins per the §5 rule.

---

## 7. Final level cross-check (after the dictionary is complete)

Verify assignments against external references rather than intuition:

- **Profilo della lingua italiana** (Spinelli & Parizzi) — the official CEFR Reference
  Level Description for Italian; the authority for A1–B2 lexical inventories.
- **KELLY list (Italian)** — ~9000 frequency-ranked lemmas banded to CEFR levels;
  machine-readable, so usable as a programmatic checklist for both level assignment
  and coverage measurement.
- **SUBTLEX-IT** (subtitle frequency — best proxy for spoken Italian) and **CoLFIS**
  (written) as sanity checks. A word high in SUBTLEX-IT but absent from the dictionary
  is a gap worth filling regardless of topic.

Output a mismatch report (our level vs. reference level) and correct before finalising.

---

## 8. Batch checklist

- [ ] Format matches §1; all ids fresh; all counters 0
- [ ] Zero ß
- [ ] Length gradient holds (B1 7–9, B2 9–12, nothing over ~12)
- [ ] Tense/mood/person/sentence-type spread per §3.2
- [ ] Reservation lists consulted; §5 rule applied to every entry
- [ ] Deduped against `master.json` per §6
- [ ] Topic counts reported; no topic left under ~80 entries
