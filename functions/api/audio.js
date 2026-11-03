const AUDIO_ORIGIN = 'https://dict.youdao.com/dictvoice'
const MAX_TEXT_LENGTH = 500
const CACHE_SECONDS = 60 * 60 * 24 * 30

function errorResponse(message, status) {
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

// Only this fixed pronunciation endpoint is reachable; callers cannot supply a URL.
export async function onRequest({ request, waitUntil }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } })
  }

  const url = new URL(request.url)
  const audio = url.searchParams.get('audio')?.trim()
  const type = url.searchParams.get('type') ?? '2'
  if (!audio || audio.length > MAX_TEXT_LENGTH || /[\u0000-\u001f\u007f]/u.test(audio) || !['1', '2'].includes(type)) {
    return errorResponse('Provide pronunciation text (1–500 characters) and type 1 (UK) or 2 (US).', 400)
  }

  const query = new URLSearchParams({ audio, type })
  const cacheKey = new Request(`${url.origin}/api/audio?${query}`)
  const cache = caches.default
  const cached = await cache.match(cacheKey)
  if (cached) {
    return request.method === 'HEAD' ? new Response(null, cached) : cached
  }

  try {
    const upstream = await fetch(`${AUDIO_ORIGIN}?${query}`, {
      headers: { Accept: 'audio/mpeg, audio/*;q=0.9' },
      redirect: 'error',
      signal: AbortSignal.timeout(12000),
    })
    if (!upstream.ok || !upstream.headers.get('Content-Type')?.toLowerCase().startsWith('audio/')) {
      await upstream.body?.cancel()
      return errorResponse('Pronunciation is temporarily unavailable. Please try again.', 502)
    }

    const response = new Response(upstream.body, {
      headers: {
        'Content-Type': upstream.headers.get('Content-Type'),
        'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
        'X-Content-Type-Options': 'nosniff',
        'Cross-Origin-Resource-Policy': 'same-origin',
      },
    })
    waitUntil(cache.put(cacheKey, response.clone()))
    return request.method === 'HEAD' ? new Response(null, response) : response
  } catch {
    return errorResponse('Pronunciation is temporarily unavailable. Please try again.', 502)
  }
}
