(function() {
    var fill = null;
    var progress = 0;
    var interval = null;
    var finished = false;
    var MIN_SHOW_TIME = 1200;
    var startTime = Date.now();

    function updateProgress() {
        if (finished) return;
        progress += 1;
        if (progress >= 100) {
            progress = 100;
            if (fill) fill.style.width = progress + '%';
            finished = true;
            clearInterval(interval);
            checkAndHide();
            return;
        }
        if (fill) fill.style.width = progress + '%';
    }

    function checkAndHide() {
        var elapsed = Date.now() - startTime;
        if (elapsed < MIN_SHOW_TIME) {
            setTimeout(checkAndHide, MIN_SHOW_TIME - elapsed);
            return;
        }
        hideLoader();
    }

    function hideLoader() {
        var loader = document.getElementById('loading-screen');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(function() {
                loader.style.display = 'none';
            }, 500);
        }
    }

    window.addEventListener('load', function() {
        fill = document.querySelector('.progress-fill');
        if (fill) {
            interval = setInterval(updateProgress, 12);
        }
    });
})();
