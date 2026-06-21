/*
 * sous-bridge.js — Sous-authored receiver injected into the Doge game (in an
 * iframe under the Sous origin). This is the ONLY game-side integration code;
 * the vendored Tamaweb engine is never modified (two tiny additive customImage
 * render branches in App.js are the sole exception).
 *
 * It mirrors the typed protocol in src/lib/doge/bridge-protocol.ts. Loaded by a
 * plain <script> tag after Main.js. IMPORTANT: the game declares `App` /
 * `Activities` as lexical globals (const/class), which are NOT properties of
 * `window` — so we reference them as BARE identifiers (resolved via the shared
 * global lexical environment), guarded by `typeof`. (`window.App` is undefined.)
 * See docs/DOGE-INTEGRATION-PLAN.md §1.5.
 */
(function () {
  "use strict";

  var CHANNEL = "sous-doge";
  var V = 1;

  var nonce = null; // set by sous:hello
  var announced = false; // have we posted doge:ready for the current pet?
  var lastPet = null; // identity watch for hatch / age-up
  // Settled-transaction dedupe. PERSISTED to localStorage (capped) so an iframe
  // reload mid-transaction can't reset it: the parent's durable outbox replays
  // every unsettled txn on the next doge:ready handshake, and a fresh in-memory
  // set would re-credit gold / re-grant a dish. With persistence the replay is
  // recognised as already-settled and merely re-acked. (Audit C1.)
  var SEEN_KEY = "sous-doge-seen-txn-v1";
  var SEEN_CAP = 300;
  var seenOrder = [];
  var seenTxn = Object.create(null);
  (function loadSeenTxn() {
    try {
      var arr = JSON.parse(window.localStorage.getItem(SEEN_KEY) || "[]");
      if (Array.isArray(arr)) {
        seenOrder = arr.slice(-SEEN_CAP);
        for (var i = 0; i < seenOrder.length; i++) seenTxn[seenOrder[i]] = true;
      }
    } catch (_e) {
      /* corrupt / disabled — start empty */
    }
  })();
  function markSeen(txnId) {
    if (!txnId || seenTxn[txnId]) return;
    seenTxn[txnId] = true;
    seenOrder.push(txnId);
    if (seenOrder.length > SEEN_CAP) delete seenTxn[seenOrder.shift()];
    try {
      window.localStorage.setItem(SEEN_KEY, JSON.stringify(seenOrder));
    } catch (_e) {
      /* quota / disabled — best effort */
    }
  }

  function getApp() {
    return typeof App !== "undefined" ? App : null;
  }
  function getActivities() {
    return typeof Activities !== "undefined" ? Activities : null;
  }
  function gameReady() {
    var a = getApp();
    return !!(a && a.loadingEnded && a.pet);
  }

  function post(type, extra) {
    var msg = { channel: CHANNEL, v: V, type: type };
    if (extra) for (var k in extra) msg[k] = extra[k];
    try {
      window.parent.postMessage(msg, window.location.origin);
    } catch (_e) {
      /* parent gone / cross-origin — ignore */
    }
  }

  function announceReady() {
    announced = true;
    lastPet = getApp().pet;
    post("doge:ready");
  }

  // ---- verb handlers (each re-resolves App.pet fresh) -------------------------

  function handleGold(d) {
    var amt = Math.floor(Number(d.amount));
    if (!(amt > 0 && amt <= 200) || seenTxn[d.txnId]) {
      post("doge:ack", { txnId: d.txnId, credited: 0 });
      return;
    }
    var App = getApp();
    App.pet.stats.gold = (App.pet.stats.gold || 0) + amt;
    if (d.juice) {
      // optional money-bag flourish; gold lands regardless if it's unavailable
      try {
        var Act = getActivities();
        if (Act && Act.task_winMoneyFromArcade) Act.task_winMoneyFromArcade({ amount: 0, hasWon: true });
      } catch (_e) {
        /* cosmetic only */
      }
    }
    if (App.save) App.save(true);
    markSeen(d.txnId); // record settled only AFTER the credit is durably saved
    post("doge:ack", { txnId: d.txnId, credited: amt });
  }

  // Map a DogeFoodDef (rule-7 dish serving) onto the native food-def shape.
  function toNativeFoodDef(def) {
    return {
      name: def.name,
      sprite: def.spriteFallback,
      customImage: def.customImage || null,
      hunger_replenish: def.hunger_replenish,
      fun_replenish: def.fun_replenish,
      health_replenish: def.health_replenish,
      price: 0,
      cookableOnly: true,
      unbuyable: true,
      sous: true,
      cuisine: def.cuisine,
    };
  }

  function handleGrantDish(d) {
    var def = d.def;
    if (!def || !def.id) {
      post("doge:granted", { txnId: d.txnId, id: "" });
      return;
    }
    var App = getApp();
    if (!App || !App.definitions || !App.pet) {
      post("doge:granted", { txnId: d.txnId, id: "" });
      return;
    }
    if (!App.definitions.food) App.definitions.food = {};
    if (!App.definitions.food[def.id]) App.definitions.food[def.id] = toNativeFoodDef(def);
    if (!seenTxn[d.txnId]) {
      App.addNumToObject(App.pet.inventory.food, def.id, 1);
      if (App.save) App.save(true);
      markSeen(d.txnId); // record settled only AFTER the grant is durably saved
    }
    post("doge:granted", { txnId: d.txnId, id: def.id });
  }

  function handleSay(d) {
    var App = getApp();
    if (!App || !App.pet) {
      post("doge:said", { sayId: d.sayId });
      return;
    }
    var pet = App.pet;
    var asleep = pet.stats && pet.stats.is_sleeping;
    var scripted = typeof pet.isDuringScriptedState === "function" && pet.isDuringScriptedState();
    var text = String(d.text || "").replace(/[<>]/g, ""); // dodge the raw-HTML bubble branch
    if (!asleep && !scripted && text) pet.say(text, typeof d.ms === "number" ? d.ms : 6000);
    post("doge:said", { sayId: d.sayId });
  }

  function handleSetMood(d) {
    // Drive Dobe's VISIBLE reaction from your real nutrition — a momentary
    // scripted animation (the same kind the game uses for its own celebrations),
    // NOT a stat overwrite, so it never fights the game's depleting-stat loop.
    // Positive-only + guarded: never interrupts sleep or another scripted state.
    var App = getApp();
    var pet = App && App.pet;
    if (!pet || typeof pet.triggerScriptedState !== "function") return;
    if (pet.stats && pet.stats.is_sleeping) return;
    if (typeof pet.isDuringScriptedState === "function" && pet.isDuringScriptedState()) return;
    try {
      if (d.mood === "thriving") pet.triggerScriptedState("cheering", 4000, 0, true);
      else if (d.mood === "content") pet.triggerScriptedState("blush", 3000, 0, true);
      // peckish / hungry / asleep → no forced animation; the greeting already
      // voices those, and we don't fake the game's own low-stat states.
    } catch (_e) {
      /* never let a reaction crash the game loop */
    }
  }

  // ---- message plumbing -------------------------------------------------------

  function onMessage(e) {
    if (e.origin !== window.location.origin) return;
    var d = e.data;
    if (!d || d.channel !== CHANNEL || d.v !== V || typeof d.type !== "string") return;

    if (d.type === "sous:hello") {
      nonce = d.nonce;
      return;
    }
    if (!nonce || d.nonce !== nonce) return;
    if (!gameReady()) return; // parent retries on next doge:ready

    try {
      switch (d.type) {
        case "sous:gold:credit":
          handleGold(d);
          break;
        case "doge:grantDish":
          handleGrantDish(d);
          break;
        case "doge:say":
          handleSay(d);
          break;
        case "sous:setMood":
          handleSetMood(d);
          break;
        default:
          break;
      }
    } catch (err) {
      if (typeof console !== "undefined") console.warn("[doge-bridge] verb failed:", d.type, err);
    }
  }

  window.addEventListener("message", onMessage);

  // ---- native nutrition HUD on the (fullscreen) main view ---------------------
  // The real Sous nutrition, on screen the moment you open the app — rendered
  // with the GAME's own primitives (createProgressbar + getIcon) and injected
  // into the game's own DOM, styled like the game. Not a foreign React overlay;
  // it reads the shared localStorage key Sous writes (doge-health-store.ts).
  var hudStyled = false;
  function injectHudStyle() {
    if (hudStyled) return;
    hudStyled = true;
    var css =
      // Render in the GAME's own panel art (.surface-stylized): cream bg, tan
      // border, inset bevel, orange pixel text + text-shadow, asymmetric radius —
      // so the nutrition reads as a native in-game measure, not a foreign HUD.
      // (Falls back to the default-theme literals if the theme vars are absent.)
      ".sous-nutrition-hud{position:absolute;top:50px;left:7px;right:7px;z-index:60;" +
      "background:var(--prim-clr-b-bg,#fff4e8);color:var(--prim-clr-b-text,#ff8000);" +
      "border:2px solid var(--prim-clr-b-border,#ffb362);" +
      "box-shadow:10px -20px 0px -15px inset var(--prim-clr-b-shadow,#f5deb3);" +
      "text-shadow:1px 1px 0px var(--prim-clr-b-text-shadow,#ffcf9d);" +
      "border-radius:10px;border-top-left-radius:20px;border-bottom-right-radius:20px;" +
      "padding:9px 12px 10px;pointer-events:auto;cursor:pointer;}" +
      ".sous-nutrition-hud:active{transform:scale(.985);}" +
      ".sous-hud-title{font-size:9px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;" +
      "margin:0 0 7px 2px;display:flex;align-items:baseline;justify-content:space-between;gap:8px;}" +
      ".sous-hud-titletext{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}" +
      ".sous-hud-more{flex:none;letter-spacing:0;opacity:.8;}" +
      ".sous-hud-row{display:flex;align-items:center;gap:6px;margin:3px 0;}" +
      ".sous-hud-ic{width:14px;text-align:center;flex:none;}" +
      ".sous-hud-ic i{font-size:12px;}" +
      ".sous-hud-lb{width:56px;font-size:9px;font-weight:700;text-transform:uppercase;flex:none;}" +
      ".sous-nutrition-hud .progressbar{flex:1;min-width:0;margin:0;}" +
      ".sous-hud-pc{width:32px;text-align:right;font-size:9px;font-weight:700;flex:none;}" +
      ".sous-hud-status{font-size:9px;margin-top:6px;font-weight:700;}" +
      ".sous-hud-meals{font-size:9px;margin-top:4px;font-weight:700;opacity:.92;" +
      "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}" +
      ".sous-hud-meals i{margin-right:2px;}" +
      // Hide the vendored SW-update notice — off-brand for Doge + it overlaps the HUD.
      "#download-container,#download-complete-container{display:none!important;}" +
      // --- Fullscreen layout fix --------------------------------------------
      // The room/world FILLS the entire screen (cover, pixel-perfect) — the game
      // IS the screen, not a small square on a flat backdrop. The 96x96 room is a
      // fixed square image, so cover crops the far side-edges (mostly bare wall);
      // the dog + bed + depth stay centered and full-height. The nutrition then
      // overlays it as a native in-room board, so the metrics live in the room.
      ".graphics-wrapper.fullscreen{display:block!important;padding:0!important;" +
      "background:#15121a!important;}" +
      ".graphics-wrapper.fullscreen.sous-subscreen{padding:0!important;}" +
      ".graphics-wrapper.fullscreen .screen-wrapper{position:absolute!important;inset:0!important;" +
      "width:100%!important;height:100%!important;}" +
      ".graphics-wrapper.fullscreen .graphics-canvas{height:100%!important;width:100%!important;" +
      "object-fit:contain!important;object-position:center 58%!important;image-rendering:pixelated!important;" +
      "background:transparent!important;}" +
      // Grid menus (main menu, care, inventory) size each tile to 1/3 of the
      // container height — fine on the 192px egg-shell, but on the fullscreen
      // 742px screen each tile balloons to ~245px so the 4th row (the Back
      // button) overflows below the fold. Cap the tile height + center the grid
      // so all entries fit on one screen, clear of the bezel + the Sous back btn.
      ".graphics-wrapper.fullscreen .generic-grid-container{align-content:center!important;}" +
      ".graphics-wrapper.fullscreen .generic-grid-container .grid-item{height:165px!important;min-height:0!important;}";
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }
  function readSousHealth() {
    try {
      return JSON.parse(window.localStorage.getItem("sous-doge-health-v1") || "null");
    } catch (_e) {
      return null;
    }
  }
  function renderHud(hud) {
    var App = getApp();
    if (!App) return;
    var data = readSousHealth();
    if (!data || !Array.isArray(data.stats) || !data.stats.length) {
      hud.innerHTML =
        '<div class="sous-hud-title"><span class="sous-hud-titletext">Dobe’s health · your nutrition</span>' +
        '<span class="sous-hud-more">tap ›</span></div>' +
        '<div class="sous-hud-status">Cook or log a meal in Sous to fill Dobe’s health.</div>';
      return;
    }
    var rows = "";
    for (var i = 0; i < data.stats.length; i++) {
      var s = data.stats[i];
      var pct = Math.max(0, Math.min(100, Number(s.pct) || 0));
      rows +=
        '<div class="sous-hud-row"><span class="sous-hud-ic">' +
        App.getIcon(s.fa, true) +
        '</span><span class="sous-hud-lb">' +
        s.label +
        "</span>" +
        App.createProgressbar(pct).node.outerHTML +
        '<span class="sous-hud-pc">' +
        Math.round(pct) +
        "%</span></div>";
    }
    var meals = "";
    if (Array.isArray(data.meals) && data.meals.length) {
      var shown = data.meals.slice(0, 3);
      var extra = data.meals.length - shown.length;
      meals =
        '<div class="sous-hud-meals">' +
        App.getIcon("utensils", true) +
        " Fed today: " +
        shown.join(" · ") +
        (extra > 0 ? " +" + extra : "") +
        "</div>";
    }
    hud.innerHTML =
      '<div class="sous-hud-title"><span class="sous-hud-titletext">Dobe’s health · your nutrition</span>' +
      '<span class="sous-hud-more">tap ›</span></div>' +
      rows +
      (data.status ? '<div class="sous-hud-status">' + data.status + "</div>" : "") +
      meals;
  }
  var hudTimer = null;
  function ensureHud() {
    if (!gameReady()) return;
    var wrap = document.querySelector(".graphics-wrapper");
    if (!wrap) return;
    injectHudStyle();
    var hud = wrap.querySelector(".sous-nutrition-hud");
    if (!hud) {
      hud = document.createElement("div");
      hud.className = "sous-nutrition-hud";
      // Tap the HUD summary -> open the full native Nutrition tab (progressive
      // disclosure). Bound on the persistent container so it survives the 3s
      // innerHTML refresh.
      hud.addEventListener("click", function () {
        var A = getApp();
        if (A && A.handlers && A.handlers.open_stats) A.handlers.open_stats("tab-3");
      });
      wrap.appendChild(hud);
      renderHud(hud);
      if (!hudTimer)
        hudTimer = setInterval(function () {
          var h = document.querySelector(".sous-nutrition-hud");
          if (h) renderHud(h);
        }, 3000);
    }
  }

  // The HUD belongs to the main ROOM view only. Hide it whenever a menu, the
  // stats/care screen, a dialog, or the welcome modal covers the room — so it
  // never overlaps the game's own UI (e.g. the menu's top row sat behind it).
  // Detect by probing a point well below the HUD: if the room canvas is the
  // topmost element there we're on the main view; otherwise an overlay is open.
  function syncHudVisibility() {
    var hud = document.querySelector(".sous-nutrition-hud");
    if (!hud) return;
    var el = document.elementFromPoint(
      Math.round(window.innerWidth / 2),
      Math.round(window.innerHeight * 0.62)
    );
    var onRoom = !!(el && el.classList && el.classList.contains("graphics-canvas"));
    hud.style.display = onRoom ? "" : "none";
    // Reclaim the HUD-reserved top padding on canvas sub-screens (no HUD there).
    var wrap = document.querySelector(".graphics-wrapper");
    if (wrap) wrap.classList.toggle("sous-subscreen", !onRoom);
    // Also toggle the Sous (parent) back button: hide it over game overlays —
    // those screens have their own BACK and two collide at the top-left corner.
    try {
      var pb =
        window.parent &&
        window.parent !== window &&
        window.parent.document.querySelector("[data-doge-back]");
      if (pb) pb.style.display = onRoom ? "" : "none";
    } catch (_e) {
      /* cross-origin (shouldn't happen here) — skip */
    }
  }

  // The pet IS Dobe the Doberman in Sous. New pets are named "Dobe" at the
  // source (App.js), but legacy saves carry a random "...tchi" name — rename
  // those to Dobe ONCE (guarded by a flag so a later in-game rename sticks).
  function ensureDobeName() {
    var App = getApp();
    if (!App || !App.petDefinition) return;
    try {
      if (window.localStorage.getItem("sous-doge-named-v1")) return;
      if (App.petDefinition.name !== "Dobe") {
        App.petDefinition.name = "Dobe";
        if (App.save) App.save(true);
      }
      window.localStorage.setItem("sous-doge-named-v1", "1");
    } catch (_e) {
      /* disabled storage — best effort */
    }
  }

  // Bleed the room's OWN wall colour up and floor colour down into the contain
  // margins, so the scene reads as ONE tall room filling the screen — not a
  // square on a flat ("lazy orange") backdrop. Samples the room canvas edges so
  // it adapts to every room (bedroom/kitchen/...) + day-night.
  var bgSampleTick = 0;
  function sampleRoomBackdrop() {
    var canvas = document.querySelector(".graphics-canvas");
    var wrap = document.querySelector(".graphics-wrapper");
    if (!canvas || !wrap || !canvas.width) return;
    if (bgSampleTick++ % 5 !== 0) return; // edges change slowly; ~every 2s
    try {
      var ctx = canvas.getContext("2d");
      var w = canvas.width,
        h = canvas.height;
      var px = function (x, y) {
        var d = ctx.getImageData(x, y, 1, 1).data;
        return "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")";
      };
      var wall = px((w / 2) | 0, 2); // top-centre = back wall
      var floor = px(3, h - 3); // bottom-left corner = floor (dog rarely here)
      wrap.style.setProperty(
        "background",
        "linear-gradient(180deg," + wall + " 0%," + wall + " 34%," + floor + " 70%," + floor + " 100%)",
        "important"
      );
    } catch (_e) {
      /* tainted/odd canvas — keep the CSS fallback */
    }
  }

  // Announce readiness, surface the nutrition HUD, then watch for pet
  // reassignment (hatch / age-up) so the parent can re-handshake.
  setInterval(function () {
    if (!gameReady()) return;
    ensureDobeName();
    ensureHud();
    syncHudVisibility();
    sampleRoomBackdrop();
    if (!announced) announceReady();
    else if (getApp().pet !== lastPet) announceReady();
  }, 400);
})();
