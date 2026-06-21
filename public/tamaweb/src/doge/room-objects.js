/**
 * room-objects.js — Diegetic Dobe nutrition room (Month 1, Weeks 2–4).
 *
 * W2: spawn the manifest's slots as engine Object2d's, z-occluded by the dog.
 * W3: each metric BREATHES — a dim vessel + a band-coloured fill tracking live pct.
 * W4: each object is individually SELECTABLE + DRILLABLE — click → a dark-navy drill
 *     card (projected over the object) shows the exact value/target (detail metrics)
 *     or coverage copy (mood/vitamins, never a fabricated number) or the meals (feed
 *     companions); the hydration card carries "Log a glass" → doge:logWater. The
 *     liquid-clip + animation + a11y focus proxies + HUD demotion are W4b/W5.
 *
 * SAFETY: read-only. Never writes stats or gold (CI-guarded). The water action only
 * POSTS doge:logWater (via the receiver's exposed post) — the parent owns the write.
 * Health key parsed once per 400ms tick into a cache; onDraw (60fps) reads the cache.
 *
 * FLAG default OFF: sous-doge-room-objects-v1 / ?roomobjects=1. Off ⇒ nothing spawns.
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
  // Persistent "selected" outline (engine drop-shadow stack), distinct from the
  // cyan hover — NOT showBoundingBox (that is a 25%-opacity red debug wash).
  var OUTLINE_SELECTED =
    "drop-shadow(0px 1px 0px #ffce6b) drop-shadow(1px 0px 0px #ffce6b) " +
    "drop-shadow(-1px 0px 0px #ffce6b) drop-shadow(0px -1px 0px #ffce6b)";

  var spawned = [];
  var lifecycleTimer = null;
  var healthCache = null;
  var roomSelected = null; // the selected slot id (the object-box + drill)

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
  function findSlot(id) {
    var m = getManifest();
    if (!m) return null;
    for (var i = 0; i < m.objects.length; i++)
      if (m.objects[i].id === id) return m.objects[i];
    return null;
  }
  function isEnabled() {
    try {
      if (window.localStorage.getItem(FLAG_KEY) === "1") return true;
    } catch (_e) {
      /* blocked */
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

  // ---- data binding (read-only, mirrors src/lib/doge/room-binding.ts) ---------
  function refreshHealth() {
    try {
      var raw = window.localStorage.getItem(HEALTH_KEY);
      healthCache = raw && JSON.parse(raw);
      if (!healthCache || !Array.isArray(healthCache.stats)) healthCache = null;
    } catch (_e) {
      healthCache = null;
    }
  }
  function clampPct(p) {
    var n = Number(p);
    return Math.max(0, Math.min(100, isFinite(n) ? n : 0));
  }
  function pctWord(p) {
    return p >= 80
      ? "Great"
      : p >= 55
        ? "On track"
        : p >= 30
          ? "Getting there"
          : "Low";
  }
  function fmtDetail(d) {
    if (!d || typeof d.value !== "number" || typeof d.target !== "number")
      return null;
    if (d.unit === "glass") return d.value + " / " + d.target + " glasses";
    if (d.unit === "g") return d.value + "g / " + d.target + "g";
    return (d.value + " / " + d.target + " " + (d.unit || "")).trim();
  }
  function resolveCoverage(t, pct) {
    return String(t).replace(/\{pct\}/g, String(Math.round(pct)));
  }
  function statFor(slot) {
    if (!healthCache) return null;
    for (var i = 0; i < healthCache.stats.length; i++) {
      var s = healthCache.stats[i];
      if (s && s.label === slot.label) return s;
    }
    return null;
  }
  function slotPct(slot) {
    var s = statFor(slot);
    return s ? clampPct(s.pct) : 0;
  }
  function slotBinding(slot) {
    if (slot.bind && slot.bind.feed) {
      var meals = healthCache && Array.isArray(healthCache.meals) ? healthCache.meals : [];
      return { feed: true, meals: meals, word: "" };
    }
    var s = statFor(slot);
    var pct = s ? clampPct(s.pct) : 0;
    var b = { pct: pct, word: pctWord(pct), detailText: null, coverageText: null };
    if (slot.bind.detailUnit) b.detailText = s ? fmtDetail(s.detail) : null;
    else if (slot.bind.coverageCopy)
      b.coverageText = resolveCoverage(slot.bind.coverageCopy, pct);
    return b;
  }
  function bandColor(pct, band) {
    var low = (band && band.low) || 30;
    var mid = (band && band.mid) || 70;
    if (pct >= mid) return { r: 110, g: 185, b: 90 };
    if (pct >= low) return { r: 240, g: 170, b: 40 };
    return { r: 224, g: 92, b: 92 };
  }
  function dim(c, f) {
    return {
      r: Math.round(c.r * f),
      g: Math.round(c.g * f),
      b: Math.round(c.b * f),
    };
  }

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

  // ---- the drill card (DOM, dark-navy theme) ----------------------------------
  function escapeHtml(s) {
    return String(s).replace(/[<>&"]/g, function (ch) {
      return { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[ch];
    });
  }
  function ensureDrillStyle() {
    if (document.getElementById("sous-rd-style")) return;
    var s = document.createElement("style");
    s.id = "sous-rd-style";
    s.textContent = [
      ".sous-room-drill{position:fixed;z-index:60;transform:translate(-50%,-100%);",
      "min-width:78px;max-width:168px;background:#1b2447;border:2px solid #46598f;",
      "border-radius:7px;padding:5px 8px 7px;box-shadow:0 5px 16px rgba(8,12,28,.55);",
      "text-align:center;pointer-events:auto;font-family:'Pixel','PixelOld',monospace;",
      "image-rendering:pixelated;display:none;line-height:1.25;}",
      ".sous-rd-title{color:#ffb96b;font-size:9px;letter-spacing:.5px;text-transform:uppercase;}",
      ".sous-rd-val{color:#ffe1b0;font-size:12px;font-weight:bold;margin-top:1px;}",
      ".sous-rd-word{color:#9fb0dd;font-size:8.5px;margin-top:1px;}",
      ".sous-rd-water{margin-top:5px;background:#3a7bd0;border:1px solid #6aa0e6;color:#fff;",
      "font-family:inherit;font-size:8.5px;padding:3px 8px;border-radius:5px;cursor:pointer;}",
      ".sous-rd-water:active{transform:scale(.95);}",
      // When the diegetic room is on, demote the floating cream HUD — the room
      // objects ARE the nutrition surface, and the HUD would collide with the
      // drill card (both z-index 60). !important beats syncHudVisibility's inline.
      "body.sous-room-active .sous-nutrition-hud{display:none!important;}",
    ].join("");
    (document.head || document.documentElement).appendChild(s);
  }
  var drillNode = null;
  function drillEl() {
    if (drillNode && drillNode.isConnected) return drillNode;
    ensureDrillStyle();
    drillNode = document.createElement("div");
    drillNode.className = "sous-room-drill";
    document.body.appendChild(drillNode);
    return drillNode;
  }
  function hideDrill() {
    if (drillNode) drillNode.style.display = "none";
  }
  function containerFor(id) {
    for (var i = 0; i < spawned.length; i++)
      if (spawned[i] && spawned[i].sousRoomSlot === id) return spawned[i];
    return null;
  }
  // world canvas px → iframe-viewport CSS px, through object-fit:contain +
  // object-position:center 58% (the /doge fullscreen canvas). Refined for the
  // windowed view + resize tracking in W10.
  function positionDrill(el, slot) {
    var App = getApp();
    var container = containerFor(slot.id);
    if (!App || !container || !App.drawer || !App.drawer.canvas) return;
    var canvas = App.drawer.canvas;
    var rect = canvas.getBoundingClientRect();
    var cw = canvas.width || WORLD;
    var ch = canvas.height || WORLD;
    var scale = Math.min(rect.width / cw, rect.height / ch);
    var dispW = cw * scale;
    var dispH = ch * scale;
    var offX = rect.left + (rect.width - dispW) * 0.5;
    var offY = rect.top + (rect.height - dispH) * 0.58;
    var cx = (container.x || 0) + (container.width || 0) / 2;
    var cy = container.y || 0;
    el.style.left = Math.round(offX + cx * scale) + "px";
    el.style.top = Math.round(offY + cy * scale - 6) + "px";
  }
  function renderDrill() {
    if (!roomSelected) {
      hideDrill();
      return;
    }
    var slot = findSlot(roomSelected);
    if (!slot) {
      hideDrill();
      return;
    }
    var bind = slotBinding(slot);
    var el = drillEl();
    var html = '<div class="sous-rd-title">' + escapeHtml(slot.label) + "</div>";
    if (bind.feed) {
      var line =
        bind.meals && bind.meals.length
          ? bind.meals.slice(0, 3).join(" · ")
          : "Nothing logged yet";
      html += '<div class="sous-rd-val" style="font-size:9.5px">' + escapeHtml(line) + "</div>";
    } else {
      var value = bind.detailText || bind.coverageText || "";
      var band = bandColor(bind.pct, slot.fill && slot.fill.band);
      if (value)
        html +=
          '<div class="sous-rd-val" style="color:rgb(' +
          band.r + "," + band.g + "," + band.b +
          ')">' + escapeHtml(value) + "</div>";
      html += '<div class="sous-rd-word">' + escapeHtml(bind.word) + "</div>";
    }
    if (slot.bind.action === "water")
      html += '<button class="sous-rd-water" type="button">Log a glass</button>';
    el.innerHTML = html;
    var wbtn = el.querySelector(".sous-rd-water");
    if (wbtn)
      wbtn.onclick = function () {
        try {
          if (window.SOUS_DOGE_POST) window.SOUS_DOGE_POST("doge:logWater");
        } catch (_e) {
          /* parent gone */
        }
      };
    positionDrill(el, slot);
    el.style.display = "block";
  }
  function selectSlot(id) {
    roomSelected = roomSelected === id ? null : id;
    renderDrill();
  }

  // ---- object builders --------------------------------------------------------
  function buildContainer(App, slot) {
    var isFloor = !!FLOOR_IDS[slot.id];
    var isMetric = !!(slot.bind && slot.bind.statKey);
    var baseC =
      slot.art && slot.art.kind === "solid" && slot.art.color
        ? slot.art.color
        : { r: 200, g: 200, b: 200 };
    var color = isMetric ? dim(baseC, 0.42) : baseC;
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
        // persistent selected outline; hover (onHover) shows cyan on top.
        me.filter = roomSelected === slot.id ? OUTLINE_SELECTED : "";
      },
      onHover: function (me) {
        me.showOutline("#7CE0E6");
      },
      onClick: function () {
        // The Object2d wrapper already cleared App.mouse.isDown (one tap = one
        // call) and set preventNextGameplayControl (no open_main_menu).
        selectSlot(slot.id);
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
          /* never crash */
        }
      };
    }
    return new Object2d(config);
  }

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
        me.invisible = frac <= 0;
      },
      onLateDraw: function (me) {
        me.z = container.z;
        me.localZ = (container.localZ || 0) + 0.01;
      },
    });
  }

  function spawnRoomObjects() {
    if (spawned.length) return;
    var App = getApp();
    var manifest = getManifest();
    if (!App || !manifest || !onHomeScene(App)) return;
    if (typeof Object2d === "undefined" || !Object2d.defaultDrawer) return;
    ensureDrillStyle(); // also carries the cream-HUD demotion rule
    try {
      document.body.classList.add("sous-room-active");
    } catch (_e) {
      /* no body yet */
    }
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
        if (typeof console !== "undefined")
          console.warn("[doge-room] spawn failed:", slot && slot.id, e);
      }
    }
  }

  function despawnRoomObjects() {
    for (var i = 0; i < spawned.length; i++) {
      try {
        spawned[i] && spawned[i].removeObject && spawned[i].removeObject();
      } catch (_e) {
        /* gone */
      }
    }
    spawned = [];
    roomSelected = null;
    hideDrill();
    try {
      document.body.classList.remove("sous-room-active"); // restore the cream HUD
    } catch (_e) {
      /* gone */
    }
  }

  function tick() {
    var App = getApp();
    if (!App || !App.loadingEnded) return;
    refreshHealth();
    var want = isEnabled() && onHomeScene(App);
    if (want && !spawned.length) spawnRoomObjects();
    else if (!want && spawned.length) despawnRoomObjects();
    else if (want && roomSelected) renderDrill(); // keep the open card live
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
      select: selectSlot,
      selected: function () {
        return roomSelected;
      },
      count: function () {
        return spawned.length;
      },
    };
    if (document.readyState === "loading")
      window.addEventListener("DOMContentLoaded", start);
    else start();
  }
})();
