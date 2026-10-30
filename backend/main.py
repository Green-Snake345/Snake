from flask import Flask, send_from_directory, abort, request, make_response, jsonify
import logging
from logging.handlers import RotatingFileHandler
import os
import time
import json
import sqlite3
import ipaddress
import threading
import requests
from waitress import serve

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

if os.path.exists('/data') and os.access('/data', os.W_OK):
    DATA_DIR = '/data'
else:
    DATA_DIR = BASE_DIR

os.makedirs(DATA_DIR, exist_ok=True)
LOG_PATH = os.path.join(DATA_DIR, 'snake.log')
DB_PATH = os.path.join(DATA_DIR, 'analytics.db')

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

BLOCKED_COUNTRIES = {
    'UA', 'US', 'FI', 'CN', 'JP', 'DE', 'ME', 'NO', 'SE', 'FR', 'BY', 'PL',
    'KZ', 'LT', 'LV', 'GB', 'ES', 'IT', 'NL', 'KR', 'TR', 'BR', 'CZ', 'HU',
    'RO', 'GR', 'IL', 'VN', 'ID', 'CH', 'AT', 'BE', 'RS', 'HR', 'MD', 'EE',
    'IE', 'DK', 'TH', 'PH', 'PT', 'PK', 'SA', 'AE', 'MX', 'IS', 'BA', 'BD',
    'LK', 'MY', 'LA', 'MN', 'UZ', 'KG', 'AZ', 'GE', 'AM', 'TJ', 'TM', 'IR',
    'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CG',
    'CD', 'CI', 'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN',
    'GW', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ',
    'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD',
    'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW', 'EH', 'RE', 'YT', 'SH', 'CU', 'AR',
    'VE', 'KP'
}

WHITE_COUNTRIES = {'RU'}

