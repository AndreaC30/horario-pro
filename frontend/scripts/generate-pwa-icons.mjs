/**
 * Genera favicons e iconos PWA desde public/icon-source.png (WorkShift).
 * Uso: npm run icons
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const sourcePath = join(publicDir, "icon-source.png");

const sharp = (await import("sharp")).default;
const source = readFileSync(sourcePath);

const sizes = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "pwa-192x192.png", size: 192 },
  { name: "pwa-512x512.png", size: 512 },
];

for (const { name, size } of sizes) {
  await sharp(source).resize(size, size, { fit: "cover" }).png().toFile(join(publicDir, name));
  console.log(`Wrote ${name}`);
}

// Maskable: icono con margen seguro (~80% área útil) sobre fondo de marca
const maskableSize = 512;
const inner = Math.round(maskableSize * 0.72);
const offset = Math.round((maskableSize - inner) / 2);
const innerBuf = await sharp(source).resize(inner, inner, { fit: "cover" }).png().toBuffer();
await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: { r: 11, g: 16, b: 32, alpha: 1 },
  },
})
  .composite([{ input: innerBuf, left: offset, top: offset }])
  .png()
  .toFile(join(publicDir, "maskable-512x512.png"));
console.log("Wrote maskable-512x512.png");

// favicon.ico multi-size (16 + 32)
await sharp(source)
  .resize(32, 32, { fit: "cover" })
  .toFile(join(publicDir, "favicon.ico"));
console.log("Wrote favicon.ico");
