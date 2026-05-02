# W15 close — voice-cook persisted preference + Sprint-C close

**Sprint:** C (Stage-5 W1 voice-driven cook mode)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H1 Sprint C W15
**Date closed:** 2026-05-02
**Scope:** Sprint-C close-out + persisted user preference for
voice cook (off by default, opt-in via the profile settings sheet
per CLAUDE.md rule 3).

## Shipped commits

| Phase          | Commit         | Output                                                                           |
| -------------- | -------------- | -------------------------------------------------------------------------------- |
| Wave + 3 loops | (HEAD pending) | `useVoiceCookPref` + `parseStoredVoiceCookPref` + 13 tests + Sprint-C IDEO close |

## Surfaces touched

| File                                              | Change                                                                                        |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/lib/voice/use-voice-cook-pref.ts` (NEW)      | localStorage-backed preference. Pure parser + state-based hook.                               |
| `src/lib/voice/use-voice-cook-pref.test.ts` (NEW) | 13 vitest cases — base parser cases + 3 stress (long-content, race-condition, poisoned-data). |
| `docs/sprints/C/IDEO-REVIEW.md` (NEW)             | Sprint-C close + carry-forward into Sprint D.                                                 |

## Loop 1 — stress test results

| Test                | Assertion                    | Result               |
| ------------------- | ---------------------------- | -------------------- |
| null raw            | returns default              | ✓                    |
| undefined raw       | returns default              | ✓                    |
| empty string        | returns default              | ✓                    |
| valid payload       | parses correctly             | ✓                    |
| corrupt JSON        | falls back to default        | ✓                    |
| non-boolean enabled | coerced to false             | ✓                    |
| missing lang        | coerced to en-US             | ✓                    |
| extra fields        | ignored                      | ✓                    |
| 5000-char payload   | survives without crash       | ✓                    |
| 1000 repeat calls   | deterministic                | ✓                    |
| no shared state     | mutating result doesn't leak | ✓ (after Loop 2 fix) |
| JSON null payload   | returns default              | ✓ (after Loop 2 fix) |
| JSON array payload  | returns default              | ✓                    |

## Loop 2 RCA — two real bugs Loop 1 caught

### Bug 1: shared mutable DEFAULT_PREF leaked across calls

**Symptom:** Test "returns a fresh object reference" failed —
mutating one parser result mutated the next.

**Root cause:** `return DEFAULT_PREF` in three places handed back
the SAME object reference on every call. Tests that ran before the
no-shared-state test mutated `DEFAULT_PREF.enabled = true`, and
subsequent calls saw the mutation.

**Fix:** Replaced `DEFAULT_PREF` const with `freshDefaultPref()`
factory that returns a NEW object every call. Hook's
`useState(freshDefaultPref)` uses the lazy-init form so the factory
runs once at mount.

### Bug 2: `JSON.parse("null")` crashed on property access

**Symptom:** Test "handles JSON null payload" expected default,
got an unexpected enabled-true result (which traced back to bug 1's
shared-state leak — but the deeper issue was that `JSON.parse("null")`
returns `null`, and `(null).enabled` would throw a TypeError if the
parser path actually ran.

**Root cause:** `JSON.parse` accepts `"null"`, `"[1,2,3]"`,
`"42"`, `'"hello"'` etc. — anything that's valid JSON. The parser
treated the result as `Partial<VoiceCookPref>` without checking
the shape.

**Fix:** Object-shape gate before destructuring:

```ts
if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
  return freshDefaultPref();
}
```

### Pattern surfaced

`JSON.parse` is not a typed contract. Parsers must validate the
shape before treating as the target type. This RCA's lesson
generalises: any localStorage / sessionStorage / URL-param parser
in the codebase that does `JSON.parse(...) as MyType` should add a
shape-gate. (Stage-3 retro flagged this as a "known gotcha" — W15
makes it concrete.)

## Loop 3 improvement

The `freshDefaultPref()` factory pattern is now the codebase
standard for "return a default that the caller might mutate."
Subsequent storage-parsing helpers should adopt it.

## Acceptance for W15

- [x] Persisted user preference shipped + tested.
- [x] Default is "off" — voice cook is opt-in.
- [x] Stored payload survives all degenerate input shapes
      (long, corrupt, null, array, primitive, wrong types).
- [x] All four gates green: pnpm lint ✓, pnpm typecheck ✓, pnpm
      test 533/533 ✓ (was 520; +13 from this week's suite),
      pnpm build ✓.
- [x] 3-loop recursive testing protocol completed; 2 real bugs
      caught + fixed in Loop 2.
- [x] Sprint-C IDEO close doc shipped.

## Residuals

- **No live UI consumer yet.** The pref hook is ready for the
  settings sheet to import; the cook step page is ready for all
  four voice hooks (W12, W13, W14, W15). Sprint D W16's first
  deliverable per the close-out carry-forward.
- **Locale picker uses lang as a free-text string.** A future
  refinement could constrain to a known-list of supported
  locales (en-US, en-GB, es-ES, etc.).

## Retrospective (1 paragraph)

W15's stress tests caught two real bugs (shared mutable default,
JSON null trap) that would have been silent corruption bugs in
production — the kind that surfaces months later as "voice cook
mysteriously enabled itself." That's exactly the failure mode the
3-loop protocol exists to prevent. The `freshDefaultPref()`
factory pattern + the JSON-shape gate are now codebase-standard
for any storage-backed parser; both should be retroactively
applied to other localStorage hooks if a future audit finds the
same shape issue elsewhere. **Sprint C is closed:** four voice
hooks + the cook/combined refactor wave A all landed with the
3-loop protocol fully executed, +101 tests across 5 weeks, no user-
facing regressions. Sprint D's first job is to actually wire all
this into the cook step page so users can experience it.
