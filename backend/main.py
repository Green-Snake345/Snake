from flask import Flask, send_from_directory, abort, request, make_response, jsonify
import logging
from logging.handlers import RotatingFileHandler
import os
import time
import json
import sqlite3
from waitress import serve
import requests
from werkzeug.middleware.proxy_fix import ProxyFix

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_PATH = os.path.join(BASE_DIR, 'snake.log')
DB_PATH = os.path.join(BASE_DIR, 'analytics.db')

ALLOWED_FILES = {'index.html', 'index.js', 'style.css', 'favicon.ico', 'track.js', 'analytics.js', 'block.js'}
CACHE_TIME = {
    'index.html': 0,
    'index.js': 3600,
    'style.css': 3600,
    'favicon.ico': 86400,
    'track.js': 3600,
    'analytics.js': 3600,
    'block.js': 3600,
}

BLOCKED_COUNTRIES = {'UA', 'US', 'FI', 'CN', 'JP', 'DE', 'ME', 'NO', 'SE', 'FR', 'BY'}

handler = RotatingFileHandler(LOG_PATH, maxBytes=1000000, backupCount=3, encoding='utf-8')
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')
handler.setFormatter(formatter)

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)

def _column_exists(conn, table, column):
    cur = conn.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cur.fetchall())

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS events (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            event       TEXT    NOT NULL,
            session_id  TEXT,
            score       INTEGER,
            level       INTEGER,
            reason      TEXT,
            duration    INTEGER,
            mode        TEXT,
            platform    TEXT,
            message     TEXT,
            stack       TEXT,
            context     TEXT,
            url         TEXT,
            ua          TEXT,
            ip          TEXT,
            raw         TEXT,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            eaten           INTEGER,
            combo           INTEGER,
            spent           INTEGER,
            balance         INTEGER,
            skin_id         TEXT,
            previous_score  INTEGER
        );
        CREATE INDEX IF NOT EXISTS idx_events_event   ON events(event);
        CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
    """)

    migrations = [
        ('eaten',          'INTEGER'),
        ('combo',          'INTEGER'),
        ('spent',          'INTEGER'),
        ('balance',        'INTEGER'),
        ('skin_id',        'TEXT'),
        ('previous_score', 'INTEGER'),
    ]
    for col, typ in migrations:
        if not _column_exists(conn, 'events', col):
            conn.execute(f"ALTER TABLE events ADD COLUMN {col} {typ}")
            app.logger.info(f"DB migration: добавлена колонка events.{col}")

    conn.commit()
    conn.close()

init_db()

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def _to_int(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None

def _to_str(v, limit):
    if v is None:
        return None
    return str(v)[:limit]

@app.before_request
def block_countries():
    ip = request.remote_addr

    if ip in ('127.0.0.1', 'localhost') or ip.startswith('192.168.') or ip.startswith('10.'):
        return

    try:
        res = requests.get(f'http://ip-api.com/json/{ip}?fields=countryCode', timeout=2)
        if res.status_code == 200:
            data = res.json()
            country = data.get('countryCode', '')

            if country in BLOCKED_COUNTRIES:
                app.logger.warning(f"Заблокирован доступ из страны: {country} | IP: {ip}")
                abort(403)
    except Exception as e:
        app.logger.error(f"Ошибка проверки IP: {e}")

@app.before_request
def log_request():
    request.start_time = time.time()

@app.after_request
def log_response(response):
    duration = time.time() - getattr(request, 'start_time', time.time())
    if request.path not in ('/favicon.ico', '/api/track') and not request.path.endswith(('.css', '.js')):
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
        "default-src 'self';"
        "script-src 'self' 'unsafe-inline';"
        "style-src 'self' 'unsafe-inline';"
        "img-src 'self' data:;"
        "font-src 'self';"
        "connect-src 'self';")
    return response

def _apply_cache_headers(response, filename):
    cache_time = CACHE_TIME.get(filename, 0)
    if cache_time > 0:
        response.headers['Cache-Control'] = f'public, max-age={cache_time}'
    else:
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response

@app.route('/')
def index():
    response = make_response(send_from_directory(BASE_DIR, 'index.html'))
    return _apply_cache_headers(response, 'index.html')

@app.route('/health')
def health():
    response = make_response(jsonify({'status': 'Окей', 'service': 'Змейка'}), 200)
    response.headers['Cache-Control'] = 'no-store'
    return response

@app.route('/api/track', methods=['POST', 'OPTIONS'])
def api_track():
    if request.method == 'OPTIONS':
        return ('', 204)

    try:
        if request.is_json:
            body = request.get_json(silent=True) or {}
        else:
            raw = request.get_data(as_text=True) or ''
            body = json.loads(raw) if raw else {}
    except Exception:
        body = {}

    event = body.get('event')
    if not event or not isinstance(event, str):
        return jsonify({'error': 'event is required'}), 400
    conn = None
    try:
        conn = db()
        conn.execute("""
            INSERT INTO events (
                event, session_id, score, level, reason, duration, mode, platform,
                message, stack, context, url, ua, ip, raw,
                eaten, combo, spent, balance, skin_id, previous_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            _to_str(event, 64),
            _to_str(body.get('sessionId'), 64),
            _to_int(body.get('score')),
            _to_int(body.get('level')),
            _to_str(body.get('reason'), 64),
            _to_int(body.get('duration')),
            _to_str(body.get('mode'), 32),
            _to_str(body.get('platform'), 32),
            _to_str(body.get('message'), 500),
            _to_str(body.get('stack'), 1500),
            _to_str(body.get('context'), 64),
            _to_str(body.get('url'), 500),
            _to_str(body.get('ua'), 300),
            _to_str(request.remote_addr, 64),
            _to_str(json.dumps(body, ensure_ascii=False), 4000),
            _to_int(body.get('eaten')),
            _to_int(body.get('combo')),
            _to_int(body.get('spent')),
            _to_int(body.get('balance')),
            _to_str(body.get('skin_id'), 64),
            _to_int(body.get('previous_score')),
        ))
        conn.commit()
        conn.close()
        return ('', 204)
    except Exception as e:
        app.logger.exception(f"track error: {e}")
        return jsonify({'error': 'internal'}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/stats', methods=['GET'])
def api_stats():
    conn = None
    try:
        conn = db()

        totals = [dict(r) for r in conn.execute("""
            SELECT event, COUNT(*) AS count
            FROM events
            GROUP BY event
            ORDER BY count DESC
        """).fetchall()]

        by_day = [dict(r) for r in conn.execute("""
            SELECT DATE(created_at) AS day, COUNT(*) AS count
            FROM events
            WHERE event = 'game_started'
            GROUP BY DATE(created_at)
            ORDER BY day DESC
            LIMIT 30
        """).fetchall()]

        sessions = conn.execute("""
            SELECT COUNT(DISTINCT session_id) AS total
            FROM events
            WHERE session_id IS NOT NULL
        """).fetchone()['total']

        scores = dict(conn.execute("""
            SELECT
                COUNT(*)      AS games,
                MAX(score)    AS best,
                AVG(score)    AS avg,
                SUM(duration) AS total_seconds
            FROM events
            WHERE event = 'game_over' AND score IS NOT NULL
        """).fetchone())

        top_scores = [dict(r) for r in conn.execute("""
            SELECT score, session_id, created_at
            FROM events
            WHERE event = 'game_over' AND score IS NOT NULL
            ORDER BY score DESC
            LIMIT 20
        """).fetchall()]

        errors = [dict(r) for r in conn.execute("""
            SELECT message, context, COUNT(*) AS count
            FROM events
            WHERE event IN ('js_error', 'resource_error')
            GROUP BY message, context
            ORDER BY count DESC
            LIMIT 20
        """).fetchall()]

        platforms = [dict(r) for r in conn.execute("""
            SELECT platform, COUNT(DISTINCT session_id) AS sessions
            FROM events
            WHERE platform IS NOT NULL
            GROUP BY platform
        """).fetchall()]

        combos = dict(conn.execute("""
            SELECT
                MAX(combo)  AS best,
                AVG(combo)  AS avg,
                COUNT(*)    AS games
            FROM events
            WHERE event = 'game_over' AND combo IS NOT NULL
        """).fetchone())

        eaten_stats = dict(conn.execute("""
            SELECT
                MAX(eaten)  AS best,
                AVG(eaten)  AS avg,
                SUM(eaten)  AS total
            FROM events
            WHERE event = 'game_over' AND eaten IS NOT NULL
        """).fetchone())

        shop = dict(conn.execute("""
            SELECT
                COUNT(*)    AS purchases,
                SUM(spent)  AS total_spent,
                AVG(spent)  AS avg_spent
            FROM events
            WHERE event = 'shop_buy' AND spent IS NOT NULL
        """).fetchone())

        skins = [dict(r) for r in conn.execute("""
            SELECT skin_id, COUNT(*) AS count
            FROM events
            WHERE event = 'skin_changed' AND skin_id IS NOT NULL
            GROUP BY skin_id
            ORDER BY count DESC
            LIMIT 10
        """).fetchall()]

        conn.close()

        return jsonify({
            'totals': totals,
            'byDay': by_day,
            'sessions': sessions,
            'scores': scores,
            'topScores': top_scores,
            'errors': errors,
            'platforms': platforms,
            'combos': combos,
            'eaten': eaten_stats,
            'shop': shop,
            'skins': skins,
        })
    except Exception as e:
        app.logger.exception(f"stats error: {e}")
        return jsonify({'error': 'internal'}), 500
    finally:
        if conn:
            conn.close()

@app.route('/<path:filename>')
def static_files(filename):
    if '..' in filename or '/' in filename or '\\' in filename:
        app.logger.warning(f"Попытка доступа к запрещённому пути: {filename}")
        abort(403)
    if filename not in ALLOWED_FILES:
        app.logger.warning(f"Попытка доступа к неразрешённому файлу: {filename}")
        abort(404)
    response = make_response(send_from_directory(BASE_DIR, filename))
    return _apply_cache_headers(response, filename)

@app.errorhandler(403)
def forbidden(error):
    html = """
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Доступ ограничен</title>
        <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; background: #0b1020; color: white; font-family: sans-serif; text-align: center; margin: 0; }
            h1 { color: #ff4444; font-size: 32px; margin-bottom: 10px; }
            p { font-size: 18px; opacity: 0.8; }
        </style>
    </head>
    <body>
        <div>
            <h1>Доступ ограничен</h1>
            <p>К сожалению, игра недоступна в вашей стране.</p>
        </div>
    </body>
    </html>
    """
    return html, 403

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
