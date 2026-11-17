# Changelog — Educational Platform Migration

All notable changes and optimization milestones for the **Royaume des Connaissances** clean platform are documented here.

---

## [1.0.0] — 2026-11-17 — Clean Vercel-Ready Release

### Summary
Created a completely independent, optimized, and maintainable copy of the educational platform in `educational-platform/`, preserving 100% of the original website functionality, educational content, illustrations, audio, animations, and Gemini AI integration while cleaning over 415 MB of obsolete binaries, development artifacts, and redundant files.

The original project at `c:\Users\KHALIL\Desktop\master\Nouveau dossier\github-ready-project` was **completely untouched** throughout the entire migration (verified clean git working tree).

---

### Features Preserved & Verified

1. **Student Interactive Map & Navigation:**
   - Full Tunisia illustrated map with animated ambient canvas (`ambient_life.js`).
   - Smooth viewport pan/zoom controls via `MapCamera` and `MapSystem`.
   - Sequential journey unlocking and persistence in `localStorage`.

2. **All 8 Educational Journeys & Level 10 Evaluation:**
   - **Journey 1:** Phonétique & écriture son [z], lecture guidée avec boutons audio interactifs.
   - **Journey 2:** Compréhension écrite : "Caroline arrive à l'école".
   - **Journey 3 (`JOURNE 3`):** Reconnaissance sons [k] avec k et q, vocabulaire illustré.
   - **Journey 4:** Reconstitution de phrases et ordonnancement logique.
   - **Journey 5:** Vocabulaire & expressions usuelles.
   - **Journey 6:** Organisation de texte et chronologie d'images.
   - **Journey 7:** Mots croisés interactifs et célébration Chott el-Jérid débloquant Nafta.
   - **Journey 8:** Activité "J'écris mon texte" avec évaluation en temps réel par Gemini AI (`gemini-3.5-flash-lite`).
   - **Level 10 (Évaluation):** Évaluation formelle avec fiche d'identité élève et enregistrement dans Firestore.

3. **Audio & Sound Engine:**
   - Background music engine (`sound_system.js`) with smart narration ducking.
   - Web Audio API synthesizer for UI clicks, sparkles, and fanfare chords.
   - French voiceover narration and audio instructions in all activities.

4. **Celebrations & Mascots:**
   - Fennec mascot animations across all feedback screens.
   - Fullscreen celebration modal with particle fireworks canvas and `Felicitation.mp3`.
   - Encouragement pop-ups with randomized cards and voice audio from `contiuer/`.
   - Interactive wooden "Continuer" button centered on journey end screens.

5. **Teacher Dashboard & Data Export:**
   - Teacher portal modal with live records fetched from Firestore.
   - Student filtering by date, name, and class.
   - CSV export functionality.

6. **Gemini AI & App Check Security:**
   - Real Gemini AI evaluation using `@firebase/ai` and `GoogleAIBackend`.
   - Official 3-criteria grading rubric (C1: 4.5, C3: 3.0, C6: 1.5 = 9.0 pts total, passing >= 5).
   - Firebase App Check integration with reCAPTCHA Enterprise.
   - Dual-slot request queue with retry backoff and duplicate submission prevention.

---

### Cleanup & Performance Optimization

#### Storage Reduction: 740.5 MB &rarr; 324.7 MB (415.8 MB Freed, -56% size)
- **Eliminated 370+ MB of non-project clutter:**
  - Removed installer executables accidentally placed in asset folders (`dsh-latest-windows-x64.exe` [276 MB], `Claude Setup.exe` [6.9 MB]).
  - Removed unrelated presentation decks (`FLOWGEN_...` [65 MB], `AI_Recruitment_Interviewer...` [40 MB]).
  - Removed offline web page download clones (`evalution/Firebase Kids Evaluation Project.html` and `_files/` [7 MB]).
  - Removed unreferenced raw upscaled files (`evalution/91f900e6...` [14.5 MB]).
  - Removed duplicate unreferenced WAV audio files (`audio/bg_music.wav` [7.1 MB], `audio/pop.wav`, `audio/success.wav`) — only `.mp3` is used.
  - Removed extensionless duplicate audio (`contiuer/Excellent` [exact binary duplicate of `excellent.mp3`]).
  - Excluded all developer scripts (`scratch/` folder, test runners, headless Chrome temp profiles).

#### Asset Compatibility Fixes:
- Added aliases `journe 5/end pop up.png` &rarr; `journe 5/end popup.png` and `journe 6/end pop up.png` &rarr; `journe 6/popup end.png` to ensure 100% of code paths resolve with zero 404s.
- Verified all French accented audio filenames in `contiuer/` and journey folders resolve correctly.

---

### New Files Added

- `vercel.json`: Zero-config static deployment rules for Vercel.
- `package.json`: Lightweight local development configuration (`npm run dev`).
- `.env.example`: Template documenting Firebase and domain authorization requirements.
- `.gitignore`: Production-grade ignore rules excluding OS files, IDE configs, and test logs.
- `AI_PROJECT_GUIDE.md`: Comprehensive reference manual for future AI agents.
- `ARCHITECTURE.md`: High-level system architecture and data flow diagrams.
- `FILE_MAP.md`: Searchable inventory of all assets, directories, and exported systems.
- `DEPLOYMENT.md`: Production deployment guide for Vercel and Firebase App Check.
- `docs/TESTING_REPORT.md`: Detailed test verification log.

---

### Dependencies Summary

- **Retained (Production CDN):**
  - Firebase App Compat `10.8.0`
  - Firebase Firestore Compat `10.8.0`
  - Firebase Analytics Compat `10.8.0`
  - Firebase App Check Compat `10.8.0`
  - `@firebase/app` `0.16.5` (ESM via esm.sh)
  - `@firebase/app-check` `0.8.12` (ESM via esm.sh)
  - `@firebase/ai` `3.0.0` (ESM via esm.sh)
  - Google Fonts (Nunito, Quicksand, Outfit)
- **Dev Dependencies Added:**
  - `serve` `^14.0.0` (for local preview testing)
- **Removed:**
  - No build toolchain needed — pure static web architecture.
