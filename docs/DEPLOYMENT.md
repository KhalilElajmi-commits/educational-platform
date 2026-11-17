# Deployment Guide — Vercel & Firebase Setup

This guide details the exact procedure for deploying the **Royaume des Connaissances** educational platform to Vercel and configuring Firebase services for production.

---

## 1. Architecture & Hosting Strategy

The platform is a **pure static Single-Page Application (SPA)**:
- Served directly as static files (HTML, CSS, JS, images, audio).
- No Node.js server runtime, no serverless functions, no SSR required.
- Global CDN caching provided by Vercel Edge Network.
- All dynamic features (Firestore, Gemini AI grading, App Check) communicate directly from the client to Firebase / Google Cloud APIs.

---

## 2. Prerequisites

1. **Vercel Account:** Create a free or team account at [vercel.com](https://vercel.com).
2. **Vercel CLI (optional for CLI deployment):**
   ```bash
   npm install -g vercel
   ```
3. **Firebase Console Access:** Administrative access to the Firebase project:
   - Project ID: `kids-eval` (or your production project ID)
   - Firebase Authentication & Firestore enabled.
   - Firebase App Check & reCAPTCHA Enterprise enabled.
   - Google AI Developer API / Vertex AI enabled for Gemini.

---

## 3. Vercel Configuration (`vercel.json`)

The project contains a pre-configured `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

This configuration ensures:
- Direct static file serving through Vercel's CDN.
- Clean routing with zero build overhead.
- Immediate sub-second deployments.

---

## 4. Deployment Methods

### Option A: Deployment via Git Integration (Recommended)

1. **Push the `educational-platform` directory to GitHub:**
   - Dedicated repository: `https://github.com/KhalilElajmi-commits/educational-platform.git`
   ```bash
   cd educational-platform
   git init
   git add -A
   git commit -m "feat: initial clean Vercel-ready educational platform"
   git branch -M main
   git remote add origin https://github.com/KhalilElajmi-commits/educational-platform.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your Git repository.
   - **Framework Preset:** Select **Other**.
   - **Root Directory:** If the project is in a subfolder, select `educational-platform`; if at repository root, leave as `./`.
   - **Build & Development Settings:**
     - Build Command: Leave empty (or `echo 'static'`).
     - Output Directory: Leave empty (`.` is default).
     - Install Command: Leave empty.
   - Click **Deploy**.

---

### Option B: Deployment via Vercel CLI

1. **Log in to Vercel:**
   ```bash
   vercel login
   ```

2. **Preview Deployment:**
   ```bash
   cd educational-platform
   vercel
   ```
   Follow the prompts:
   - Set up and deploy: **Yes**
   - Which scope: Select your personal or team account
   - Link to existing project: **No**
   - Project name: `educational-platform`
   - Directory: `./`
   - Modify settings: **No**

3. **Production Deployment:**
   ```bash
   vercel --prod
   ```

---

## 5. Critical Firebase Configuration (Required for Production)

Because the application uses Firebase Authentication, Firestore, and Firebase App Check with Gemini AI, you **must authorize your Vercel domains** in Google Cloud / Firebase Console.

### Step 1: Authorize Domain in Firebase Authentication
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (`kids-eval`).
3. Navigate to **Build > Authentication > Settings > Authorized domains**.
4. Click **Add domain**.
5. Add your Vercel domains:
   - `your-app.vercel.app`
   - `*.vercel.app` (if supported)
   - Your custom domain (e.g., `ecole.example.com`).

### Step 2: Configure Firebase App Check & reCAPTCHA Enterprise
1. In Firebase Console, go to **Build > App Check**.
2. Select your Web App.
3. Under **reCAPTCHA Enterprise**:
   - Ensure the site key matches `window.RECAPTCHA_ENTERPRISE_SITE_KEY` in `index.html`.
   - In Google Cloud Console > Security > reCAPTCHA Enterprise, verify your Vercel domain (`your-app.vercel.app`) is in the allowed domain list for that key.
4. **Local Development Note:** `window.configureFirebaseAppCheckEnvironment()` automatically activates a debug token provider when running on `localhost` or `127.0.0.1`. In production, reCAPTCHA Enterprise tokens are generated automatically for users.

### Step 3: Firebase AI Logic (Gemini API) Access
- Ensure the Firebase project is on the **Blaze (pay-as-you-go)** billing plan (required by Firebase AI Logic / Google AI Developer API).
- Ensure the **Google AI Developer API** or **Vertex AI API** is enabled in Google Cloud Console.

---

## 6. Pre-Flight Verification Checklist

Before announcing production release, verify:

- [ ] **Homepage Load:** Map renders with background, clouds, and fennec mascot.
- [ ] **Sound System:** Audio toggle starts background music (`audio/bg_music.mp3`); click sounds respond on button presses.
- [ ] **Journey 1:** First pop-up opens with `journe 1/first pop up`; exercises advance; audio clips play without 404s.
- [ ] **Journey 7:** Crossword activity functions; level completion displays Chott el-Jérid board and unlocks Level 8.
- [ ] **Journey 8 (Gemini AI):** Activity 4 submission successfully calls Gemini and displays structured 9-point rubric feedback.
- [ ] **Teacher Portal:** Clicking the teacher icon prompts password / displays evaluation records from Firestore without permission errors.
- [ ] **Progress Persistence:** Map progress updates in `localStorage` and persists across page reloads.
- [ ] **Console Inspection:** No 404 asset errors, no CORS errors, and no unhandled promise rejections.

---

## 7. Rollback Procedure

If an issue occurs in production:
1. Go to **Vercel Dashboard > Project > Deployments**.
2. Find the previous stable deployment.
3. Click the three dots (`...`) next to it and select **Instant Rollback**.
4. The previous deployment will be instantly promoted to production with zero downtime.
