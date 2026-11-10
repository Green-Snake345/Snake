(function () {
  const toast = document.getElementById('pwa-toast');
  const btn = document.getElementById('pwa-update-btn');

  if (!toast || !btn || !window.PWAUpdate) return;

  btn.addEventListener('click', () => {
    toast.classList.add('hidden');
    window.PWAUpdate.applyUpdate();
  });

  window.PWAUpdate.initPwaAutoUpdate({
    debug: false,
    autoReload: false,
    checkIntervalMs: 60 * 1000,
    checkOnVisible: true,
    onUpdateReady: () => {
      toast.classList.remove('hidden');
    },
    onUpdateApplied: () => {
      toast.classList.add('hidden');
    },
  });
})();
