from flask import Flask, send_from_directory, abort
import logging
from logging.handlers import RotatingFileHandler
import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'snake.db')
LOG_PATH = os.path.join(BASE_DIR, 'snake.log')
ALLOWED = {'index.html', 'index.js', 'style.css'}

handler = RotatingFileHandler(LOG_PATH, maxBytes=1000000, backupCount=3)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s %(levelname)s')
handler.setFormatter(formatter)

app = Flask(__name__)
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)

def init_db():
    connection = sqlite3.connect(DB_PATH)
    
    cursor = connection.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            high_score INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            high_score INTEGER DEFAULT 0,
            max_snake_length INTEGER DEFAULT 1,
            best_time_seconds INTEGER DEFAULT 0,
            total_score INTEGER DEFAULT 0,
            games_played INTEGER DEFAULT 0,
            total_apples_eaten INTEGER DEFAULT 0,
            total_play_time INTEGER DEFAULT 0,
            total_deaths INTEGER DEFAULT 0,
            coins INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            experience INTEGER DEFAULT 0,
            sound_enabled INTEGER DEFAULT 1,
            music_volume REAL DEFAULT 0.5,
            equipped_skin TEXT DEFAULT 'green',
            equipped_background TEXT DEFAULT 'classic',
            
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS game_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            snake_length INTEGER NOT NULL,
            apples_eaten INTEGER NOT NULL,
            duration_seconds INTEGER NOT NULL,
            difficulty TEXT DEFAULT 'normal',
            death_reason TEXT,                          -- 'wall', 'self', 'timeout'
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            description TEXT NOT NULL,
            icon TEXT,
            reward_coins INTEGER DEFAULT 0
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_achievements (
            user_id INTEGER NOT NULL,
            achievement_id INTEGER NOT NULL,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, achievement_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS shop_items (
            id INTEGER PRIMARY KEY,
            item_type TEXT NOT NULL,                    -- 'skin', 'background', 'trail'
            item_name TEXT UNIQUE NOT NULL,
            price INTEGER NOT NULL,
            preview_image TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_inventory (
            user_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, item_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES shop_items(id) ON DELETE CASCADE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_history_user ON game_history(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_history_score ON game_history(score DESC)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_highscore ON users(high_score DESC)')

    connection.commit()
    connection.close()
    print("База данных инициализирована")
    connection.commit()
    connection.close()

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
    app.run(host='0.0.0.0', port=3000, debug=False, threaded=True)