FORBIDDEN_TRANSLATIONS = {
    'US': ('Access Restricted', 'Unfortunately, the game is not available in your region'),
    'UA': ('Доступ обмежено', 'На жаль, гра недоступна у вашому регіоні'),
    'FI': ('Pääsy estetty', 'Valitettavasti peli ei ole saatavilla alueellasi'),
    'CN': ('访问受限', '很抱歉，该游戏在您所在的地区不可用'),
    'JP': ('アクセスが制限されています', '申し訳ありませんが、このゲームはお住まいの地域ではご利用いただけません'),
    'DE': ('Zugriff eingeschränkt', 'Leider ist das Spiel in Ihrer Region nicht verfügbar'),
    'ME': ('Pristup ograničen', 'Nažalost, igra nije dostupna u vašoj regiji'),
    'NO': ('Tilgang begrenset', 'Dessverre er spillet ikke tilgjengelig i din region'),
    'SE': ('Åtkomst begränsad', 'Tyvärr är spelet inte tillgängligt i din region'),
    'FR': ('Accès restreint', "Malheureusement, le jeu n'est pas disponible dans votre région"),
    'BY': ('Доступ абмежаваны', 'На жаль, гульня недаступная ў вашым рэгіёне'),
    'PL': ('Dostęp ograniczony', 'Niestety, gra nie jest dostępna w Twoim regionie'),
    'KZ': ('Қолжетімділік шектелген', 'Өкінішке орай, ойын сіздің аймағыңызда қолжетімсіз'),
    'LT': ('Prieiga apribota', 'Deja, žaidimas jūsų regione neprieinamas'),
    'LV': ('Piekļuve ierobežota', 'Diemžēl spēle jūsu reģionā nav pieejama'),
    'GB': ('Access Restricted', 'Unfortunately, the game is not available in your region'),
    'ES': ('Acceso restringido', 'Lamentablemente, el juego no está disponible en tu región'),
    'IT': ('Accesso limitato', 'Sfortunatamente, il gioco non è disponibile nella tua regione'),
    'NL': ('Toegang beperkt', 'Helaas is de game niet beschikbaar in jouw regio'),
    'KR': ('접근 제한됨', '죄송합니다. 이 게임은 귀하의 지역에서 이용할 수 없습니다'),
    'TR': ('Erişim Kısıtlandı', 'Ne yazık ki, oyun bölgenizde mevcut değil'),
    'BR': ('Acesso Restrito', 'Infelizmente, o jogo não está disponível na sua região'),
    'CZ': ('Přístup omezen', 'Hra bohužel není ve vaší oblasti k dispozici'),
    'HU': ('Hozzáférés korlátozva', 'Sajnos a játék nem érhető el az Ön régiójában'),
    'RO': ('Acces restricționat', 'Din păcate, jocul nu este disponibil în regiunea dvs'),
    'GR': ('Περιορισμένη πρόσβαση', 'Δυστυχώς, το παιχνίδι δεν είναι διαθέσιμο στην περιοχή σας'),
    'IL': ('הגישה מוגבלת', 'למרבה הצער, המשחק אינו זמין באזורך'),
    'VN': ('Truy cập bị hạn chế', 'Rất tiếc, trò chơi không khả dụng ở khu vực của bạn'),
    'ID': ('Akses Dibatasi', 'Sayangnya, game ini tidak tersedia di wilayah Anda'),
    'CH': ('Zugriff eingeschränkt', 'Leider ist das Spiel in Ihrer Region nicht verfügbar'),
    'AT': ('Zugriff eingeschränkt', 'Leider ist das Spiel in Ihrer Region nicht verfügbar'),
    'BE': ('Toegang beperkt', 'Helaas is de game niet beschikbaar in jouw regio'),
    'RS': ('Приступ ограничен', 'Нажалост, игра није доступна у вашем региону'),
    'HR': ('Pristup ograničen', 'Nažalost, igra nije dostupna u vašoj regiji'),
    'MD': ('Acces restricționat', 'Din păcate, jocul nu este disponibil în regiunea dvs'),
    'EE': ('Juurdepääs piiratud', 'Kahjuks pole mäng teie piirkonnas saadaval'),
    'IE': ('Access Restricted', 'Unfortunately, the game is not available in your region'),
    'DK': ('Adgang begrænset', 'Desværre er spillet ikke tilgængeligt i din region'),
    'TH': ('การเข้าถึงถูกจำกัด', 'ขออภัย เกมนี้ไม่พร้อมใช้งานในภูมิภาคของคุณ'),
    'PH': ('Limitado ang Pag-access', 'Sa kasamaang palad, hindi available ang laro sa iyong rehiyon'),
    'PT': ('Acesso restrito', 'Infelizmente, o jogo não está disponível na sua região'),
    'MY': ('Akses Terhad', 'Malangnya, permainan ini tidak tersedia di wilayah anda'),
    'PK': ('رسائی محدود ہے', 'بدقسمتی سے، گیم آپ کے علاقے میں دستیاب نہیں ہے'),
    'SA': ('الوصول مقيد', 'لسوء الحظ، اللعبة غير متوفرة في منطقتك'),
    'AE': ('الوصول مقيد', 'لسوء الحظ، اللعبة غير متوفرة في منطقتك'),
    'MX': ('Acceso restringido', 'Lamentablemente, el juego no está disponible en tu región'),
    'IS': ('Aðgangur takmarkaður', 'Því miður er leikurinn ekki í boði á þínu svæði'),
    'BA': ('Pristup ograničen', 'Nažalost, igra nije dostupna u vašoj regiji'),
    'BD': ('অ্যাক্সেস সীমাবদ্ধ', 'দুঃখিত, আপনার অঞ্চলে গেমটি উপলব্ধ নেই'),
    'LK': ('ප්‍රවේශය සීමා කර ඇත', 'කණගාටුයි, ක්‍රීඩාව ඔබේ කලාපයේ නොමැත'),
    'LA': ('ການເຂົ້າເຖິງຖືກຈຳກັດ', 'ຂໍອະໄພ, ເກມນີ້ບໍ່ມີໃຫ້ໃນພາກພື້ນຂອງທ່ານ'),
    'MN': ('Хандалт хязгаарлагдсан', 'Уучлаарай, тоглоом таны бүс нутагт боломжгүй байна'),
    'UZ': ('Kirish cheklangan', "Afsuski, o'yin sizning mintaqangizda mavjud emas"),
    'KG': ('Кирүү чектелген', 'Тилекке каршы, оюн сиздин аймагыңызда жеткиликсиз'),
    'AZ': ('Giriş məhdudlaşdırılıb', 'Təəssüf ki, oyun bölgənizdə mövcud deyil'),
    'GE': ('წვდომა შეზღუდულია', 'სამწუხაროდ, თამაში თქვენს რეგიონში მიუწვდომელია'),
    'AM': ('Մուտքը սահմանափակված է', 'Ցավոք, խաղը հասանելի չէ ձեր տարածաշրջանում'),
    'TJ': ('Дастрасӣ маҳдуд аст', 'Мутаассифона, бозӣ дар минтақаи шумо дастрас нест'),
    'TM': ('Giriş çäklendirilen', 'Gynansak-da, oýun sebitiňizde elýeterli däl'),
    'IR': ('دسترسی محدود شده است', 'متأسفانه، بازی در منطقه شما در دسترس نیست'),
    'VE': ('Acceso Restringido', 'Lamentablemente, el juego no está disponible en tu región'),
    'KP': ('접근 제한됨', '죄송합니다. 이 게임은 귀하의 지역에서 이용할 수 없습니다'),
}

