# Architecture — Royaume des Connaissances

## Overview

**Type:** Pure Static Single-Page Application (SPA)
**Framework:** None — Vanilla HTML5 / CSS3 / JavaScript (ES6+)
**Build Step:** None — files are served as-is
**Hosting:** Vercel (static hosting)

The entire application lives in one `index.html` file (20,532 lines). There is no bundler, no transpiler, and no server-side logic. External scripts (`ambient_life.js`, `sound_system.js`, `dev_overlay.js`) are loaded at the bottom of `index.html`.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      index.html                            │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐  │ │
│  │  │  MapSystem   │  │ ExerciseSystem│  │ FirebaseService│  │ │
│  │  │  (line 5042) │  │  (line 5337)  │  │  (line 1375)   │  │ │
│  │  │              │  │               │  │                │  │ │
│  │  │ Journey dots │  │ Activity load │  │ Firestore save │  │ │
│  │  │ Map progress │  │ Grading logic │  │ App Check init │  │ │
│  │  │ localStorage │  │ Celebrations  │  │ Token mgmt     │  │ │
│  │  └──────┬───────┘  └───────┬───────┘  └───────┬────────┘  │ │
│  │         │                  │                   │           │ │
│  │         └──────────────────┼───────────────────┘           │ │
│  │                            │                               │ │
│  │  ┌─────────────────────────▼──────────────────────────┐   │ │
│  │  │               GeminiAIService (line 2173)           │   │ │
│  │  │                                                     │   │ │
│  │  │  model: "gemini-3.5-flash-lite"                     │   │ │
│  │  │  initFirebaseAiLogic() → GoogleAIBackend            │   │ │
│  │  │  RequestManagers for concurrent grading             │   │ │
│  │  └──────────────────────────────────────────────────── ┘   │ │
│  └─────────────────────────────────────────────────────────── ┘ │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ambient_life.js│  │sound_system.js│  │   dev_overlay.js    │  │
│  │Canvas birds,  │  │Audio playback │  │Dev tools (X key)    │  │
│  │butterflies    │  │Music toggle   │  │Harmless in prod     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
              │                              │
              ▼                              ▼
┌────────────────────────┐    ┌────────────────────────────────────┐
│   FIREBASE (Google)    │    │        CDN RESOURCES               │
│                        │    │                                    │
│  ┌──────────────────┐  │    │  gstatic.com/firebasejs/10.8.0/    │
│  │  Firestore DB    │  │    │  ├─ firebase-app-compat.js         │
│  │  evaluations/    │  │    │  ├─ firebase-firestore-compat.js   │
│  │  collection      │  │    │  ├─ firebase-analytics-compat.js   │
│  └──────────────────┘  │    │  └─ firebase-app-check-compat.js   │
│                        │    │                                    │
│  ┌──────────────────┐  │    │  esm.sh/@firebase/ai@3.0.0         │
│  │  Firebase AI     │  │    │  (Modular SDK, ES Module import)   │
│  │  Logic (Gemini)  │  │    │                                    │
│  │  gemini-3.5-     │  │    │  fonts.googleapis.com              │
│  │  flash-lite      │  │    │  Nunito, Quicksand, Outfit fonts   │
│  └──────────────────┘  │    └────────────────────────────────────┘
│                        │
│  ┌──────────────────┐  │
│  │  App Check       │  │
│  │  reCAPTCHA Ent.  │  │
│  │  Protects AI API │  │
│  └──────────────────┘  │
│                        │
│  ┌──────────────────┐  │
│  │  Analytics       │  │
│  └──────────────────┘  │
└────────────────────────┘
```

---

## Main JavaScript Systems

### 1. MapSystem (index.html, line 5042)
**Purpose:** Manages the interactive Tunisia map — the game's home screen.

- Renders journey dots at fixed coordinates over the map image
- Tracks which journeys are unlocked/completed
- Persists progress in `localStorage` under a namespaced key
- Calls `ExerciseSystem.open(levelNum)` when student taps a journey dot
- `MapSystem.advanceAfterCompletion(N)` unlocks the next journey after completing journey N

**State:** `MapSystem.state` — JavaScript object, synced to localStorage

---

### 2. ExerciseSystem (index.html, line 5337)
**Purpose:** Controls all activity loading, navigation, and celebration sequences.

- Opens/closes the exercise overlay
- Tracks `currentExIndex` — which activity within a journey is active
- Dispatches to `loadJourneyNActivity(index)` for each journey
- Handles the "check answer" flow: `ExerciseSystem.checkAnswer()`
- Triggers success popups and journey-end celebrations
- Calls `GeminiAIService` for AI-graded activities

**Key methods:**
```javascript
ExerciseSystem.open(levelNum)      // Open a journey
ExerciseSystem.close()             // Close exercise overlay
ExerciseSystem.checkAnswer()       // Validate current activity
ExerciseSystem.nextActivity()      // Advance to next activity
```

---

### 3. GeminiAIService (index.html, line 2173)
**Purpose:** Wraps Firebase AI Logic to grade open-ended student responses.

- Uses `gemini-3.5-flash-lite` via `GoogleAIBackend`
- Initialized lazily via `initFirebaseAiLogic()` on first use
- Separate evaluation functions per journey:
  - `evaluateJourney2Activity4()` — text writing (9-point rubric)
  - `evaluateJourney4Activity4()` — text writing (9-point rubric)
  - `evaluateJourney5Activity4()` — sentence evaluation
  - `evaluateJourney8Activity1()` — comprehension Q&A (4 questions)
  - `evaluateJourney8Activity4()` — text writing (9-point rubric)
- Uses `Journey2AiRequestManager` for concurrent request throttling
- Retries on transient errors with exponential backoff

**Model:** `gemini-3.5-flash-lite`
**Backend:** Firebase AI Logic (`GoogleAIBackend`) — routes through Firebase, protected by App Check

---

### 4. FirebaseService (index.html, line 1375)
**Purpose:** Firebase initialization and Firestore operations.

- Initializes Firebase app + Firestore + Analytics + App Check
- App Check uses reCAPTCHA Enterprise provider
- Saves teacher evaluation data to Firestore `evaluations/` collection via REST API
- Uses Firestore Compat SDK (`firebase.firestore()`)

---

### 5. SoundSystem (sound_system.js)
**Purpose:** Background music and UI sound effects.

- Loads and plays `audio/bg_music.mp3`
- Plays `audio/pop.mp3` on UI interactions
- Plays `audio/success.mp3` on activity success
- Toggle-able by the student (music on/off button)

---

### 6. AmbientLife (ambient_life.js)
**Purpose:** Visual ambience — animated birds, butterflies, and particles on HTML5 Canvas elements.

- Renders on `#home-ambient-canvas` and `#map-ambient-canvas`
- Completely cosmetic — no effect on game logic
- Runs continuously via `requestAnimationFrame`

