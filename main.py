from flask import Flask, send_from_directory, abort, request, make_response
import logging
from logging.handlers import RotatingFileHandler
import os
import time
from waitress import serve

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_PATH = os.path.join(BASE_DIR, 'snake.log')
ALLOWED_FILES = {'index.html', 'index.js', 'style.css', 'favicon.ico'}
CACHE_TIME = {'index.html': 0, 'index.js': 3600, 'style.css': 3600, 'favicon.ico': 86400}

handler = RotatingFileHandler(LOG_PATH, maxBytes=1000000, backupCount=3, encoding='utf-8')
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')
handler.setFormatter(formatter)

app = Flask(__name__)
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)

@app.before_request
def log_request():
    request.start_time = time.time()

@app.after_request
def log_response(response):
    duration = time.time() - getattr(request, 'start_time', time.time())
    if request.path not in ('/favicon.ico',) and not request.path.endswith(('.css', '.js')):
        app.logger.info(
        f"{request.remote_addr} | {request.method} {request.path} | "
        f"{response.status_code} | {duration*1000:.1f}ms")
    return response

@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self'; "
        "img-src 'self' data:; "
        "font-src 'self';")
    return response

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/health')
def health():
    return {'status': 'Окей', 'service': 'Змейка'}, 200

@app.route('/<path:filename>')
def static_files(filename):
    if '..' in filename or '/' in filename or '\\' in filename:
        app.logger.warning(f"Попытка доступа к запрещённому пути: {filename}")
        abort(403)
    if filename not in ALLOWED_FILES:
        app.logger.warning(f"Попытка доступа к неразрешённому файлу: {filename}")
        abort(404)
    response = make_response(send_from_directory(BASE_DIR, filename))
    cache_time = CACHE_TIME.get(filename, 0)
    return send_from_directory(BASE_DIR, filename)

@app.errorhandler(403)
def forbidden(error):
    return "Доступ запрещён", 403

@app.errorhandler(404)
def not_found(error):
    return "Файл не найден", 404

@app.errorhandler(500)
def internal_error(error):
    app.logger.exception("Внутренняя ошибка сервера")
    return "Ошибка сервера", 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5000'))
    serve(app, host='0.0.0.0', port=port, threads=6, connection_limit=200, channel_timeout=30)
