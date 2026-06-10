# The Dream of the Two Princesses

Interactive story web app for Naomi's book, **The Two Princesses**.

## Play Online

[Play the game in your browser](https://starman965.github.io/the-dream-of-the-two-princesses-game/)

## Run Locally

```bash
cd web-app
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Build

```bash
cd web-app
npm run build
```

Production files are written to `web-app/dist/`.

## Project Layout

- `web-app/src/App.jsx` — story flow, transitions, and UI
- `web-app/src/gameData.js` — scene sequence and tap targets
- `web-app/src/storyAudio.js` — sound effects and music
- `web-app/src/storyVideo.js` — cutscene videos
- `web-app/src/assets/full_story/` — scene artwork
- `web-app/src/assets/audio/` — story audio
- `web-app/src/assets/video/` — cutscene videos
