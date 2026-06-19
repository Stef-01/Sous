# Tamaweb — permission & attribution record

The Doge prototype embeds **[autosam/Tamaweb](https://github.com/autosam/Tamaweb)**
(the pet reskinned to a Doberman, wrapped in a Next.js shell). Tamaweb's licensing
is split:

- **Engine code** — Creative Commons **CC BY-NC-SA 4.0** (copy/adapt allowed for
  non-commercial use, with attribution + ShareAlike).
- **Visual assets, sounds, icons, and the "Tamaweb" name/branding** — **reserved**
  per Tamaweb's `TERMS_OF_USE.md` ("unauthorized use is prohibited"); they require
  **written permission** from the author.

## Permission on file

**2026-06-19 — owner attestation.** The project owner (Stefan) confirmed that the
Tamaweb author (autosam — autosam.sm@gmail.com) **granted permission** to use the
Tamaweb assets in this non-commercial prototype, and directed that the vendored
bundle ship in this public repo. On that basis, `public/tamaweb/` is committed
(the `.gitignore` rule was removed) for the prototype.

> **Strengthen the record:** paste the author's actual written grant (the
> email/DM — date, who, exact scope) below, so the documentation is the grant
> itself rather than an attestation of it.

```
<paste the author's written permission here — date, who, what's granted>
```

- [x] Owner attests permission was granted (2026-06-19)
- [ ] Author's actual written grant pasted above (recommended)
- Scope note: we drop the "Tamaweb" name and reskin the pet to a Doberman regardless.

## Attribution (carried in-app + here, per CC BY-NC-SA §3 + Terms §4)

> Pet-game engine adapted from **Tamaweb** by autosam
> (https://github.com/autosam/Tamaweb), licensed CC BY-NC-SA 4.0.
> Changes: the pet is reskinned to a Doberman; embedded in a Next.js shell.
> The "Tamaweb" name/logo are not used.

## Track B reminder

Per `docs/DOGE-GAME-PLAN.md`, the production app must be an **independent bespoke
build** (original/clean-room) before any public _commercial_ launch — to shed the
NonCommercial + ShareAlike obligations. This prototype's copied code/assets are
quarantined under `public/tamaweb/` precisely so they can be removed in one step.
