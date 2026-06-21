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
  // The iframe reads its OWN reduced-motion preference (no host channel needed);
  // the fill animation branches the JS on it — a CSS rule can't stop canvas draws.
  function prefersReducedMotion() {
    try {
      return (
        !!window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    } catch (_e) {
      return false;
    }
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
    // Native CREAM .surface-stylized panel — the game's own stats/menu look
    // (priority A: the cream/beveled pixel-art panel, pixel font, outlined). Uses
    // the same theme tokens as the in-game panels (fallbacks match the HUD).
    s.textContent = [
      ".sous-room-drill{position:fixed;z-index:60;transform:translate(-50%,-100%);",
      "min-width:80px;max-width:170px;background:var(--prim-clr-b-bg,#fff4e8);",
      "color:var(--prim-clr-b-text,#ff8000);border:2px solid var(--prim-clr-b-border,#ffb362);",
      "border-radius:9px 9px 9px 3px;padding:5px 9px 7px;",
      "box-shadow:9px -16px 0 -13px inset var(--prim-clr-b-shadow,#ffcf9d),0 5px 14px rgba(70,42,15,.28);",
      "text-align:center;pointer-events:auto;font-family:'Pixel','PixelOld',monospace;",
      "image-rendering:pixelated;text-shadow:0 1px 0 rgba(255,255,255,.45);display:none;line-height:1.25;}",
      ".sous-rd-title{font-size:9px;letter-spacing:.5px;text-transform:uppercase;opacity:.8;}",
      ".sous-rd-val{font-size:12px;font-weight:bold;margin-top:1px;}",
      ".sous-rd-word{font-size:8.5px;margin-top:1px;opacity:.85;}",
      ".sous-rd-water{margin-top:5px;background:var(--prim-clr-b-text,#ff8000);",
      "border:1px solid var(--prim-clr-b-border,#ffb362);color:var(--prim-clr-b-bg,#fff4e8);",
      "font-family:inherit;font-size:8.5px;padding:3px 8px;border-radius:5px;cursor:pointer;",
      "text-shadow:none;}",
      ".sous-rd-water:active{transform:scale(.95);}",
      // When the diegetic room is on, demote the floating cream HUD — the room
      // objects ARE the nutrition surface, and the HUD would collide with the
      // drill card (both z-index 60). !important beats syncHudVisibility's inline.
      // The spiral FEED-LOG notebook — today's meals shown in-world, always (the
      // reference's "FED TODAY: …"). Same cream panel, left-aligned, pointer-none.
      ".sous-room-feedlog{position:fixed;z-index:59;transform:translate(-50%,-100%);",
      "min-width:86px;max-width:152px;background:var(--prim-clr-b-bg,#fff4e8);",
      "color:var(--prim-clr-b-text,#ff8000);border:2px solid var(--prim-clr-b-border,#ffb362);",
      "border-radius:3px 9px 9px 9px;padding:4px 8px 6px;",
      "box-shadow:9px -14px 0 -12px inset var(--prim-clr-b-shadow,#ffcf9d),0 4px 12px rgba(70,42,15,.25);",
      "pointer-events:none;font-family:'Pixel','PixelOld',monospace;image-rendering:pixelated;",
      "text-shadow:0 1px 0 rgba(255,255,255,.45);display:none;line-height:1.3;}",
      ".sous-rf-title{font-size:8px;letter-spacing:.5px;text-transform:uppercase;opacity:.72;text-align:center;}",
      ".sous-rf-row{font-size:9px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".sous-rf-empty{font-size:8.5px;opacity:.82;text-align:center;}",
      "body.sous-room-active .sous-nutrition-hud{display:none!important;}",
      // The 58% object-position pushes the room DOWN to clear the cream HUD — but
      // when the diegetic room is on, the HUD is demoted, so re-centre the room so
      // it's balanced and the dog isn't jammed against the bottom edge. (The square
      // room still letterboxes in portrait — full edge-to-edge needs the portrait
      // background PNG, see DOGE-ART-HANDOFF.md.) positionDrill uses the SAME 0.50.
      "body.sous-room-active .graphics-wrapper.fullscreen .graphics-canvas{object-position:center 50%!important;}",
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
    var offY = rect.top + (rect.height - dispH) * 0.5; // matches the room-active 50%
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
    // Feed companions show their meals PERSISTENTLY (the spiral notebook), not in
    // a tap drill — so the drill is metric-only.
    if (!slot || (slot.bind && slot.bind.feed)) {
      hideDrill();
      return;
    }
    var bind = slotBinding(slot);
    var el = drillEl();
    var html = '<div class="sous-rd-title">' + escapeHtml(slot.label) + "</div>";
    var value = bind.detailText || bind.coverageText || "";
    var band = bandColor(bind.pct, slot.fill && slot.fill.band);
    // Value inherits the panel's orange (native); the WORD carries the red/amber/
    // green health hint so the band signal survives the cream restyle.
    if (value) html += '<div class="sous-rd-val">' + escapeHtml(value) + "</div>";
    html +=
      '<div class="sous-rd-word" style="color:rgb(' +
      band.r + "," + band.g + "," + band.b +
      ')">' + escapeHtml(bind.word) + "</div>";
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
    updateProxies();
  }

  // ---- the persistent spiral FEED-LOG notebook (today's meals, in-world) ------
  var feedLogNode = null;
  function feedLogEl() {
    if (feedLogNode && feedLogNode.isConnected) return feedLogNode;
    ensureDrillStyle();
    feedLogNode = document.createElement("div");
    feedLogNode.className = "sous-room-feedlog";
    document.body.appendChild(feedLogNode);
    return feedLogNode;
  }
  function removeFeedLog() {
    if (feedLogNode && feedLogNode.parentNode)
      feedLogNode.parentNode.removeChild(feedLogNode);
    feedLogNode = null;
  }
  function updateFeedLog() {
    var slot = findSlot("feed-log");
    if (!slot) return;
    var meals =
      healthCache && Array.isArray(healthCache.meals) ? healthCache.meals : [];
    var el = feedLogEl();
    var html;
    if (meals.length) {
      html = '<div class="sous-rf-title">Fed today</div>';
      var shown = meals.slice(0, 3);
      for (var i = 0; i < shown.length; i++)
        html += '<div class="sous-rf-row">' + escapeHtml(shown[i]) + "</div>";
      if (meals.length > shown.length)
        html +=
          '<div class="sous-rf-title">+' +
          (meals.length - shown.length) +
          " more</div>";
    } else {
      html =
        '<div class="sous-rf-title">Feed log</div>' +
        "<div class=\"sous-rf-empty\">Dobe's hungry — feed him today</div>";
    }
    el.innerHTML = html;
    positionDrill(el, slot); // reuse the contain+58% projection
    el.style.display = "block";
  }

  // ---- a11y focus proxies -----------------------------------------------------
  // Canvas objects aren't in the DOM, so keyboard / screen-reader users can't
  // reach them. A parallel list of sr-only <button>s (Tab-order = manifest order)
  // mirrors each object: Enter/Space selects (opens the same drill card), and the
  // aria-label carries the live value + word so the canvas meaning isn't lost.
  var proxyWrap = null;
  function proxyAriaLabel(slot) {
    var bind = slotBinding(slot);
    if (bind.feed) {
      return (
        slot.label +
        ": " +
        (bind.meals && bind.meals.length
          ? bind.meals.slice(0, 3).join(", ")
          : "nothing logged yet")
      );
    }
    var val = bind.detailText || bind.coverageText || "";
    return slot.label + (val ? ": " + val : "") + (bind.word ? ", " + bind.word : "");
  }
  function ensureProxies() {
    if (proxyWrap && proxyWrap.isConnected) return;
    var m = getManifest();
    if (!m || !document.body) return;
    proxyWrap = document.createElement("div");
    proxyWrap.className = "sous-room-proxies";
    proxyWrap.setAttribute("role", "group");
    proxyWrap.setAttribute("aria-label", "Dobe's nutrition — your eating today");
    // sr-only: focusable but off-screen (the canvas + drill card are the visual).
    proxyWrap.style.cssText =
      "position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;";
    for (var i = 0; i < m.objects.length; i++) {
      var slot = m.objects[i];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-room-proxy", slot.id);
      btn.textContent = slot.label;
      (function (id) {
        btn.addEventListener("click", function () {
          selectSlot(id);
        });
      })(slot.id);
      proxyWrap.appendChild(btn);
    }
    document.body.appendChild(proxyWrap);
    updateProxies();
  }
  function updateProxies() {
    if (!proxyWrap) return;
    var btns = proxyWrap.querySelectorAll("[data-room-proxy]");
    for (var i = 0; i < btns.length; i++) {
      var id = btns[i].getAttribute("data-room-proxy");
      var slot = findSlot(id);
      if (!slot) continue;
      btns[i].setAttribute("aria-label", proxyAriaLabel(slot));
      btns[i].setAttribute(
        "aria-pressed",
        roomSelected === id ? "true" : "false",
      );
    }
  }
  function removeProxies() {
    if (proxyWrap && proxyWrap.parentNode)
      proxyWrap.parentNode.removeChild(proxyWrap);
    proxyWrap = null;
  }

  // ---- the founder-art drop-in seam (AssetLoader) -----------------------------
  // dev-only: ?roomart=<slotId>:<path> swaps ONE slot's sprite at runtime so a
  // single delivered asset can be eyeballed in place before it's in the manifest.
  function artOverride(id) {
    try {
      var m = /[?&]roomart=([^&]+)/.exec(window.location.search);
      if (!m) return null;
      var parts = decodeURIComponent(m[1]).split(":");
      return parts[0] === id && parts[1]
        ? { kind: "sprite", src: parts.slice(1).join(":") }
        : null;
    } catch (_e) {
      return null;
    }
  }
  // The ONE drop-in: art.kind:"solid"→"sprite" loads the founder PNG. The Drawer
  // draws solidColor ONLY when no image is loaded (Drawer.js:204 is an else-if
  // after the image branch), so the procedural rect is the AUTOMATIC fallback —
  // during load AND on a 404/decode error (image.naturalWidth stays 0). Zero
  // logic change to bind/hover/select/fill: art is cosmetic-only.
  function applyArt(obj, slot) {
    var art = artOverride(slot.id) || slot.art;
    if (art && art.kind === "sprite" && art.src) {
      try {
        obj.setImg(art.src);
      } catch (_e) {
        /* falls back to solidColor automatically */
      }
    }
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
    var obj = new Object2d(config);
    applyArt(obj, slot); // founder sprite if one is set; else the solidColor stand-in
    return obj;
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
        var target = Math.max(0, Math.min(1, pct / 100));
        // Animate the LEVEL toward the target (~250ms ease); start empty so the
        // room visibly fills up on open. Colour uses the real pct immediately.
        if (me._df == null) me._df = 0;
        if (prefersReducedMotion()) me._df = target;
        else {
          var d = target - me._df;
          me._df += Math.abs(d) < 0.004 ? d : d * 0.16;
        }
        var frac = me._df;
        var fx = ((slot.anchor.x + fb.x) / WORLD) * c.cw;
        var fullH = (fb.h / WORLD) * c.ch;
        var fillH = fullH * frac;
        me.width = Math.max(1, (fb.w / WORLD) * c.cw);
        me.height = Math.max(0, fillH);
        me.x = fx;
        me.y = ((slot.anchor.y + fb.y) / WORLD) * c.ch + (fullH - fillH);
        me.solidColor = bandColor(pct, slot.fill && slot.fill.band);
        me.invisible = frac <= 0.001;
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
    ensureProxies();
    updateFeedLog();
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
    removeFeedLog();
    removeProxies();
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
    else if (want && spawned.length) {
      updateProxies(); // keep the SR labels live
      updateFeedLog(); // the always-on spiral notebook (today's meals)
      if (roomSelected) renderDrill(); // keep the open card live
    }
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