DEFAULT_FORBIDDEN_TEXT = (
    'Доступ ограничен',
    'К сожалению, игра недоступна в вашем регионе',
)

GEO_API_TIMEOUT = 2
GEO_CACHE_TTL = 3600
GEO_ERROR_TTL = 300

handler = RotatingFileHandler(LOG_PATH, maxBytes=1000000, backupCount=3, encoding='utf-8')
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')
handler.setFormatter(formatter)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

app = Flask(__name__)
app.logger.addHandler(handler)
app.logger.addHandler(console_handler)
app.logger.setLevel(logging.INFO)

_geo_session = requests.Session()
_geo_cache = {}
_geo_lock = threading.Lock()


def _get_real_ip():
    forwarded_for = request.headers.get('X-Forwarded-For')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.remote_addr or ''


def _column_exists(conn, table, column):
    cur = conn.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cur.fetchall())

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
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
        ('eaten', 'INTEGER'),
        ('combo', 'INTEGER'),
        ('spent', 'INTEGER'),
        ('balance', 'INTEGER'),
        ('skin_id', 'TEXT'),
        ('previous_score', 'INTEGER'),
    ]
    for col, typ in migrations:
        if not _column_exists(conn, 'events', col):
            conn.execute(f"ALTER TABLE events ADD COLUMN {col} {typ}")
            app.logger.info(f"DB migration: добавлена колонка events.{col}")

    conn.commit()
    conn.close()


try:
    init_db()
    print("База данных инициализирована успешно")
except Exception as e:
    print(f"Ошибка инициализации БД: {e}")
    import traceback
    traceback.print_exc()


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


def _is_private_ip(ip):
    try:
        addr = ipaddress.ip_address(ip)
        return addr.is_private or addr.is_loopback
    except ValueError:
        return False


def _get_country(ip):
    if not ip or _is_private_ip(ip):
        return "XX"
    now = time.time()

    with _geo_lock:
        cached = _geo_cache.get(ip)
        if cached and cached[1] > now:
            return cached[0]

    country = None

    try:
        res = _geo_session.get(
            f'http://ip-api.com/json/{ip}?fields=countryCode',
            timeout=GEO_API_TIMEOUT,
        )
        if res.status_code == 200:
            country = (res.json().get('countryCode') or '').upper()
    except requests.exceptions.ConnectionError as e:
        app.logger.info(f"DNS/Сеть: Не удалось достучаться до ip-api.com для {ip} ({e})")
    except requests.exceptions.Timeout:
        app.logger.info(f"Таймаут при запросе к ip-api.com для {ip}")
    except requests.exceptions.RequestException as e:
        app.logger.info(f"Ошибка запроса к ip-api.com для {ip}: {e}")

    if not country:
        try:
            res = _geo_session.get(
                f'https://get.geojs.io/v1/ip/country/{ip}.json',
                timeout=GEO_API_TIMEOUT,
            )
            if res.status_code == 200:
                country = (res.json().get('country') or '').upper()
        except requests.exceptions.RequestException:
            pass

    with _geo_lock:
        ttl = GEO_CACHE_TTL if country else GEO_ERROR_TTL
        _geo_cache[ip] = (country, now + ttl)

    return country


