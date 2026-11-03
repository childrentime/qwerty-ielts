import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { afterEach, beforeEach, test } from 'node:test'

// Import the Pages Function without changing the upstream application's module format.
const source = await readFile(new URL('../functions/api/audio.js', import.meta.url), 'utf8')
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const originalFetch = globalThis.fetch
const originalCaches = globalThis.caches
let pending
let entries
let requests

beforeEach(() => {
  pending = []
  entries = new Map()
  requests = []
  globalThis.caches = {
    default: {
      match: async (key) => entries.get(key.url)?.clone(),
      put: async (key, response) => {
        entries.set(key.url, response)
      },
    },
  }
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options })
    return new Response(new Uint8Array([0x49, 0x44, 0x33]), {
      headers: { 'Content-Type': 'audio/mpeg', 'Set-Cookie': 'upstream=private' },
    })
  }
})
afterEach(() => {
  globalThis.fetch = originalFetch
  globalThis.caches = originalCaches
})

const request = (query, method = 'GET') =>
  onRequest({
    request: new Request(`https://example.pages.dev/api/audio?${query}`, { method }),
    waitUntil: (promise) => pending.push(promise),
  })

test('serves and caches UK and US audio separately without forwarding cookies', async () => {
  for (const type of ['1', '2']) {
    const response = await request(`audio=ice+cream+%26+coffee&type=${type}`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('Content-Type'), 'audio/mpeg')
    assert.equal(response.headers.get('Set-Cookie'), null)
    assert.equal(response.headers.get('Cross-Origin-Resource-Policy'), 'same-origin')
    const url = new URL(requests.at(-1).url)
    assert.equal(url.origin, 'https://dict.youdao.com')
    assert.equal(url.pathname, '/dictvoice')
    assert.equal(url.searchParams.get('audio'), 'ice cream & coffee')
    assert.equal(url.searchParams.get('type'), type)
    await Promise.all(pending)
    assert.equal((await request(`type=${type}&audio=ice+cream+%26+coffee`)).status, 200)
  }
  assert.equal(requests.length, 2)
})

test('rejects empty, oversized, control-character and invalid-accent requests before fetching', async () => {
  for (const query of ['audio=', 'audio=word&type=3', 'audio=test%0Aword', `audio=${'a'.repeat(501)}`]) {
    assert.equal((await request(query)).status, 400)
  }
  assert.equal((await request('audio=word', 'POST')).status, 405)
  assert.equal(requests.length, 0)
})

test('HEAD has no body and shares the GET cache', async () => {
  const head = await request('audio=accommodation&type=1', 'HEAD')
  assert.equal(head.status, 200)
  assert.equal(await head.text(), '')
  await Promise.all(pending)
  const get = await request('audio=accommodation&type=1')
  assert.equal((await get.arrayBuffer()).byteLength, 3)
  assert.equal(requests.length, 1)
})

test('upstream errors, HTML and network failures are not cached as audio', async () => {
  for (const upstream of [
    () => new Response('blocked', { status: 403 }),
    () => new Response('<html>error</html>', { headers: { 'Content-Type': 'text/html' } }),
    () => {
      throw new Error('timeout')
    },
  ]) {
    globalThis.fetch = upstream
    const response = await request('audio=word')
    assert.equal(response.status, 502)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
    assert.equal(entries.size, 0)
  }
})
