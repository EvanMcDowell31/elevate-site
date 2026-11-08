// Elevate draft: age check, open-now status, today's hours and special,
// the phone action bar, and the smoke that rises from the headline's ember.
(function () {
  "use strict";
  clearTimeout(window.__elevateFallback);

  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  var still = params.has("still");
  if (still) root.classList.add("still");
  if (params.has("og")) root.classList.add("og");
  var reduceMotion = still ||
    (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // Opening hours in Marietta time, 24-hour clock, by day (0 = Sunday).
  var HOURS = { 0: [11, 21], 1: [11, 23], 2: [11, 23], 3: [11, 23], 4: [11, 23], 5: [11, 23], 6: [11, 23] };
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function clock(h) { return (h % 12 || 12) + (h < 12 ? " AM" : " PM"); }

  function mariettaNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
      }).formatToParts(new Date());
      var get = function (type) {
        for (var i = 0; i < parts.length; i++) if (parts[i].type === type) return parts[i].value;
        return "";
      };
      return { day: DAYS.indexOf(get("weekday")), mins: (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function showStatus() {
    var now = mariettaNow();
    var el = document.querySelector("[data-status]");
    if (!el || now.day < 0) return now;
    var text = el.querySelector(".status-text");
    var today = HOURS[now.day];
    if (now.mins >= today[0] * 60 && now.mins < today[1] * 60) {
      el.classList.add("is-open");
      text.textContent = "Open until " + clock(today[1]);
    } else {
      el.classList.remove("is-open");
      text.textContent = now.mins < today[0] * 60
        ? "Closed · opens " + clock(today[0])
        : "Closed · opens " + clock(HOURS[(now.day + 1) % 7][0]) + " tomorrow";
    }
    return now;
  }

  function markToday(day) {
    document.querySelectorAll(".is-today").forEach(function (n) { n.classList.remove("is-today"); });
    document.querySelectorAll('[data-day="' + day + '"]').forEach(function (n) { n.classList.add("is-today"); });
  }

  // Smoke: soft puffs leave the ember, thicken, curl and drift up and to the right.
  function smoke() {
    var hero = document.querySelector(".hero");
    var canvas = hero && hero.querySelector(".smoke");
    var ember = hero && hero.querySelector(".ember");
    var ctx = canvas && canvas.getContext && canvas.getContext("2d");
    if (!ctx || !ember) return;

    var seed = 20261108; // the same plume on every load, so screenshots match
    function rand() {
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    var puffs = [];
    for (var s = 0; s < 4; s++) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var g = c.getContext("2d");
      for (var b = 0; b < 8; b++) {
        var bx = 64 + (rand() - .5) * 46, by = 64 + (rand() - .5) * 46, br = 20 + rand() * 26;
        var grad = g.createRadialGradient(bx, by, 0, bx, by, br);
        grad.addColorStop(0, "rgba(238,243,236,.11)");
        grad.addColorStop(1, "rgba(238,243,236,0)");
        g.fillStyle = grad;
        g.beginPath(); g.arc(bx, by, br, 0, 6.2832); g.fill();
      }
      puffs.push(c);
    }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, ex = 0, ey = 0, k = 1, wind = 0, parts = [], frame = 0;

    function measure() {
      var hr = hero.getBoundingClientRect(), er = ember.getBoundingClientRect();
      if (hr.width !== W || hr.height !== H) {
        W = hr.width; H = hr.height;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }
      ex = er.left - hr.left + er.width / 2;
      ey = er.top - hr.top + er.height * .3;
      k = Math.max(.65, Math.min(1.2, W / 1200));
      wind = (W < 700 ? -.0018 : .0026) * k; // on phones, drift back over the leaves
    }

    function spawn() {
      parts.push({
        x: ex + (rand() - .5) * 2, y: ey,
        vx: (rand() - .5) * .18, vy: -(.5 + rand() * .3) * k,
        r: (2 + rand() * 2) * k, grow: (.2 + rand() * .14) * k,
        rot: rand() * 6.283, spin: (rand() - .5) * .012,
        life: 0, max: 360 + rand() * 200, puff: puffs[(rand() * puffs.length) | 0], phase: rand() * 6.283
      });
    }

    function step() {
      frame++;
      if (frame % 3 === 0) spawn();
      if (frame % 30 === 0) measure();
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i], t = ++p.life / p.max;
        p.vx += Math.sin(p.life * .022 + p.phase) * .045 * t + wind;
        p.vx *= .994; p.vy *= .9988;
        p.x += p.vx; p.y += p.vy;
        p.r += p.grow * (1 + 3 * t); p.rot += p.spin;
        if (p.life >= p.max || p.y < -p.r * 1.2) parts.splice(i, 1);
      }
    }

    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], t = p.life / p.max;
        ctx.globalAlpha = (t < .1 ? t / .1 : Math.pow(1 - (t - .1) / .9, 1.4)) * .42;
        var cos = Math.cos(p.rot) * dpr, sin = Math.sin(p.rot) * dpr;
        ctx.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr);
        ctx.drawImage(p.puff, -p.r, -p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
    }

    measure();
    for (var w = 0; w < 300; w++) step();
    draw();
    if (reduceMotion) return;

    var running = false, onScreen = true;
    function loop() { if (!running) return; step(); draw(); requestAnimationFrame(loop); }
    function play() { if (!running && onScreen && !document.hidden) { running = true; requestAnimationFrame(loop); } }
    function pause() { running = false; }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) play(); else pause();
      }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) pause(); else play(); });
    window.addEventListener("resize", measure, { passive: true });
    play();
  }

  function ready() { root.classList.add("is-ready"); }

  // The phone action bar shows once the hero's buttons scroll away.
  var dock = document.querySelector(".dock");
  var heroActions = document.querySelector(".hero .actions");
  if (dock && heroActions && "IntersectionObserver" in window) {
    root.classList.add("dock-auto");
    new IntersectionObserver(function (entries) {
      var heroInView = entries[0].isIntersecting;
      dock.classList.toggle("is-shown", !heroInView);
      if (heroInView) dock.setAttribute("inert", ""); else dock.removeAttribute("inert");
    }, { rootMargin: "0px 0px -72px 0px" }).observe(heroActions);
  }

  // Age check, remembered on this device.
  var KEY = "elevate-21";
  function passed() { try { return localStorage.getItem(KEY) === "yes"; } catch (e) { return false; } }
  function remember() { try { localStorage.setItem(KEY, "yes"); } catch (e) { /* private mode: ask again next time */ } }

  var gate = document.querySelector("[data-gate]");
  function setInert(on) {
    document.querySelectorAll("body > :not([data-gate]):not(.dock)").forEach(function (n) {
      if (on) n.setAttribute("inert", ""); else n.removeAttribute("inert");
    });
  }

  if (gate && !params.has("nogate") && !passed()) {
    gate.hidden = false;
    root.classList.add("gate-open");
    setInert(true);
    var yes = gate.querySelector("[data-gate-yes]");
    var no = gate.querySelector("[data-gate-no]");
    yes.focus();
    yes.addEventListener("click", function () {
      remember();
      gate.hidden = true;
      root.classList.remove("gate-open");
      setInert(false);
      ready();
    });
    no.addEventListener("click", function () {
      gate.querySelector("[data-gate-actions]").hidden = true;
      var message = gate.querySelector("[data-gate-message]");
      message.hidden = false;
      message.setAttribute("tabindex", "-1");
      message.focus();
    });
  } else {
    ready();
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(smoke); else smoke();

  markToday(showStatus().day);
  setInterval(function () { markToday(showStatus().day); }, 60000);
})();
