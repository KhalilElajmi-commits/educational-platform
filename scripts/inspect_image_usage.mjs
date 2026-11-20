import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('c:/Users/KHALIL/Desktop/master/Nouveau dossier/educational-platform/index.html', 'utf8');

const imgTags = html.match(/<img[^>]+src=["'][^"']+["'][^>]*>/gi) || [];
console.log('Total static <img> tags in HTML:', imgTags.length);
imgTags.forEach((t, i) => console.log(`  [${i + 1}] ${t}`));

const bgImages = html.match(/url\(['"]?[^'")\s]+\.(png|jpg|webp)['"]?\)/gi) || [];
console.log('\nTotal CSS background-image url():', bgImages.length);
bgImages.forEach(b => console.log(' ', b));

// Look at dynamic image loading helpers or patterns
console.log('\nChecking dynamic image loaders:');
const dynamicPatterns = [
  'document.getElementById(\'exercise-bg\').src',
  'imgEl.src',
  'cardImg.src',
  'JOURNEY_',
  'MapSystem',
  'preload'
];

dynamicPatterns.forEach(p => {
  const count = (html.match(new RegExp(p.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')) || []).length;
  console.log(`  Pattern "${p}": ${count} matches`);
});
