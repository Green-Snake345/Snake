(function () {
  'use strict';

  var T = window.Tracker;
  if (!T) {
    console.warn('[analytics] Tracker не найден — подключи track.js перед analytics.js');
    return;
  }

  var gameStartTime = null;
  var lastScore = 0;
  var lastEaten = 0;
  var lastLevel = 1;
  var lastCoins = null;
  var lastActiveSkin = null;
  var isPaused = false;

  function safe(fn) {
    try { return fn(); }
    catch (e) {
      console.warn('[analytics] ошибка:', e);
      if (T && T.trackError) T.trackError(e, 'analytics');
      return undefined;
    }
  }

  function send(event, props) {
    if (!T || typeof T.track !== 'function') return;
    safe(function () { T.track(event, props || {}); });
  }

  function $(id) { return document.getElementById(id); }
  function text(el) { return el ? (el.textContent || '').trim() : ''; }
  function num(el) {
    var n = parseInt(text(el).replace(/[^0-9-]/g, ''), 10);
    return isNaN(n) ? 0 : n;
  }
  function isHidden(el) {
    if (!el) return true;
    if (el.classList.contains('hidden')) return true;
    var s = window.getComputedStyle(el);
    return s.display === 'none' || s.visibility === 'hidden';
  }

  function gameStart(opts) {
    safe(function () {
      opts = opts || {};
      gameStartTime = (window.performance && performance.now)
        ? performance.now()
        : Date.now();
      lastScore = 0;
      lastLevel = 1;
      isPaused = false;
      send('game_started', { mode: opts.mode || 'classic' });
    });
  }

  function gameOver() {
    safe(function () {
      var duration = null;
      if (gameStartTime !== null) {
        var now = (window.performance && performance.now)
          ? performance.now()
          : Date.now();
        duration = Math.round((now - gameStartTime) / 1000);
      }
      var finalScore = num($('final-score'));
      var finalLevel = num($('final-level'));
      var finalEaten = num($('final-eaten'));
      var finalCombo = text($('final-combo'));

      send('game_over', {
        score: finalScore,
        level: finalLevel,
        eaten: finalEaten,
        combo: finalCombo,
        duration: duration
      });

      if ($('new-record') && !isHidden($('new-record'))) {
        send('new_record', { score: finalScore });
      }

      gameStartTime = null;
    });
  }

  function pause()  { if (isPaused) return; isPaused = true;  send('game_paused'); }
  function resume() { if (!isPaused) return; isPaused = false; send('game_resumed'); }
  function levelUp(level) { send('level_up', { level: level }); }
  function appleEaten(score, eaten) { send('apple_eaten', { score: score, eaten: eaten }); }
  function shopOpen() { send('shop_opened'); }
  function shopBuy(spent, balance) { send('shop_buy', { spent: spent, balance: balance }); }
  function skinChange(id) { send('skin_changed', { id: id }); }

  function reportError(err, context) {
    safe(function () {
      if (T && typeof T.trackError === 'function') {
        T.trackError(err, context || 'manual');
      }
    });
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('button, .skin-option');
    if (!el) return;
    var id = el.id;

    if (id === 'btn-play' || id === 'btn-continue') {
      gameStart({ mode: 'classic' });
    } else if (id === 'btn-restart' || id === 'btn-restart-from-overlay') {
      send('restart_clicked', { previousScore: lastScore });
      gameStart({ mode: 'classic' });
    } else if (id === 'btn-shop') {
      shopOpen();
    } else if (el.classList && el.classList.contains('skin-option')) {
      var skinId = el.getAttribute('data-id');
      if (skinId && skinId !== lastActiveSkin) {
        skinChange(skinId);
        lastActiveSkin = skinId;
      }
    }
  }, true);

  function watchVisibility(id, onShow, onHide) {
    var el = $(id);
    if (!el) return;
    var wasHidden = isHidden(el);
    var obs = new MutationObserver(function () {
      var hidden = isHidden(el);
      if (wasHidden && !hidden && onShow) onShow();
      if (!wasHidden && hidden && onHide) onHide();
      wasHidden = hidden;
    });
    obs.observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
  }

  function watchText(id, onChange) {
    var el = $(id);
    if (!el) return;
    var last = text(el);
    var obs = new MutationObserver(function () {
      var cur = text(el);
      if (cur !== last) {
        onChange(cur, last);
        last = cur;
      }
    });
    obs.observe(el, { childList: true, subtree: true, characterData: true });
  }

  function init() {
    safe(function () {
      T.init();
      if (typeof T.installGlobalErrorHandlers === 'function') {
        T.installGlobalErrorHandlers();
      }
    });

    watchVisibility('game-over-overlay', gameOver, null);
    watchVisibility('pause-overlay', pause, resume);

    watchText('level-display', function (cur) {
      var lvl = parseInt(cur, 10);
      if (!isNaN(lvl) && lvl > lastLevel) {
        lastLevel = lvl;
        levelUp(lvl);
      }
    });

    watchText('score-display', function (cur) {
      var s = parseInt(cur, 10);
      if (isNaN(s)) return;
      if (s > lastScore) {
        lastScore = s;
        appleEaten(s, lastEaten);
      }
    });

    watchText('coins-value', function (cur) {
      var c = parseInt(cur, 10);
      if (isNaN(c)) return;
      if (lastCoins !== null && c < lastCoins && !isHidden($('shop-screen'))) {
        shopBuy(lastCoins - c, c);
      }
      lastCoins = c;
    });

    var skins = document.querySelector('.skin-options');
    if (skins) {
      var obs = new MutationObserver(function () {
        var act = document.querySelector('.skin-option.active');
        if (act) {
          var sid = act.getAttribute('data-id');
          if (sid && sid !== lastActiveSkin) {
            lastActiveSkin = sid;
            skinChange(sid);
          }
        }
      });
      obs.observe(skins, { attributes: true, attributeFilter: ['class'], subtree: true });
    }

    safe(function () {
      var c = $('coins-value');
      if (c) lastCoins = parseInt(text(c), 10) || 0;
      var act = document.querySelector('.skin-option.active');
      if (act) lastActiveSkin = act.getAttribute('data-id');
    });
  }

  window.Analytics = {
    init: init,
    gameStart: gameStart,
    gameOver: gameOver,
    appleEaten: appleEaten,
    pause: pause,
    resume: resume,
    levelUp: levelUp,
    shopOpen: shopOpen,
    shopBuy: shopBuy,
    skinChange: skinChange,
    reportError: reportError
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { safe(init); });
  } else {
    safe(init);
  }
})();
