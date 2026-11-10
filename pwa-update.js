(function (global) {
  const DEFAULTS = {
    swUrl: './service-worker.js',
    scope: './',
    checkIntervalMs: 60 * 1000,
    checkOnVisible: true,
    autoReload: false,
    canReload: () => true,
    onUpdateAvailable: null,
    onUpdateReady: null,
    onUpdateApplied: null,
    debug: false,
  };

  const state = {
    registration: null,
    waitingWorker: null,
    reloading: false,
    pendingReload: false,
    intervalId: null,
    initialized: false,
    options: { ...DEFAULTS },
  };

  function log(...args) {
    if (state.options.debug) console.log('[pwa-update]', ...args);
  }

  function initPwaAutoUpdate(options = {}) {
    state.options = { ...DEFAULTS, ...options };

    if (!('serviceWorker' in navigator)) {
      log('Service Worker не поддерживается');
      return api;
    }
    if (state.initialized) {
      log('Уже инициализирован');
      return api;
    }
    state.initialized = true;

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      log('controllerchange');
      if (state.reloading) return;

      if (state.options.autoReload && state.options.canReload()) {
        doReload();
      } else {
        state.pendingReload = true;
        state.options.onUpdateReady?.();
      }
    });

    if (state.options.checkOnVisible) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          checkForUpdate().catch(() => {});
        }
      });
    }

    window.addEventListener('pwa:safe-point', () => {
      if (state.pendingReload && state.options.autoReload) {
        if (state.options.canReload()) doReload();
      }
    });

    state.intervalId = setInterval(() => {
      checkForUpdate().catch(() => {});
    }, state.options.checkIntervalMs);

    return api;
  }

  async function register() {
    try {
      const reg = await navigator.serviceWorker.register(state.options.swUrl, {
        scope: state.options.scope,
        updateViaCache: 'none',
      });
      state.registration = reg;
      log('SW зарегистрирован', reg.scope);

      if (reg.waiting && navigator.serviceWorker.controller) {
        state.waitingWorker = reg.waiting;
        state.options.onUpdateAvailable?.(reg.waiting);
        state.options.onUpdateReady?.();
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        log('updatefound, новый SW устанавливается');

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            log('Новый SW установлен и ждёт активации');
            state.waitingWorker = newWorker;
            state.options.onUpdateAvailable?.(newWorker);
            state.options.onUpdateReady?.();
          }
        });
      });
    } catch (e) {
      console.error('[pwa-update] Ошибка регистрации SW', e);
    }
  }

  async function checkForUpdate() {
    if (!state.registration) return false;
    try {
      await state.registration.update();
      return true;
    } catch (err) {
      log('Ошибка проверки обновления', err);
      return false;
    }
  }

  function applyUpdate() {
    const worker = state.waitingWorker || state.registration?.waiting;
    if (!worker) {
      if (state.pendingReload) doReload();
      return false;
    }

    state.options.onUpdateApplied?.();

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => doReload(),
      { once: true }
    );

    try {
      worker.postMessage({ type: 'SKIP_WAITING' });
    } catch {}

    if (typeof worker.skipWaiting === 'function') {
      worker.skipWaiting();
    }

    setTimeout(() => {
      if (!state.reloading) doReload();
    }, 3000);

    return true;
  }

  function tryApplyPending() {
    if (state.pendingReload && state.options.canReload()) {
      doReload();
      return true;
    }
    return false;
  }

  function doReload() {
    if (state.reloading) return;
    state.reloading = true;
    state.options.onUpdateApplied?.();
    log('Перезагрузка страницы для применения обновления');
    window.location.reload();
  }

  const api = {
    initPwaAutoUpdate,
    checkForUpdate,
    applyUpdate,
    tryApplyPending,
    getState: () => ({ ...state }),
  };

  global.PWAUpdate = api;
})(window);
