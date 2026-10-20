// Renders the app icon (SVG) to the PNG sizes a PWA needs.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const BG = '#2B5BD7';
const OUT = 'public/icons';

// Concentric "focus" mark. `pad` is the fraction of the canvas kept clear
// around the mark (maskable icons need a larger safe zone).
function iconSvg({ size, pad, rounded }) {
  const c = size / 2;
  const r = size * (0.5 - pad);
  const stroke = r * 0.22;
  const rx = rounded ? size * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="${BG}"/>
  <circle cx="${c}" cy="${c}" r="${r - stroke / 2}" fill="none" stroke="#FFFFFF" stroke-width="${stroke}" stroke-opacity="0.95"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.42}" fill="#FFFFFF"/>
</svg>`;
}

await mkdir(OUT, { recursive: true });

// Vector favicon / source of truth.
await writeFile(`${OUT}/icon.svg`, iconSvg({ size: 512, pad: 0.2, rounded: true }));

const jobs = [
  { file: 'icon-192.png', size: 192, pad: 0.2, rounded: false },
  { file: 'icon-512.png', size: 512, pad: 0.2, rounded: false },
  { file: 'icon-maskable-512.png', size: 512, pad: 0.27, rounded: false },
  { file: 'apple-touch-icon.png', size: 180, pad: 0.2, rounded: false },
];
for (const job of jobs) {
  const svg = Buffer.from(iconSvg(job));
  await sharp(svg).png().toFile(`${OUT}/${job.file}`);
  console.log('wrote', job.file);
}
