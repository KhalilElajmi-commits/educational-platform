# File Map & System Inventory — Royaume des Connaissances

This document provides a searchable file index and component directory mapping for the educational platform.

---

## 1. Root Application Files

| Path | Size | Responsibility | Key Exports / Functions | Referenced By |
|---|---|---|---|---|
| `index.html` | ~1.0 MB | **Main application entry point.** Contains HTML structure, CSS stylesheets, and all client-side JavaScript systems inline. | `MapSystem`, `ExerciseSystem`, `GeminiAIService`, `FirebaseService`, `TeacherPortal`, `EVALUATION_RUBRIC_CONFIG` | Served directly by Vercel / web server |
| `ambient_life.js` | 19.6 KB | Ambient canvas background animation system (birds, butterflies, desert particles). | `AmbientLife` engine, particle emitters | `<script src="ambient_life.js">` in `index.html` |
| `sound_system.js` | 17.1 KB | Global sound engine using Web Audio API synthesis and background music player. | `SoundSystem.startMusic()`, `SoundSystem.playClick()`, `SoundSystem.playSparkle()`, ducking | `<script src="sound_system.js">` in `index.html` |
| `dev_overlay.js` | 42.0 KB | Developer debugging overlay (activated via 'X' key). Allows jumping between journeys and toggling states. | `DevOverlay.toggle()`, level unlocker, rubric inspector | `<script src="dev_overlay.js">` in `index.html` |
| `vercel.json` | ~200 B | Vercel deployment configuration for static hosting. | Route rewrite rules, static build configuration | Vercel CLI & Git integration |
| `package.json` | ~400 B | Project metadata and dev scripts (`npm run dev` using `serve`). | `dev`, `preview`, `build` scripts | npm / Node.js |
| `.env.example` | ~600 B | Environment variable documentation template. | Firebase App Check, Gemini domain notes | Future developers / AI agents |
| `.gitignore` | ~300 B | Git ignore rules tailored for production deployment. | Ignores OS files, IDE configs, temp files | Git repository |
| `AI_PROJECT_GUIDE.md` | ~14 KB | Primary reference guide for AI coding agents. | Architectural rules, modification guidelines, verification commands | Future AI agents |
| `ARCHITECTURE.md` | ~13 KB | System architecture overview and data flow diagrams. | Architecture diagram, component relationships, state machines | Technical teams |
| `DEPLOYMENT.md` | ~8 KB | Step-by-step Vercel deployment and Firebase domain setup guide. | Deployment commands, pre-flight checklist, domain authorization | DevOps / Developers |
| `CHANGELOG.md` | ~5 KB | Record of project cleanup, optimizations, and preserved features. | Migration history, deleted clutter, performance gains | All contributors |

---

## 2. Inline Systems in `index.html`

The primary application logic in `index.html` is partitioned into distinct subsystems:

### A. Firebase & Security (Lines ~1300–1660)
- `window.FIREBASE_APP_CONFIG`: Firebase project credentials (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId).
- `window.RECAPTCHA_ENTERPRISE_SITE_KEY`: reCAPTCHA Enterprise site key for App Check.
- `window.configureFirebaseAppCheckEnvironment()`: Detects local vs production hostname and activates App Check or debug tokens.
- `window.FirebaseService`: Initializes Firebase app, Firestore instance, and App Check provider.

### B. Evaluation Rubric & AI Logic (Lines ~1665–3420)
- `window.EVALUATION_RUBRIC_CONFIG`: Centralized 9-point rubric definition:
  - **C1:** Adéquation avec la situation (max 4.5 pts)
  - **C3:** Correction linguistique (max 3.0 pts)
  - **C6:** Richesse du vocabulaire (max 1.5 pts)
  - Passing threshold: `totalScore >= 5.0 / 9.0`
- `window.EvaluationRubricHelper`: Score normalization, boundary checks, and criterion calculations.
- `initFirebaseAiLogic()`: Initializes `@firebase/ai` with `GoogleAIBackend` and loads model `gemini-3.5-flash-lite`.
- `buildQuestionPrompt(qConfig, studentAnswer, rubricConfig)`: Generates strict French prompt instructing Gemini to evaluate C1, C3, and C6 and return structured JSON.
- `window.GeminiAIService`: Provides `gradeQuestion(qConfig, answer, imageBlob)` and handles request queueing with retry backoff.
- `Journey2AiRequestManager` / `Journey8AiRequestManager`: Request queues limiting concurrency to 2 simultaneous requests with 30-second timeouts.

### C. Teacher Portal & Evaluation Dashboard (Lines ~3450–4950)
- `window.TeacherPortal`: Renders the teacher dashboard overlay (`evalution/tet dachbored.png`).
- Pulls live evaluation records from Firestore (`evaluations` collection).
- Filters by class, student name, and date.
- Exports evaluation data to CSV (`evaluations_espace_enseignant.csv`).

### D. Interactive Map System (Lines ~5040–5330)
- `window.MapSystem`: Manages the Tunisia map viewport, zoom/pan navigation, journey markers (dots), and level progression.
- `window.MapCamera`: Smooth camera transitions and coordinate conversions between screen space and map coordinates.
- `MapSystem.state`: Persistent progression tracking via `localStorage` (`unlockedLevel`, `completedLevels`, `currentLevel`).
- `MapSystem.advanceAfterCompletion(levelNum)`: Unlocks the next journey, pans camera to the new marker, and plays celebration fanfare.

