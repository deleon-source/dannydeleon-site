/* dannydeleon.com — renders from data/site.json; releases come live from dandelionmusica.com. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  var NEWTAB = '<span class="sr-only"> (opens in new tab)</span>';
  var ext = function (url, label, cls) { return '<a class="' + (cls || "") + '" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + NEWTAB + "</a>"; };
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var fmt = function (iso) { if (!iso) return ""; var p = iso.split("-"); return MONTHS[+p[1] - 1] + " " + (+p[2]) + ", " + p[0]; };
  var today = function () { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  var isUpcoming = function (r) { return r.status === "upcoming" && (!r.date || r.date > today()); };

  function renderStatic(s) {
    $("tagline").textContent = s.tagline;
    $("lede").textContent = s.lede;
    $("stats").innerHTML = s.stats.map(function (x) { return "<li><b>" + esc(x.k) + "</b><span>" + esc(x.v) + "</span></li>"; }).join("");
    $("bio").innerHTML = s.bioLong.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    $("bio-short").textContent = s.bioShort;
    $("genres").innerHTML = s.genres.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("");
    $("gigs").innerHTML = s.gigs.map(function (g) { return "<li><b>" + esc(g.title) + "</b><span>" + esc([g.where, g.note].filter(Boolean).join(" · ")) + "</span></li>"; }).join("");
    $("listen").innerHTML = s.listen.map(function (l) { return ext(l.url, l.label, "btn btn-ghost btn-sm"); }).join("");
    $("social").innerHTML = s.social.map(function (l) { return "<li>" + ext(l.url, l.label) + "</li>"; }).join("");
    $("gallery").innerHTML = s.photos.map(function (p) { return '<li><a href="' + esc(p.src) + '" target="_blank" rel="noopener"><img src="' + esc(p.src.replace("photos/", "photos/web/").replace(/\.jpg$/, ".webp")) + '" alt="' + esc(p.alt) + '" loading="lazy"><span class="sr-only"> (opens full size in new tab)</span></a></li>'; }).join("");
    var mail = "mailto:" + s.bookingEmail + "?subject=" + encodeURIComponent("Booking inquiry: Danny Deleon") + "&body=" + encodeURIComponent("Date:\nVenue:\nCity:\nSet length:\nEvent details:\n");
    $("book-btn").href = mail; $("book-mail").textContent = s.bookingEmail;
    $("foot-mail").href = "mailto:" + s.bookingEmail; $("foot-mail").textContent = s.bookingEmail;
    $("set-links").innerHTML = ext("https://www.youtube.com/playlist?list=" + s.liveSetsPlaylist, "All sets on YouTube", "btn btn-teal btn-sm") + ext("https://soundcloud.com/dannydeleonmusic", "Mixes on SoundCloud", "btn btn-ghost btn-sm");
    // Click-to-load video keeps YouTube from loading trackers until the visitor asks for it.
    var v = $("video");
    v.innerHTML = '<button type="button" class="btn btn-gold btn-lg" style="position:absolute;inset:auto;left:50%;top:50%;transform:translate(-50%,-50%)">Play live sets</button>';
    v.style.backgroundImage = "linear-gradient(rgba(23,19,15,.35),rgba(23,19,15,.35)),url(photos/web/dj-water.webp)"; v.style.backgroundSize = "cover"; v.style.backgroundPosition = "center";
    v.querySelector("button").addEventListener("click", function () {
      v.innerHTML = '<iframe title="Danny Deleon live sets playlist" src="https://www.youtube-nocookie.com/embed/videoseries?list=' + esc(s.liveSetsPlaylist) + '&autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    });
    $("copy-bio").addEventListener("click", function () {
      (navigator.clipboard ? navigator.clipboard.writeText(s.bioShort) : Promise.reject()).then(function () { $("copy-status").textContent = "Short bio copied."; $("copy-bio").textContent = "Copied"; }).catch(function () { $("copy-status").textContent = "Copy not available; select the text instead."; });
    });
  }

  function renderReleases(s, rel) {
    var base = s.labelBase;
    var mine = rel.filter(function (r) { return /danny\s*de\s*leon/i.test(r.artists || ""); });
    var abs = function (p) { return /^https?:/.test(p) ? p : base + p; };
    $("releases").innerHTML = mine.map(function (r) {
      var L = r.links || {}, url = L.smartlink || L.presave || L.spotify || L.traxsource || L.beatport || base;
      var meta = (isUpcoming(r) ? "Out " + fmt(r.date) : (r.date ? fmt(r.date) : "Out now")) + (r.genre ? " · " + r.genre : "");
      return '<li class="rel"><a href="' + esc(url) + '" target="_blank" rel="noopener"><img src="' + esc(abs(r.cover)) + '" alt="" loading="lazy" width="400" height="400"><p class="rel-title">' + esc(r.title) + '</p><p class="rel-meta">' + esc(r.artists) + "</p><p class=\"rel-meta\">" + esc(meta) + '</p><span class="sr-only"> (opens in new tab)</span></a></li>';
    }).join("");
    var r = mine.find(isUpcoming) || mine[0]; if (!r) return;
    var L = r.links || {}, up = isUpcoming(r);
    $("latest").hidden = false;
    $("latest-cover").src = abs(r.cover); $("latest-cover").alt = r.title + " cover art";
    $("latest-chip").textContent = up ? "New single · out " + fmt(r.date) : "Latest release";
    $("latest-title").textContent = r.title;
    $("latest-artists").textContent = r.artists + (r.genre ? " · " + r.genre : "");
    var html = "";
    if (r.preview) html += '<button type="button" class="btn btn-teal btn-sm pv" id="pv" aria-pressed="false"><span id="pv-t">Play 30s preview</span><span class="bar" aria-hidden="true"><i id="pv-bar"></i></span></button>';
    var go = up ? L.presave : (L.smartlink || L.spotify);
    if (go) html += ext(go, up ? "Pre-save" : "Listen now", "btn btn-ghost btn-sm");
    if (L.free) html += ext(L.free, "Free download", "btn btn-ghost btn-sm");
    $("latest-actions").innerHTML = html;
    if (r.preview) {
      var a = new Audio(abs(r.preview)); a.preload = "none";
      var b = $("pv"), t = $("pv-t"), bar = $("pv-bar");
      var set = function (on) { b.setAttribute("aria-pressed", on ? "true" : "false"); t.textContent = on ? "Pause preview" : "Play 30s preview"; };
      b.addEventListener("click", function () { if (a.paused) { a.play().then(function () { set(true); if (window.fbq) window.fbq("track", "ViewContent", { content_name: r.title + " preview" }); }).catch(function () { set(false); }); } else { a.pause(); set(false); } });
      a.addEventListener("timeupdate", function () { bar.style.width = (a.currentTime / (a.duration || 30) * 100) + "%"; });
      a.addEventListener("ended", function () { set(false); bar.style.width = "0"; });
    }
  }

  function setupJoin(s) {
    var f = $("join-form"), msg = $("join-msg"), input = $("join-email");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { msg.textContent = "Please enter a valid email address."; input.setAttribute("aria-invalid", "true"); input.focus(); return; }
      input.removeAttribute("aria-invalid");
      var fd = new FormData(); fd.append(s.joinForm.emailField, v);
      fetch(s.joinForm.action, { method: "POST", mode: "no-cors", body: fd }).finally(function () {
        msg.textContent = "You're on the list. Thank you!"; f.reset();
        if (window.fbq) window.fbq("track", "CompleteRegistration", { content_name: "Join the list (artist site)" });
      });
    });
  }

  function setupPixel(s) {
    if (location.hostname.replace(/^www\./, "") !== s.liveDomain || !s.pixelId) return;
    !function(f,b,e,v,n,t,x){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;x=b.getElementsByTagName(e)[0];x.parentNode.insertBefore(t,x)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", s.pixelId); window.fbq("track", "PageView");
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
      var h = a.href, ev = null;
      if (/^mailto:/.test(h)) ev = "Contact";
      else if (a.hostname && a.hostname !== location.hostname) ev = /hypeddit\.com/.test(h) ? "Lead" : /traxsource|beatport|bandcamp/.test(h) ? "InitiateCheckout" : "ViewContent";
      if (ev) window.fbq("track", ev, { content_name: (a.textContent || "").trim().slice(0, 60) });
    }, true);
  }

  fetch("data/site.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (s) {
    renderStatic(s); setupJoin(s); setupPixel(s);
    fetch(s.releasesUrl, { cache: "no-cache" }).then(function (r) { return r.json(); })
      .catch(function () { return fetch("data/releases-fallback.json").then(function (r) { return r.json(); }); })
      .then(function (d) { renderReleases(s, d.releases || d); })
      .catch(function () { $("releases").innerHTML = '<li class="rel-meta">Releases are on <a href="' + esc(s.labelBase) + '">dandelionmusica.com</a>.</li>'; });
  });
})();
