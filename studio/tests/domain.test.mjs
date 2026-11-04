import test from 'node:test'
import assert from 'node:assert/strict'
import { countWords, checkWriting, sameDay, validateBackup } from '../src/domain.mjs'

test('word count handles contractions, hyphens and punctuation', () => {
  assert.equal(countWords("It's a long-term goal. 中文不计入英文词数。"), 4)
  assert.equal(countWords(''), 0)
})
test('checks only concrete supported patterns and preserves unrelated text', () => {
  const result = checkWriting(
    'Governments should to invest for alleviate congestion. This can brings many benefit.',
    'sentence',
    ['alleviate', 'sustainable'],
  )
  assert.equal(result.issues.length, 4)
  assert.equal(result.corrected, 'Governments should invest to alleviate congestion. This can bring many benefits.')
  assert.deepEqual(result.used, ['alleviate'])
  assert.equal(checkWriting('This is a different sentence.', 'task2').issues.length, 0)
})
test('target matching does not confuse a word with a substring', () => {
  assert.deepEqual(
    checkWriting('A critical issue affects people.', 'sentence', ['critic', 'critical', 'affect']).used,
    ['critical', 'affect'],
  )
})
test('task word targets follow each exercise type', () => {
  assert.equal(checkWriting('', 'task1').minimum, 150)
  assert.equal(checkWriting('', 'task2').minimum, 250)
  assert.equal(checkWriting('', 'sentence').minimum, 0)
})
test('backup importer rejects malformed records before replacing local state', () => {
  const valid = {
    version: 1,
    seen: { word: { firstSeen: 1, lastSeen: 2, count: 1 } },
    reviewed: {},
    saved: [],
    sessions: [],
    drafts: {},
    writingHistory: [],
    settings: { goal: 20, target: '7.0', theme: 'light', accent: 'en-GB', autoAudio: false },
  }
  assert.equal(validateBackup(valid, ['word']), valid)
  assert.throws(() =>
    validateBackup({ ...valid, seen: { unknown: { firstSeen: 1, lastSeen: 2, count: 1 } } }, ['word']),
  )
  assert.throws(() => validateBackup({ ...valid, settings: { ...valid.settings, goal: -1 } }, ['word']))
  assert.throws(() => validateBackup({ ...valid, writingHistory: [{ text: 'incomplete' }] }, ['word']))
  assert.throws(() => validateBackup({ ...valid, version: 2 }, ['word']))
})
test('local calendar day comparison', () => {
  assert.equal(sameDay(new Date(2026, 1, 2, 8).getTime(), new Date(2026, 1, 2, 21).getTime()), true)
  assert.equal(sameDay(new Date(2026, 1, 1, 23).getTime(), new Date(2026, 1, 2, 1).getTime()), false)
})
