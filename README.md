# lessico

An Italian ↔ German flashcard app. Single static site — no build step, no server, no dependencies. `index.html` holds the dictionary and all the app logic; `sw.js` is a small service worker that keeps the app up to date and lets it work offline.

## Put it online (GitHub Pages)

These files go in the **root** of your repo.

```bash
# from inside your cloned, empty repo:
cp /path/to/index.html /path/to/sw.js /path/to/manifest.webmanifest /path/to/.nojekyll .
cp /path/to/icon-192.png /path/to/icon-512.png /path/to/apple-touch-icon.png .
git add .
git commit -m "lessico flashcard app"
git push
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: “Deploy from a branch” → Branch: `main` / `/ (root)` → Save.**

After a minute your app is live at:

```
https://<your-username>.github.io/<your-repo>/
```

Open that URL in Chrome on your phone → menu → **Add to Home screen** for a full-screen app icon.

### Changing the app icon

The home-screen icon isn't a GitHub setting — it comes from the icon files and `manifest.webmanifest` in the repo root. To change it, replace `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png` (keep the same filenames and square sizes — 192×192, 512×512, and 180×180 respectively) and push. Already-installed phones cache the icon from when you added it, so **remove the app from your home screen and add it again** to pick up the new one.

### Updates and offline

`sw.js` uses a **network-first** strategy: whenever you open the app online it loads the latest version straight from the network (so you never have to clear your cache to get an update), and it falls back to the last cached copy when you're offline. Your scores live in the browser's `localStorage` and are **not** affected by updates — only an explicit "clear site data" wipes them. When you push a new `index.html`, existing installs pick it up on their next online open.

## Editing the dictionary

The word list is `words.json` at the repo root. The app fetches it on every open and caches it, so
adding or changing words there reaches every device on its next online load. Progress lives in the
browser's `localStorage` and is matched to words **by id**, so editing a word's text, level or topic
never disturbs the score attached to it.

Each entry looks like:

```js
{ it:"la casa", de:"das Haus", its:"Torno a casa presto.", des:"Ich komme früh nach Hause.", level:"B1", topic:"Household" },
```

`its` / `des` (example sentences) are optional. `level` is any CEFR tag; `topic` is any label you like — both drive the filters in Settings and in the Words list.

## Studying

- **Settings → Study → Levels / Topics** limit which words a session draws from. Both are multi-select: tap any combination of levels and topics (e.g. B1 + B2, or Household + Children), or **All** to clear a selection. An empty selection means everything. Topics are listed **alphabetically**, and each topic name is **coloured by its progress** — amber (needs work) → green (learned), computed for the levels you've selected — so you can see at a glance which topics to focus on. (The **Words** tab's Topic filter is coloured the same way, for the level filter shown there.)
- **Direction (front side)** defaults to **DE → IT** (German prompt). Change it in Settings → Study — *Mixed*, *IT → DE*, or *DE → IT*.
- **Settings → Focus** is a single lifecycle dial controlling which words a session draws from, running from introducing to maintaining:
  - **Explore** — mostly new words, blended with some in-progress review.
  - **Balanced** — adapts, shifting toward more review as your in-progress backlog grows.
  - **Consolidate** — in-progress words only (1–2 dots), no new words.
  - **Refresh** — spaced reviews of words you've already **learned** (within your Level/Topic filter). The gap grows each time you're right, until a word retires and stops coming back. Miss one and its score resets to zero, so it drops back into the learning pool.

  A word becomes **learned** after you get it right **3 times in a row** — the three dots on the card fill up as you go. Learned words leave the Explore/Balanced/Consolidate sessions and are reviewed via Refresh. The two states are *learning* and *learned*, and Refresh is what maintains learned words over time.
- **How many words am I studying?** A **progress bar** shows your standing under the current study filter, coloured by ripeness: green = learned, then lighter shades for words at 2 dots and 1 dot, and amber for new/unstarted words. Its label breaks that down (*"40 learned · 30 ●●○ · 20 ●○○ · 10 new · 100 total"*). It appears in **Settings → Study** (updating as you change Levels/Topics), on the Session **start** screen ("Ready when you are"), and on the **completion** screen, where the words you just learned this session glow as their own brighter segment. The header (top-right) shows your **learned** total and how many are **in progress** (words at 1–2 of 3 dots) — it leads with what you've learned rather than a big "everything left" number, and updates live as you answer. The deck's total size is on the Words tab.
- The **Words** tab is filterable by **Level**, **Topic** and **Progress**, on top of the search box. The Progress row offers the same six bands as the progress bar, in the same colours — mastered, learned, ●●○, ●○○, met, not started — and only lists bands that actually contain words under the other filters. **Tap any word** to expand its example sentences, level, and topic, then **✏️ Edit** to change any field, including moving it to a different topic (typing an existing topic name, in any case, folds it into that topic). Edits stay in this browser.

## Hands-free (audio) mode

On the **Session** tab, **▶ Hands-free** reads each card aloud and runs the whole session without touching the screen — useful while cooking, walking, or driving. Tap the **🔊** on a card any time to hear just that side's word and example sentence. Two rating styles (pick one with the segmented control on the Session tab, or under **Settings → Voice**):

- **Self-assess** — the app reads the prompt (word and example sentence), then waits for you to say **“reveal”** before it reads the answer. You say **“yes”** or **“no”** and it scores the card and moves on.
- **Auto-rate** — the app reads the prompt and listens for you to *say the translation out loud*. It compares what you said to the correct answer (article-insensitive, with a little tolerance for mishearing), tells you **“Correct.”** or **“Not quite.”**, then reads the answer and scores it automatically.

Both modes read the example sentences by default; turn that off with **Settings → Voice → Read example sentences (hands-free)** if you want just the words. The mic only opens *after* the app finishes speaking (so it never mishears its own voice), and it waits a generous window for your answer before deciding none came.

Voice input uses the browser's Web Speech API, so hands-free scoring works best in a **Chromium-based browser (Chrome/Edge)** and needs microphone permission (granted automatically over https, e.g. GitHub Pages). In browsers without speech recognition, ▶ Hands-free still reads each card aloud and you tap ✓/✕ to rate.

## Backups

**Settings → Export** saves a file with all your words *and* your scores — a backup you can keep before a big
change or when moving to a new phone. **Settings → Import** reads that file back.

Importing **merges** rather than overwrites: words are matched by id (falling back to the word pair), and for
each word the more recent practice wins, so an older backup can never undo work you have done since. It shows
what it would change and waits for you to confirm before touching anything.

## Building the dictionary

The shared word list lives in `words.json` at the repo root — the single source, served straight
to the app. Authoring rules and tooling sit under [`dict/`](dict/):

- `dict/SPEC.md` — authoring rules (entry format, Swiss `ss`, sentence complexity by level, topic assignment, dedup).
- `dict/TOPICS.md` — the topic manifest, build order, pending re-tags, and reservation lists.
- `dict/validate.js` — mechanical checks for a batch: `node dict/validate.js dict/batches/<batch>.json`.

New/updated entries land in `words.json` via commits, and every device picks them up through sync **by word id** — so re-tagging a word or rewriting its sentence never touches your scores (scores live per-device, keyed by the same id). The in-app **Import** brings scores across from another browser; it never adds words to the repo.

## What gets recorded

Two logs, both in `localStorage`, both on your device only — nothing is sent anywhere. They carry
in Export and merge on Import.

**`lessico_log_v1`** — one row per day, last 90 days:

| | |
|---|---|
| `cards` `sess` `ms` | answers given, sessions, time on cards |
| `revN` `revOK` | reviews attempted / recalled — the retention figure |
| `newN` `newOK` | first exposures attempted / already known |
| `up` `down` `nw` | dots gained, dots lost, new words started |
| `back` | peak backlog (drives the intake controller) |
| `learned` `retired` | end-of-day totals, so a progress curve can be drawn for the past |

**`lessico_ev_v1`** — one row per review, last 5000, as
`[day, gap×10, stabilityBefore×10, recalled, side, easy, seconds×10]`. Stability is the value
*before* the answer, because that is what the schedule was predicted from. Full buffers cost
about 110 KB.

Only the **first** answer to a word in a session is logged as a test: a card you miss is requeued,
but that retry is re-study, and counting it would flatter the recall rate. New words and reviews
are counted apart, because a single combined hit rate moves with how much new material a week
happened to contain rather than with how well anything is being retained.

The point of the review log is to check the scheduler against reality — it assumes
`p(recall) = exp(-gap / (6.15 · stability))`, which nothing has ever verified. Bucketing rows by
`gap / stability` and comparing predicted against observed recall is what would calibrate it.
That needs months of data, which is why collection starts before there is anything to read.

**Settings → Reset** clears both logs along with the scores.

## Notes

- A session you leave partway **resumes where you left off** when you come back — the remaining cards and order are saved on the device. Finishing a session, changing the Level/Topic/Focus filters, or tapping **↻ New session** on the Session tab starts a fresh one.
- Scores and settings are stored in the browser (`localStorage`) on the device you study on — they don't sync across devices. Use Export/Import to move them, or see **Syncing words into the site** to share the word list across devices.
- **Settings → Reset progress** zeroes out scores but keeps your words.
