// Elevate draft: age check, open-now status, today's hours and special,
// the phone action bar, and the hero's altimeter.
(function () {
  "use strict";
  clearTimeout(window.__elevateFallback);

  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  if (params.has("still")) root.classList.add("still");
  if (params.has("og")) root.classList.add("og");

  // Opening hours in Marietta time, 24-hour clock, by day (0 = Sunday).
  var HOURS = { 0: [11, 21], 1: [11, 23], 2: [11, 23], 3: [11, 23], 4: [11, 23], 5: [11, 23], 6: [11, 23] };
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var reduceMotion = params.has("still") ||
    (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

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
      text.textContent = "Open now · until " + clock(today[1]);
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

  // The altimeter climbs to the shop's elevation.
  function climb() {
    var el = document.querySelector("[data-count]");
    if (!el) return;
    var to = parseInt(el.getAttribute("data-count"), 10);
    if (reduceMotion) { el.textContent = to.toLocaleString("en-US"); return; }
    var start = null, delay = 250, duration = 1600;
    el.textContent = "0";
    function frame(t) {
      if (start === null) start = t + delay;
      var p = Math.min(1, Math.max(0, (t - start) / duration));
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function ready() {
    root.classList.add("is-ready");
    climb();
  }

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

  markToday(showStatus().day);
  setInterval(function () { markToday(showStatus().day); }, 60000);
})();
