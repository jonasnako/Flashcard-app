# lessico

An offline Italian ↔ German flashcard app. Single static site — no build step, no server, no dependencies. Just three files: `index.html`, `words.js` (the dictionary), and `sw.js` (offline cache).

## Put it online (GitHub Pages)

These files go in the **root** of your repo.

```bash
# from inside your cloned, empty repo:
cp /path/to/index.html /path/to/words.js /path/to/sw.js /path/to/.nojekyll .
git add .
git commit -m "lessico flashcard app"
git push
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: “Deploy from a branch” → Branch: `main` / `/ (root)` → Save.**

After a minute your app is live at:

```
https://<your-username>.github.io/<your-repo>/
```

Open that URL in Chrome on your phone → menu → **Add to Home screen**. Installed, it runs full-screen and offline, and the microphone works (needed for hands-free voice commands and the “Speak answer” mode, both of which require https).

## Editing the dictionary

Open `words.js` and add entries in the same format:

```js
{ it:"la casa", de:"das Haus", its:"Torno a casa presto.", des:"Ich komme früh nach Hause.", level:"B1", topic:"Household" },
```

`its` / `des` (example sentences) are optional. `level` is any CEFR tag; `topic` is any label you like — both drive the filters in Settings.

After editing, commit and push, then in the app go to **Settings → Merge dictionary**. That pulls in the new words **without touching your progress**. (`Reset to dictionary` wipes progress and reloads everything from `words.js`.)

## Backups

**Settings → Export deck** saves a `.json` with all your words *and* your scores. **Import deck** restores it. Handy before a big reset or when moving to a new phone.

## Notes

- Progress and settings are stored in the browser (`localStorage`) on the device you study on — they don't sync across devices. Use Export/Import to move them.
- The app icon and PWA manifest are generated at runtime, so there are no icon files to manage.
- `sw.js` caches `index.html` and `words.js` for offline use. If you update `words.js`, the service worker cache version (`lessico-v2`) may serve the old copy until it refreshes — bump the version string in `sw.js` (e.g. to `lessico-v3`) when you push dictionary changes and want them to appear immediately.
