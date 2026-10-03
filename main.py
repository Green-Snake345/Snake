from flask import Flask, send_from_directory, abort
import logging
from logging.handlers import RotatingFileHandler
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_PATH = os.path.join(BASE_DIR, 'snake.log')
ALLOWED_FILES = {'index.html', 'index.js', 'style.css'}

handler = RotatingFileHandler(LOG_PATH, maxBytes=1000000, backupCount=3)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s %(levelname)s')
handler.setFormatter(formatter)

app = Flask(__name__)
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    if '..' in filename or '/' in filename or '\\' in filename:
        app.logger.warning(f"Попытка доступа к запрещённому пути: {filename}")
        abort(403)
    if filename not in ALLOWED_FILES:
        app.logger.warning(f"Попытка доступа к неразрешённому файлу: {filename}")
        abort(404)
    return send_from_directory('.', filename)

@app.errorhandler(403)
def forbidden(error):
    return "Доступ запрещён", 403

@app.errorhandler(500)
def internal_error(error):
    app.logger.exception("Внутренняя ошибка сервера")
    return "Ошибка сервера", 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5000'))
    app.run(host='0.0.0.0', port=port, debug=False, threaded=False)