@app.before_request
def block_countries():
    if request.path == '/health' or request.method == 'OPTIONS':
        return

    if request.path != '/' and not request.path.startswith('/api/') :
        return

    ip = _get_real_ip()
    if not ip or _is_private_ip(ip):
        return

    country = _get_country(ip)

    if country and country in WHITE_COUNTRIES:
        return

    if country and country in BLOCKED_COUNTRIES:
        app.logger.warning(f"Заблокирован доступ из страны: {country} | IP: {ip}")
        abort(403)


@app.before_request
def log_request():
    setattr(request, 'start_time', time.time())


@app.after_request
def log_response(response):
    duration = time.time() - getattr(request, 'start_time', time.time())

    if request.path not in ('/favicon.ico', '/api/track') and not request.path.endswith(('.css', '.js')):
        real_ip = _get_real_ip()
        country = _get_country(real_ip) or "XX"
        app.logger.info(
            f"{real_ip} [{country}] | {request.method} {request.path} | "
            f"{response.status_code} | {duration * 1000:.1f}ms"
        )
    return response


@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Content-Security-Policy'] = (
        "default-src 'self';"
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;"
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;"
        "img-src 'self' data:;"
        "font-src 'self';"
        "connect-src 'self' https://get.geojs.io;")
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

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(BASE_DIR, 'favicon.ico', mimetype='image/x-icon')

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

    if not isinstance(body, dict):
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
            _to_int(body.get('duration_sec')), 
            _to_str(body.get('mode'), 32),
            _to_str(body.get('platform'), 32),
            _to_str(body.get('message'), 500),
            _to_str(body.get('stack'), 1500),
            _to_str(body.get('context'), 64),
            _to_str(body.get('url'), 500),
            _to_str(body.get('ua'), 300),
            _to_str(_get_real_ip(), 64),
            _to_str(json.dumps(body, ensure_ascii=False), 4000),
            _to_int(body.get('eaten')),
            _to_int(body.get('max_combo')),    
            _to_int(body.get('price')),        
            _to_int(body.get('balance')),
            _to_str(body.get('skin') or body.get('skin_id'), 64),     
            _to_int(body.get('previous_score')),
        ))
        conn.commit()

        if event in ('GameStarted', 'GameOver'):
            real_ip = _get_real_ip()
            country = _get_country(real_ip) or "XX"
            score_str = f" | Score: {body.get('score')}" if event == 'GameOver' else ""
            app.logger.info(f"🎮 ИГРА: {real_ip} [{country}] | {event}{score_str}")

        return ('', 204)
    except Exception as e:
        app.logger.exception(f"track error: {e}")
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
    ip = _get_real_ip()
    country = ''
    if ip and not _is_private_ip(ip):
        country = _get_country(ip) or ''
    title, message = FORBIDDEN_TRANSLATIONS.get(country, DEFAULT_FORBIDDEN_TEXT)
    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>{title}</title>
<style>
body {{ display:flex; justify-content:center; align-items:center; height:100vh; background:#0b1020; color:white; font-family:'Microsoft YaHei','PingFang SC','Hiragino Sans','Yu Gothic','Noto Sans SC','Noto Sans JP',sans-serif; text-align:center; margin:0; padding:20px; box-sizing:border-box; }}
h1 {{ color:#ff4444; font-size:32px; margin-bottom:10px; }}
p  {{ font-size:18px; opacity:0.8; }}
</style>
</head>
<body>
<div>
<h1>{title}</h1>
<p>{message}</p>
</div>
</body>
</html>"""
    return html, 403


@app.errorhandler(404)
def not_found(error):
    return "Файл не найден", 404


@app.errorhandler(413)
def payload_too_large(error):
    return jsonify({'error': 'payload too large'}), 413


@app.errorhandler(500)
def internal_error(error):
    app.logger.exception("Внутренняя ошибка сервера")
    return "Ошибка сервера", 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Запуск сервера на порту {port}", flush=True)

    serve(app, host='0.0.0.0', port=port, threads=6, connection_limit=200, channel_timeout=30)
