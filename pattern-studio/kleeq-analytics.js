/* Kleeq analytics — Google Analytics 4 for every page and studio.
   One place for the Measurement ID. Loads gtag, sends a page view, and exposes
   window.kleeqTrack(name, params) for tool events (style picks, exports, remixes).
   Silent when opened as a local file or inside the editor preview. */
(function () {
  var ID = 'G-XGMXVJ7D2C';
  var live = /^https?:$/.test(location.protocol) && !/localhost|127\.0\.0\.1/.test(location.hostname);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  window.kleeqTrack = function (name, params) {
    if (!live) return;
    try { gtag('event', name, Object.assign({ app: document.title || location.pathname }, params || {})); } catch (e) {}
  };
  if (!live) return;
  var s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', ID, { page_title: document.title || location.pathname, anonymize_ip: true });
})();
