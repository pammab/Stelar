# ORBIT · Solar System Explorer / 太阳系交互探索

An interactive 3D Solar System for **PCC Hack 1 (theme: Space)**.
The Sun and the eight planets are shown at their **true relative sizes**, and you can explore them
with the mouse, your **hands** (webcam) or your **voice**, and ask **Stelar**, an AI space guide
powered by Claude, anything about what you're looking at. Switch the whole interface between **English, 中文 and Español** from the language menu.

## Features

- **True-scale sizes.** The Sun is 109× wider than Earth and Jupiter is 11×. Distances are compressed so everything fits.
- **Three views**
  - *Overview*: planets orbiting the Sun, with an asteroid belt.
  - *Compare Sizes*: all planets lined up beside the Sun's edge.
  - *Close-up*: fly to any body. The lighting comes from the Sun, so you see day and night sides.
- **Realistic surfaces from real planet maps**, with Venus switchable to a radar view of the ground under its clouds. Procedural textures take over if a map is missing:
  - Earth: oceans, continents, clouds, ice caps and shiny water.
  - Mars: Valles Marineris, Olympus Mons and polar caps.
  - Jupiter: cloud belts and the Great Red Spot.
  - Saturn: the hexagon and detailed rings, including the Cassini Division.
  - Uranus: sideways rings. Neptune: the dark spot.
  - The Sun is animated.
- **Particle mode.** In close-up, open your palm (or use the slider) to scatter the planet into particles.
- **Hand gestures** with an on-screen cursor and a live hand skeleton:

  | Gesture | What it does |
  |---|---|
  | ☝ Point | Move the cursor over a planet; **hold still on it for about a second to open it**. In close-up, look around |
  | 🤏 Pinch | Open the planet under the cursor. Pinch and move up or down to zoom |
  | ✋ Open palm | Turn the Solar System. In close-up, scatter the particles |
  | ✊ Hold fist (1 s) | Go back to the overview |
  | ✌ Victory | Start talking to Stelar |

- **Hand sensitivity slider (1–5)** under the camera preview. Higher means smaller hand movements move the cursor further and react faster; lower is calmer and steadier. The setting is remembered on that device.
- **Steadier tracking:** fingers are read from 3D joint angles, so a tilted hand still works. A gesture must win a short vote over recent frames, so it doesn't flicker. The cursor uses a One-Euro filter: steady when you hold still, quick when you move.
- **Ask Stelar (AI + voice)**
  - Type, or press 🎙 and speak. Answers can be read aloud (🔊).
  - Voice and text navigation work without the AI: "Go to Mars", "去火星", "Compare sizes", "Back".
  - Stelar replies in the language you use. Voice input follows the chosen language (Português is also available in the chat's voice menu).

## Project structure

Everything sits in one folder (only `api/` is separate, because Vercel needs it there), so the
project can be uploaded through GitHub's web page.

```
index.html            Page layout
style.css             Styles
data.js               ★ Facts and text for every body (edit here)
i18n.js               Languages: Spanish dictionary and language switch
maps.js               Loads the real surface maps (the .jpg/.png files)
textures.js           Procedural backup surfaces, used if a map is missing
bodies.js             3D builders: buildPlanet, buildSun, stars, asteroid belt
gestures.js           Hand tracking (MediaPipe) and gesture recognition
voice.js              Speech-to-text and text-to-speech
chat.js               Ask Stelar chat panel and voice commands
main.js               Scene, camera, views, mouse and gesture controls
api/chat.js           AI endpoint on Vercel (prompt, limits, Claude API call)
server.mjs            Local server: the app plus the AI chat on http://localhost:8000
*.jpg, *.png          Planet surface maps
orbit-standalone.html Single-file version, opens with a double-click (no AI answers)
particle-garden.html  The earlier Particle Garden version
```

## Quickest way to look at it

Double-click **`orbit-standalone.html`**. It's the whole app in one file and opens straight from your
folder. Everything works except the AI answers, which need the server below. `index.html` needs a
server; if you double-click it, the page explains what to do.

`orbit-standalone.html` is a snapshot; after big changes, ask for it to be rebuilt.

## Run it locally

Needs [Node.js](https://nodejs.org) 18 or newer. There is nothing to install.

1. Copy `.env.example` to `.env` and paste the Anthropic API key after `ANTHROPIC_API_KEY=`.
2. Run:
   ```bash
   npm start
   ```
3. Open **http://localhost:8000** in **Chrome or Edge**.
4. Allow the camera (Enable Gestures) and the microphone (🎙 Talk) when asked.

Without a key, everything except the AI answers still works: planets, gestures and voice navigation.
VS Code Live Server also works for the 3D part, but the AI chat needs `npm start` or the online version.

## Put it online (Vercel, free)

1. Push the repo to GitHub. `.gitignore` keeps `.env` out.
2. On https://vercel.com, sign in with GitHub, choose **Add New → Project**, and import the repo.
3. Under **Environment Variables**, add `ANTHROPIC_API_KEY`.
4. Click **Deploy** and share the link. Every push to `main` redeploys automatically.

Set a monthly spend limit for the key in the Anthropic Console. The server also limits each visitor
to about 10 questions a minute and keeps answers short.

## Privacy notes

- **Camera:** hand tracking runs entirely in the browser. Video is never uploaded.
- **Microphone:** speech recognition uses the browser's built-in service. In Chrome, audio is processed by Google.
- **AI questions:** questions typed or spoken to Stelar are sent to the Claude API through our server.
  The API key is never sent to the browser.

## Credits

Surface maps (from the team's realistic version):
- Earth colour, normal, roughness and cloud maps: [three.js examples](https://threejs.org/examples/textures/planets/).
- All other planet maps and Saturn's ring: [Solar System Scope](https://www.solarsystemscope.com/textures/), licensed **CC BY 4.0**.
- Bump maps are derived from brightness: artistic detail, not scientific elevation data.

Built with [three.js](https://threejs.org), [MediaPipe Hand Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker),
the Web Speech API and the [Claude API](https://docs.claude.com). Moon counts are as of 2025–2026 and change as new moons are confirmed.
