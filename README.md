# Hone

Mobile-first focus and attention training, built as an installable PWA.
Short sessions mix three demanding counting exercises:

- **Letter count** – read a passage and count target letters.
- **Listening count** – hear a spoken letter sequence and track targets,
  vowels or consonants without seeing anything.
- **Shape count** – count shapes by colour and form among distractors.

Difficulty adapts per skill (levels 1–10) from passage length, number of
targets, audio length and pace, letter confusability, shape count,
distractors, overlap and size variance. Accuracy, time, score and
best/recent results are stored on the device (no account, no backend).

## Run it

```bash
nvm use 22          # Node >= 20.19
npm install --legacy-peer-deps
npm run dev         # http://localhost:5180, also on your LAN IP
```

Install on a phone (same Wi-Fi):

```bash
npm run build && npm run preview   # serves the production build with the service worker
```

Open `http://<your-mac-ip>:4180` on the phone. iOS: Share → Add to Home
Screen. Android Chrome: use the install prompt. For a real test over
HTTPS (required for a PWA install anywhere except localhost on some
browsers), either deploy the `dist/` folder to any static host or tunnel
the preview server.

## Scripts

| Script            | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Vite dev server                                           |
| `npm run build`   | Type-check and build to `dist/` with the service worker   |
| `npm run preview` | Serve `dist/`                                             |
| `npm test`        | Unit tests for generators, scoring and session planning   |
| `npm run gen:audio` | Regenerate the 26 letter clips (macOS `say` + ffmpeg)   |
| `npm run gen:icons` | Regenerate PWA icons from the SVG mark (sharp)          |

## How audio works

The listening exercise does not use `speechSynthesis`: on phones it is
unreliable (voices load late, iOS cuts utterances, timing is not
controllable). Instead 26 short MP3 clips (`public/audio/letters/`) are
decoded once and scheduled sample-accurately with Web Audio. The clips
are precached by the service worker so the exercise works offline, and
`unmute-ios-audio` keeps playback audible with the iOS silent switch on.

## Structure

```
src/
  lib/            pure domain logic (no React)
    exercises/    generators for the three exercise types + sentence bank
    audio/        Web Audio letter player and feedback tones
    difficulty.ts level → parameters, scoring.ts, session.ts, stats.ts
  store/          zustand stores (persistent progress/history, live session)
  components/     UI primitives and the three exercise views
  screens/        Home, Session, Summary, Stats
scripts/          asset generators (audio, icons)
```
