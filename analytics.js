'use strict';

(function() {
  var DOMAIN = 'studio.posty5.com';
  var SCRIPT_URL = 'https://plausible.io/js/plausible.js';

  window['trackEvent'] = function(name, props) {
    if (typeof window.plausible === 'function') {
      try {
        
        var isFirst = false;
        try {
          if (!localStorage.getItem('snake_first_game_played')) {
            isFirst = true;
          }
        } catch(e) {}

        var finalProps = Object.assign({ first_game: isFirst }, props || {});

        window.plausible(name, { props: finalProps });
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

    var gameStartTime = 0;
    var pauseCount = 0;

    var originalStartGame = startGame;
    startGame = function() {
      gameStartTime = Date.now();
      pauseCount = 0;
      var isFirst = false;
      try {
        if (!localStorage.getItem('snake_first_game_played')) {
          localStorage.setItem('snake_first_game_played', '1');
          isFirst = true;
        }
      } catch (e) {}
      trackEvent('GameStarted', {
        difficulty: S.difficulty,
        theme: S.theme,
        grid: S.grid,
        first_game: isFirst
      });
      return originalStartGame.apply(this, arguments);
    };

    var originalGameOver = gameOver;
    gameOver = function() {
      var isRecord = S.score > S.highScore;
      var snakeLen = (S.snake && S.snake.length) || 0;
      var durationSec = gameStartTime ? Math.round((Date.now() - gameStartTime) / 1000) : 0;

      trackEvent('GameOver', {
        score: S.score,
        level: S.level,
        eaten: (typeof sessionEaten !== 'undefined' ? sessionEaten : 0),
        max_combo: S.maxComboThisGame,
        coins: S.sessionCoins,
        is_record: isRecord,
        snake_length: snakeLen,
        duration_sec: durationSec,
        pause_count: pauseCount
      });

      if (isRecord) trackEvent('NewRecord', { score: S.score, level: S.level });

      var topScore = 0;
      [100, 500, 1000, 5000, 10000].forEach(function(m) {
        if (S.score >= m) topScore = m;
      });
      if (topScore) trackEvent('ScoreMilestone', { milestone: topScore, score: S.score });

      var topCombo = 0;
      [5, 10, 20, 50].forEach(function(m) {
        if ((S.maxComboThisGame || 0) >= m) topCombo = m;
      });
      if (topCombo) trackEvent('ComboMilestone', { combo: topCombo, score: S.score });

      try {
        var totalGames = parseInt(localStorage.getItem('snake_total_games') || '0', 10) + 1;
        localStorage.setItem('snake_total_games', String(totalGames));
        if ([10, 50, 100, 500].indexOf(totalGames) !== -1) {
          trackEvent('GamesMilestone', { total_games: totalGames });
        }
      } catch (e) {}

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

    var pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
      var wasPaused = false;
      var observer = new MutationObserver(function() {
        var isPaused = !pauseOverlay.classList.contains('hidden');
        if (isPaused && !wasPaused) {
          pauseCount++;
          trackEvent('GamePaused', {
            score: S.score,
            level: S.level,
            pause_count: pauseCount
          });
        }
        if (!isPaused && wasPaused) {
          trackEvent('GameResumed', {
            score: S.score,
            pause_count: pauseCount
          });
        }
        wasPaused = isPaused;
      });
      observer.observe(pauseOverlay, { attributes: true, attributeFilter: ['class'] });
    }

    if (typeof window.snakeActivateTurbo === 'function') {
      var originalActivateTurbo = window.snakeActivateTurbo;
      window.snakeActivateTurbo = function() {
        trackEvent('TurboUsed', { level: S.level, score: S.score });
        return originalActivateTurbo.apply(this, arguments);
      };
    }

    document.addEventListener('click', function(e) {
      var target = e.target;
      if (!target || !target.classList) return;

      if (target.classList.contains('buy-btn')) {
        var item = target.closest('.shop-item');
        if (item) {
          var skinId = item.getAttribute('data-id');
          var skin = (typeof SKIN_CATALOG !== 'undefined')
            ? SKIN_CATALOG.find(function(s) { return s.id === skinId; })
            : null;
          var price = skin ? skin.price : 0;
          if (S.coins < price) {
            trackEvent('PurchaseFailed', {
              skin: skinId, price: price, reason: 'no_coins', have_coins: S.coins
            });
          } else {
            setTimeout(function() {
              trackEvent('SkinPurchased', { skin: skinId, price: price });
            }, 100);
          }
        }
      }

      if (target.classList.contains('select-btn') ||
          target.classList.contains('free-btn')) {
        var item2 = target.closest('.shop-item');
        if (item2) trackEvent('SkinSelected', { skin: item2.getAttribute('data-id') });
      }

      if (target.classList.contains('skin-option') && !target.classList.contains('locked')) {
        var skinOptId = target.getAttribute('data-id');
        if (skinOptId) trackEvent('SkinSelected', { skin: skinOptId, source: 'settings' });
      }

      if (target.id === 'btn-shop')         trackEvent('ShopOpened');
      if (target.id === 'btn-settings')     trackEvent('SettingsOpened');
      if (target.id === 'btn-instructions') trackEvent('InstructionsOpened');
      if (target.id === 'btn-about')        trackEvent('AboutOpened');
      if (target.id === 'btn-continue')     trackEvent('GameContinued');

      if (target.id === 'btn-restart' ||
          target.id === 'btn-restart-from-overlay') {
        trackEvent('GameRestarted', { score: S.score, level: S.level });
      }
      if (target.id === 'btn-to-menu' ||
          target.id === 'btn-pause-to-menu' ||
          target.id === 'btn-back-to-menu') {
        trackEvent('ExitedToMenu', {
          score: S.score,
          level: S.level,
          reason: target.id === 'btn-back-to-menu' ? 'game_over' : 'in_game'
        });
      }

      if (target.id === 'btn-save-settings') {
        trackEvent('SettingsSaved', {
          theme: (document.getElementById('theme-select') || {}).value,
          difficulty: (document.getElementById('difficulty-select') || {}).value
        });
      }
      if (target.id === 'btn-reset-settings') {
        trackEvent('SettingsReset');
      }
    });

    document.addEventListener('change', function(e) {
      var t = e.target;
      if (!t || !t.id) return;

      if (t.id === 'theme-select')               trackEvent('ThemeChanged', { theme: t.value });
      if (t.id === 'difficulty-select')          trackEvent('DifficultyChanged', { difficulty: t.value });
      if (t.id === 'game-mode-select')           trackEvent('GameModeChanged', { mode: t.value });
      if (t.id === 'wall-mode-select')           trackEvent('WallModeChanged', { mode: t.value });
      if (t.id === 'grid-size-select')           trackEvent('GridSizeChanged', { size: t.value });
      if (t.id === 'control-scheme-select')      trackEvent('ControlSchemeChanged', { scheme: t.value });
      if (t.id === 'mobile-size-select')         trackEvent('MobileSizeChanged', { size: t.value });
      if (t.id === 'mobile-control-mode-select') trackEvent('MobileControlChanged', { mode: t.value });
      if (t.id === 'performance-mode-select')    trackEvent('PerformanceModeChanged', { mode: t.value });
      if (t.id === 'ui-scale-select')            trackEvent('UiScaleChanged', { scale: t.value });
      if (t.id === 'powerup-frequency-select')   trackEvent('PowerupFrequencyChanged', { freq: t.value });
      if (t.id === 'speed-slider')               trackEvent('SpeedChanged', { speed: t.value });
      if (t.id === 'volume-slider')              trackEvent('VolumeChanged', { volume: t.value });
    });

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
