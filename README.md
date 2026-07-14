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

`its` / `des` (example sentences) are optional. `level` is any CEFR tag; `topic` is any label you like — both drive the filters in Settings.

## Backups

**Settings → Export (.json)** saves a file with all your words *and* your scores. **Import** restores it. Handy before a big reset or when moving to a new phone.

## Notes

- Progress and settings are stored in the browser (`localStorage`) on the device you study on — they don't sync across devices. Use Export/Import to move them.
- **Settings → Reset progress** zeroes out scores but keeps your words.
