(function () {
  if (!window.PWAUpdate) {
    console.warn('[sw-register] PWAUpdate не найден');
    return;
  }

  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  function isGameRunning() {
    if (window.S) {
      return window.S.isRunning && !window.S.isPaused;
    }
    return false;
  }

  const pwa = window.PWAUpdate.initPwaAutoUpdate({
    swUrl: './service-worker.js',
    scope: './',
    autoReload: false,
    canReload: () => !isGameRunning(),
    onUpdateReady: () => showUpdateBanner(),
    onUpdateApplied: () => saveGameState(),
  });

  function saveGameState() {
    try {
      if (window.S && window.S.isRunning) {
        if (window.snakeRefreshContinue) {
          window.snakeRefreshContinue();
        }
      }
    } catch (e) {
      console.warn('Ошибка сохранения состояния:', e);
    }
  }

  function showUpdateBanner() {
    if (sessionStorage.getItem('pwa-update-dismissed') === '1') return;
    if (document.getElementById('pwa-update-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.innerHTML = `
      <div style="
        position:fixed;left:50%;bottom:16px;transform:translateX(-50%);
        z-index:9999;display:flex;align-items:center;gap:12px;
        max-width:calc(100vw - 32px);padding:12px 16px;
        border-radius:12px;background:#14141f;color:#e8e8f0;
        box-shadow:0 8px 24px rgba(0,0,0,.5);font:14px/1.4 system-ui,sans-serif;
        border:1px solid #2a2a3a;
      ">
        <span id="pwa-update-text" style="flex:1">Доступна новая версия игры</span>
        <button id="pwa-update-apply" style="
          padding:8px 14px;border:0;border-radius:8px;
          background:#00e0c6;color:#0a0a0f;font:inherit;font-weight:600;
          cursor:pointer;
        ">Обновить</button>
        <button id="pwa-update-later" style="
          padding:8px 10px;border:0;border-radius:8px;
          background:transparent;color:#8a8aa0;font:inherit;cursor:pointer;
        ">Позже</button>
      </div>
    `;
    document.body.appendChild(banner);

    if (isIOS) {
      banner.querySelector('#pwa-update-text').textContent =
        'Обновление готово. Закройте и снова откройте игру.';
      banner.querySelector('#pwa-update-apply').style.display = 'none';
    }

    banner.querySelector('#pwa-update-apply').onclick = () => {
      if (isGameRunning()) {
        const ok = confirm(
          'Вы сейчас играете! Обновление перезагрузит игру, и текущий прогресс этого матча будет потерян. Продолжить?'
        );
        if (!ok) return;
      }
      saveGameState();
      pwa.applyUpdate();
    };

    banner.querySelector('#pwa-update-later').onclick = () => {
      sessionStorage.setItem('pwa-update-dismissed', '1');
      banner.remove();
    };
  }

  window.pwaUpdate = pwa;
})();
