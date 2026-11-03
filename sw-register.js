if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((reg) => console.log('SW зарегистрирован:', reg.scope))
            .catch((e) => console.log('SW ошибка:', e));
    });
}
