# Educational Platform — Royaume des Connaissances 🏰🗺️

Interactive French educational web platform for primary school children in Tunisia, exploring knowledge and regions through 8 structured learning journeys.

- **Folder Name:** `educational-platform`
- **GitHub Repository:** [`educational-platform`](https://github.com/KhalilElajmi-commits/educational-platform)
- **Vercel Project Name:** `educational-platform`

---

## 🌟 Features & Content

- **Interactive Map & Cinematic Viewport:** Dynamic Tunisia map navigation with smooth zoom/pan camera (`MapSystem`), organic animated cloud borders, and regional stage reveals.
- **8 Educational Learning Journeys (Journées 1 à 8):**
  - **Journée 1 (Tunis) :** Phonology and sound recognition `[z]`, interactive audio flashcards, syllable matching.
  - **Journée 2 (Dougga) :** Interactive reading comprehension ("Caroline à l'école").
  - **Journée 3 (Kairouan) :** Sound `[k]` discrimination with letters *k* and *q*, illustrated vocabulary.
  - **Journée 4 :** Sentence structure, word order, and logical sequencing.
  - **Journée 5 :** Vocabulary enrichment and expression building.
  - **Journée 6 :** Narrative ordering, chronological connectives, story reconstruction.
  - **Journée 7 (Chott el-Jérid) :** Interactive school crossword puzzle and celebration unlocking Nafta.
  - **Journée 8 (Nafta) :** Full written composition ("J'écris mon texte") with real Gemini AI grading and feedback.
- **Evaluation Level (Niveau 10) :** Formal assessment with student profile registration and Firestore database recording.
- **Audio & Ambient Engine:**
  - Procedural sound effects using Web Audio API synthesis (clicks, fanfare, chimes, fireworks).
  - Background music player with automatic voiceover ducking.
  - 60 FPS ambient canvas animation (birds, desert atmosphere).
- **Security & AI Grading:**
  - Firebase App Check with reCAPTCHA Enterprise.
  - Firebase AI Logic (`@firebase/ai`) powered by `gemini-3.5-flash-lite`.
  - Official 9-point primary school grading rubric (C1: 4.5, C3: 3.0, C6: 1.5).

---

## 🚀 Deployment on Vercel

The platform is a pure static Single-Page Application (SPA) requiring no build step or server runtime.

### Quick Deployment via Vercel CLI:
```bash
# 1. Install Vercel CLI if needed
npm install -g vercel

# 2. Deploy to production
cd educational-platform
vercel --prod
```

### Git-Connected Deployment:
1. Import repository `https://github.com/KhalilElajmi-commits/educational-platform` on [Vercel](https://vercel.com/new).
2. Set Project Name to `educational-platform`.
3. Framework Preset: **Other** | Output Directory: `./`.
4. Click **Deploy**.

---

## 🛠️ Local Development

```bash
# Run local preview server on http://localhost:3000
npm run dev
```

---

## 📚 Technical Documentation

- [`AI_PROJECT_GUIDE.md`](./AI_PROJECT_GUIDE.md): Comprehensive developer and AI agent reference manual.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md): System architecture, subsystem breakdown, and data flow diagrams.
- [`FILE_MAP.md`](./FILE_MAP.md): Searchable index of all assets, directories, and code modules.
- [`DEPLOYMENT.md`](./DEPLOYMENT.md): Detailed Vercel deployment and Firebase domain setup instructions.
- [`CHANGELOG.md`](./CHANGELOG.md): Migration history, cleanup summary, and performance metrics.
