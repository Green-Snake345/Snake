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
        if (deferredPrompt) {
            
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('PWA: пользователь выбрал', outcome);
            deferredPrompt = null;
            installBtn.style.display = 'none';
        } else {
            
            showInstallInstructions();
        }
    });

    window.addEventListener('appinstalled', () => {
        installBtn.style.display = 'none';
        deferredPrompt = null;
        console.log('PWA: приложение установлено');
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
        installBtn.style.display = 'none';
    }

    function showInstallInstructions() {
        const userAgent = navigator.userAgent;
        const isYandex = /YaBrowser/i.test(userAgent);
        const isChrome = /Chrome/i.test(userAgent) && !isYandex;
        const isFirefox = /Firefox/i.test(userAgent);
        const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);

        let message = 'Чтобы установить приложение «Змейка»:\n\n';

        if (isYandex) {
            message += '🌐 Яндекс Браузер (ПК):\n' +
                       '1. Нажмите три точки ⋮ в правом верхнем углу\n' +
                       '2. Выберите "Установить приложение"\n' +
                       '3. Подтвердите установку\n\n' +
                       '📱 Яндекс Браузер (телефон):\n' +
                       '1. Нажмите три точки ⋮ внизу\n' +
                       '2. "Добавить на главный экран"';
        } else if (isChrome) {
            message += '🌐 Chrome/Edge:\n' +
                       '1. Нажмите иконку установки ⬇️ в адресной строке (справа)\n' +
                       '2. Или: меню ⋮ → "Установить приложение"';
        } else if (isFirefox) {
            message += '⚠️ Firefox не поддерживает установку PWA.\n' +
                       'Откройте сайт в Chrome или Edge.';
        } else if (isSafari) {
            message += '📱 Safari (iPhone/iPad):\n' +
                       '1. Нажмите кнопку "Поделиться" (квадрат со стрелкой)\n' +
                       '2. "На экран «Домой»"\n' +
                       '3. "Добавить"';
        } else {
            message += 'Используйте меню браузера → "Установить приложение"';
        }

        alert(message);
    }
})();
