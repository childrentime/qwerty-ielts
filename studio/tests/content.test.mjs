import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/data.ts', import.meta.url), 'utf8')
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { words, prompts, topics } = await import('data:text/javascript;base64,' + Buffer.from(output).toString('base64'))

test('every writing word-bank target resolves to a real vocabulary card', () => {
  const ids = new Set(words.map((word) => word.id))
  for (const prompt of prompts) {
    assert.ok(prompt.reference.trim(), `Missing reference: ${prompt.id}`)
    for (const target of prompt.targets) assert.ok(ids.has(target), `${prompt.id} references unknown word ${target}`)
  }
})
test('experience vocabulary has unique IDs, complete content and valid topics', () => {
  assert.equal(new Set(words.map((word) => word.id)).size, words.length)
  for (const word of words) {
    assert.ok(topics.includes(word.topic))
    assert.ok(word.meaning && word.phonetic && word.phrase && word.example && word.translation)
  }
})
