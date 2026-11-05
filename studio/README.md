# Wordloom product design build

OpenDesign-adapted frontend implementation of the IELTS learning product: desktop vocabulary practice and writing, with a touch-first mobile review interface and a native SwiftUI reference board. The current visual direction uses ink-colored primary surfaces, lilac vocabulary accents, rose writing surfaces and native system typography.

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

## Existing Qwerty records — compatibility audit, 2026-11-05

The original `https://qwerty-ielts.pages.dev/` and this branch preview at `https://wordloom.qwerty-ielts.pages.dev/` have separate browser storage. Updating the Wordloom branch does not update or access the original site's records. The original app stores practice events in IndexedDB `RecordDB` (schema version 3); chapter selection and preferences also use localStorage. Its Settings → Data settings → Export data produces a `Qwerty-Learner-User-Data-*.gz` backup. Its current Import data operation clears tables before import, so it must not be reused as a merge operation.

Legacy import and cross-device cloud sync are not implemented in this design preview. Before a production replacement, migration must retain the legacy database and the original backup, copy into a separate versioned destination, deduplicate by source event identity, verify counts and timestamps, and merge without replacing existing activity. Repeated imports must be idempotent and interrupted imports must be recoverable. All legacy words must be retained even when their definitions have not yet been added to the new catalog; the current 37-word experience set is not a complete migration target.

Records on another computer must first be exported from the browser where practice happened, or migrated on that same browser before account sync is enabled. Legacy word events are saved on word completion, so they can establish practiced-word history but cannot reconstruct every displayed or skipped word. CloudKit/Apple login configuration and an actual legacy import need separate implementation and verification before claiming synchronization is available.
