/**
 * Genera PNG 192/512 y apple-touch-icon desde public/icon.svg (FE-060).
 * Requiere: npm install -D sharp
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const svg = readFileSync(join(publicDir, "icon.svg"));

const sharp = (await import("sharp")).default;

const sizes = [
  { name: "pwa-192x192.png", size: 192 },
  { name: "pwa-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(join(publicDir, name));
  console.log(`Wrote ${name}`);
}
