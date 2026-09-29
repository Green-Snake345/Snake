from flask import Flask, send_from_directory, abort
import logging
import os

logging.basicConfig(
    filename='snake.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)

ALLOWED = {'index.html', 'index.js', 'style.css'}

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    if filename not in ALLOWED:
        abort(404)
    return send_from_directory('.', filename)

@app.errorhandler(500)
def internal_error(error):
    app.logger.exception("Внутренняя ошибка сервера")
    return "Ошибка сервера", 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False, threaded=True)
