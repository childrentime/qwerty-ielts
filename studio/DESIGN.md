# Wordloom — product design

Working name: Wordloom. The product connects vocabulary recognition with written expression. The first language is Simplified Chinese for Chinese IELTS learners; examples and writing prompts are English.

## Product contract

- A word enters the seen list when displayed in practice, including skipped words. There is no spelling mastery score or SRS due-date model.
- Desktop supports typing and sentence / Academic Task 1 / Task 2 writing. Mobile supports touch-only vocabulary and writing-expression review.
- Every count derives from local activity. The initial account has no fabricated learning history.
- Vocabulary is an original AI-authored, curated experience set. It is not copied from the restricted upstream dictionary.
- Drafts, seen words, favorites, completed reviews, writing history and preferences persist locally. Export / validated import support moving this preview between devices.
- CloudKit / Sign in with Apple and online AI assessment are not configured in this design build. Their interfaces expose the real disconnected state. No fake cloud sync, AI grading, or IELTS band prediction.
- Device speech synthesis provides preview pronunciation. Production audio will use pre-generated officially licensed TTS files.

## Color

Warm paper #f7f7f2; white surfaces #ffffff; forest ink #244f40; graphite #242b27; muted sage #e9eee5; warm orange #bd7049; restrained red/green for answer feedback. Dark appearance uses charcoal paper and soft sage ink. All tokens have semantic names and contrast-conscious foregrounds.

## Typography

English learning material uses Georgia, a locally available editorial serif. Navigation and Chinese copy use a native readable sans-serif stack. English words have generous leading and distinct type scale. Labels use small, spaced uppercase Latin text; Chinese body text remains at least 14px on desktop and 15px on mobile. No remote font dependency.

## Layout

Desktop: 224px navigation rail, 72px utility bar, max 1280px content canvas. An editorial split hero and ruled word rows establish a study-space character. Practice is focused; writing uses a prompt/editor/support split. Mobile: safe-area-aware four-tab navigation, one-column cards, full-width touch choices, sticky primary actions. A switchable 414px phone viewport lets desktop users inspect the actual responsive interface.

## Components and states

Shared buttons, topic chips, activity rows, word cards, progress indicators, dialogs, accessible tabs, toast messages, focus rings. Review has unanswered, correct, incorrect, revealed, completed and empty states. Writing has prompt selection, autosaved draft, word bank, reference expression, local-check result, applied correction and history. Settings includes target, daily goal, pronunciation, theme, local data management and disconnected cloud state. Dialogs trap focus and restore it; keyboard operation and reduced-motion preferences are supported.

## Routes

- Today: next action, genuine progress, learning-to-writing journey, next words.
- Practice: desktop typing, actual word exposure, pronunciation, next / skip, completion.
- Review: definition-to-word and listening-to-meaning, feedback, saved words, session completion.
- Library: topic/status filters, search, word detail, favorites, examples and writing links.
- Writing: sentence drills, original Task 1 charts, Task 2 prompts, draft history, explicit reference content, deterministic local checks. Phone view reviews expressions without a writing keyboard.
- Settings: local account preferences, goal, voice, appearance, export/import/reset, cloud connection explanation.

## Evaluation

The design should make it possible to decide whether learning words on a computer and revisiting vocabulary plus corrected expressions on a phone creates a coherent product. The reviewable deliverable is a functional frontend, not a claim that native iOS packaging or production cloud services are complete.

## Appearance and reference boards (0.2)

- `#/design` is the live color board: all 77 paired semantic, state, chart, illustration, border and shadow colors, with light/dark component examples and copyable values.
- `src/colors.json` is the color source; `pnpm colors` generates `src/themes.css`. Product CSS and SVG charts use tokens; regression checks reject new unpaired hex colors and verify a 4.5:1 contrast minimum for core text, primary controls and answer state pairs.
- Every product page, search/word/sync dialog, chart and phone preview reads the theme. A persistent header button switches light/dark; settings also supports system preference updates.
- `#/app` shows nine states of the independently implemented native SwiftUI prototype, each with light/dark simulator captures. It is a screen reference gallery; the separate phone webpage link remains the browser interaction preview.
- Native source is kept outside this public GPL repository. It was built and checked on a dedicated iPhone 16e simulator. This public directory contains only the exported WebP UI captures.
- Native/cloud boundary: twelve sample words and three writing examples are local prototype content. No claim of web/iPhone data synchronization, Apple authentication or online AI feedback is made before those integrations are configured.
