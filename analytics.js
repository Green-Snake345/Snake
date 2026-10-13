(function () {
  'use strict';

  var T = window.Tracker;
  if (!T) {
    console.warn('[analytics] Tracker не найден — подключи track.js перед analytics.js');
  }

  var gameStartTime = null;

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

  function init() {
    safe(function () {
      if (!T || typeof T.init !== 'function') return;
      T.init();
      if (typeof T.installGlobalErrorHandlers === 'function') {
        T.installGlobalErrorHandlers();
      }
    });
  }

  function gameStart(opts) {
    safe(function () {
      opts = opts || {};
      gameStartTime = (window.performance && performance.now)
        ? performance.now()
        : Date.now();
      send('game_started', { mode: opts.mode || 'classic' });
    });
  }

  function appleEaten(opts) {
    safe(function () {
      opts = opts || {};
      send('apple_eaten', { score: opts.score, level: opts.level });
    });
  }

  function gameOver(opts) {
    safe(function () {
      opts = opts || {};
      var duration = null;
      if (gameStartTime !== null) {
        var now = (window.performance && performance.now)
          ? performance.now()
          : Date.now();
        duration = Math.round((now - gameStartTime) / 1000);
      }
      send('game_over', {
        score: opts.score,
        level: opts.level,
        reason: opts.reason || 'collision',
        duration: duration
      });
      gameStartTime = null;
    });
  }

  function newRecord(opts) {
    safe(function () {
      opts = opts || {};
      send('new_record', { score: opts.score });
    });
  }

  function restart(opts) {
    safe(function () {
      opts = opts || {};
      send('restart_clicked', { previousScore: opts.previousScore });
    });
  }

  function pause()  { safe(function () { send('game_paused'); }); }
  function resume() { safe(function () { send('game_resumed'); }); }

  function levelUp(opts) {
    safe(function () {
      opts = opts || {};
      send('level_up', { level: opts.level });
    });
  }

  function leaderboardView() { safe(function () { send('leaderboard_viewed'); }); }
  function shopOpen()        { safe(function () { send('shop_opened'); }); }

  function shopBuy(opts) {
    safe(function () {
      opts = opts || {};
      send('shop_buy', { item: opts.item, price: opts.price });
    });
  }

  function settingsChange(opts) {
    safe(function () {
      opts = opts || {};
      send('setting_changed', { key: opts.key, value: opts.value });
    });
  }

  function skinChange(opts) {
    safe(function () {
      opts = opts || {};
      send('skin_changed', { id: opts.id });
    });
  }

  function reportError(err, context) {
    safe(function () {
      if (T && typeof T.trackError === 'function') {
        T.trackError(err, context || 'manual');
      }
    });
  }

  window.Analytics = {
    init: init,
    gameStart: gameStart,
    appleEaten: appleEaten,
    gameOver: gameOver,
    newRecord: newRecord,
    restart: restart,
    pause: pause,
    resume: resume,
    levelUp: levelUp,
    leaderboardView: leaderboardView,
    shopOpen: shopOpen,
    shopBuy: shopBuy,
    settingsChange: settingsChange,
    skinChange: skinChange,
    reportError: reportError
  };
})();