---

## State Management

| State | Storage | Scope | Reset |
|---|---|---|---|
| Map journey progress (unlocked/completed) | `localStorage` | Persistent across sessions | Only on `localStorage.clear()` |
| Current activity index | `ExerciseSystem` JS object (memory) | Session only | Page refresh |
| Student answers for current activity | JS variables (memory) | Activity only | Next activity |
| Gemini grading results | JS variables (memory) | Session only | Page refresh |
| Teacher evaluation data | Firebase Firestore | Permanent | Manual deletion in Firebase Console |
| App Check token | `FirebaseService.appCheckToken` (memory) | Session | Page refresh |

---

## Asset Delivery

All assets are referenced with **relative paths** directly in `index.html`:

```html
<!-- Images -->
<img src="journe 1/activity1.png" />
<img src="JOURNE 3/popup.png" />  <!-- Note: uppercase -->
<img src="map_assets_full/map.png" />
<img src="contiuer/bien joue.png" />

<!-- Audio -->
<audio src="audio/bg_music.mp3" />
```

**No bundling, no CDN for assets.** All images and audio are served as static files from the project root by Vercel.

---

## External Service Dependencies

| Service | Used For | Required? | Fallback |
|---|---|---|---|
| Firebase Firestore | Teacher evaluation storage | Yes (for teacher dashboard) | No — evaluations are lost |
| Firebase App Check | Protect AI API key | Yes | No — Gemini calls will fail without it |
| Firebase AI Logic / Gemini | Grade open-ended activities | Yes (for Journeys 2,4,5,8) | Activity shows error state |
| Firebase Analytics | Usage metrics | No | Skipped gracefully |
| Google Fonts | UI typography | No | Falls back to system sans-serif |
| reCAPTCHA Enterprise | App Check provider | Yes | Same as App Check |

---

## Security Model

```
Student Browser
     │
     │ 1. Page loads, App Check initializes
     │ 2. reCAPTCHA Enterprise runs silently
     │ 3. Firebase issues App Check token
     │
     ├──► Firebase AI Logic (Gemini)
     │    ← Token required — prevents unauthorized API use
     │
     └──► Firestore (via REST API)
          ← Firestore Security Rules control access
```

- **Firebase API key** is public (by design for client-side Firebase)
- **App Check** token is the actual security gate for Gemini
- **Firestore Security Rules** control who can read/write evaluation data
- **No student authentication** — students are anonymous

---

## Deployment Architecture

```
Developer pushes to GitHub
        │
        ▼
  Vercel picks up push
  (Git integration)
        │
        ▼
  Vercel serves static files
  (No build, just file serving)
        │
        ▼
  Student visits URL
  (e.g., your-app.vercel.app)
        │
        ▼
  Browser loads index.html
  (All app logic inline)
```

Vercel serves 100% static content. There is no server process, no API routes, no serverless functions in this project.
