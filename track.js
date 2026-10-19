(function () {
  'use strict';

  var TRACK_ENDPOINT = '/api/track';

  var host = location.hostname || '';
  var isLocal = host === 'localhost' || host === '127.0.0.1' || host === '' || host.endsWith('.local');
  var IS_PROD = !isLocal;
  var PLATFORM = isLocal ? 'local' : 'server';

  var sessionId = null;
  var initialized = false;
  var errorHandlerInstalled = false;

  function safe(fn) {
    try { return fn(); }
    catch (e) {
      if (!IS_PROD) console.warn('[track] ошибка:', e);
      return undefined;
    }
  }

  function makeSessionId() {
    return safe(function () {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
      }
      return 'sid-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    }) || ('sid-' + Date.now());
  }

  function init() {
    if (initialized) return;
    initialized = true;
    sessionId = makeSessionId();
    if (!IS_PROD) {
      console.debug('[track] init, sessionId =', sessionId, 'platform =', PLATFORM);
    }
  }

  function track(event, props) {
    if (!initialized) safe(init);

    if (!event || typeof event !== 'string') {
      if (!IS_PROD) console.warn('[track] пропущено событие без имени');
      return;
    }

    var payload = {
      sessionId: sessionId,
      ts: Date.now(),
      platform: PLATFORM
    };

    safe(function () {
      if (props && typeof props === 'object') {
        for (var k in props) {
          if (Object.prototype.hasOwnProperty.call(props, k)) payload[k] = props[k];
        }
      }
    });

    safe(function () {
      if (!TRACK_ENDPOINT) return;
      var body = { event: event };
      for (var k2 in payload) {
        if (Object.prototype.hasOwnProperty.call(payload, k2)) body[k2] = payload[k2];
      }
      var json = JSON.stringify(body);

      if (navigator.sendBeacon) {
        var blob = new Blob([json], { type: 'application/json' });
        if (navigator.sendBeacon(TRACK_ENDPOINT, blob)) return;
      }

      fetch(TRACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
        keepalive: true
      }).catch(function () {});
    });

    if (!IS_PROD) console.debug('[track]', event, payload);
  }

  function trackError(err, context) {
    var message = 'unknown';
    var stack = '';
    safe(function () {
      if (err instanceof Error) {
        message = err.message || String(err);
        stack = err.stack || '';
      } else if (typeof err === 'string') {
        message = err;
      } else if (err && typeof err === 'object') {
        message = err.message || JSON.stringify(err);
      } else {
        message = String(err);
      }
    });

    track('js_error', {
      message: String(message).slice(0, 500),
      stack: String(stack).slice(0, 1500),
      context: context || 'unknown',
      url: location.href,
      ua: navigator.userAgent
    });
  }

  function installGlobalErrorHandlers() {
    if (errorHandlerInstalled) return;
    errorHandlerInstalled = true;

    safe(function () {
      window.addEventListener('error', function (e) {
        if (e && e.target && e.target !== window) {
          var tag = e.target.tagName ? e.target.tagName.toLowerCase() : 'unknown';
          if (tag === 'script' || tag === 'img' || tag === 'link') {
            track('resource_error', {
              tag: tag,
              src: e.target.src || e.target.href || ''
            });
          }
          return;
        }
        trackError(e.error || e.message || 'window.error', 'window.onerror');
      });
    });

    safe(function () {
      window.addEventListener('unhandledrejection', function (e) {
        trackError(e.reason || 'unhandled rejection', 'unhandledrejection');
      });
    });
  }

  function getSessionId() { return sessionId; }
  function getPlatform()  { return PLATFORM; }

  window.Tracker = {
    init: function () { safe(init); },
    track: track,
    trackError: trackError,
    installGlobalErrorHandlers: installGlobalErrorHandlers,
    getSessionId: getSessionId,
    getPlatform: getPlatform
  };
<<<<<<< HEAD
})();
=======
})();
>>>>>>> b61c6d2fa33dcd056c48a071794ecd880a122568
