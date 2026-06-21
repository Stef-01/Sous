/**
 * room-objects.js — Diegetic Dobe nutrition room (Month 1, Weeks 2–3).
 *
 * W2: spawn the manifest's slots into the live 96×96 world as real engine
 * Object2d's, z-sorted so the dog occludes the floor objects.
 * W3: each metric now BREATHES with your real eating — a dim "vessel" container
 * plus a band-coloured fill (red <40 / amber 40–70 / green ≥70) whose height
 * tracks the live pct from sous-doge-health-v1. The exact value/target + the
 * drill card + the dark-navy theme are W4; the liquid-`clip` + animation are W5.
 *
 * SAFETY: read-only. Never writes stats or gold (CI-guarded). The health key is
 * parsed once per 400ms lifecycle tick into a cached snapshot — onDraw (60fps)
 * reads only the cache, never JSON.parse per frame.
 *
 * FLAG default OFF: localStorage["sous-doge-room-objects-v1"]==="1" OR
 * ?roomobjects=1. Off ⇒ nothing spawns ⇒ the cream DOM HUD is byte-identical.
 * SW gotcha: edits need the /tamaweb/ service worker unregistered to appear.
 */
(function () {
  "use strict";

  var FLAG_KEY = "sous-doge-room-objects-v1";
  var HEALTH_KEY = "sous-doge-health-v1";
  var WORLD = 96;
  var FLOOR_IDS = {
    hydration: 1,
    protein: 1,
    fiber: 1,
    vitamins: 1,
    "protein-bag": 1,
    "feed-log": 1,
  };
  var BUBBLE_Z = 50;

  var spawned = []; // every live Object2d we own (containers + fills)
  var lifecycleTimer = null;
  var healthCache = null; // parsed once per tick; onDraw reads this only

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
      /* localStorage blocked */
    }
    return /[?&]roomobjects=1\b/.test(window.location.search);
  }
  function onHomeScene(App) {
    return !!(
      App &&
      App.currentScene &&
      App.scene &&
      App.currentScene === App.scene.home
    );
  }

  // ---- data binding (read-only) ----------------------------------------------
  function refreshHealth() {
    try {
      var raw = window.localStorage.getItem(HEALTH_KEY);
      if (!raw) {
        healthCache = null;
        return;
      }
      var p = JSON.parse(raw);
      healthCache = p && Array.isArray(p.stats) ? p : null;
    } catch (_e) {
      healthCache = null; // corrupt value must never throw a frame
    }
  }
  function slotPct(slot) {
    if (!healthCache || !slot.bind || !slot.label) return 0;
    var stats = healthCache.stats;
    for (var i = 0; i < stats.length; i++) {
      if (stats[i] && stats[i].label === slot.label) {
        var n = Number(stats[i].pct);
        return Math.max(0, Math.min(100, isFinite(n) ? n : 0));
      }
    }
    return 0;
  }
  function bandColor(pct, band) {
    var low = (band && band.low) || 30;
    var mid = (band && band.mid) || 70;
    if (pct >= mid) return { r: 110, g: 185, b: 90 }; // green
    if (pct >= low) return { r: 240, g: 170, b: 40 }; // amber
    return { r: 224, g: 92, b: 92 }; // red
  }
  function dim(c, f) {
    return {
      r: Math.round(c.r * f),
      g: Math.round(c.g * f),
      b: Math.round(c.b * f),
    };
  }

  // world (0..96) → live canvas px, every frame (resize/fullscreen-safe)
  function canvasOf(me) {
    var d = me.drawer;
    return d && d.canvas
      ? { cw: d.canvas.width || WORLD, ch: d.canvas.height || WORLD }
      : { cw: WORLD, ch: WORLD };
  }
  function applyLayout(me, slot) {
    var c = canvasOf(me);
    me.x = (slot.anchor.x / WORLD) * c.cw;
    me.y = (slot.anchor.y / WORLD) * c.ch;
    me.width = Math.max(1, (slot.size.w / WORLD) * c.cw);
    me.height = Math.max(1, (slot.size.h / WORLD) * c.ch);
  }

  // ---- object builders -------------------------------------------------------
  function buildContainer(App, slot) {
    var isFloor = !!FLOOR_IDS[slot.id];
    var isMetric = !!(slot.bind && slot.bind.statKey);
    var base =
      slot.art && slot.art.kind === "solid" && slot.art.color
        ? slot.art.color
        : { r: 200, g: 200, b: 200 };
    // Metrics render as a dim "vessel" so the bright fill (the value) reads on
    // top. Feed companions keep their solid placeholder (their meals come in W7).
    var color = isMetric ? dim(base, 0.42) : base;

    var config = {
      x: (slot.anchor.x / WORLD) * 100 + "%",
      y: (slot.anchor.y / WORLD) * 100 + "%",
      width: Math.max(1, slot.size.w),
      height: Math.max(1, slot.size.h),
      z: isFloor ? slot.z : BUBBLE_Z,
      solidColor: { r: color.r, g: color.g, b: color.b },
      sousRoomSlot: slot.id,
      onDraw: function (me) {
        applyLayout(me, slot);
      },
      onHover: function (me) {
        me.showOutline("#7CE0E6");
      },
      // Wrapped by Object2d → fires once/press (clears App.mouse.isDown) and sets
      // preventNextGameplayControl (suppresses open_main_menu). W4 opens the drill.
      onClick: function () {
        try {
          App.playSound &&
            App.playSound("resources/sounds/ui_tab_01.ogg", true);
        } catch (_e) {
          /* cosmetic */
        }
      },
    };
    if (isFloor) {
      config.onLateDraw = function (me) {
        try {
          App.pet &&
            App.pet.setLocalZBasedOnSelf &&
            App.pet.setLocalZBasedOnSelf(me);
        } catch (_e) {
          /* never crash the frame */
        }
      };
    }
    return new Object2d(config);
  }

  // The value fill: a band-coloured sub-rect anchored at the bottom of the slot's
  // fillBox, its height = pct% of the cavity. Tracks the container's z/localZ so
  // it always draws just above its vessel. No interaction (the container owns hover).
  function buildFill(App, slot, container) {
    var fb =
      slot.fill && slot.fill.fillBox
        ? slot.fill.fillBox
        : { x: 0, y: 0, w: slot.size.w, h: slot.size.h };
    return new Object2d({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      z: container.z,
      solidColor: { r: 200, g: 200, b: 200 },
      sousRoomSlot: slot.id + ":fill",
      onDraw: function (me) {
        var c = canvasOf(me);
        var pct = slotPct(slot);
        var frac = Math.max(0, Math.min(1, pct / 100));
        var fx = ((slot.anchor.x + fb.x) / WORLD) * c.cw;
        var fullH = (fb.h / WORLD) * c.ch;
        var fillH = fullH * frac;
        me.width = Math.max(1, (fb.w / WORLD) * c.cw);
        me.height = Math.max(0, fillH);
        me.x = fx;
        me.y = ((slot.anchor.y + fb.y) / WORLD) * c.ch + (fullH - fillH);
        me.solidColor = bandColor(pct, slot.fill && slot.fill.band);
        me.invisible = frac <= 0; // empty ⇒ draw nothing (the vessel shows empty)
      },
      onLateDraw: function (me) {
        me.z = container.z;
        me.localZ = (container.localZ || 0) + 0.01; // just above the vessel
      },
    });
  }

  function spawnRoomObjects() {
    if (spawned.length) return; // idempotent
    var App = getApp();
    var manifest = getManifest();
    if (!App || !manifest || !onHomeScene(App)) return;
    if (typeof Object2d === "undefined" || !Object2d.defaultDrawer) return;
    var objects = manifest.objects || [];
    for (var i = 0; i < objects.length; i++) {
      var slot = objects[i];
      try {
        var container = buildContainer(App, slot);
        if (container) spawned.push(container);
        if (slot.bind && slot.bind.statKey && container) {
          var fill = buildFill(App, slot, container);
          if (fill) spawned.push(fill);
        }
      } catch (e) {
        if (typeof console !== "undefined") {
          console.warn("[doge-room] spawn failed:", slot && slot.id, e);
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

  function tick() {
    var App = getApp();
    if (!App || !App.loadingEnded) return;
    refreshHealth(); // once per tick; onDraw reads the cache only
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
