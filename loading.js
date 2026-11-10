(function() {
    var fill = null;
    var progress = 0;
    var interval = null;
    var finished = false;
    var MIN_SHOW_TIME = 3000;
    var startTime = null;

    function updateProgress() {
        if (finished) return;
        if (!startTime) startTime = Date.now();
        
        var elapsed = Date.now() - startTime;
        progress = Math.min(100, (elapsed / MIN_SHOW_TIME) * 100);
        
        if (fill) fill.style.width = progress + '%';
        
        if (progress >= 100) {
            finished = true;
            clearInterval(interval);
            setTimeout(hideLoader, 300);
        }
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
        fill = document.querySelector('.loading-bar-fill');
        if (fill) {
            interval = setInterval(updateProgress, 50);
        }
    });
})();
