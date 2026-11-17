# AI Project Guide — Royaume des Connaissances

> **For AI Agents:** This is your primary reference for working with this codebase. Read this before making any changes.

---

## A. Project Overview

**Name:** Royaume des Connaissances (Kingdom of Knowledge)
**Purpose:** Interactive French language educational platform for primary school students in Tunisia. Students navigate an illustrated map of Tunisia and unlock 8 educational journeys (modules), each containing 3–4 activities that reinforce French language skills.

**Architecture:** Pure static Single-Page Application (SPA)
- One `index.html` file contains **all** HTML structure, CSS styles, and JavaScript logic (20,532 lines)
- No framework, no build step, no bundler
- External scripts loaded at the bottom: `ambient_life.js`, `sound_system.js`, `dev_overlay.js`

**Hosting:** Vercel (static hosting, no server-side rendering)
**GitHub:** https://github.com/KhalilElajmi-commits/educational-platform.git
**Language:** French (UI, content, activity instructions)

### Technologies & External Libraries

| Library | Version | CDN | Purpose |
|---|---|---|---|
| Firebase App (Compat) | 10.8.0 | gstatic.com | Firebase initialization |
| Firebase Firestore (Compat) | 10.8.0 | gstatic.com | Teacher evaluation database |
| Firebase Analytics (Compat) | 10.8.0 | gstatic.com | Usage analytics |
| Firebase App Check (Compat) | 10.8.0 | gstatic.com | API key protection via reCAPTCHA Enterprise |
| @firebase/ai | 3.0.0 | esm.sh | Firebase AI Logic (Gemini backend) |
| Google Fonts: Nunito, Quicksand, Outfit | — | fonts.googleapis.com | UI typography |

> **Note:** Firebase AI (`@firebase/ai`) is loaded via ES Module `import` inside a `<script type="module">` block at line ~1669. All Firebase Compat SDKs are traditional `<script src>` tags at lines 1320–1323.

### Gemini AI Model
- **Model:** `gemini-3.5-flash-lite`
- **Backend:** `GoogleAIBackend` (Firebase AI Logic)
- **Initialization:** `initFirebaseAiLogic()` function (line ~1931)
- **Global service:** `window.GeminiAIService` (line 2173)

---

## B. Directory Structure

```
educational-platform/
├── index.html              # THE ENTIRE APPLICATION — all HTML, CSS, JS inline (20,532 lines)
├── ambient_life.js         # Background animation (birds, insects, ambient life on canvas)
├── sound_system.js         # Global sound system (background music, effects)
├── dev_overlay.js          # Development overlay (Dev mode tools) — keep but can disable
├── vercel.json             # Vercel deployment configuration
├── package.json            # Dev dependencies (serve for local preview)
├── .env.example            # Environment variable documentation template
├── audio/                  # Background music and sound effects
│   ├── bg_music.mp3        # Background music (MP3 — primary format)
│   ├── bg_music.wav        # Background music (WAV — same content, larger file)
│   ├── pop.mp3             # UI click/interaction sound
│   └── success.mp3         # Activity success sound
├── journe 1/               # Journey 1 assets (images, popups, activity screens)
├── journe 2/               # Journey 2 assets
├── JOURNE 3/               # Journey 3 assets (UPPERCASE — keep exactly as-is)
├── journe 4/               # Journey 4 assets
├── journe 5/               # Journey 5 assets
├── journe 6/               # Journey 6 assets
├── journe 7/               # Journey 7 assets
├── journe 8/               # Journey 8 assets
├── contiuer/               # Celebration/encouragement cards (bien joue.png, etc.)
├── evalution/              # Teacher evaluation dashboard (Firebase Kids Evaluation Project.html)
│   ├── Firebase Kids Evaluation Project.html   # Main teacher dashboard page
│   ├── Firebase Kids Evaluation Project_files/ # Dashboard assets
│   └── [images/assets]     # Dashboard UI images
├── map_assets_full/        # Interactive Tunisia map images (journey dots, regions)
├── clean_clouds/           # Cloud overlay images used over the map
├── docs/                   # Documentation (this folder)
└── [root images]           # Map background, fox mascot elements, logos, cloud corners
    ├── background_upscayl_2x_ultrasharp-4x.png  # Main map background
    ├── logofr.png           # Logo
    ├── buttom center.png    # Mascot/UI element
    ├── fanke buttom enter 2.png
    ├── fanke buttom right.png
    ├── fnake buttom left.png
    ├── fnake top right.png
    ├── cloud_pure_bl.png    # Cloud corners (bottom-left)
    ├── cloud_pure_br.png    # Cloud corners (bottom-right)
    ├── cloud_pure_tl.png    # Cloud corners (top-left)
    ├── cloud_pure_tr.png    # Cloud corners (top-right)
    └── exercice pop up.png  # Exercise popup background
```

