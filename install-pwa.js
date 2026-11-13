(function () {
    'use strict';

    let deferredPrompt = null;
    const installBtn = document.getElementById('btn-install-pwa');

    if (!installBtn) return;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'block';
        console.log('PWA: кнопка установки готова');
    });
  
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
          
            showInstallHint();
            return;
        }
      
        deferredPrompt.prompt();
      
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWA: пользователь выбрал', outcome);
      
        deferredPrompt = null;
        installBtn.style.display = 'none';
    });
  
    window.addEventListener('appinstalled', () => {
        installBtn.style.display = 'none';
        deferredPrompt = null;
        console.log('PWA: приложение установлено');
    });
  
    function showInstallHint() {
        const isYandex = /YaBrowser/i.test(navigator.userAgent);
        const isChrome = /Chrome/i.test(navigator.userAgent) && !/YaBrowser/i.test(navigator.userAgent);

        let message = '';
        if (isYandex) {
            message = 'Нажмите на иконку ⚙️ в адресной строке → "Установить приложение"';
        } else if (isChrome) {
            message = 'Нажмите на иконку установки в адресной строке (справа)';
        } else {
            message = 'Добавьте эту страницу на главный экран через меню браузера';
        }

        alert('Приложение уже установлено или браузер не поддерживает установку.\n\n' + message);
    }
  
    if (window.matchMedia('(display-mode: standalone)').matches) {
        installBtn.style.display = 'none';
    }
})();
