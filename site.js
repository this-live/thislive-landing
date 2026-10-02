/* this.live site script. Small on purpose, loaded with `defer`.
 *
 * Two switches, both OFF until the privacy.html amendment is published
 * (see docs/SITE-OPERATIONS.md). Nothing here sets cookies.
 *
 *  CF_BEACON_TOKEN  Cloudflare Web Analytics site token (public, not a secret).
 *                   Empty string = no analytics script is loaded.
 *  UTM_PASSTHROUGH  When true, utm_* tags on the landing URL are kept in this
 *                   tab's sessionStorage and appended to the Cal.com booking
 *                   links, so a booking records which channel it came from.
 */
(function () {
  'use strict';

  var CF_BEACON_TOKEN = '';      // off until the privacy amendment is published
  var UTM_PASSTHROUGH = false;   // off until the privacy amendment is published

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var BOOKING_PREFIX = 'https://cal.com/bryce-murad/';

  function readUtm() {
    var found = {};
    var any = false;
    try {
      var params = new URLSearchParams(window.location.search);
      UTM_KEYS.forEach(function (k) {
        var v = params.get(k);
        if (v && /^[a-z0-9._-]{1,60}$/i.test(v)) { found[k] = v.toLowerCase(); any = true; }
      });
      if (any) {
        window.sessionStorage.setItem('tl_utm', JSON.stringify(found));
        return found;
      }
      var saved = window.sessionStorage.getItem('tl_utm');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return any ? found : null;
    }
  }

  function tagBookingLinks(utm) {
    var links = document.querySelectorAll('a[href^="' + BOOKING_PREFIX + '"]');
    Array.prototype.forEach.call(links, function (a) {
      try {
        var url = new URL(a.href);
        Object.keys(utm).forEach(function (k) { url.searchParams.set(k, utm[k]); });
        a.href = url.toString();
      } catch (e) { /* leave the link as it is */ }
    });
  }

  function loadBeacon(token) {
    var s = document.createElement('script');
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: token }));
    document.head.appendChild(s);
  }

  if (UTM_PASSTHROUGH) {
    var utm = readUtm();
    if (utm) { tagBookingLinks(utm); }
  }
  if (CF_BEACON_TOKEN) { loadBeacon(CF_BEACON_TOKEN); }
})();
