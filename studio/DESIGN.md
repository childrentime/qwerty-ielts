# Wordloom — product design

Working name: Wordloom. The product connects vocabulary recognition with written expression. The first language is Simplified Chinese for Chinese IELTS learners; examples and writing prompts are English.

## Product contract

- A word enters the seen list when displayed in practice, including skipped words. There is no spelling mastery score or SRS due-date model.
- Desktop supports typing and sentence / Academic Task 1 / Task 2 writing. Mobile supports touch-only vocabulary and writing-expression review.
- Every count derives from local activity. The initial account has no fabricated learning history.
- Vocabulary is an original AI-authored, curated experience set. It is not copied from the restricted upstream dictionary.
- Drafts, seen words, favorites, completed reviews, writing history and preferences persist locally. Export / validated import support moving this preview between devices.
- CloudKit / Sign in with Apple are not configured in this design build. Their interfaces expose the real disconnected state. Online AI writing assessment and IELTS score prediction are outside the agreed scope. AI is used only for pre-generating curated vocabulary content.
- Device speech synthesis provides preview pronunciation. Production audio will use pre-generated officially licensed TTS files.

## Visual direction — native refinement 0.3

The product uses a restrained, native Apple direction: system sans-serif typography, neutral grouped backgrounds, a single blue interaction color, clear titles, compact utility controls and standard platform navigation. Decorative paper illustrations, serif wordmarks and promotional headings have been removed. Product labels describe the action or content directly.

## Color

`src/colors.json` is the source of truth for 27 paired light/dark semantic colors. Backgrounds are neutral; the blue tint communicates interaction, while green/red indicate review outcomes with icons as well as color. Primary controls have a separate action color to retain readable white labels. No one-off product colors are allowed outside the palette. The live board shows every pair.

## Typography

System sans-serif across navigation, learning content and writing. No remote fonts. Distinct title, body, secondary and caption roles; English words use medium system type instead of a decorative serif. Native iOS uses system text styles and standard navigation titles.

## Layout

Desktop: 212px sidebar, 58px toolbar, grouped study surfaces and precise spacing. Mobile web: one-column cards and safe-area navigation. Native iOS: NavigationStack, native TabView, system segmented pickers, sheets and Form settings. Review keeps its primary action above the tab bar. The App reference board shows complete simulator screens and offers an enlarged view.

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

## Appearance and reference boards (0.3)

- `#/design` is the live color board: all 27 paired semantic, state, chart, border and shadow colors, with light/dark component examples and copyable values.
- `src/colors.json` is the color source; `pnpm colors` generates `src/themes.css`. Product CSS and SVG charts use tokens; regression checks reject new unpaired hex colors and verify a 4.5:1 contrast minimum for core text, primary controls and answer state pairs.
- Every product page, search/word/sync dialog, chart and phone preview reads the theme. A persistent header button switches light/dark; settings also supports system preference updates.
- `#/app` shows nine states of the independently implemented native SwiftUI prototype, each with light/dark simulator captures. It is a screen reference gallery; the separate phone webpage link remains the browser interaction preview.
- Native source is kept outside this public GPL repository. It was built and checked on a dedicated iPhone 16e simulator. This public directory contains only the exported WebP UI captures.
- Native/cloud boundary: twelve sample words and three writing examples are local prototype content. Web/iPhone data synchronization and Apple authentication await configuration. Writing uses local practice, reference examples and deterministic checks; online AI assessment is not planned.

Design references: [Apple color](https://developer.apple.com/design/human-interface-guidelines/color), [typography](https://developer.apple.com/design/human-interface-guidelines/typography), and [tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars). Apple guidelines informed semantic color and standard navigation; the concrete layouts are Wordloom design choices.
