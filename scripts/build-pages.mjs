import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const directories = [
  'camo-studio', 'finish-catalogue', 'mix-lab', 'mixing-calculator',
  'pattern-studio', 'space', 'vendor'
];
const rootFiles = [
  '_worker.js', 'index.html', 'apple-touch-icon.png', 'faran-najafi.png',
  'favicon-192.png', 'favicon-32.png', 'favicon-512.png', 'favicon.ico',
  'favicon.svg', 'kleeq-tokens.css', 'robots.txt', 'site.webmanifest'
];
const assetExtensions = new Set(['.html', '.js', '.css', '.json', '.png', '.ico', '.svg', '.jpeg', '.jpg']);
let count = 0;

async function copyFile(path) {
  const target = join(output, path);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(root, path), target);
  count++;
}

async function copyDirectory(path) {
  for (const entry of await readdir(join(root, path), { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const child = join(path, entry.name);
    if (entry.isDirectory()) await copyDirectory(child);
    else if (entry.isFile() && assetExtensions.has(extname(entry.name))) await copyFile(child);
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of rootFiles) await copyFile(path);
for (const path of directories) await copyDirectory(path);
console.log(`Prepared ${count - 1} static assets and the Pages worker in dist/`);
