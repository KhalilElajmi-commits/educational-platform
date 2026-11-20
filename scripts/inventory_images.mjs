import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const baseDir = 'c:/Users/KHALIL/Desktop/master/Nouveau dossier/educational-platform';

const ignoreDirs = new Set(['node_modules', '.git', 'docs']);
const imageExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

// Read text files to check for image references
const textFiles = [
  'index.html',
  'ambient_life.js',
  'sound_system.js',
  'dev_overlay.js'
];

const fileContents = {};
for (const tf of textFiles) {
  const p = path.join(baseDir, tf);
  if (fs.existsSync(p)) {
    fileContents[tf] = fs.readFileSync(p, 'utf8');
  }
}

function findReferences(relPath) {
  const refs = [];
  const normalizedRel = relPath.replace(/\\/g, '/');
  const baseName = path.basename(relPath);

  for (const [filename, content] of Object.entries(fileContents)) {
    // Check full relative path, or basename, or URL encoded
    const encoded = encodeURI(normalizedRel);
    if (content.includes(normalizedRel) || content.includes(encoded)) {
      refs.push({ file: filename, matchType: 'exact_rel_path' });
    } else if (content.includes(baseName)) {
      refs.push({ file: filename, matchType: 'basename' });
    }
  }
  return refs;
}

function scanDir(dir) {
  let images = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      images = images.concat(scanDir(path.join(dir, entry.name)));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      const isSpecialImage = entry.name === 'first pop up'; // extensionless webp in journe 1
      if (imageExts.has(ext) || isSpecialImage) {
        images.push(path.join(dir, entry.name));
      }
    }
  }
  return images;
}

async function runInventory() {
  const imagePaths = scanDir(baseDir);
  console.log(`Found ${imagePaths.length} candidate image files.`);

  const inventory = [];
  let totalBytes = 0;

  for (const imgPath of imagePaths) {
    const relPath = path.relative(baseDir, imgPath).replace(/\\/g, '/');
    const stat = fs.statSync(imgPath);
    totalBytes += stat.size;

    let meta = {};
    let isImage = true;
    try {
      meta = await sharp(imgPath).metadata();
    } catch (e) {
      console.warn(`Could not read metadata for ${relPath}: ${e.message}`);
      isImage = false;
    }

    const refs = findReferences(relPath);

    inventory.push({
      path: relPath,
      sizeBytes: stat.size,
      sizeMB: (stat.size / (1024 * 1024)).toFixed(3),
      format: meta.format || path.extname(relPath).replace('.', '') || 'unknown',
      width: meta.width || null,
      height: meta.height || null,
      hasAlpha: meta.hasAlpha ?? false,
      channels: meta.channels || null,
      space: meta.space || null,
      references: refs,
      refCount: refs.length
    });
  }

  // Sort by size descending
  inventory.sort((a, b) => b.sizeBytes - a.sizeBytes);

  const report = {
    generatedAt: new Date().toISOString(),
    totalImages: inventory.length,
    totalSizeBytes: totalBytes,
    totalSizeMB: (totalBytes / (1024 * 1024)).toFixed(2),
    images: inventory
  };

  fs.writeFileSync(
    path.join(baseDir, 'docs', 'IMAGE_INVENTORY.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );

  // Also write readable markdown summary
  let md = `# Image Inventory — Initial State\n\n`;
  md += `**Date:** ${report.generatedAt}\n`;
  md += `**Total Images:** ${report.totalImages}\n`;
  md += `**Total Storage:** ${report.totalSizeMB} MB (${report.totalSizeBytes.toLocaleString()} bytes)\n\n`;

  md += `## Top 20 Largest Images\n\n`;
  md += `| # | Path | Format | Dimensions | Size | Alpha | References |\n`;
  md += `|---|---|---|---|---|---|---|\n`;

  inventory.slice(0, 20).forEach((img, i) => {
    md += `| ${i + 1} | \`${img.path}\` | ${img.format} | ${img.width}x${img.height} | ${img.sizeMB} MB | ${img.hasAlpha ? 'Yes' : 'No'} | ${img.refCount} |\n`;
  });

  md += `\n## Format Breakdown\n\n`;
  const formatCounts = {};
  const formatSizes = {};
  inventory.forEach(img => {
    formatCounts[img.format] = (formatCounts[img.format] || 0) + 1;
    formatSizes[img.format] = (formatSizes[img.format] || 0) + img.sizeBytes;
  });

  md += `| Format | Count | Total Size | % of Total |\n`;
  md += `|---|---|---|---|\n`;
  for (const [fmt, cnt] of Object.entries(formatCounts)) {
    const bytes = formatSizes[fmt];
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    const pct = ((bytes / totalBytes) * 100).toFixed(1);
    md += `| ${fmt.toUpperCase()} | ${cnt} | ${mb} MB | ${pct}% |\n`;
  }

  md += `\n## All Scanned Images\n\n`;
  md += `| Path | Format | Dimensions | Size | Has Alpha | Referenced In |\n`;
  md += `|---|---|---|---|---|---|\n`;
  inventory.forEach(img => {
    const refStr = img.references.map(r => r.file).join(', ') || 'Dynamic / Background';
    md += `| \`${img.path}\` | ${img.format} | ${img.width}x${img.height} | ${img.sizeMB} MB | ${img.hasAlpha ? 'Yes' : 'No'} | ${refStr} |\n`;
  });

  fs.writeFileSync(path.join(baseDir, 'docs', 'IMAGE_INVENTORY.md'), md, 'utf8');

  console.log(`Inventory complete! Total images: ${report.totalImages}, Total size: ${report.totalSizeMB} MB`);
}

runInventory().catch(err => {
  console.error(err);
  process.exit(1);
});