---

## C. Feature Map

| Feature | File / System | Notes |
|---|---|---|
| Student interactive map | `index.html` — `MapSystem` (line 5042) | Journey dots on Tunisia map image |
| Journey 1–8 navigation | `index.html` — `ExerciseSystem` (line 5337) | Each journey has 3–4 activities |
| Activity: Comprehension Q&A | `index.html` — `loadJourney[N]Activity` | Gemini AI graded (journeys 1, 2, 4, 5, 8) |
| Activity: Image ordering | `index.html` — Journey-specific activity | Student clicks images in correct order |
| Activity: Crossword | `index.html` — Journey 7 crossword system | Keyword crossword grid |
| Activity: Sentence builder | `index.html` — Journey 8 activity | Drag/select sentence parts |
| Activity: Text writing | `index.html` — Journey 8 Activity 4 | Gemini AI graded (9-point rubric) |
| Encouragement celebrations | `contiuer/` + `index.html` | Random card + audio + fireworks |
| Journey end celebrations | `index.html` — `showJourney[N]EndCelebration` | Full-screen fireworks popup |
| Teacher dashboard | `evalution/` | Separate HTML page, reads Firebase Firestore |
| Background music | `sound_system.js` + `audio/` | Toggle on/off |
| Ambient animations | `ambient_life.js` | Birds, butterflies, sparkles on canvas |
| Firebase AI (Gemini) | `index.html` — `GeminiAIService` (line 2173) | Journeys 2, 4, 5, 8 activities |
| App Check security | `index.html` — Firebase App Check | reCAPTCHA Enterprise (site key inline) |
| Student progress | `index.html` — `MapSystem.state` | JavaScript memory + localStorage |
| Firestore evaluation save | `index.html` — `FirebaseService` (line 1375) | Teacher evaluations saved to Firestore |

---

## D. Data Flow

### Student Session Flow

```
1. Student opens site
   → Interactive Tunisia map renders (MapSystem initializes)
   → Ambient animations start (ambient_life.js)
   → Background music plays (sound_system.js)

2. Student clicks a journey dot on the map
   → First popup appears with journey title and description
   → Student clicks "Commencer" button

3. ExerciseSystem.open(levelNum) is called
   → Exercise overlay appears
   → Activities load sequentially via ExerciseSystem.currentExIndex

4. Per-activity grading:
   ┌── Gemini-graded activities (journeys 2, 4, 5, 8)
   │   Student writes/selects answer
   │   → GeminiAIService.evaluate[Journey]() called
   │   → initFirebaseAiLogic() initializes Firebase AI with GoogleAIBackend
   │   → App Check token obtained (reCAPTCHA Enterprise)
   │   → Gemini model (gemini-3.5-flash-lite) called with prompt + answer
   │   → JSON response parsed → score extracted
   │   → Score applied to activity state
   │
   └── Auto-validated activities
       Student selects/arranges answer
       → Answer compared against expected values in JS
       → Immediate pass/fail

5. Activity success
   → showJourney[N]SuccessPopup() displays encouragement card from contiuer/
   → Sound effect plays
   → Next activity loads

6. Journey completion
   → showJourney[N]EndCelebration() — full-screen fireworks + end card
   → finishJourney[N]() called
   → MapSystem.advanceAfterCompletion(N) → next journey dot unlocked

7. Progress persistence
   → MapSystem.state saved to localStorage
   → Firestore: teacher evaluation data saved via FirebaseService.saveEvaluation()
```

---

## E. Important Configurations

### Firebase (Inline in index.html — Public Client-Side Keys)
```javascript
// Lines 1325–1332 of index.html
const firebaseConfig = {
  apiKey: "AIzaSyBBCXAcvKEJ93QCXf80qJ7x0WBt9O88RPE",
  authDomain: "students-9d81b.firebaseapp.com",
  projectId: "students-9d81b",
  storageBucket: "students-9d81b.firebasestorage.app",
  appId: "1:991487211489:web:78ff29222442e9558304a0",
  measurementId: "G-5S0BCJBDK3"
};
```
> **Note:** Firebase web API keys are designed to be public client-side. Security is enforced by Firebase Security Rules and App Check, NOT by hiding the key.

