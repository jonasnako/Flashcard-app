# lessico — CEFR level cross-check (SPEC §7)

The topic build assigns each entry a CEFR band (A2/B1/B2). This is a frequency-based
cross-check of those assignments against an external reference, per SPEC §7.

## Reference

**KELLY list — Italian** (*Italian_for_Translators*, 6 866 lemmas banded A1–C2 by corpus
frequency). Authors Francesca Strik Lievers & Serge Sharoff; KELLY project 2009–2011,
CC BY-NC-SA. See https://spraakbanken.gu.se/en/projects/kelly.

> **Important caveat.** KELLY bands by *corpus frequency*, not by *pedagogical order*.
> Concrete everyday nouns (la sedia, il gatto, la mela, l'uovo) are rarer in a
> translation corpus than abstract/function words, so KELLY places them at B2 even though
> a learner meets them at A1. **Profilo della lingua italiana** is the pedagogical authority;
> KELLY is only a proxy. Therefore the cross-check uses KELLY's signal **asymmetrically**:
> it is trusted to pull *over-leveled common words down*, but never to push *basic concrete
> words up*.

## Method

`dict/level-check.js <kelly.tsv>` (TSV columns: `lemma  pos  level`, e.g. converted from
the KELLY `.xls`). It strips articles, resolves reflexives, matches single-word headwords
to KELLY lemmas, and reports our band vs KELLY's (clamped to A2..B2: A1→A2, C1/C2→B2).
Multiword phrases are matched for the report but **excluded from automatic correction**
(head-token matches like *la comunicazione non violenta*→"comunicazione" are unreliable).

## Result

The initial deck was systematically over-leveled toward B1 (A2 19% / B1 55% / B2 27%;
B1/A2 ratio 2.94 — a healthy A2–B2 reference has A2 ≥ B1). Two passes corrected it:

1. A curated 202-word confident-A1/A2 reference → 54 obvious basics B1→A2.
2. KELLY single-word over-leveled alignment → 474 more (346 B1→A2, 94 B2→A2, 34 B2→B1),
   overwhelmingly core high-frequency vocabulary buried in the seed-derived Children /
   Thinking & Feeling topics (il bambino, mangiare, capire, credere, vedere, la paura…).

| | A2 | B1 | B2 | B1/A2 |
|---|---|---|---|---|
| before | 505 (19%) | 1483 (55%) | 722 (27%) | 2.94 |
| after | 999 (37%) | 1117 (41%) | 594 (22%) | 1.12 |

KELLY agreement among matched single/multi-word entries rose 485 → 959.

**One-band cap (correction).** KELLY frequency over-lowered abstract/institutional words
that are frequent in a news corpus but pedagogically B1–B2 (la costituzione, il parlamento,
l'integrazione, la consapevolezza, l'identità...). Rule applied afterwards: **a single
KELLY-frequency signal may move a word at most one band.** The 94 two-band B2→A2 drops were
restored to B2→B1. Final distribution A2 33% / B1 45% / B2 22% (ratio 1.34) — B1 largest,
as an Aufbau deck should be.

## Still open

- **Multiword over-levels** (~371 remaining) need per-phrase judgement, not head-token matching.
- The **under-leveled** direction (KELLY harder than us, 457) is mostly the frequency artifact
  above and was intentionally not acted on; a Profilo check would confirm.
- Correcting the level tag does not rewrite example sentences, so a handful of downgraded
  words now carry a slightly rich-for-level sentence (harmless; no entry exceeds the §3 ceiling).

## Update — Profilo pass (authoritative)

The user supplied the four **Profilo della lingua italiana** per-level lists (A1/A2/B1/B2,
unistrapg.it / Perugia CVCL). Profilo is the *pedagogical* CEFR inventory (the RLD authority),
not a frequency list, so it supersedes KELLY: a word's level = the lowest Profilo list it
appears in (A1 mapped to our A2 floor), and it is trusted in **both** directions.

`node dict/profilo-check.js [--apply]` (lists in dict/ref/). Matched 1282 deck headwords;
aligned **691** to Profilo (309 raised, 382 lowered). This notably **reversed KELLY's
frequency over-lowering** of abstract words (decidere, il dubbio, il sentimento, l'educazione,
la responsabilita -> back to B1/B2) and confirmed lowering seed-derived household chores
(passare l'aspirapolvere, stirare, fare la spesa -> A2). Distribution after Profilo:
**A2 39% / B1 36% / B2 25%**. Unmatched headwords (multiword, inflected, or outside Profilo's
<=B2 inventory) keep their prior level.
