import { readFile, readdir, rm, copyFile } from 'node:fs/promises'

const resources = JSON.parse(await readFile(new URL('../src/resources/ielts.json', import.meta.url), 'utf8'))
const allowedDictionaries = new Set(resources.map((dict) => dict.url.split('/').at(-1)))
const publicFiles = new Set([
  'index.html',
  'assets',
  'dicts',
  'sounds',
  'manifest.json',
  'robots.txt',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  '_routes.json',
  '_headers',
])

for (const file of await readdir('build')) {
  if (!publicFiles.has(file)) await rm(`build/${file}`, { recursive: true, force: true })
}
for (const file of await readdir('build/dicts')) {
  if (!allowedDictionaries.has(file)) await rm(`build/dicts/${file}`, { recursive: true, force: true })
}

for (const dict of resources) {
  if (!dict.tags.includes('IELTS') || dict.language !== 'en') throw new Error(`Non-IELTS dictionary: ${dict.id}`)
  const words = JSON.parse(await readFile(`build${dict.url}`, 'utf8'))
  if (words.length !== dict.length) throw new Error(`${dict.id}: expected ${dict.length} words, found ${words.length}`)
}
await copyFile('LICENSE', 'build/LICENSE.txt')
console.log(`Deployment contains exactly ${allowedDictionaries.size} IELTS dictionaries.`)
