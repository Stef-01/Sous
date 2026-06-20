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

  function handleSetMood(_d) {
    // P1: forward-compat no-op. P6 maps DogeMood → App.pet.stats.
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

  // Announce readiness, then watch for pet reassignment (hatch / age-up) so the
  // parent can re-handshake + re-flush its outbox.
  setInterval(function () {
    if (!gameReady()) return;
    if (!announced) announceReady();
    else if (getApp().pet !== lastPet) announceReady();
  }, 400);
})();
