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
})();
