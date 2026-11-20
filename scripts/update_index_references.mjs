import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve('c:/Users/KHALIL/Desktop/master/Nouveau dossier/educational-platform');
const INDEX_HTML_PATH = path.join(PROJECT_ROOT, 'index.html');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'optimized', 'asset_manifest.json');

function run() {
  console.log('--- Updating References in index.html ---');
  let html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  // Backup original index.html first
  fs.writeFileSync(path.join(PROJECT_ROOT, 'index.html.bak'), html, 'utf8');

  // 1. Add Preload links in <head>
  const preloadTags = `  <!-- Preload Critical Above-The-Fold Assets -->
  <link rel="preload" as="image" href="optimized/background_upscayl_2x_ultrasharp-4x.webp" type="image/webp" />
  <link rel="preload" as="image" href="optimized/logofr.webp" type="image/webp" />
`;
  if (!html.includes('<!-- Preload Critical Above-The-Fold Assets -->')) {
    html = html.replace('  <!-- Premium Friendly & Smooth French Educational Typography -->', preloadTags + '\n  <!-- Premium Friendly & Smooth French Educational Typography -->');
  }

  // 2. Add Asset Optimization Helper Script before the Firebase script
  const helperScript = `  <!-- Automated High-Performance WebP Asset Registry with Instant Fallback -->
  <script>
    window.OPTIMIZED_ASSET_MAP = ${JSON.stringify(manifest, null, 2)};
    window.getOptimizedAsset = function(src) {
      if (!src || typeof src !== 'string') return src;
      const clean = src.split('?')[0].trim();
      return (window.OPTIMIZED_ASSET_MAP && window.OPTIMIZED_ASSET_MAP[clean]) || src;
    };
    window.setOptimizedImgSrc = function(imgEl, src, fallbackSrc) {
      if (!imgEl) return;
      const fallback = fallbackSrc || src;
      const opt = window.getOptimizedAsset(src);
      imgEl.onerror = function() {
        imgEl.onerror = null;
        if (imgEl.src !== fallback) {
          imgEl.src = fallback;
        }
      };
      imgEl.src = opt;
    };
  </script>
`;
  if (!html.includes('window.OPTIMIZED_ASSET_MAP')) {
    html = html.replace('  <!-- Firebase Compat SDK, App Check & Firestore Service -->', helperScript + '\n  <!-- Firebase Compat SDK, App Check & Firestore Service -->');
  }

  // 3. Update Static <img> tags

  // 3.1 #initial-bg
  html = html.replace(
    '<img id="initial-bg" src="background_upscayl_2x_ultrasharp-4x.png" alt="Royaume des Connaissances" draggable="false" />',
    `<img id="initial-bg"
      srcset="optimized/background_upscayl_2x_ultrasharp-4x-1080.webp 1080w, optimized/background_upscayl_2x_ultrasharp-4x-1920.webp 1920w, optimized/background_upscayl_2x_ultrasharp-4x.webp 2560w"
      sizes="100vw"
      src="optimized/background_upscayl_2x_ultrasharp-4x.webp"
      onerror="this.onerror=null;this.src='background_upscayl_2x_ultrasharp-4x.png';"
      loading="eager"
      fetchpriority="high"
      decoding="async"
      alt="Royaume des Connaissances"
      draggable="false" />`
  );

  // 3.2 #bg-map
  html = html.replace(
    `<img id="bg-map" src="background_upscayl_2x_ultrasharp-4x.png" alt="Royaume des Connaissances"
          draggable="false" />`,
    `<img id="bg-map"
          srcset="optimized/background_upscayl_2x_ultrasharp-4x-1080.webp 1080w, optimized/background_upscayl_2x_ultrasharp-4x-1920.webp 1920w, optimized/background_upscayl_2x_ultrasharp-4x.webp 2560w"
          sizes="100vw"
          src="optimized/background_upscayl_2x_ultrasharp-4x.webp"
          onerror="this.onerror=null;this.src='background_upscayl_2x_ultrasharp-4x.png';"
          loading="eager"
          decoding="async"
          alt="Royaume des Connaissances"
          draggable="false" />`
  );

  // 3.3 Static clouds
  html = html.replace(
    '<img class="cloud-img pure-edge f-v1" src="cloud_pure_tl.png" alt="" draggable="false" />',
    '<img class="cloud-img pure-edge f-v1" src="optimized/cloud_pure_tl.webp" onerror="this.onerror=null;this.src=\'cloud_pure_tl.png\';" loading="lazy" decoding="async" alt="" draggable="false" />'
  );
  html = html.replace(
    '<img class="cloud-img pure-edge f-h1" src="cloud_pure_bl.png" alt="" draggable="false" />',
    '<img class="cloud-img pure-edge f-h1" src="optimized/cloud_pure_bl.webp" onerror="this.onerror=null;this.src=\'cloud_pure_bl.png\';" loading="lazy" decoding="async" alt="" draggable="false" />'
  );
  html = html.replace(
    '<img class="cloud-img pure-edge f-v2" src="cloud_pure_bl.png" alt="" draggable="false" />',
    '<img class="cloud-img pure-edge f-v2" src="optimized/cloud_pure_bl.webp" onerror="this.onerror=null;this.src=\'cloud_pure_bl.png\';" loading="lazy" decoding="async" alt="" draggable="false" />'
  );
  html = html.replace(
    '<img class="cloud-img pure-edge f-h2" src="cloud_pure_tl.png" alt="" draggable="false" />',
    '<img class="cloud-img pure-edge f-h2" src="optimized/cloud_pure_tl.webp" onerror="this.onerror=null;this.src=\'cloud_pure_tl.png\';" loading="lazy" decoding="async" alt="" draggable="false" />'
  );
  html = html.replace(
    '<img class="cloud-img pure-edge f-v2" src="cloud_pure_tr.png" alt="" draggable="false" />',
    '<img class="cloud-img pure-edge f-v2" src="optimized/cloud_pure_tr.webp" onerror="this.onerror=null;this.src=\'cloud_pure_tr.png\';" loading="lazy" decoding="async" alt="" draggable="false" />'
  );
  html = html.replace(
    '<img class="cloud-img pure-edge f-h2" src="cloud_pure_br.png" alt="" draggable="false" />',
    '<img class="cloud-img pure-edge f-h2" src="optimized/cloud_pure_br.webp" onerror="this.onerror=null;this.src=\'cloud_pure_br.png\';" loading="lazy" decoding="async" alt="" draggable="false" />'
  );
  html = html.replace(
    '<img class="cloud-img pure-edge f-v1" src="cloud_pure_br.png" alt="" draggable="false" />',
    '<img class="cloud-img pure-edge f-v1" src="optimized/cloud_pure_br.webp" onerror="this.onerror=null;this.src=\'cloud_pure_br.png\';" loading="lazy" decoding="async" alt="" draggable="false" />'
  );
  html = html.replace(
    '<img class="cloud-img pure-edge f-h1" src="cloud_pure_tr.png" alt="" draggable="false" />',
    '<img class="cloud-img pure-edge f-h1" src="optimized/cloud_pure_tr.webp" onerror="this.onerror=null;this.src=\'cloud_pure_tr.png\';" loading="lazy" decoding="async" alt="" draggable="false" />'
  );
  html = html.replace(
    '<img class="cloud-img pure-edge f-v1" src="clean_clouds/cloud_top_fluffy.png" alt="" draggable="false" />',
    '<img class="cloud-img pure-edge f-v1" src="optimized/clean_clouds/cloud_top_fluffy.webp" onerror="this.onerror=null;this.src=\'clean_clouds/cloud_top_fluffy.png\';" loading="lazy" decoding="async" alt="" draggable="false" />'
  );
  html = html.replace(
    '<img class="cloud-img pure-edge f-v2" src="clean_clouds/cloud_c_32_x360_y608.png" alt="" draggable="false" />',
    '<img class="cloud-img pure-edge f-v2" src="optimized/clean_clouds/cloud_c_32_x360_y608.webp" onerror="this.onerror=null;this.src=\'clean_clouds/cloud_c_32_x360_y608.png\';" loading="lazy" decoding="async" alt="" draggable="false" />'
  );

  // 3.4 Logo
  html = html.replace(
    '<img id="logo-img" src="logofr.png" alt="Royaume des Connaissances" draggable="false" />',
    '<img id="logo-img" src="optimized/logofr.webp" onerror="this.onerror=null;this.src=\'logofr.png\';" loading="eager" decoding="async" alt="Royaume des Connaissances" draggable="false" />'
  );

  // 3.5 Skip Intro button
  html = html.replace(
    '<img src="journe 1/skip botten.png" alt="Passer" draggable="false" />',
    '<img src="optimized/journe 1/skip botten.webp" onerror="this.onerror=null;this.src=\'journe 1/skip botten.png\';" loading="lazy" decoding="async" alt="Passer" draggable="false" />'
  );

  // 3.6 Teacher Portal button
  html = html.replace(
    '<img src="evalution/botten tet.png" alt="Espace Enseignant" draggable="false" />',
    '<img src="optimized/evalution/botten tet.webp" onerror="this.onerror=null;this.src=\'evalution/botten tet.png\';" loading="lazy" decoding="async" alt="Espace Enseignant" draggable="false" />'
  );

  // 3.7 Validation button in footer
  html = html.replace(
    '<img id="btn-check-answer" src="journe 1/valider.png" alt="Valider" onclick="ExerciseSystem.checkAnswer()" />',
    '<img id="btn-check-answer" src="optimized/journe 1/valider.webp" onerror="this.onerror=null;this.src=\'journe 1/valider.png\';" loading="lazy" decoding="async" alt="Valider" onclick="ExerciseSystem.checkAnswer()" />'
  );

  // 3.8 Level popup bg
  html = html.replace(
    '<img src="exercice pop up.png" class="level-popup-bg" alt="" draggable="false" />',
    '<img src="optimized/exercice pop up.webp" onerror="this.onerror=null;this.src=\'exercice pop up.png\';" loading="lazy" decoding="async" class="level-popup-bg" alt="" draggable="false" />'
  );

  // 3.9 Teacher Dashboard bg
  html = html.replace(
    `<img id="td-bg-img" src="evalution/tet dachbored.png?v=1670" alt="Espace Enseignant" draggable="false" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;user-select:none;pointer-events:none;filter:drop-shadow(0 20px 45px rgba(0,0,0,0.65));" />`,
    `<img id="td-bg-img" src="optimized/evalution/tet dachbored.webp" onerror="this.onerror=null;this.src='evalution/tet dachbored.png?v=1670';" loading="lazy" decoding="async" alt="Espace Enseignant" draggable="false" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;user-select:none;pointer-events:none;filter:drop-shadow(0 20px 45px rgba(0,0,0,0.65));" />`
  );

  // 4. MapSystem SVG Layer images (lines 5130-5131)
  html = html.replace(
    `            img.setAttribute("href", \`map_assets_full/\${level.name}.png\`);
            img.setAttributeNS("http://www.w3.org/1999/xlink", "href", \`map_assets_full/\${level.name}.png\`);`,
    `            const layerPng = \`map_assets_full/\${level.name}.png\`;
            const layerOpt = window.getOptimizedAsset(layerPng);
            img.setAttribute("href", layerOpt);
            img.setAttributeNS("http://www.w3.org/1999/xlink", "href", layerOpt);`
  );

  // 5. Tutorial Fneck Scene Guide image
  html = html.replace(
    `      fneckImg.src = scene.asset;`,
    `      window.setOptimizedImgSrc(fneckImg, scene.asset);`
  );

  // 6. Level Intro Popups (openLevelIntroPopup)
  const oldPopupsBlock = `        if (levelId === 1 || levelId === 2 || levelId === 3 || levelId === 4 || levelId === 5 || levelId === 6 || levelId === 7 || levelId === 8 || levelId === 10) {
          if (levelId === 1) {
            imgEl.src = 'journe 1/first pop up';
            imgEl.onerror = () => { imgEl.src = 'journe 1/first pop up.png'; };
          } else if (levelId === 2) {
            imgEl.src = 'journe 2/pop for journe 2.png';
          } else if (levelId === 3) {
            imgEl.src = 'JOURNE 3/pop for jouene 3.png';
          } else if (levelId === 4) {
            imgEl.src = 'journe 4/popup of journe 4.png';
          } else if (levelId === 5) {
            imgEl.src = 'journe 5/first popup.png';
          } else if (levelId === 6) {
            imgEl.src = 'journe 6/first popup.png';
          } else if (levelId === 7) {
            imgEl.src = 'journe 7/first pop up.png';
          } else if (levelId === 8) {
            imgEl.src = 'journe 8/FIRST POPUP.png';
          } else if (levelId === 10) {
            imgEl.src = 'evalution/pop up evalution.png';
          }`;

  const newPopupsBlock = `        if (levelId === 1 || levelId === 2 || levelId === 3 || levelId === 4 || levelId === 5 || levelId === 6 || levelId === 7 || levelId === 8 || levelId === 10) {
          if (levelId === 1) {
            window.setOptimizedImgSrc(imgEl, 'journe 1/first pop up', 'journe 1/first pop up.png');
          } else if (levelId === 2) {
            window.setOptimizedImgSrc(imgEl, 'journe 2/pop for journe 2.png');
          } else if (levelId === 3) {
            window.setOptimizedImgSrc(imgEl, 'JOURNE 3/pop for jouene 3.png');
          } else if (levelId === 4) {
            window.setOptimizedImgSrc(imgEl, 'journe 4/popup of journe 4.png');
          } else if (levelId === 5) {
            window.setOptimizedImgSrc(imgEl, 'journe 5/first popup.png');
          } else if (levelId === 6) {
            window.setOptimizedImgSrc(imgEl, 'journe 6/first popup.png');
          } else if (levelId === 7) {
            window.setOptimizedImgSrc(imgEl, 'journe 7/first pop up.png');
          } else if (levelId === 8) {
            window.setOptimizedImgSrc(imgEl, 'journe 8/FIRST POPUP.png');
          } else if (levelId === 10) {
            window.setOptimizedImgSrc(imgEl, 'evalution/pop up evalution.png');
          }`;

  html = html.replace(oldPopupsBlock, newPopupsBlock);

  // 7. Exercise backgrounds in startLevel
  const bgReplacements = [
    {
      target: "document.getElementById('exercise-bg').src = 'journe 1/backbround of journe 1.png';",
      replacement: "window.setOptimizedImgSrc(document.getElementById('exercise-bg'), 'journe 1/backbround of journe 1.png');"
    },
    {
      target: "document.getElementById('exercise-bg').src = 'journe 2/background journe 2_upscayl_2x_upscayl-standard-4x.png';",
      replacement: "window.setOptimizedImgSrc(document.getElementById('exercise-bg'), 'journe 2/background journe 2_upscayl_2x_upscayl-standard-4x.png');"
    },
    {
      target: "document.getElementById('exercise-bg').src = 'JOURNE 3/BACKGROUND JOURNE 3_upscayl_2x_upscayl-standard-4x.png';",
      replacement: "window.setOptimizedImgSrc(document.getElementById('exercise-bg'), 'JOURNE 3/BACKGROUND JOURNE 3_upscayl_2x_upscayl-standard-4x.png');"
    },
    {
      target: "document.getElementById('exercise-bg').src = 'journe 4/background journe 4_upscayl_2x_upscayl-standard-4x.png';",
      replacement: "window.setOptimizedImgSrc(document.getElementById('exercise-bg'), 'journe 4/background journe 4_upscayl_2x_upscayl-standard-4x.png');"
    },
    {
      target: "document.getElementById('exercise-bg').src = 'journe 5/6d654db3-5144-4e84-89a8-d4c21ae26d3e_upscayl_2x_upscayl-standard-4x.png';",
      replacement: "window.setOptimizedImgSrc(document.getElementById('exercise-bg'), 'journe 5/6d654db3-5144-4e84-89a8-d4c21ae26d3e_upscayl_2x_upscayl-standard-4x.png');"
    },
    {
      target: "document.getElementById('exercise-bg').src = 'journe 6/background  journe 6_upscayl_2x_upscayl-standard-4x.png';",
      replacement: "window.setOptimizedImgSrc(document.getElementById('exercise-bg'), 'journe 6/background  journe 6_upscayl_2x_upscayl-standard-4x.png');"
    },
    {
      target: "document.getElementById('exercise-bg').src = 'journe 7/background.png';",
      replacement: "window.setOptimizedImgSrc(document.getElementById('exercise-bg'), 'journe 7/background.png');"
    },
    {
      target: "document.getElementById('exercise-bg').src = 'journe 8/BACKGROUND.png';",
      replacement: "window.setOptimizedImgSrc(document.getElementById('exercise-bg'), 'journe 8/BACKGROUND.png');"
    },
    {
      target: "document.getElementById('exercise-bg').src = 'evalution/back ground.png';",
      replacement: "window.setOptimizedImgSrc(document.getElementById('exercise-bg'), 'evalution/back ground.png');"
    },
    {
      target: "document.getElementById('exercise-bg').src = ex.bg;",
      replacement: "window.setOptimizedImgSrc(document.getElementById('exercise-bg'), ex.bg);"
    }
  ];

  for (const item of bgReplacements) {
    if (html.includes(item.target)) {
      html = html.replace(item.target, item.replacement);
      console.log(`Updated exercise-bg setter: ${item.target.substring(0, 50)}...`);
    } else {
      console.warn(`Target not found for exercise-bg: ${item.target}`);
    }
  }

  // 8. Replace dynamic activity image setters:
  // "bgImg.src = activity.src;" -> "window.setOptimizedImgSrc(bgImg, activity.src);"
  let countBgImg = 0;
  html = html.replace(/bgImg\.src\s*=\s*activity\.src;/g, () => {
    countBgImg++;
    return 'window.setOptimizedImgSrc(bgImg, activity.src);';
  });
  console.log(`Replaced bgImg.src = activity.src (${countBgImg} occurrences)`);

  // "img.src = activity.src;" -> "window.setOptimizedImgSrc(img, activity.src);"
  let countImgAct = 0;
  html = html.replace(/img\.src\s*=\s*activity\.src;/g, () => {
    countImgAct++;
    return 'window.setOptimizedImgSrc(img, activity.src);';
  });
  console.log(`Replaced img.src = activity.src (${countImgAct} occurrences)`);

  // "cardImg.src = chosenSrc;" -> "window.setOptimizedImgSrc(cardImg, chosenSrc);"
  let countCardChosen = 0;
  html = html.replace(/cardImg\.src\s*=\s*chosenSrc;/g, () => {
    countCardChosen++;
    return 'window.setOptimizedImgSrc(cardImg, chosenSrc);';
  });
  console.log(`Replaced cardImg.src = chosenSrc (${countCardChosen} occurrences)`);

  // Button setters:
  // "vbtn.src = 'journe 1/valider.png';" -> "window.setOptimizedImgSrc(vbtn, 'journe 1/valider.png');"
  let countValBtn = 0;
  html = html.replace(/vbtn\.src\s*=\s*'journe 1\/valider\.png';/g, () => {
    countValBtn++;
    return "window.setOptimizedImgSrc(vbtn, 'journe 1/valider.png');";
  });
  html = html.replace(/valBtn\.src\s*=\s*'journe 1\/valider\.png';/g, () => {
    countValBtn++;
    return "window.setOptimizedImgSrc(valBtn, 'journe 1/valider.png');";
  });
  console.log(`Replaced valider button setters (${countValBtn} occurrences)`);

  // "vbtn.src = 'journe 1/continuer.png';" -> "window.setOptimizedImgSrc(vbtn, 'journe 1/continuer.png');"
  let countContBtn = 0;
  html = html.replace(/vbtn\.src\s*=\s*'journe 1\/continuer\.png';/g, () => {
    countContBtn++;
    return "window.setOptimizedImgSrc(vbtn, 'journe 1/continuer.png');";
  });
  html = html.replace(/valBtn\.src\s*=\s*'journe 1\/continuer\.png';/g, () => {
    countContBtn++;
    return "window.setOptimizedImgSrc(valBtn, 'journe 1/continuer.png');";
  });
  html = html.replace(/btn\.src\s*=\s*'journe 1\/continuer\.png';/g, () => {
    countContBtn++;
    return "window.setOptimizedImgSrc(btn, 'journe 1/continuer.png');";
  });
  html = html.replace(/btnImg\.src\s*=\s*'journe 1\/continuer\.png';/g, () => {
    countContBtn++;
    return "window.setOptimizedImgSrc(btnImg, 'journe 1/continuer.png');";
  });
  html = html.replace(/btnImg8\.src\s*=\s*'journe 1\/continuer\.png';/g, () => {
    countContBtn++;
    return "window.setOptimizedImgSrc(btnImg8, 'journe 1/continuer.png');";
  });
  console.log(`Replaced continuer button setters (${countContBtn} occurrences)`);

  // Nav buttons:
  // "btnBack.src = 'journe 1/back botten.png';"
  let countBackBtn = 0;
  html = html.replace(/btnBack\.src\s*=\s*'journe 1\/back botten\.png';/g, () => {
    countBackBtn++;
    return "window.setOptimizedImgSrc(btnBack, 'journe 1/back botten.png');";
  });
  console.log(`Replaced btnBack setters (${countBackBtn} occurrences)`);

  // "btnHome.src = 'journe 1/home botten.png';"
  let countHomeBtn = 0;
  html = html.replace(/btnHome\.src\s*=\s*'journe 1\/home botten\.png';/g, () => {
    countHomeBtn++;
    return "window.setOptimizedImgSrc(btnHome, 'journe 1/home botten.png');";
  });
  console.log(`Replaced btnHome setters (${countHomeBtn} occurrences)`);

  // End card popups:
  const cardReplacements = [
    { target: "cardImg.src = 'evalution/espace.png';", replacement: "window.setOptimizedImgSrc(cardImg, 'evalution/espace.png');" },
    { target: "cardImg.src = 'journe 6/popup end.png';", replacement: "window.setOptimizedImgSrc(cardImg, 'journe 6/popup end.png');" },
    { target: "cardImg.src = 'journe 7/end pop up.png';", replacement: "window.setOptimizedImgSrc(cardImg, 'journe 7/end pop up.png');" },
    { target: "cardImg.src = 'journe 8/last popup.png';", replacement: "window.setOptimizedImgSrc(cardImg, 'journe 8/last popup.png');" },
    { target: "cardImg.src = 'journe 1/end journe 1.png';", replacement: "window.setOptimizedImgSrc(cardImg, 'journe 1/end journe 1.png');" },
    { target: "cardImg.src = 'journe 2/end journe 2.png';", replacement: "window.setOptimizedImgSrc(cardImg, 'journe 2/end journe 2.png');" },
    { target: "cardImg.src = 'JOURNE 3/end journe 3.png';", replacement: "window.setOptimizedImgSrc(cardImg, 'JOURNE 3/end journe 3.png');" },
    { target: "cardImg.src = 'journe 4/end pop up.png';", replacement: "window.setOptimizedImgSrc(cardImg, 'journe 4/end pop up.png');" },
    { target: "cardImg.src = 'journe 5/end popup.png';", replacement: "window.setOptimizedImgSrc(cardImg, 'journe 5/end popup.png');" },
    { target: "cardImg.src = 'evalution/pop up end.png';", replacement: "window.setOptimizedImgSrc(cardImg, 'evalution/pop up end.png');" }
  ];
  for (const item of cardReplacements) {
    if (html.includes(item.target)) {
      html = html.replace(new RegExp(item.target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), item.replacement);
      console.log(`Updated cardImg popup setter: ${item.target}`);
    } else {
      console.warn(`Card popup target not found: ${item.target}`);
    }
  }

  // Write updated index.html
  fs.writeFileSync(INDEX_HTML_PATH, html, 'utf8');
  console.log('Successfully updated index.html with optimized asset references and fallbacks!');
}

run();
