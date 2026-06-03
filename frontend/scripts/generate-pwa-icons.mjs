/**
 * Genera favicons e iconos PWA desde public/icon-source.png (WorkShift).
 * Convierte fondo negro del export a transparencia real (PNG alpha).
 * Uso: npm run icons
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const sourcePath = join(publicDir, "icon-source.png");

const BRAND_BG = { r: 11, g: 16, b: 32, alpha: 1 };

const sharp = (await import("sharp")).default;
const source = readFileSync(sourcePath);

/** Export JPEG/PNG sin alpha: negro puro → transparente. */
async function withTransparentBackground(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = Buffer.from(data);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r <= 20 && g <= 20 && b <= 20) {
      pixels[i + 3] = 0;
    }
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();
}

const transparentSource = await withTransparentBackground(source);
const trimmedBuffer = await transparentSource.clone().trim().png().toBuffer();
const trimmedSource = sharp(trimmedBuffer);

async function iconBuffer(innerSize) {
  return trimmedSource
    .clone()
    .resize(innerSize, innerSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

/** Favicon pestaña: fondo transparente, icono grande. */
async function resizeFilledTransparent(size, padding = 0.03) {
  const inner = Math.max(1, Math.round(size * (1 - padding * 2)));
  const iconBuf = await iconBuffer(inner);
  const offset = Math.round((size - inner) / 2);
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: iconBuf, left: offset, top: offset }])
    .png();
}

/** PWA / Apple / Windows: fondo #0B1020 (sin recuadro negro). */
async function resizeFilledOnBrand(size, padding = 0.08) {
  const inner = Math.max(1, Math.round(size * (1 - padding * 2)));
  const iconBuf = await iconBuffer(inner);
  const offset = Math.round((size - inner) / 2);
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: iconBuf, left: offset, top: offset }])
    .png();
}

// Maestro versionado: PNG real con alpha
await transparentSource.clone().toFile(sourcePath);
console.log("Wrote icon-source.png (RGBA, fondo transparente)");

await trimmedSource
  .clone()
  .resize(768, 768, { fit: "inside", withoutEnlargement: true })
  .png()
  .toFile(join(publicDir, "brand-logo.png"));
console.log("Wrote brand-logo.png");

const faviconSizes = [
  { name: "favicon-16x16.png", size: 16, padding: 0.015 },
  { name: "favicon-32x32.png", size: 32, padding: 0.02 },
  { name: "favicon-48x48.png", size: 48, padding: 0.025 },
];

for (const { name, size, padding } of faviconSizes) {
  const icon = await resizeFilledTransparent(size, padding);
  await icon.toFile(join(publicDir, name));
  console.log(`Wrote ${name}`);
}

const installSizes = [
  { name: "apple-touch-icon.png", size: 180, padding: 0.08 },
  { name: "pwa-192x192.png", size: 192, padding: 0.08 },
  { name: "pwa-512x512.png", size: 512, padding: 0.08 },
];

for (const { name, size, padding } of installSizes) {
  const icon = await resizeFilledOnBrand(size, padding);
  await icon.toFile(join(publicDir, name));
  console.log(`Wrote ${name}`);
}

// Android maskable (zona segura ~80 %)
const maskableSize = 512;
const inner = Math.round(maskableSize * 0.76);
const offset = Math.round((maskableSize - inner) / 2);
const innerBuf = await iconBuffer(inner);

await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: BRAND_BG,
  },
})
  .composite([{ input: innerBuf, left: offset, top: offset }])
  .png()
  .toFile(join(publicDir, "maskable-512x512.png"));
console.log("Wrote maskable-512x512.png");

await (await resizeFilledTransparent(32, 0.02)).toFile(join(publicDir, "favicon.ico"));
console.log("Wrote favicon.ico");
