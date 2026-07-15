# lessico

An Italian ↔ German flashcard app. Single static site — no build step, no server, no dependencies. `index.html` holds the dictionary and all the app logic; `sw.js` is a small service worker that keeps the app up to date and lets it work offline.

## Put it online (GitHub Pages)

These files go in the **root** of your repo.

```bash
# from inside your cloned, empty repo:
cp /path/to/index.html /path/to/sw.js /path/to/.nojekyll .
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

### Updates and offline

`sw.js` uses a **network-first** strategy: whenever you open the app online it loads the latest version straight from the network (so you never have to clear your cache to get an update), and it falls back to the last cached copy when you're offline. Your scores live in the browser's `localStorage` and are **not** affected by updates — only an explicit "clear site data" wipes them. When you push a new `index.html`, existing installs pick it up on their next online open.

## Editing the dictionary

The starting word list lives in the `SEED` array near the top of the `<script>` in `index.html`. It's only used to seed an empty library — once the app has run once, your words and progress live in the browser's `localStorage`, so editing `SEED` afterwards won't change what you already have. To add words going forward, use **Words → + Add a word** in the app itself, or edit `SEED` before your first run (or reset).

Each entry looks like:

```js
{ it:"la casa", de:"das Haus", its:"Torno a casa presto.", des:"Ich komme früh nach Hause.", level:"B1", topic:"Household" },
```

`its` / `des` (example sentences) are optional. `level` is any CEFR tag; `topic` is any label you like — both drive the filters in Settings and in the Words list.

## Studying

- **Settings → Focus** controls which words a session draws from: **Mixed** (any due word), **Seen only** (drill words you've already been tested on, instead of a fresh random draw each session), or **New only** (words you've never been tested on).
- The **Words** tab is filterable by **Level** and **Topic**, on top of the search box. **Tap any word** to expand its example sentences, level, and topic, then **✏️ Edit** to change any field — including moving it to a different topic (typing an existing topic name, in any case, folds it into that topic). Edits sync to the repo just like generated words.

## Hands-free (audio) mode

On the **Session** tab, **▶ Hands-free** reads each card aloud and runs the whole session without touching the screen — useful while cooking, walking, or driving. Tap **🔊** any time to just hear the current card. Two rating styles (pick one with the segmented control on the Session tab, or under **Settings → Voice**):

- **Self-assess** — the app reads the prompt (word and example sentence), then waits for you to say **“reveal”** before it reads the answer. You say **“yes”** or **“no”** and it scores the card and moves on.
- **Auto-rate** — the app reads the prompt and listens for you to *say the translation out loud*. It compares what you said to the correct answer (article-insensitive, with a little tolerance for mishearing), tells you **“Correct.”** or **“Not quite.”**, then reads the answer and scores it automatically.

Both modes read the example sentences by default; turn that off with **Settings → Voice → Read example sentences (hands-free)** if you want just the words. The mic only opens *after* the app finishes speaking (so it never mishears its own voice), and it waits a generous window for your answer before deciding none came.

Voice input uses the browser's Web Speech API, so hands-free scoring works best in a **Chromium-based browser (Chrome/Edge)** and needs microphone permission (granted automatically over https, e.g. GitHub Pages). In browsers without speech recognition, ▶ Hands-free still reads each card aloud and you tap ✓/✕ to rate.

## Generating words with Claude

The app can generate new vocabulary — with translations and example sentences — and auto-complete cards you start yourself, using the Claude API directly from your browser.

1. In **Settings → Claude**, paste your Anthropic API key and press **Save key**. It's stored only in this browser's `localStorage` — never uploaded to the repo or anywhere else.
2. On the **Words** tab:
   - **✨ Generate with Claude** — pick a count and level, then in **Topic** either name a topic or describe what you want (e.g. *“Work — verbs & adjectives”*). Claude generates that many new words — a balanced variety of nouns, verbs, and adjectives unless you ask for specific types — skipping any that already exist. It also picks one topic label for the whole batch, reusing one of your existing topics when it fits (case-insensitive) so related words stay grouped. The result line tells you which topic they landed in.
   - **+ Add a word → ✨ Auto-fill** — type just the Italian *or* German word and Claude fills in the translation and example sentences for you to review before saving.

The default model is `claude-haiku-4-5` (fast and cheap). To use a higher-quality model, change the `MODEL` constant near the top of the `<script>` in `index.html` (e.g. to `claude-opus-4-8`).

## Syncing words into the site

By default, words you add or generate live in your browser's `localStorage`. You can instead have them **committed back into this repo** so every device — and every fresh browser — loads the same word list. The app writes a `words.json` file to the repo via the GitHub API straight from your browser; GitHub Pages then republishes it (about a minute later). **Your scores stay per-device** — only the word list is shared.

One-time setup:

1. Create a **fine-grained personal access token** on GitHub: *Settings → Developer settings → Fine-grained tokens → Generate new token*. Under **Repository access** choose *Only select repositories* → this repo, and under **Permissions → Repository permissions** set **Contents: Read and write**.
2. In the app, go to **Settings → Sync to repo**. Paste the token, confirm the **Repo owner** and **Repo name** (auto-filled when you're on `*.github.io`), and press **Save**.
3. Press **Push words now** once to create `words.json` from your current words.

From then on, **Generate with Claude**, **+ Add a word**, and deleting a word each commit the updated `words.json` automatically — the Words tab shows the sync status. The token is stored only in this browser (in `localStorage`, and never included in Export). If you don't set up a token, everything still works exactly as before, just per-browser.

Notes:
- On load, the app merges the repo's `words.json` with anything in this browser (**words are only ever added, never dropped** by a sync), so a word you just generated on one device won't disappear before the other device has caught up.
- Because of that union, **deleting a word only removes it on the device you delete it from** and on the committed file — other devices that already have it keep their copy until you clear or re-import there.

## Backups

**Settings → Export (.json)** saves a file with all your words *and* your scores. **Import** restores it. Handy before a big reset or when moving to a new phone.

## Notes

- Scores and settings are stored in the browser (`localStorage`) on the device you study on — they don't sync across devices. Use Export/Import to move them, or see **Syncing words into the site** to share the word list across devices.
- **Settings → Reset progress** zeroes out scores but keeps your words.
