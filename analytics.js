'use strict';

(function() {
  var DOMAIN = 'studio.posty5.com';
  var SCRIPT_URL = 'https://plausible.io/js/plausible.js';

  window['trackEvent'] = function(name, props) {
    if (typeof window.plausible === 'function') {
      try {
        window.plausible(name, { props: props || {} });
      } catch (e) {}
    }
  };

  function loadPlausible() {
    if (document.querySelector('script[src*="plausible.io"]')) return;
    var script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = DOMAIN;
    script.src = SCRIPT_URL;
    script.onerror = function() {
      console.warn('Не удалось загрузить Plausible Analytics');
    };
    document.body.appendChild(script);
  }

  function hookGameEvents() {
    if (typeof S === 'undefined' || typeof startGame !== 'function') {
      setTimeout(hookGameEvents, 200);
      return;
    }

    var originalStartGame = startGame;
    startGame = function() {
      trackEvent('GameStarted', { difficulty: S.difficulty, theme: S.theme, grid: S.grid });
      return originalStartGame.apply(this, arguments);
    };

    var originalGameOver = gameOver;
    gameOver = function() {
      var isRecord = S.score > S.highScore;
      trackEvent('GameOver', {
        score: S.score, level: S.level,
        eaten: (typeof sessionEaten !== 'undefined' ? sessionEaten : 0),
        maxCombo: S.maxComboThisGame, coins: S.sessionCoins, isRecord: isRecord
      });
      if (isRecord) trackEvent('NewRecord', { score: S.score, level: S.level });
      return originalGameOver.apply(this, arguments);
    };

    var originalLevelUp = levelUp;
    levelUp = function() {
      trackEvent('LevelUp', { level: S.level });
      return originalLevelUp.apply(this, arguments);
    };

    var originalSaveAchievement = saveAchievement;
    saveAchievement = function(key) {
      trackEvent('Achievement', { name: key });
      return originalSaveAchievement.apply(this, arguments);
    };

    document.addEventListener('click', function(e) {
      var target = e.target;
      if (target.classList && target.classList.contains('buy-btn')) {
        var item = target.closest('.shop-item');
        if (item) {
          var skinId = item.getAttribute('data-id');
          var skin = (typeof SKIN_CATALOG !== 'undefined')
            ? SKIN_CATALOG.find(function(s) { return s.id === skinId; }) : null;
          var price = skin ? skin.price : 0;
          if (S.coins < price) {
            trackEvent('PurchaseFailed', { skin: skinId, price: price, reason: 'no_coins', haveCoins: S.coins });
          } else {
            setTimeout(function() { trackEvent('SkinPurchased', { skin: skinId, price: price }); }, 100);
          }
        }
      }
      if (target.classList && (target.classList.contains('select-btn') || target.classList.contains('free-btn'))) {
        var item2 = target.closest('.shop-item');
        if (item2) trackEvent('SkinSelected', { skin: item2.getAttribute('data-id') });
      }
      if (target.id === 'btn-share-score') {
        trackEvent('ResultShared', { score: S.score, level: S.level });
      }
    });

    if (typeof window.snakeActivateTurbo === 'function') {
      var originalActivateTurbo = window.snakeActivateTurbo;
      window.snakeActivateTurbo = function() {
        trackEvent('TurboUsed', { level: S.level, score: S.score });
        return originalActivateTurbo.apply(this, arguments);
      };
    }

    console.log(' Аналитика Plausible: перехват активирован');
  }

  var sessionStart = Date.now();
  window.addEventListener('beforeunload', function() {
    var duration = Math.round((Date.now() - sessionStart) / 1000);
    if (duration > 5) trackEvent('SessionDuration', { seconds: duration });
  });

  window.addEventListener('error', function(e) {
    trackEvent('GameError', {
      message: (e.message || '').slice(0, 100),
      source: (e.filename || '').split('/').pop(),
      line: e.lineno || 0
    });
  });

  var hiddenStart = null;
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      hiddenStart = Date.now();
    } else if (hiddenStart) {
      var hiddenDuration = Math.round((Date.now() - hiddenStart) / 1000);
      if (hiddenDuration > 3) trackEvent('TabHidden', { seconds: hiddenDuration });
      hiddenStart = null;
    }
  });

  loadPlausible();
  hookGameEvents();

  console.log('Аналитика Plausible инициализирована для ' + DOMAIN);
})();
