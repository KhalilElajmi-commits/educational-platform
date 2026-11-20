import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';

const PROJECT_ROOT = path.resolve('c:/Users/KHALIL/Desktop/master/Nouveau dossier/educational-platform');
const ARTIFACT_DIR = path.resolve('C:/Users/KHALIL/.gemini/antigravity/brain/a6039605-ecd7-422e-8e22-b61d06b33a30');
const PORT = 8297;
const CDP_PORT = 9333;
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

// 1. Static HTTP Server
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

// 2. CDP Client over WebSocket
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

async function run() {
  console.log('=== Starting Chrome Visual Quality & Optimization Verification ===');
  const server = await startServer();

  const tempUserData = path.join(PROJECT_ROOT, '.tmp_chrome_test');
  if (fs.existsSync(tempUserData)) {
    fs.rmSync(tempUserData, { recursive: true, force: true });
  }
  fs.mkdirSync(tempUserData, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tempUserData}`,
    '--window-size=1600,900',
    'about:blank'
  ]);

  // Wait for Chrome to open debugging port
  await new Promise(r => setTimeout(r, 1500));

  // Get WebSocket debugger URL
  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const pages = await listRes.json();
  const page = pages.find(p => p.type === 'page');
  if (!page) throw new Error('No page found in Chrome');

  const cdp = new CDPClient(page.webSocketDebuggerUrl);
  await cdp.connect();
  console.log('Connected to Chrome CDP!');

  await cdp.send('Page.enable');
  await cdp.send('Network.enable');
  await cdp.send('Runtime.enable');

  const networkRequests = [];
  const networkErrors = [];
  const consoleMessages = [];

  cdp.on('Network.responseReceived', (params) => {
    networkRequests.push({
      url: params.response.url,
      status: params.response.status,
      mimeType: params.response.mimeType,
      size: params.response.encodedDataLength
    });
  });

  cdp.on('Network.loadingFailed', (params) => {
    networkErrors.push(params);
  });

  cdp.on('Runtime.consoleAPICalled', (params) => {
    const text = params.args.map(a => a.value).join(' ');
    consoleMessages.push({ type: params.type, text });
  });

  console.log(`Navigating to http://localhost:${PORT}/index.html...`);
  await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/index.html` });

  // Wait for page load
  await new Promise(r => setTimeout(r, 2500));

  // 1. Verify Home Screen
  const homeImages = await cdp.evaluate(`
    Array.from(document.querySelectorAll('img')).map(img => ({
      id: img.id,
      src: img.currentSrc || img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete
    }))
  `);
  console.log(`Home screen images found: ${homeImages.length}`);
  for (const img of homeImages) {
    if (img.src && !img.src.startsWith('data:')) {
      console.log(`  - [${img.id || 'anonymous'}] ${img.src} (${img.naturalWidth}x${img.naturalHeight}, complete: ${img.complete})`);
    }
  }

  const homeScreenshot = path.join(ARTIFACT_DIR, 'verify_optimized_welcome.png');
  await cdp.screenshot(homeScreenshot);

  // 2. Click "Commencer" to reveal map
  console.log('Clicking "Commencer" button...');
  await cdp.evaluate(`
    document.getElementById('btn-commencer').click();
  `);
  await new Promise(r => setTimeout(r, 3000)); // wait for cloud transition & MapSystem.init()

  // Unlock all levels for verification
  await cdp.evaluate(`
    MapSystem.state.unlockedLevel = 10;
    MapSystem.saveProgress();
    MapSystem.updateVisuals();
  `);

  const mapScreenshot = path.join(ARTIFACT_DIR, 'verify_optimized_map.png');
  await cdp.screenshot(mapScreenshot);

  // 3. Test Journey 1 intro popup
  console.log('Opening Journey 1 intro popup...');
  await cdp.evaluate(`MapSystem.handleLevelClick(1);`);
  await new Promise(r => setTimeout(r, 1000));
  const j1PopupInfo = await cdp.evaluate(`
    const img = document.querySelector('#level-popup-overlay img');
    ({ src: img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight })
  `);
  console.log(`Journey 1 popup image:`, j1PopupInfo);
  const j1PopupScreenshot = path.join(ARTIFACT_DIR, 'verify_optimized_j1_popup.png');
  await cdp.screenshot(j1PopupScreenshot);

  // 4. Start Journey 1 Activity 1
  console.log('Starting Journey 1 Activity 1...');
  await cdp.evaluate(`closeLevelPopup(true);`);
  await new Promise(r => setTimeout(r, 1500));

  const j1ActInfo = await cdp.evaluate(`
    (() => {
      const bg = document.getElementById('exercise-bg');
      const cards = Array.from(document.querySelectorAll('#exercise-content-area img')).map(i => ({
        src: i.src,
        naturalWidth: i.naturalWidth,
        naturalHeight: i.naturalHeight
      }));
      return { bgSrc: bg.src, bgWidth: bg.naturalWidth, cards };
    })()
  `);
  console.log(`Journey 1 activity state:`, j1ActInfo);
  const j1ActScreenshot = path.join(ARTIFACT_DIR, 'verify_optimized_j1_activity.png');
  await cdp.screenshot(j1ActScreenshot);

  // 5. Test Journey 7
  console.log('Testing Journey 7...');
  await cdp.evaluate(`
    (() => {
      ExerciseSystem.close();
      MapSystem.handleLevelClick(7);
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));
  await cdp.evaluate(`closeLevelPopup(true);`);
  await new Promise(r => setTimeout(r, 1500));

  const j7Info = await cdp.evaluate(`
    (() => {
      const bg = document.getElementById('exercise-bg');
      return { bgSrc: bg.src, bgWidth: bg.naturalWidth };
    })()
  `);
  console.log(`Journey 7 state:`, j7Info);
  const j7Screenshot = path.join(ARTIFACT_DIR, 'verify_optimized_j7.png');
  await cdp.screenshot(j7Screenshot);

  // 6. Test Journey 8
  console.log('Testing Journey 8...');
  await cdp.evaluate(`
    (() => {
      ExerciseSystem.close();
      MapSystem.handleLevelClick(8);
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));
  await cdp.evaluate(`closeLevelPopup(true);`);
  await new Promise(r => setTimeout(r, 1500));

  const j8Info = await cdp.evaluate(`
    (() => {
      const bg = document.getElementById('exercise-bg');
      return { bgSrc: bg.src, bgWidth: bg.naturalWidth };
    })()
  `);
  console.log(`Journey 8 state:`, j8Info);
  const j8Screenshot = path.join(ARTIFACT_DIR, 'verify_optimized_j8.png');
  await cdp.screenshot(j8Screenshot);

  // 7. Verify Fallback Mechanism
  console.log('Testing Fallback Mechanism with intentionally broken path...');
  const fallbackResult = await cdp.evaluate(`
    new Promise((resolve) => {
      const img = document.createElement('img');
      img.id = 'test-fallback-element';
      document.body.appendChild(img);
      window.setOptimizedImgSrc(img, 'non_existent_fake_asset.png', 'journe 1/valider.png');
      setTimeout(() => {
        resolve({
          finalSrc: img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          success: img.naturalWidth > 0 && img.src.includes('valider.png')
        });
      }, 500);
    })
  `);
  console.log(`Fallback test result:`, fallbackResult);

  // Check network statistics
  const webpRequests = networkRequests.filter(r => r.url.endsWith('.webp') || r.mimeType === 'image/webp');
  const pngRequests = networkRequests.filter(r => r.url.endsWith('.png'));
  console.log(`\nNetwork summary during session:`);
  console.log(`- WebP image requests: ${webpRequests.length}`);
  console.log(`- Original PNG fallback requests: ${pngRequests.length}`);
  console.log(`- Network loading errors: ${networkErrors.length}`);

  cdp.close();
  chromeProc.kill('SIGTERM');
  server.close();

  if (fs.existsSync(tempUserData)) {
    try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
  }

  console.log('\n=== Automated Browser Verification Completed Successfully ===');
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
