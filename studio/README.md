# Wordloom product design build

OpenDesign-adapted frontend implementation of the IELTS learning product: desktop vocabulary practice and writing, with a touch-first mobile review interface.

## Run

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

The development address is http://127.0.0.1:4173. Add `?view=phone` to inspect the mobile interface in a phone frame on a wide screen. On an actual phone, it uses the responsive full-screen layout.

## Implemented

- Original themed vocabulary experience set, topic/status search, favorites, word details and device pronunciation.
- Actual word exposure logging, typing feedback, skipped-word inclusion and local daily counts.
- Definition-to-word and listening-to-meaning reviews with answer reveal and session completion.
- Sentence, original Academic Task 1 chart and Task 2 writing prompts, autosaved drafts, word bank, references, timer and focus mode.
- Explicit deterministic local writing checks, explained corrections and saved original/revised text.
- Phone expression cards based on verified rule corrections, plus read-only writing history.
- Preferences, light/dark/system appearance, validated backup import, export and confirmed local reset.
- Production build includes a cached offline shell. Local records stay in browser storage.

## Service boundaries

This is a complete interactive product-design frontend, not a released native iOS application. CloudKit / Apple authentication are not configured. Online AI writing assessment is outside the agreed scope; AI is used only for pre-generating curated vocabulary content. The interface displays the disconnected state; no data is uploaded. Pronunciation uses the device speech engine for this preview, pending pre-generated commercial TTS assets. No IELTS score prediction is fabricated. The hosted preview uses an isolated Cloudflare Pages branch and does not replace the original IELTS typing site.

Data structure and design decisions are documented in DESIGN.md. The web source is distributed under the repository's GPL-3.0 license. Experience-set definitions, examples and practice prompts were authored for this build; restricted upstream dictionary data is not bundled in this frontend.
