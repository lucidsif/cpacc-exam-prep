# `data/` — content datasets

Every file in this directory exports:

1. A named constant for the data (e.g. `CPACC_BANK`)
2. A `*_PROVENANCE` constant in the IBM AI FactSheet shape (see [`../AI_TRANSPARENCY.md`](../AI_TRANSPARENCY.md))

The smoke tests in `tests/run.js` enforce both shapes — adding a new file means adding it to the test loader and providing both exports.

## File index

| File | Exports | Bucket |
|---|---|---|
| `questions.js` | `CPACC_BANK`, `CPACC_BANK_PROVENANCE` | ai-from-source (high confidence) |
| `bear-questions.js` | `BEAR_BANK`, `BEAR_BANK_PROVENANCE` | ai-from-notes (medium confidence) |
| `bear-flashcards.js` | `BEAR_FLASHCARDS`, `BEAR_FLASHCARDS_PROVENANCE` | ai-from-notes |
| `disabilities.js` | `DISABILITIES`, `DISABILITIES_PROVENANCE` | ai-from-notes |
| `legal.js` | `LEGAL`, `LEGAL_PROVENANCE` | ai-from-source |

## Question item shape

Used by both `CPACC_BANK` and `BEAR_BANK`:

```js
{
  id: 99,                          // unique across BOTH banks
  domain: 1,                       // 1 | 2 | 3 (CPACC BoK domain)
  type: "application",             // "recall" | "application" | "analysis"
  q: "Question text…",
  choices: { A: "…", B: "…", C: "…", D: "…" },
  answer: "B",
  why: { A: "why wrong…", B: "why right…", C: "…", D: "…" },
  cite: "BoK p.42",                // citation string; required for high confidence
  flag: "Optional uncertainty note shown in the UI",   // optional
  provenance: { ... },             // optional per-item override; defaults to *_PROVENANCE
}
```

**Adding a new question:**

1. Append the item to the appropriate bank file
2. Use the next available unique id (check both banks)
3. Run `npm test` — the data smoke tests will catch missing fields or ID collisions

## Flashcard shape

```js
{
  id: 7,
  tag: "ud-principle",             // free-form category tag
  front: "What is principle 1 of Universal Design?",
  back: "Equitable use…",
}
```

## Disabilities reference shape

```js
{
  categories: [
    { id: "visual", label: "…", emoji: "👁️", color: "#…", summary: "…" },
    …
  ],
  items: [
    {
      id: "low-vision",
      category: "visual",          // must match a category id
      name: "Low vision",
      emoji: "👓",
      prevalence: "~2.2B globally (WHO)",
      description: "…",
      keyFacts: ["…", "…"],        // optional
      a11ySolutions: ["…", "…"],   // optional
    },
    …
  ],
}
```

## Laws & standards reference shape

```js
{
  jurisdictions: [
    { id: "un", label: "United Nations", emoji: "🌐", color: "#…", summary: "…" },
    …
  ],
  items: [
    {
      id: "crpd",
      jurisdiction: "un",          // must match a jurisdiction id
      type: "Convention",
      year: "2006",
      name: "Convention on the Rights of Persons with Disabilities",
      summary: "…",
      keyFacts: ["…", "…"],        // optional
      cpacc: true,                 // set to false to hide from rendering but keep in data
    },
    …
  ],
}
```

## Provenance shape (per file)

```js
export const FOO_PROVENANCE = {
  category: 'ai-from-source' | 'ai-from-notes' | 'ai-live',
  label: 'Short human-readable bucket label shown on the badge',
  citations: ['Source 1', 'Source 2'],
  generatedBy: 'Claude Sonnet 4.6',
  generatedAt: '2025-04',
  humanReview: 'How the content was reviewed (or "None").',
  confidence: 'high' | 'medium' | 'low' | 'variable',
  limitations: [
    'Limitation 1',
    'Limitation 2',
  ],
};
```

Per-item overrides set the `provenance` field on the item itself; the dataset default is used otherwise.

## How sampling reads these files

`src/sampling.js` takes the bank array as an argument and treats every item as opaque except for the `id` and `domain` fields. The view layer reads everything else. There's no schema enforcement at runtime — only the smoke tests catch malformed items.
