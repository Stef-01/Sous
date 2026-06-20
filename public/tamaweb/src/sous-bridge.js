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
  var seenTxn = Object.create(null); // txnId -> true (per-session dedupe)

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
    seenTxn[d.txnId] = true;
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
    if (!App.definitions.food) App.definitions.food = {};
    if (!App.definitions.food[def.id]) App.definitions.food[def.id] = toNativeFoodDef(def);
    if (!seenTxn[d.txnId]) {
      seenTxn[d.txnId] = true;
      App.addNumToObject(App.pet.inventory.food, def.id, 1);
      if (App.save) App.save(true);
    }
    post("doge:granted", { txnId: d.txnId, id: def.id });
  }

  function handleSay(d) {
    var pet = getApp().pet;
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
    var pet = getApp().pet;
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
      ".sous-nutrition-hud{position:absolute;top:6px;left:6px;right:6px;z-index:60;" +
      "background:rgba(38,31,44,.82);border:2px solid rgba(255,255,255,.10);border-radius:12px;" +
      "padding:7px 9px 8px;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,.4);" +
      "-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);}" +
      ".sous-hud-title{font-size:8.5px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;" +
      "color:#fff;opacity:.78;margin:0 0 5px 46px;}" +
      ".sous-hud-row{display:flex;align-items:center;gap:5px;margin:2.5px 0;}" +
      ".sous-hud-ic{width:13px;text-align:center;color:#f5c542;flex:none;}" +
      ".sous-hud-ic i{font-size:11px;}" +
      ".sous-hud-lb{width:54px;font-size:8.5px;font-weight:700;color:rgba(255,255,255,.85);" +
      "text-transform:uppercase;flex:none;}" +
      ".sous-nutrition-hud .progressbar{flex:1;min-width:0;margin:0;}" +
      ".sous-hud-pc{width:30px;text-align:right;font-size:9px;font-weight:800;color:#fff;flex:none;}" +
      ".sous-hud-status{font-size:8.5px;color:#f5c542;margin-top:5px;font-weight:600;}";
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
        '<div class="sous-hud-title">Dobe’s health</div>' +
        '<div class="sous-hud-status">Log meals in Sous to fill these.</div>';
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
    hud.innerHTML =
      '<div class="sous-hud-title">Dobe’s health · your nutrition</div>' +
      rows +
      (data.status ? '<div class="sous-hud-status">' + data.status + "</div>" : "");
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
      wrap.appendChild(hud);
      renderHud(hud);
      if (!hudTimer)
        hudTimer = setInterval(function () {
          var h = document.querySelector(".sous-nutrition-hud");
          if (h) renderHud(h);
        }, 3000);
    }
  }

  // Announce readiness, surface the nutrition HUD, then watch for pet
  // reassignment (hatch / age-up) so the parent can re-handshake.
  setInterval(function () {
    if (!gameReady()) return;
    ensureHud();
    if (!announced) announceReady();
    else if (getApp().pet !== lastPet) announceReady();
  }, 400);
})();
