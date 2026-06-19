# Tamaweb — permission & attribution record

The Doge prototype embeds **[autosam/Tamaweb](https://github.com/autosam/Tamaweb)**
(the pet reskinned to a Doberman, wrapped in a Next.js shell). Tamaweb's licensing
is split:

- **Engine code** — Creative Commons **CC BY-NC-SA 4.0** (copy/adapt allowed for
  non-commercial use, with attribution + ShareAlike).
- **Visual assets, sounds, icons, and the "Tamaweb" name/branding** — **reserved**
  per Tamaweb's `TERMS_OF_USE.md` ("unauthorized use is prohibited"); they require
  **written permission** from the author.

## Written permission on file

> **ACTION REQUIRED:** paste the author's written grant below (the email/DM from
> autosam — autosam.sm@gmail.com — permitting Sous/Doge to use the protected
> assets). Until this is filled in, the vendored game stays **git-ignored**
> (`public/tamaweb/`, see `.gitignore`) and is **not** published in this public
> repo — it only runs locally for the prototype.

```
<paste the author's written permission here — date, who, what's granted>
```

- [ ] Written permission pasted above
- [ ] Scope confirmed (assets? the "Tamaweb" name? — note that we drop the name and reskin the pet regardless)
- [ ] Once filled: remove `/public/tamaweb/` from `.gitignore` to ship the bundle (only if the repo staying public is intended)

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
