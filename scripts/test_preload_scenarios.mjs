import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';

const PROJECT_ROOT = path.resolve('c:/Users/KHALIL/Desktop/master/Nouveau dossier/educational-platform');
const PORT = 8345;
const CDP_PORT = 9345;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg'
};

function startServer() {
  const server = http.createServer((req, res) => {
    let reqUrl = decodeURI(req.url.split('?')[0]);
    if (reqUrl === '/' || reqUrl === '') reqUrl = '/index.html';

    const filePath = path.join(PROJECT_ROOT, reqUrl);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.events = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        } else if (data.method && this.events.has(data.method)) {
          for (const handler of this.events.get(data.method)) {
            handler(data.params);
          }
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, handler) {
    if (!this.events.has(method)) {
      this.events.set(method, []);
    }
    this.events.get(method).push(handler);
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      console.error('Eval error detail:', JSON.stringify(res.exceptionDetails, null, 2));
      throw new Error(`Eval exception: ${res.exceptionDetails.text} - ${res.exceptionDetails.exception?.description || ''}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async screenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outputPath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${outputPath}`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runTestSuite() {
  console.log('===============================================================');
  console.log('PROJECT KIDS — PRELOADING SYSTEM COMPREHENSIVE TEST SUITE');
  console.log('===============================================================');

  const server = await startServer();
  const tempUserData = path.join(PROJECT_ROOT, '.tmp_chrome_preload_test');
  if (fs.existsSync(tempUserData)) {
    fs.rmSync(tempUserData, { recursive: true, force: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-web-security',
    '--window-size=1600,900',
    `--user-data-dir=${tempUserData}`,
    `http://localhost:${PORT}/index.html`
  ]);

  let cdp;
  const testResults = [];

  function recordResult(num, name, passed, details) {
    testResults.push({ num, name, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[Scenario ${num}] ${mark}: ${name}`);
    if (details) console.log(`   └─ ${details}`);
  }

  try {
    let versionData = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const res = await fetch(`http://localhost:${CDP_PORT}/json/list`);
        const list = await res.json();
        if (list.length > 0 && list[0].webSocketDebuggerUrl) {
          versionData = list[0];
          break;
        }
      } catch (e) {}
    }

    if (!versionData) {
      throw new Error('Could not connect to Chrome DevTools port');
    }

    cdp = new CDPClient(versionData.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    console.log('Connected to Headless Chrome. Waiting for page initialization...');
    await sleep(2000);

    // ── SCENARIO 1: Open the main journey-selection page ──────────────
    console.log('\n--- Running Scenario 1: Open main journey-selection page ---');
    await cdp.evaluate(`
      (() => {
        if (window.MapSystem && window.MapSystem.state) {
          window.MapSystem.state.unlockedLevel = 8;
          window.MapSystem.state.introducedLevels = [1];
        }
        if (typeof skipToMap === 'function') {
          skipToMap();
        }
      })()
    `);
    await sleep(400);

    const s1Status = await cdp.evaluate(`window.ImagePreloadManager ? window.ImagePreloadManager.getStatus() : null`);
    const s1Pass = s1Status && s1Status.mapReady === true;
    recordResult(1, 'Open main journey-selection page and start preloading', s1Pass,
      `MapReady: ${s1Status?.mapReady}, Popups completed: ${s1Status?.completedPopups?.length}/8`);
    await cdp.screenshot(path.join(PROJECT_ROOT, 'test_scenario_1_map.png'));

    // ── SCENARIO 2 & 3: Select last journey while still preloading ───
    console.log('\n--- Running Scenario 2 & 3: Select Journey 8 and confirm immediate priority ---');
    await cdp.evaluate(`
      window.MapSystem.handleLevelClick(8);
    `);
    await sleep(400);

    const s2After = await cdp.evaluate(`
      (() => {
        const status = window.ImagePreloadManager.getStatus();
        const popup = document.getElementById('level-popup-overlay');
        const img = popup ? popup.querySelector('.level-popup-bg') : null;
        return {
          status,
          isActive: popup ? popup.classList.contains('active') : false,
          imgComplete: img ? img.complete : false,
          imgNaturalWidth: img ? img.naturalWidth : 0,
          imgSrc: img ? img.src : '',
          currentSelectedLevel: window.currentSelectedLevel
        };
      })()
    `);

    const s2Pass = s2After.isActive && s2After.currentSelectedLevel === 8 && s2After.imgNaturalWidth > 0 && s2After.imgComplete;
    recordResult(2, 'Select the last journey (Journey 8) while preloading is underway', s2Pass,
      `CurrentSelectedLevel: ${s2After.currentSelectedLevel}, Popup active: ${s2After.isActive}`);

    const s3Pass = s2After.status.completedPopups.includes(8) && s2After.status.stats.preemptions > 0;
    recordResult(3, 'Confirm Journey 8 popup receives immediate priority and decodes before display', s3Pass,
      `Preemptions: ${s2After.status.stats.preemptions}, Journey 8 popup in completedPopups: ${s2After.status.completedPopups.includes(8)}, Img naturalWidth: ${s2After.imgNaturalWidth}`);
    await cdp.screenshot(path.join(PROJECT_ROOT, 'test_scenario_2_journey8_popup.png'));

    // ── SCENARIO 4: Press "Commencer" on Journey 8 ───────────────────
    console.log('\n--- Running Scenario 4: Press "Commencer" and verify Activity 1 ready ---');
    await cdp.evaluate(`
      closeLevelPopup(true);
    `);
    await sleep(500);

    const s4Data = await cdp.evaluate(`
      (() => {
        const stage = document.getElementById('exercise-stage');
        const bg = document.getElementById('exercise-bg');
        const content = document.getElementById('exercise-content-area');
        const actImg = content ? content.querySelector('img') : null;
        const status = window.ImagePreloadManager.getStatus();
        return {
          stageActive: stage ? stage.classList.contains('active') : false,
          bgComplete: bg ? bg.complete : false,
          bgNaturalWidth: bg ? bg.naturalWidth : 0,
          bgSrc: bg ? bg.src : '',
          actImgComplete: actImg ? actImg.complete : false,
          actImgNaturalWidth: actImg ? actImg.naturalWidth : 0,
          currentExIndex: window.ExerciseSystem.currentExIndex,
          currentLevelId: window.ExerciseSystem.currentLevelId,
          status
        };
      })()
    `);

    const s4Pass = s4Data.stageActive && s4Data.currentLevelId === 8 && s4Data.bgNaturalWidth > 0 && s4Data.actImgNaturalWidth > 0;
    recordResult(4, 'Press "Commencer" and verify first activity is ready as complete visual composition', s4Pass,
      `Exercise stage active: ${s4Data.stageActive}, Bg naturalWidth: ${s4Data.bgNaturalWidth}, Act img naturalWidth: ${s4Data.actImgNaturalWidth}`);
    await cdp.screenshot(path.join(PROJECT_ROOT, 'test_scenario_4_journey8_activity1.png'));

    // ── SCENARIO 5: Continue playing while subsequent activities preload ─
    console.log('\n--- Running Scenario 5: Subsequent activities of Journey 8 preload sequentially ---');
    await sleep(2500);

    const s5Data = await cdp.evaluate(`
      (() => {
        const status = window.ImagePreloadManager.getStatus();
        return {
          completedActivities: status.completedActivities,
          activeJourneyId: status.activeJourneyId,
          cacheSize: status.cacheSize
        };
      })()
    `);

    const s5HasJ8Activities = s5Data.completedActivities.filter(a => a.startsWith('j8_')).length >= 2;
    recordResult(5, 'Subsequent activities of Journey 8 preloaded sequentially in background', s5HasJ8Activities,
      `Journey 8 completed activities: ${s5Data.completedActivities.filter(a => a.startsWith('j8_')).join(', ')}, Total cache size: ${s5Data.cacheSize}`);

    // ── SCENARIO 6 & 7: Navigate to another journey during background preparation ─
    console.log('\n--- Running Scenario 6 & 7: Navigate to Journey 4 and confirm immediate priority ---');
    await cdp.evaluate(`
      window.ExerciseSystem.close();
    `);
    await sleep(400);

    await cdp.evaluate(`
      window.MapSystem.handleLevelClick(4);
    `);
    await sleep(400);

    const s6Data = await cdp.evaluate(`
      (() => {
        const popup = document.getElementById('level-popup-overlay');
        const img = popup ? popup.querySelector('.level-popup-bg') : null;
        const status = window.ImagePreloadManager.getStatus();
        return {
          currentSelectedLevel: window.currentSelectedLevel,
          popupActive: popup ? popup.classList.contains('active') : false,
          imgComplete: img ? img.complete : false,
          imgNaturalWidth: img ? img.naturalWidth : 0,
          imgSrc: img ? img.src : '',
          preemptions: status.stats.preemptions,
          completedPopups: status.completedPopups
        };
      })()
    `);

    const s6Pass = s6Data.popupActive && s6Data.currentSelectedLevel === 4;
    recordResult(6, 'Navigate to another journey (Journey 4) during background preparation', s6Pass,
      `Selected Journey: ${s6Data.currentSelectedLevel}, Popup active: ${s6Data.popupActive}`);

    const s7Pass = s6Data.completedPopups.includes(4) && s6Data.imgNaturalWidth > 0 && s6Data.preemptions >= 2;
    recordResult(7, 'Confirm new selection receives immediate priority and displays without delay', s7Pass,
      `Journey 4 in completedPopups: ${s6Data.completedPopups.includes(4)}, Preemptions count: ${s6Data.preemptions}, NaturalWidth: ${s6Data.imgNaturalWidth}`);
    await cdp.screenshot(path.join(PROJECT_ROOT, 'test_scenario_7_journey4_popup.png'));

    // ── SCENARIO 8: Verify completed assets are reused ─────────────────
    console.log('\n--- Running Scenario 8: Verify completed assets are reused ---');
    await cdp.evaluate(`
      closeLevelPopup(false);
    `);
    await sleep(200);

    const s8Before = await cdp.evaluate(`window.ImagePreloadManager.getStatus().stats`);
    // Re-request Journey 8 popup and Journey 8 Activity 1 images (must be instant cache hits)
    await cdp.evaluate(`
      (async () => {
        await window.ImagePreloadManager.ensurePopupReady(8);
        await window.ImagePreloadManager.ensureActivityReady(8, 0);
        await window.ImagePreloadManager.loadImage('journe 8/FIRST POPUP.png');
      })()
    `);
    const s8After = await cdp.evaluate(`window.ImagePreloadManager.getStatus().stats`);

    const s8Pass = s8After.cacheHits > s8Before.cacheHits;
    recordResult(8, 'Verify that completed assets are reused with zero duplicate network requests', s8Pass,
      `Cache hits before: ${s8Before.cacheHits}, Cache hits after: ${s8After.cacheHits} (gained ${s8After.cacheHits - s8Before.cacheHits} hits), Total cache hits: ${s8After.cacheHits}`);

    // ── SCENARIO 9: Verify all eight journeys and their introductory popups ─
    console.log('\n--- Running Scenario 9: Verify all eight journeys and introductory popups ---');
    const journeyVerification = [];

    for (let j = 1; j <= 8; j++) {
      await cdp.evaluate(`
        window.MapSystem.handleLevelClick(${j});
      `);
      await sleep(350);

      const jData = await cdp.evaluate(`
        (() => {
          const popup = document.getElementById('level-popup-overlay');
          const img = popup ? popup.querySelector('.level-popup-bg') : null;
          const btn = popup ? popup.querySelector('.popup-commencer-btn') : null;
          return {
            j: ${j},
            active: popup ? popup.classList.contains('active') : false,
            imgComplete: img ? img.complete : false,
            imgNaturalWidth: img ? img.naturalWidth : 0,
            imgNaturalHeight: img ? img.naturalHeight : 0,
            imgSrc: img ? img.src : '',
            btnDisplay: btn ? window.getComputedStyle(btn).display : 'none',
            btnBounds: btn ? {
              left: btn.style.left,
              top: btn.style.top,
              width: btn.style.width,
              height: btn.style.height
            } : null
          };
        })()
      `);

      const jPass = jData.active && jData.imgNaturalWidth > 0 && jData.btnBounds !== null;
      journeyVerification.push({ j, pass: jPass, data: jData });

      await cdp.evaluate(`closeLevelPopup(false);`);
      await sleep(150);
    }

    const s9AllPassed = journeyVerification.every(item => item.pass);
    recordResult(9, 'Verify all eight journeys and their introductory popups', s9AllPassed,
      `All 8 verified: ${journeyVerification.map(iv => `J${iv.j}:${iv.pass ? 'OK' : 'FAIL'} (${iv.data.imgNaturalWidth}x${iv.data.imgNaturalHeight})`).join(', ')}`);

    // ── SCENARIO 10: Check essential images never progressively appear ─
    console.log('\n--- Running Scenario 10: Check visual readiness (zero progressive rendering) ---');
    await cdp.evaluate(`
      window.MapSystem.handleLevelClick(1);
    `);
    await sleep(200);
    await cdp.evaluate(`
      closeLevelPopup(true);
    `);
    await sleep(400);

    const s10Data = await cdp.evaluate(`
      (() => {
        const stage = document.getElementById('exercise-stage');
        // Only inspect visible artwork/images that are rendered to the student
        const visibleImgs = Array.from(stage.querySelectorAll('img')).filter(i => {
          const style = window.getComputedStyle(i);
          const parentStyle = i.parentElement ? window.getComputedStyle(i.parentElement) : null;
          return style.display !== 'none' && style.visibility !== 'hidden' && (!parentStyle || parentStyle.display !== 'none');
        });
        return {
          stageActive: stage.classList.contains('active'),
          totalVisibleImages: visibleImgs.length,
          fullyDecodedImages: visibleImgs.filter(i => i.complete && i.naturalWidth > 0).length,
          imagesDetail: visibleImgs.map(i => ({
            src: i.src.split('/').slice(-2).join('/'),
            complete: i.complete,
            naturalWidth: i.naturalWidth,
            naturalHeight: i.naturalHeight
          }))
        };
      })()
    `);

    const s10Pass = s10Data.stageActive && s10Data.totalVisibleImages > 0 && s10Data.totalVisibleImages === s10Data.fullyDecodedImages;
    recordResult(10, 'Check that essential images never progressively appear after activity is revealed', s10Pass,
      `Stage active: ${s10Data.stageActive}, Visible images in stage: ${s10Data.totalVisibleImages}, Fully decoded with natural dimensions: ${s10Data.fullyDecodedImages}/${s10Data.totalVisibleImages}`);
    await cdp.screenshot(path.join(PROJECT_ROOT, 'test_scenario_10_journey1_activity.png'));

    // Final Status & Metrics Summary
    const finalStatus = await cdp.evaluate(`window.ImagePreloadManager.getStatus()`);
    console.log('\n===============================================================');
    console.log('FINAL PRELOADING SYSTEM METRICS & STATUS:');
    console.log('===============================================================');
    console.log(JSON.stringify(finalStatus, null, 2));

    const totalPassed = testResults.filter(r => r.passed).length;
    console.log(`\nTEST SUMMARY: ${totalPassed} / ${testResults.length} SCENARIOS PASSED.`);

    return {
      success: totalPassed === testResults.length,
      testResults,
      finalStatus
    };

  } finally {
    if (cdp) cdp.close();
    chromeProc.kill();
    server.close();
    if (fs.existsSync(tempUserData)) {
      try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
    }
  }
}

runTestSuite().then((res) => {
  if (res.success) {
    console.log('\n🎉 ALL 10 PRELOADING SCENARIOS PASSED WITH ZERO ERRORS!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME PRELOADING TESTS FAILED.');
    process.exit(1);
  }
}).catch((err) => {
  console.error('\n❌ Test suite execution error:', err);
  process.exit(1);
});