### App Check / reCAPTCHA Enterprise
```javascript
// Line 1335 of index.html
window.RECAPTCHA_ENTERPRISE_SITE_KEY = '6LdAWhguAAAAANNbg2iJtYw636xDuZT2nB3l9q5E';
```

### Gemini AI Model
```javascript
// Line 2174 of index.html
window.GeminiAIService = { model: "gemini-3.5-flash-lite", ... }
```

### Vercel Configuration (`vercel.json`)
- Static hosting, no build command
- Root serves `index.html` for all routes

### Local Development
```bash
npm run dev        # Uses serve package
# OR
npx serve . -p 3000
```
Then open: http://localhost:3000

---

## F. AI Agent Modification Rules

> **Read all rules before making any changes to this project.**

1. **`index.html` is the entire app.** It is 20,532 lines long. All logic is inline. Never split it without testing.

2. **Search before editing.** Before changing any activity, search for the function name:
   - e.g., `loadJourney8Activity`, `showJourney8EndCelebration`, `finishJourney8`
   - Use line numbers to navigate to the right location.

3. **Journey numbering:** `MapSystem` level `N` maps to `ExerciseSystem` journey `N`. They are 1-indexed (Journey 1 through Journey 8).

4. **Asset paths are RELATIVE and case-sensitive:**
   - ✅ `journe 1/file.png`
   - ❌ `Journe 1/file.png`
   - ⚠️ Exception: `JOURNE 3/` uses uppercase — keep exactly as-is.

5. **Adding a new activity:** You must:
   - Add it to the `JOURNEY_N_POPUPS` array (or equivalent config)
   - Implement the `loadJourneyNActivity()` case for the new activity index
   - Add a success handler

6. **Never change Firebase config values** without also updating:
   - Firebase Console → Authorized Domains
   - Firebase Console → App Check configuration

7. **Never disable App Check.** It protects the Gemini API key from unauthorized use.

8. **Local dev test command:**
   ```bash
   npx serve . -p 3000
   ```

9. **The `contiuer/` folder** (note spelling — intentional) contains encouragement assets. Do NOT rename this folder.

10. **The `evalution/` folder** (note spelling — intentional) is the teacher dashboard. Do NOT rename — paths are hardcoded in the teacher dashboard HTML and in `index.html`.

11. **Journey progress is NOT saved to Firebase.** It uses JavaScript state + localStorage only. A page refresh resets journey progress (by design — no persistent student accounts).

12. **Dev overlay (`dev_overlay.js`)** is loaded in production but harmless. It only activates when the user presses the `X` key. You may leave it loaded.

13. **Gemini grading is used in multiple journeys:** Journeys 2, 4, 5 (Activity 4 — text writing, 9-point rubric) and Journey 8 (Activity 1 — comprehension Q&A, Activity 4 — text writing).

14. **Firebase Compat SDK vs Modular SDK:** The project uses the Compat SDK (`firebase-app-compat.js`) for Firestore and App Check (traditional `<script>` tags). The Firebase AI Logic uses the Modular SDK (`@firebase/ai`) loaded via `esm.sh` inside a `<script type="module">` block. Do not mix these patterns.

---

## G. Known Issues & Quirks

| Issue | Detail |
|---|---|
| `bg_music.wav` is a duplicate | Same audio as `bg_music.mp3`, just WAV format (larger file). Not needed in production. MP3 is used. |
| `scratch/` folder (original only) | Contains 100+ dev test scripts — excluded from this project intentionally |
| Journey progress resets on refresh | By design — no persistent student accounts in the current architecture |
| `evalution/` spelling is intentional | Original project uses this exact path; hardcoded throughout |
| `JOURNE 3/` uppercase folder | Original folder was created with uppercase — kept exactly as-is to avoid broken references |
| Firebase Compat + Modular mix | Firestore uses Compat SDK; AI Logic uses Modular SDK. This is intentional and functional. |
| reCAPTCHA debug mode | App Check has a debug token mechanism for local dev — only activates when `appcheck_debug=1` query param or localStorage flag is set |

---

## H. Verification Commands

```bash
# Install dev dependencies
npm install

# Run locally (port 3000)
npm run dev
# OR
npx serve . -p 3000

# Deploy to Vercel
npx vercel --prod

# Check how many src= references exist in index.html
node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const refs=html.match(/src=['\"][^'\"]+['\"]/g); console.log(refs ? refs.length + ' src references found' : 'none');"

# Count lines in index.html
node -e "const fs=require('fs'); const lines=fs.readFileSync('index.html','utf8').split('\n'); console.log(lines.length + ' lines');"
```
