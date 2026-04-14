# QA Loop 2: Edge Case Testing

## New Tests Added

### `src/lib/normalize.test.ts` (8 tests)

- Empty string → returns empty
- Whitespace-only input → returns empty
- Emoji and special chars → stripped safely
- Multiple spaces → collapsed to single
- Accented characters → non-word chars stripped
- SQL injection-like input → stripped to safe text
- Very long input (2000 chars) → handled without error
- Basic trim + lowercase

### `src/data/coach-quiz.test.ts` (4 new edge case tests)

- Empty answers array → moderate effort, empty preferences
- All same answer (rapid-click through) → valid output
- Out-of-range answer indices → graceful handling, no crash
- More answers than questions → no crash

### `src/lib/engine/pairing-engine.test.ts` (6 new edge case tests)

- Empty dish name → still returns results
- Very long dish name (1000 chars) → no crash
- No cuisine signals → still returns results
- No mood signals → still returns results
- Single candidate → returns exactly 1 result
- Duplicate candidates → no crash

## Edge Case Analysis

### Today Page

| Edge Case                 | Status | Notes                                           |
| ------------------------- | ------ | ----------------------------------------------- |
| Empty state (no meals)    | SAFE   | Static data — 76 meals always loaded            |
| Error state (API failure) | SAFE   | Error boundary at `(today)/error.tsx`           |
| Loading state             | SAFE   | Loading component at `(today)/loading.tsx`      |
| Long meal name            | SAFE   | Text uses `truncate` class in quest-card        |
| Null imageUrl             | SAFE   | Gradient+emoji fallback renders (all URLs null) |

### Search

| Edge Case             | Status | Notes                                              |
| --------------------- | ------ | -------------------------------------------------- |
| Empty query           | SAFE   | `normalizeInput("")` → empty → returns `null`/`[]` |
| Whitespace only       | SAFE   | Trimmed to empty → no results                      |
| Special chars / emoji | SAFE   | Stripped by normalizeInput                         |
| SQL injection         | SAFE   | No SQL — Fuse.js is in-memory text search          |
| 0 results             | SAFE   | Returns empty array                                |
| Very long query       | SAFE   | Fuse.js handles gracefully                         |

### Guided Cook Flow

| Edge Case           | Status | Notes                                         |
| ------------------- | ------ | --------------------------------------------- |
| 1-step side         | SAFE   | StepCard renders single step fine             |
| 20+ steps           | SAFE   | Scrollable step area, phase indicator tracks  |
| Timer 0 seconds     | SAFE   | Timer component handles zero gracefully       |
| Timer 3600+ seconds | SAFE   | Displays as HH:MM:SS format                   |
| Navigate away       | SAFE   | Zustand store persists during session         |
| Refresh mid-cook    | SAFE   | Store resets to mission phase (clean restart) |

### Path Tab

| Edge Case     | Status | Notes                                              |
| ------------- | ------ | -------------------------------------------------- |
| Zero cooks    | SAFE   | All nodes show locked state, journey summary empty |
| 100+ cooks    | SAFE   | localStorage-based, no performance issue           |
| All unlocked  | SAFE   | All nodes render in unlocked state                 |
| None unlocked | SAFE   | Default state, clean empty display                 |

### Coach Quiz

| Edge Case           | Status | Notes                                          |
| ------------------- | ------ | ---------------------------------------------- |
| Skip every question | TESTED | Returns moderate effort, empty preferences     |
| All same answer     | TESTED | Produces valid preference vector               |
| Rapid-click         | SAFE   | No debounce needed — state transitions cleanly |

## Summary

**73 tests pass.** 18 new edge case tests added (8 normalize, 4 coach quiz, 6 pairing engine). No edge case bugs found — defensive coding is solid.
