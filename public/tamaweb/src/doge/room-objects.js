/**
 * room-objects.js — Diegetic Dobe nutrition room, Month 1 Week 2.
 *
 * Spawns the manifest's object slots (room-manifest.js) into the live 96×96 world
 * as real engine Object2d's, z-sorted so the dog occludes / is occluded by the
 * floor objects (the one thing the DOM HUD can never do). Procedural solidColor
 * stand-ins this week — value-fill + drill-down + the dark-navy theme come in
 * W3/W4. Each slot's art.kind flips "solid"→"sprite" with zero code change when
 * the founder art lands (the drop-in seam).
 *
 * SAFETY: read-only. This file never writes stats or gold (CI-guarded by
 * room-manifest.test.ts). The hydration action (W4) reuses the doge:logWater
 * postMessage — it does not mutate anything here.
 *
 * FLAG: default OFF. Spawns only when localStorage["sous-doge-room-objects-v1"]
 * === "1" OR the iframe URL carries ?roomobjects=1. Flag off ⇒ nothing spawns ⇒
 * production (the cream DOM HUD) is byte-identical.
 *
 * SW gotcha: edits here won't appear until the /tamaweb/ service worker is
 * unregistered + caches cleared; pnpm build is the real gate.
 */
(function () {
  "use strict";

  var FLAG_KEY = "sous-doge-room-objects-v1";
  var WORLD = 96; // the manifest's world units == the background's width/height
  // Floor objects depth-sort against the pet (it can stand in front/behind);
  // the bubble bars float above the dog at a fixed high z.
  var FLOOR_IDS = {
    hydration: 1,
    protein: 1,
    fiber: 1,
    vitamins: 1,
    "protein-bag": 1,
    "feed-log": 1,
  };
  var BUBBLE_Z = 50;

  var spawned = []; // the live Object2d's, for idempotent despawn
  var lifecycleTimer = null;

  function getApp() {
    try {
      return typeof App !== "undefined" ? App : null;
    } catch (_e) {
      return null;
    }
  }

  function getManifest() {
    return (typeof window !== "undefined" && window.SOUS_ROOM_MANIFEST) || null;
  }

  function isEnabled() {
    try {
      if (window.localStorage.getItem(FLAG_KEY) === "1") return true;
    } catch (_e) {
      /* localStorage blocked — fall through to the query flag */
    }
    return /[?&]roomobjects=1\b/.test(window.location.search);
  }

  function onHomeScene(App) {
    return (
      App &&
      App.currentScene &&
      App.scene &&
      App.currentScene === App.scene.home
    );
  }

  // World (0..96) → live canvas pixels, recomputed every frame so the objects
  // stay correct through resize / fullscreen toggles (no stale projection).
  function applyLayout(me, slot) {
    var d = me.drawer;
    if (!d || !d.canvas) return;
    var cw = d.canvas.width || WORLD;
    var ch = d.canvas.height || WORLD;
    me.x = (slot.anchor.x / WORLD) * cw;
    me.y = (slot.anchor.y / WORLD) * ch;
    me.width = Math.max(1, (slot.size.w / WORLD) * cw);
    me.height = Math.max(1, (slot.size.h / WORLD) * ch);
  }

  function buildObject(App, slot) {
    var isFloor = !!FLOOR_IDS[slot.id];
    var color =
      slot.art && slot.art.kind === "solid" && slot.art.color
        ? slot.art.color
        : { r: 200, g: 200, b: 200 };

    var config = {
      // Explicit width/height from the start so getBoundingBox never derefs the
      // (empty) image before the first onDraw (plan A7 / P1.1).
      x: (slot.anchor.x / WORLD) * 100 + "%",
      y: (slot.anchor.y / WORLD) * 100 + "%",
      width: Math.max(1, slot.size.w),
      height: Math.max(1, slot.size.h),
      z: isFloor ? slot.z : BUBBLE_Z,
      solidColor: { r: color.r, g: color.g, b: color.b },
      // Tag so we can find + remove our own objects, never the game's.
      sousRoomSlot: slot.id,
      onDraw: function (me) {
        applyLayout(me, slot);
      },
      onHover: function (me) {
        me.showOutline("#7CE0E6");
      },
      // config.onClick is wrapped by Object2d so it (a) fires once per press —
      // the wrapper clears App.mouse.isDown, killing the 60fps auto-repeat — and
      // (b) sets App.preventNextGameplayControl, suppressing open_main_menu. W4
      // opens the real drill card here; for W2 we just confirm the wrapper fires.
      onClick: function () {
        try {
          App.playSound &&
            App.playSound("resources/sounds/ui_tab_01.ogg", true);
        } catch (_e) {
          /* sound is cosmetic */
        }
      },
    };

    if (isFloor) {
      // The proven furniture occlusion pattern (App.temp.petBowlObject): let the
      // pet's depth solver place us relative to it by our on-screen y.
      config.onLateDraw = function (me) {
        try {
          if (App.pet && App.pet.setLocalZBasedOnSelf) {
            App.pet.setLocalZBasedOnSelf(me);
          }
        } catch (_e) {
          /* never let depth-sort crash the frame */
        }
      };
    }

    return new Object2d(config);
  }

  function spawnRoomObjects() {
    if (spawned.length) return; // idempotent
    var App = getApp();
    var manifest = getManifest();
    if (!App || !manifest || !onHomeScene(App)) return;
    if (!Object2d || !Object2d.defaultDrawer) return;
    var objects = manifest.objects || [];
    for (var i = 0; i < objects.length; i++) {
      try {
        var obj = buildObject(App, objects[i]);
        if (obj) spawned.push(obj);
      } catch (e) {
        if (typeof console !== "undefined") {
          console.warn("[doge-room] spawn failed for", objects[i] && objects[i].id, e);
        }
      }
    }
  }

  function despawnRoomObjects() {
    for (var i = 0; i < spawned.length; i++) {
      try {
        spawned[i] && spawned[i].removeObject && spawned[i].removeObject();
      } catch (_e) {
        /* already gone */
      }
    }
    spawned = [];
  }

  // Lifecycle: poll on the same cadence the bridge uses. Spawn when (flagged +
  // game ready + on the home scene); despawn the moment we leave home or the
  // flag is cleared. Idempotent both ways, so menu/kitchen/park stay untouched.
  function tick() {
    var App = getApp();
    if (!App || !App.loadingEnded) return;
    var want = isEnabled() && onHomeScene(App);
    if (want && !spawned.length) spawnRoomObjects();
    else if (!want && spawned.length) despawnRoomObjects();
  }

  function start() {
    if (lifecycleTimer) return;
    lifecycleTimer = window.setInterval(tick, 400);
    tick();
  }

  if (typeof window !== "undefined") {
    // Expose for debugging / tests; the lifecycle drives itself.
    window.SOUS_ROOM = {
      spawnRoomObjects: spawnRoomObjects,
      despawnRoomObjects: despawnRoomObjects,
      isEnabled: isEnabled,
      count: function () {
        return spawned.length;
      },
    };
    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  }
})();
