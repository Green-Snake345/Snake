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
        
        const ua = navigator.userAgent;
        const isYandex = /YaBrowser/i.test(ua);
        const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
        const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua) && !isYandex;
        
        let message = '';

        if (deferredPrompt && !isYandex) {
            console.log('PWA: показываем нативный диалог');
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                console.log('PWA: пользователь выбрал', choiceResult.outcome);
                deferredPrompt = null;
                installBtn.style.display = 'none';
            });
            return;
        }

        if (isMobile) {
            
            if (isSafari) {
                message = '🍎 Установка на iPhone/iPad (Safari):\n\n' +
                          '1. Нажмите кнопку «Поделиться» (квадрат со стрелкой вверх) внизу экрана\n' +
                          '2. В меню выберите «На экран «Домой»»\n' +
                          '3. Нажмите «Добавить»';
            } else if (isYandex) {
                message = '📱 Установка на телефон (Яндекс Браузер):\n\n' +
                          '1. Нажмите три точки ⋮ внизу экрана\n' +
                          '2. Выберите «Добавить на главный экран»\n' +
                          '3. Подтвердите добавление';
            } else {
                
                message = '🤖 Установка на Android (Chrome и др.):\n\n' +
                          '1. Нажмите три точки ⋮ в правом верхнем углу\n' +
                          '2. Выберите «Установить приложение» или «Добавить на гл. экран»\n' +
                          '3. Подтвердите установку';
            }
        } else {
            
            if (isYandex) {
                message = '💻 Установка на ПК (Яндекс Браузер):\n\n' +
                          '1. Нажмите три точки ⋮ в правом верхнем углу\n' +
                          '2. Выберите «Установить приложение»\n' +
                          '3. Подтвердите установку';
            } else if (/Firefox/i.test(ua)) {
                message = '⚠️ Firefox не поддерживает установку приложений.\n\n' +
                          'Пожалуйста, откройте сайт в Chrome, Edge или Яндекс Браузере.';
            } else {
               
                message = '💻 Установка на ПК (Chrome/Edge):\n\n' +
                          '1. Нажмите иконку установки ⬇️ справа в адресной строке\n' +
                          '   ИЛИ\n' +
                          '2. Нажмите три точки ⋮ → «Установить приложение»';
            }
        }

        console.log('PWA: показываем инструкцию для', isMobile ? 'мобильного' : 'ПК');
        alert(message);
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
