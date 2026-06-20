/*
 * sous-bridge.js — Sous-authored receiver injected into the Doge game (in an
 * iframe under the Sous origin). This is the ONLY game-side integration code;
 * the vendored Tamaweb engine is never modified (two tiny additive customImage
 * render branches in App.js are the sole exception, added in P3).
 *
 * It mirrors the typed protocol in src/lib/doge/bridge-protocol.ts. Loaded by a
 * plain <script> tag after Main.js, so it sees the game globals (App, Activities,
 * Pet) directly. See docs/DOGE-INTEGRATION-PLAN.md §1.5.
 *
 * Contract:
 *   - announce `doge:ready` once the game has booted (App.loadingEnded + App.pet),
 *     and re-announce when App.pet is reassigned (hatch / age-up).
 *   - accept parent→game messages only when origin + channel + version match AND
 *     the nonce equals the one delivered by `sous:hello` (anti-forgery).
 *   - dispatch verbs: sous:gold:credit · doge:grantDish · doge:say · sous:setMood.
 *   - idempotency is the parent's authority (it never re-posts a settled txn); we
 *     keep an in-memory seen-set as belt-and-suspenders within a session.
 */
(function () {
  "use strict";

  var CHANNEL = "sous-doge";
  var V = 1;

  var nonce = null; // set by sous:hello
  var announced = false; // have we posted doge:ready for the current pet?
  var lastPet = null; // identity watch for hatch / age-up
  var seenTxn = Object.create(null); // txnId -> true (per-session dedupe)

  function gameReady() {
    return !!(window.App && window.App.loadingEnded && window.App.pet);
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
    lastPet = window.App.pet;
    post("doge:ready");
  }

  // ---- verb handlers (each re-resolves App.pet fresh) -------------------------

  function handleGold(d) {
    var amt = Math.floor(Number(d.amount));
    if (!(amt > 0 && amt <= 200)) {
      post("doge:ack", { txnId: d.txnId, credited: 0 });
      return;
    }
    if (seenTxn[d.txnId]) {
      post("doge:ack", { txnId: d.txnId, credited: 0 }); // idempotent re-ack
      return;
    }
    seenTxn[d.txnId] = true;
    var pet = window.App.pet;
    pet.stats.gold = (pet.stats.gold || 0) + amt;
    if (window.App.save) window.App.save(true);
    // `juice` (money-bag animation) is a P4 cosmetic refinement; gold lands
    // reliably regardless. Left intentionally un-juiced here.
    post("doge:ack", { txnId: d.txnId, credited: amt });
  }

  // Map a DogeFoodDef (rule-7 dish serving) onto the native food-def shape.
  // `customImage` is honored by the P3 render patch; until then the fallback
  // sprite renders and feeding still works (inventory keys off `id`).
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
    var App = window.App;
    if (!App.definitions.food) App.definitions.food = {};
    // register-if-absent (idempotent across re-posts)
    if (!App.definitions.food[def.id]) App.definitions.food[def.id] = toNativeFoodDef(def);
    // grant exactly one serving, guarded by txnId so a re-post never double-adds
    if (!seenTxn[d.txnId]) {
      seenTxn[d.txnId] = true;
      App.addNumToObject(App.pet.inventory.food, def.id, 1);
      if (App.save) App.save(true);
    }
    post("doge:granted", { txnId: d.txnId, id: def.id });
  }

  function handleSay(d) {
    var pet = window.App.pet;
    // suppress while the pet is mid-script or asleep (matches native chatter gating)
    var asleep = pet.stats && pet.stats.is_sleeping;
    var scripted = typeof pet.isDuringScriptedState === "function" && pet.isDuringScriptedState();
    if (asleep || scripted) {
      post("doge:said", { sayId: d.sayId }); // consumed (intentionally not shown)
      return;
    }
    var text = String(d.text || "").replace(/[<>]/g, ""); // dodge the raw-HTML bubble branch
    if (!text) {
      post("doge:said", { sayId: d.sayId });
      return;
    }
    pet.say(text, typeof d.ms === "number" ? d.ms : 6000);
    post("doge:said", { sayId: d.sayId });
  }

  function handleSetMood(_d) {
    // P1: forward-compat no-op. P6 maps DogeMood → App.pet.stats so the in-iframe
    // pet's expression mirrors Sous's computePetState.
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
    // every other parent→game message must carry the session nonce
    if (!nonce || d.nonce !== nonce) return;
    // if the game isn't ready, drop it — the parent retries on the next doge:ready
    if (!gameReady()) return;

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
      // never let a malformed message crash the game loop
      if (window.console) console.warn("[doge-bridge] verb failed:", d.type, err);
    }
  }

  window.addEventListener("message", onMessage);

  // Announce readiness, then keep watching for pet reassignment (hatch / age-up)
  // so the parent can re-handshake + re-flush its outbox.
  var t = setInterval(function () {
    if (!gameReady()) return;
    if (!announced) {
      announceReady();
    } else if (window.App.pet !== lastPet) {
      announceReady(); // pet changed — re-announce
    }
  }, 400);
  // (interval runs for the life of the iframe; cost is negligible)
  void t;
})();
