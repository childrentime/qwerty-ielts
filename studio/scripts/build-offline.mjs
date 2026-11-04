import { readdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const assets = (await readdir(new URL('../dist/assets/', import.meta.url))).map((name) => '/assets/' + name)
const revision = createHash('sha256')
  .update(assets.join('|') + (await readFile(new URL('../dist/index.html', import.meta.url))))
  .digest('hex')
  .slice(0, 12)
const paths = ['/', '/index.html', '/favicon.svg', '/manifest.webmanifest', ...assets]
await writeFile(
  new URL('../dist/sw.js', import.meta.url),
  `
const CACHE = ${JSON.stringify('wordloom-' + revision)};
const ASSETS = ${JSON.stringify(paths)};
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('wordloom-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match('/index.html'))));
  } else if (ASSETS.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname)).then(hit => hit || fetch(event.request)));
  }
});
`,
)
console.log(`Offline shell prepared: ${revision}`)
