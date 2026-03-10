// Service Worker registration for PWA.
// Extracted from index.html so that Content-Security-Policy can be set
// without needing 'unsafe-inline' in script-src.

// ── URL cleanup ───────────────────────────────────────────────
// InfinityFree appends ?i=1 to directory-index requests (/index.php?i=1)
// as an anti-hotlinking measure.  Silently restore the canonical URL so
// the address bar and PWA scope matching both see a clean path.
(function () {
  try {
    if (window.location.search === '?i=1') {
      const clean = window.location.pathname === '/index.php' ? '/' : window.location.pathname;
      history.replaceState(null, '', clean);
    }
  } catch (e) {}
}());

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    // updateViaCache:'none' forces the browser to always check for a new sw.js,
    // bypassing HTTP cache — critical for users stuck on old cached versions.
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
      .catch(function () {});
  });

  // Auto-reload the page the moment a new service worker takes control,
  // so users immediately get the latest HTML/JS/CSS from the new cache.
  var _swRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!_swRefreshing) { _swRefreshing = true; location.reload(); }
  });
}
