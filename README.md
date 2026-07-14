# lessico

An Italian ↔ German flashcard app. Single static site — no build step, no server, no dependencies. Just one file: `index.html` (dictionary and app logic are embedded).

## Put it online (GitHub Pages)

This file goes in the **root** of your repo.

```bash
# from inside your cloned, empty repo:
cp /path/to/index.html /path/to/.nojekyll .
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

## Editing the dictionary

The starting word list lives in the `SEED` array near the top of the `<script>` in `index.html`. It's only used to seed an empty library — once the app has run once, your words and progress live in the browser's `localStorage`, so editing `SEED` afterwards won't change what you already have. To add words going forward, use **Words → + Add a word** in the app itself, or edit `SEED` before your first run (or reset).

Each entry looks like:

```js
{ it:"la casa", de:"das Haus", its:"Torno a casa presto.", des:"Ich komme früh nach Hause.", level:"B1", topic:"Household" },
```

`its` / `des` (example sentences) are optional. `level` is any CEFR tag; `topic` is any label you like — both drive the filters in Settings and in the Words list.

## Studying

- **Settings → Focus** controls which words a session draws from: **Mixed** (any due word), **Seen only** (drill words you've already been tested on, instead of a fresh random draw each session), or **New only** (words you've never been tested on).
- The **Words** tab is filterable by **Level** and **Topic**, on top of the search box.

## Generating words with Claude

The app can generate new vocabulary — with translations and example sentences — and auto-complete cards you start yourself, using the Claude API directly from your browser.

1. In **Settings → Claude**, paste your Anthropic API key and press **Save key**. It's stored only in this browser's `localStorage` — never uploaded to the repo or anywhere else.
2. On the **Words** tab:
   - **✨ Generate with Claude** — pick a count, level, and topic; Claude adds that many new words, skipping any that already exist.
   - **+ Add a word → ✨ Auto-fill** — type just the Italian *or* German word and Claude fills in the translation and example sentences for you to review before saving.

The default model is `claude-haiku-4-5` (fast and cheap). To use a higher-quality model, change the `MODEL` constant near the top of the `<script>` in `index.html` (e.g. to `claude-opus-4-8`).

## Backups

**Settings → Export (.json)** saves a file with all your words *and* your scores. **Import** restores it. Handy before a big reset or when moving to a new phone.

## Notes

- Progress and settings are stored in the browser (`localStorage`) on the device you study on — they don't sync across devices. Use Export/Import to move them.
- **Settings → Reset progress** zeroes out scores but keeps your words.
