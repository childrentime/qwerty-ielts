import { readFileSync, writeFileSync } from 'node:fs'
const tokens = JSON.parse(readFileSync(new URL('../src/colors.json', import.meta.url)))
let css = '/* Generated from colors.json. Run pnpm colors after editing. */\n'
for (const [mode, selector] of [
  ['light', ':root, [data-theme="light"]'],
  ['dark', ':root[data-theme="dark"], [data-theme="dark"]'],
]) {
  css += `${selector} {\n  color-scheme: ${mode};\n${tokens.map((t) => `  --${t.name}: ${t[mode]};`).join('\n')}\n}\n`
}
writeFileSync(new URL('../src/themes.css', import.meta.url), css)
