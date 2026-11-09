'use strict';

(function() {
  var sessionId = (function() {
    try {
      var id = sessionStorage.getItem('track_sid');
      if (!id) {
        id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        sessionStorage.setItem('track_sid', id);
      }
      return id;
    } catch (e) {
      return Math.random().toString(36).substring(2, 10);
    }
  })();

  function sendEvent(name, props) {
    try {
      var payload = Object.assign({
        event: name,
        sessionId: sessionId,
        platform: navigator.platform || 'Unknown',
        url: window.location.href,
        referrer: document.referrer || '',
        ua: navigator.userAgent,
        timestamp: Date.now()
      }, props || {});

      // 🎯 ОТПРАВЛЯЕМ СОБЫТИЕ В UMAMI (чтобы видеть всех игроков!)
      if (typeof window.umami !== 'undefined') {
        window.umami.track(name, props || {});
      }

      // И дублируем в консоль для твоей отладки
      console.log('📊 [Track]', payload.event, payload);
    } catch (e) {
      console.warn('Track: ошибка', e);
    }
  }

  window['Track'] = {
    send: sendEvent,
    sessionId: sessionId
  };

  sendEvent('PageView', {
    title: document.title,
    path: window.location.pathname
  });

  var pageStart = Date.now();
  window.addEventListener('beforeunload', function() {
    var duration = Math.round((Date.now() - pageStart) / 1000);
    if (duration > 2) {
      sendEvent('PageExit', { duration_sec: duration });
    }
  });

  document.addEventListener('click', function(e) {
    var target = e.target;
    if (!target || !target.classList) return;

    if (target.classList.contains('play-btn') ||
        target.id === 'play-button' ||
        target.getAttribute('data-track') === 'play') {
      sendEvent('PlayClicked', {
        button_id: target.id || '',
        button_class: target.className || ''
      });
    }
  });

  window.addEventListener('error', function(e) {
    sendEvent('TrackError', {
      message: (e.message || '').slice(0, 100),
      source: (e.filename || '').split('/').pop()
    });
  });

  console.log('Track.js загружен, session: ' + sessionId);
})();
