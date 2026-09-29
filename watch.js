// Osso Export Watch: client-side filtering of the rendered notes. No network
// requests, no storage, no third parties. Without this script every note shows.
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var cards = Array.prototype.slice.call(document.querySelectorAll("article.card"));
  if (!cards.length) return;
  var state = { jur: {}, type: {}, days: 0, q: "" };
  var q = document.getElementById("q");
  var period = document.getElementById("period");

  function any(set) { for (var k in set) if (set[k]) return true; return false; }
  function cutoff(days) { return new Date(Date.now() - days * 864e5).toISOString().slice(0, 10); }

  function apply() {
    var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    var since = state.days ? cutoff(state.days) : "";
    var counts = { all: 0, US: 0, EU: 0 };
    cards.forEach(function (c) {
      var d = c.dataset;
      var show = (!any(state.jur) || state.jur[d.jur]) &&
        (!any(state.type) || state.type[d.type]) &&
        (!since || d.date >= since) &&
        words.every(function (w) { return d.search.indexOf(w) !== -1; });
      c.hidden = !show;
      if (show) { counts.all++; counts[d.jur]++; }
    });
    document.querySelectorAll("[data-week]").forEach(function (w) {
      w.hidden = !w.querySelector("article.card:not([hidden])");
    });
    document.querySelectorAll("[data-count]").forEach(function (n) { n.textContent = counts[n.dataset.count]; });
    document.getElementById("no-match").hidden = counts.all > 0;
  }

  document.querySelectorAll("[data-filter]").forEach(function (group) {
    var set = state[group.dataset.filter];
    group.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      set[b.dataset.v] = !set[b.dataset.v];
      b.setAttribute("aria-pressed", set[b.dataset.v] ? "true" : "false");
      apply();
    });
  });
  q.addEventListener("input", function () { state.q = q.value.trim(); apply(); });
  period.addEventListener("change", function () { state.days = +period.value; apply(); });

  var more = document.querySelector(".more");
  var extra = document.getElementById("filters-extra");
  more.addEventListener("click", function () {
    var open = extra.classList.toggle("open");
    more.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();
