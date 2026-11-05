import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const colors = JSON.parse(readFileSync(new URL('../src/colors.json', import.meta.url)))
const byName = Object.fromEntries(colors.map((c) => [c.name, c]))
function luminance(hex) {
  const h = hex.slice(1)
  const full =
    h.length === 3
      ? h
          .split('')
          .map((x) => x + x)
          .join('')
      : h
  const rgb = full
    .match(/../g)
    .slice(0, 3)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
}
test('primary text, controls and answer feedback stay readable in both themes', () => {
  for (const mode of ['light', 'dark'])
    for (const [fg, bg] of [
      ['ink', 'bg'],
      ['ink', 'surface'],
      ['muted', 'surface'],
      ['muted', 'bg'],
      ['on-action', 'action'],
      ['success', 'success-bg'],
      ['error', 'error-bg'],
    ]) {
      const a = luminance(byName[fg][mode]),
        b = luminance(byName[bg][mode])
      assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5, `${mode}: ${fg} on ${bg}`)
    }
})
test('product styles and charts cannot bypass paired theme colors', () => {
  for (const file of ['styles.css', 'refinement.css', 'App.tsx', 'Views.tsx', 'Writing.tsx', 'ui.tsx']) {
    const source = readFileSync(new URL('../src/' + file, import.meta.url), 'utf8')
    assert.equal(/#[0-9a-f]{3,8}\b/i.test(source), false, `${file} has an unpaired color`)
    for (const [, name] of source.matchAll(/var\(--([a-z-]+)\)/g))
      assert.ok(name === 'display-font' || byName[name], `${file}: missing token ${name}`)
  }
  const css = readFileSync(new URL('../src/themes.css', import.meta.url), 'utf8')
  for (const c of colors) {
    assert.match(c.light, /^#[0-9a-f]{3,8}$/)
    assert.match(c.dark, /^#[0-9a-f]{3,8}$/)
    assert.ok(css.includes(`--${c.name}: ${c.dark}`))
  }
})

test('all native captures remain intact RIFF WebP binaries after checkout', async () => {
  const { readdirSync } = await import('node:fs')
  const dir = new URL('../public/native/', import.meta.url)
  const files = readdirSync(dir).filter((f) => f.endsWith('.webp'))
  assert.equal(files.length, 18)
  for (const name of files) {
    const bytes = readFileSync(new URL(name, dir))
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', name)
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', name)
    assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, `${name}: changed binary length`)
  }
})
