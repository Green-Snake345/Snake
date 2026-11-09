'use strict';

(function() {
  if (!window.Telegram || !window.Telegram.WebApp) {
    return;
  }

  const tg = window.Telegram.WebApp;

  tg.expand();
  tg.setHeaderColor('#0b1020');
  tg.setBackgroundColor('#0b1020');

  function trackTelegramUser() {
    if (typeof trackEvent !== 'function') return;
    
    const user = tg.initDataUnsafe?.user;
    if (user) {
      trackEvent('TelegramUser', {
        username: user.username || 'anonymous',
        first_name: user.first_name || '',
        language: user.language_code || 'unknown'
      });
    }
  }

  function setupMainButton() {
    tg.MainButton.setText('🐍 НАЧАТЬ ИГРУ');
    tg.MainButton.setTextColor('#ffffff');
    tg.MainButton.setColor('#00ff88');
    tg.MainButton.show();

    tg.MainButton.onClick(function() {
      if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
      }
      
      if (typeof startGame === 'function') {
        startGame();
      }
      tg.MainButton.hide();
    });
  }

  function setupBackButton() {
    tg.BackButton.onClick(function() {
      if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      }
      if (typeof showMenu === 'function') {
        showMenu();
      } else {
        window.location.reload();
      }
    });
  }

  window.shareGameResult = function(score, level) {
    if (!tg || !tg.openTelegramLink) return;
    
    const text = `🐍 Я набрал ${score} очков и достиг ${level} уровня в Неоновой Змейке! Попробуй побить мой рекорд!`;
    const url = 'https://t.me/energy_tg_support_bot';
    
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
    
    if (typeof trackEvent === 'function') {
      trackEvent('SharedResult', { score: score, level: level });
    }
  };

  function init() {
    if (typeof startGame === 'undefined') {
      setTimeout(init, 300);
      return;
    }

    setupMainButton();
    setupBackButton();
    trackTelegramUser();
    
    console.log('✅ Telegram Web App инициализирован');
  }

  init();
})();