### E. Exercise & Journey Navigation Engine (Lines ~5337–23400)
- `window.ExerciseSystem`: Core engine that loads journey activities, manages activity step navigation, handles validation, and presents completion cards.
- **Activity Data Arrays:**
  - `JOURNEY_1_POPUPS`: Journey 1 (Lettre Z & vocabulaire scolaire)
  - `JOURNEY_2_POPUPS`: Journey 2 (Caroline arrive à l'école)
  - `JOURNEY_3_POPUPS`: Journey 3 (Sons [k] avec k et q)
  - `JOURNEY_4_POPUPS`: Journey 4 (Compréhension & phrases)
  - `JOURNEY_5_POPUPS`: Journey 5 (Vocabulaire & expressions)
  - `JOURNEY_6_POPUPS`: Journey 6 (Remise en ordre & structure de texte)
  - `JOURNEY_7_POPUPS`: Journey 7 (Chott el-Jérid mots croisés & vocabulaire)
  - `JOURNEY_8_POPUPS`: Journey 8 (Nafta — Production écrite complète)
  - `JOURNEY_EVAL_POPUPS`: Level 10 Evaluation formelle
- **Activity Loaders:**
  - `loadJourney1Activity()`, `loadJourney2Activity()`, ..., `loadJourney8Activity()`
  - `loadEvaluationActivity()`: Formal 3-question evaluation test with profile registration.
- **Celebrations & Popups:**
  - `showJourney[N]SuccessPopup()`: Encouragement cards from `contiuer/` with matching audio.
  - `showJourney[N]EndCelebration()`: Fullscreen canvas fireworks, `contiuer/Felicitation.mp3`, wooden celebration boards, and completion buttons.

---

## 3. Directory & Asset Mapping

### Root Graphic Assets
| File | Purpose | Referenced In |
|---|---|---|
| `background_upscayl_2x_ultrasharp-4x.png` | Main interactive Tunisia map background | `index.html` (`#map-bg`) |
| `cloud_pure_tl.png`, `cloud_pure_tr.png` | Map cloud border overlays (top-left, top-right) | `index.html` |
| `cloud_pure_bl.png`, `cloud_pure_br.png` | Map cloud border overlays (bottom-left, bottom-right) | `index.html` |
| `buttom center.png` | UI navigation center button | `index.html` |
| `fanke buttom enter 2.png`, `fanke buttom right.png` | Fennec fox mascot dialog poses | `index.html` |
| `fnake buttom left.png`, `fnake top right.png` | Fennec fox mascot UI corner poses | `index.html` |
| `exercice pop up.png` | Generic level popup template frame | `index.html` |
| `logofr.png` | Educational platform logo | `index.html` |

### Audio Directory (`audio/`)
| File | Size | Format | Purpose |
|---|---|---|---|
| `bg_music.mp3` | 967 KB | MP3 (128 kbps) | Looping background soundtrack controlled by `sound_system.js` |
| `pop.mp3` | 1.2 KB | MP3 | Button click feedback sound |
| `success.mp3` | 7.7 KB | MP3 | Activity completion chime sound |

### Encouragement & Celebration Assets (`contiuer/`)
| File | Type | Purpose |
|---|---|---|
| `bien joue.png` & `bien joue.mp3` | Card + Voice | Encouragement: "Bien joué ! Tu progresses très bien !" |
| `excellent.png` & `excellent.mp3` | Card + Voice | Encouragement: "Excellent ! Tu progresses à grands pas !" |
| `parfait.png` & `parfait.mp3` | Card + Voice | Encouragement: "Parfait ! Continue comme ça !" |
| `super.png` & `super.mp3` | Card + Voice | Encouragement: "Super ! Tu as trouvé la bonne réponse !" |
| `Felicitation.mp3` | Audio Fanfare | Journey completion orchestral celebratory fanfare |
| Narration MP3s (6 files) | Voice Audio | Mascot audio narration instructions for interactive activities |

### Educational Journeys (`journe 1/` through `journe 8/`)
| Directory | Files | Focus & Activities |
|---|---|---|
| `journe 1/` | 24 | Phonétique & écriture [z], images d'animaux et d'objets, boutons audio interactifs |
| `journe 2/` | 10 | Lecture & compréhension : "Caroline à l'école", questions à choix multiple |
| `JOURNE 3/` | 19 | Sons [k] avec les lettres k et q, mots illustrés (Coq, Kangourou, Koala, Masque, Vélo) |
| `journe 4/` | 8 | Structure de la phrase, ordonnancement logique, reconstitution |
| `journe 5/` | 10 | Enrichissement du vocabulaire, expressions usuelles, association mots-images |
| `journe 6/` | 13 | Organisation narrative, connecteurs temporels, reconstitution d'histoire |
| `journe 7/` | 7 | Mots croisés interactifs sur la vie scolaire, Chott el-Jérid |
| `journe 8/` | 8 | Nafta : Production écrite complète, carte de préparation, correction par Gemini AI |

### Teacher Evaluation System (`evalution/`)
| File | Purpose |
|---|---|
| `1.png`, `2.png`, `3.png` | Visual prompts for formal evaluation questions 1, 2, and 3 |
| `back ground.png` | Background illustration for the evaluation room |
| `botten tet.png` | Teacher portal access button icon |
| `espace.png` | Teacher portal header emblem |
| `id.png` | Student identification badge and profile entry card |
| `pop up evalution.png` | Evaluation start modal backdrop |
| `pop up end.png` | Evaluation final completion banner |
| `tet dachbored.png` | Teacher dashboard parchment board interface |

### Map Layers (`map_assets_full/` & `clean_clouds/`)
- `map_assets_full/`: 13 transparent PNG layers representing regional topography, roads, oases, and landmarks across Tunisia.
- `clean_clouds/`: 12 cloud sprite assets positioned at precise pixel offsets around the map boundaries.
