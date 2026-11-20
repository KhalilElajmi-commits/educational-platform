import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PROJECT_ROOT = path.resolve('c:/Users/KHALIL/Desktop/master/Nouveau dossier/educational-platform');
const INVENTORY_FILE = path.join(PROJECT_ROOT, 'docs', 'IMAGE_INVENTORY.json');
const OPTIMIZED_DIR = path.join(PROJECT_ROOT, 'optimized');

async function run() {
  console.log('--- Starting Automated Image Conversion ---');
  if (!fs.existsSync(OPTIMIZED_DIR)) {
    fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
  }

  const inventoryData = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
  const inventory = inventoryData.images || inventoryData;
  console.log(`Loaded ${inventory.length} images from inventory.`);

  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;
  const results = [];
  const assetMap = {};

  for (let i = 0; i < inventory.length; i++) {
    const item = inventory[i];
    const originalRelPath = item.path;
    const originalFullPath = path.join(PROJECT_ROOT, originalRelPath);

    totalOriginalBytes += item.sizeBytes;

    // Determine target relative path inside optimized/
    // Remove old extension or append .webp
    const parsed = path.parse(originalRelPath);
    const targetSubdir = path.join(OPTIMIZED_DIR, parsed.dir);
    if (!fs.existsSync(targetSubdir)) {
      fs.mkdirSync(targetSubdir, { recursive: true });
    }

    const targetFileName = `${parsed.name}.webp`;
    const targetRelPath = path.posix.join('optimized', parsed.dir.replace(/\\/g, '/'), targetFileName).replace(/\/+/g, '/');
    const targetFullPath = path.join(PROJECT_ROOT, targetRelPath);

    try {
      let pipeline = sharp(originalFullPath);
      const meta = await pipeline.metadata();

      const hasAlpha = item.hasAlpha || meta.hasAlpha || meta.channels === 4;
      const needsResize = (meta.width > 2560 || meta.height > 2560);

      if (needsResize) {
        pipeline = pipeline.resize({
          width: 2560,
          height: 2560,
          fit: 'inside',
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3
        });
      }

      const webpOptions = {
        quality: hasAlpha ? 88 : 85,
        alphaQuality: 95,
        effort: 6,
        lossless: false
      };

      await pipeline.webp(webpOptions).toFile(targetFullPath);

      const optStat = fs.statSync(targetFullPath);
      const optBytes = optStat.size;
      totalOptimizedBytes += optBytes;

      const savingsBytes = item.sizeBytes - optBytes;
      const savingsPct = ((savingsBytes / item.sizeBytes) * 100).toFixed(1);

      results.push({
        path: originalRelPath,
        optimizedPath: targetRelPath,
        originalDimensions: `${meta.width}x${meta.height}`,
        originalBytes: item.sizeBytes,
        optimizedBytes: optBytes,
        savingsBytes,
        savingsPct: parseFloat(savingsPct),
        hasAlpha
      });

      // Register mappings in assetMap (both normalized posix and original format)
      const normKey = originalRelPath.replace(/\\/g, '/');
      assetMap[normKey] = targetRelPath;
      if (normKey.endsWith('.png')) {
        // Also map without extension if referenced loosely
      }

      console.log(`[${i + 1}/${inventory.length}] ${originalRelPath} -> ${targetRelPath} (${(item.sizeBytes / 1024 / 1024).toFixed(2)} MB -> ${(optBytes / 1024 / 1024).toFixed(2)} MB, -${savingsPct}%)`);
    } catch (err) {
      console.error(`Error processing ${originalRelPath}:`, err.message);
    }
  }

  // Generate responsive variants for large main background
  const bgMainPath = path.join(PROJECT_ROOT, 'background_upscayl_2x_ultrasharp-4x.png');
  if (fs.existsSync(bgMainPath)) {
    console.log('\n--- Generating Responsive Variants for Main Background ---');
    const responsiveConfigs = [
      { width: 1920, suffix: '-1920.webp' },
      { width: 1080, suffix: '-1080.webp' }
    ];

    for (const cfg of responsiveConfigs) {
      const outName = `background_upscayl_2x_ultrasharp-4x${cfg.suffix}`;
      const outRel = path.posix.join('optimized', outName);
      const outFull = path.join(PROJECT_ROOT, outRel);

      await sharp(bgMainPath)
        .resize({ width: cfg.width, fit: 'inside', withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
        .webp({ quality: 85, effort: 6 })
        .toFile(outFull);

      const st = fs.statSync(outFull);
      console.log(`Generated responsive variant: ${outRel} (${cfg.width}w, ${(st.size / 1024).toFixed(1)} KB)`);
    }
  }

  // Save asset map and conversion stats
  fs.writeFileSync(
    path.join(OPTIMIZED_DIR, 'asset_manifest.json'),
    JSON.stringify(assetMap, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(PROJECT_ROOT, 'docs', 'OPTIMIZATION_RESULTS.json'),
    JSON.stringify({
      totalImages: inventory.length,
      totalOriginalBytes,
      totalOptimizedBytes,
      totalSavingsBytes: totalOriginalBytes - totalOptimizedBytes,
      totalSavingsPct: (((totalOriginalBytes - totalOptimizedBytes) / totalOriginalBytes) * 100).toFixed(2),
      results
    }, null, 2),
    'utf8'
  );

  const totalOrigMB = (totalOriginalBytes / 1024 / 1024).toFixed(2);
  const totalOptMB = (totalOptimizedBytes / 1024 / 1024).toFixed(2);
  const totalSavMB = ((totalOriginalBytes - totalOptimizedBytes) / 1024 / 1024).toFixed(2);
  const totalSavPct = (((totalOriginalBytes - totalOptimizedBytes) / totalOriginalBytes) * 100).toFixed(1);

  console.log('\n=============================================');
  console.log(`TOTAL IMAGES PROCESSED: ${inventory.length}`);
  console.log(`ORIGINAL TOTAL SIZE   : ${totalOrigMB} MB (${totalOriginalBytes} bytes)`);
  console.log(`OPTIMIZED TOTAL SIZE  : ${totalOptMB} MB (${totalOptimizedBytes} bytes)`);
  console.log(`TOTAL SPACE SAVINGS   : ${totalSavMB} MB (-${totalSavPct}%)`);
  console.log('=============================================\n');
}

run().catch(err => {
  console.error('Fatal conversion error:', err);
  process.exit(1);
});
