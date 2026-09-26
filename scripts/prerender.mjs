import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const templatePath = path.join(root, 'dist', 'index.html');
const ssrEntryPath = path.join(root, 'dist-ssr', 'entry-server.js');
const rootMarker = '<div id="root"></div>';

const { render } = await import(pathToFileURL(ssrEntryPath).href);

const appHtml = render();
const template = await readFile(templatePath, 'utf8');

if (!template.includes(rootMarker)) {
  throw new Error(`Prerender failed: "${rootMarker}" not found in dist/index.html`);
}

await writeFile(
  templatePath,
  template.replace(rootMarker, `<div id="root">${appHtml}</div>`),
);

console.log(`Prerendered ${appHtml.length} characters into dist/index.html`);
