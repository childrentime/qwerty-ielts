# Qwerty IELTS

An IELTS-only fork of [Qwerty Learner](https://github.com/RealKai42/qwerty-learner), hosted on Cloudflare Pages.

**Live site:** https://qwerty-ielts.pages.dev/

This fork was modified on **2026-11-03**. It retains typing practice, dictation, chapters, pronunciation, the error book and local learning statistics. The default dictionary is IELTS (3,575 entries).

## IELTS scope

`src/resources/ielts.json` contains the 59 dictionaries tagged IELTS in the upstream catalog (57,895 entries across books; many overlap). It is the single allowlist for both the catalog and production assets. `scripts/prune-build.mjs` removes every other dictionary and checks all entry counts after each build. Other dictionaries remain in the upstream source history but are not deployed.

## Pronunciation

Both UK and US pronunciation use the same-origin `/api/audio?audio=word&type=1|2` endpoint. The Pages Function fetches MP3 audio from a fixed Youdao endpoint, validates the response, strips upstream cookies and caches successful audio for 30 days. Browser playback and preloading therefore do not require Youdao CORS headers. Text is URL-encoded, including spaces and punctuation in phrases.

Audio still depends on the upstream pronunciation service for a cache miss. Errors return an uncached 502. The endpoint cannot fetch a caller-supplied URL.

The fork removes upstream Google Analytics, Mixpanel reporting, Vercel Analytics, promotional links and the original site's ICP registration number. Learning progress stays in the current browser's local storage and IndexedDB. Progress from the original domain does not transfer automatically; use the app's data export/import controls if needed.

## Development

Use Node.js 22 and pnpm 9.5.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Vite proxies `/api/audio` for local development. To test the actual Pages Function locally:

```sh
pnpm test
pnpm run typecheck
pnpm run build
pnpm run preview:cloudflare
```

Production output is `build/`. `_routes.json` invokes Functions only for `/api/*`; static pages and assets stay on Pages' static hosting.

## Deployment

The Cloudflare project is `qwerty-ielts`, with production branch `master`. `wrangler.toml` records its non-secret account/project configuration. After signing in to Wrangler:

```sh
pnpm run deploy
```

Deployment uses the current user's Cloudflare credentials; no credentials belong in source control. GitHub Actions runs tests, type checking and the production build. Publication is performed with the deployment command above.

## Attribution and license

Original project: [RealKai42/qwerty-learner](https://github.com/RealKai42/qwerty-learner), by Kaiyi and contributors. Source code remains under [GPL-3.0](LICENSE); the deployed page links to this fork's complete source and the license. Upstream dictionary notices and data provenance in `docs/` remain applicable. Dictionary data is intended for personal study and research, with upstream restrictions on commercial use retained.

The typing experience is designed for desktop browsers and physical keyboards. On a phone, the site displays instructions for opening it on a computer.
