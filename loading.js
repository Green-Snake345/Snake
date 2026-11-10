(function() {
    var fill = null;
    var progress = 0;
    var interval = null;
    var finished = false;

    function updateProgress() {
        if (finished) return;
        progress += 2;
        if (progress >= 100) {
            progress = 100;
            finished = true;
            clearInterval(interval);
            setTimeout(hideLoader, 300);
        }
        if (fill) fill.style.width = progress + '%';
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
            interval = setInterval(updateProgress, 40);
        }
    });
})();
