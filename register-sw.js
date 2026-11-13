(function () {
    'use strict';

    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker не поддерживается браузером');
        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('SW зарегистрирован, scope:', registration.scope);
              
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('Найден новый Service Worker');

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Новая версия доступна, ждём действия пользователя');
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Ошибка регистрации SW:', error);
            });
    });

    const installBtn = document.getElementById('btn-install-pwa');
    if (!installBtn) {
        console.error('PWA: кнопка #btn-install-pwa не найдена!');
        return;
    }

    console.log('PWA: скрипт загружен, кнопка найдена');

    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'block';
        console.log('PWA: событие beforeinstallprompt сработало');
    });

    installBtn.addEventListener('click', () => {
        console.log('PWA: клик по кнопке');
        
        if (deferredPrompt) {
            console.log('PWA: показываем нативный диалог');
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                console.log('PWA: пользователь выбрал', choiceResult.outcome);
                deferredPrompt = null;
                installBtn.style.display = 'none';
            });
        } else {
            console.log('PWA: события нет, показываем инструкцию');
            alert('Чтобы установить приложение «Змейка»:\n\n' +
                  '🌐 Яндекс Браузер (ПК):\n' +
                  '1. Нажмите три точки ⋮ в правом верхнем углу\n' +
                  '2. Выберите "Установить приложение"\n' +
                  '3. Подтвердите установку\n\n' +
                  '📱 Яндекс Браузер (телефон):\n' +
                  '1. Нажмите три точки ⋮ внизу\n' +
                  '2. "Добавить на главный экран"');
        }
    });

    window.addEventListener('appinstalled', () => {
        installBtn.style.display = 'none';
        deferredPrompt = null;
        console.log('PWA: приложение установлено');
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
        installBtn.style.display = 'none';
        console.log('PWA: приложение уже установлено, кнопка скрыта');
    }
})();
