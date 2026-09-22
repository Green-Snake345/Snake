'use strict';

var canvas = document.getElementById('game');
var ctx    = canvas.getContext('2d');

function el(id) {
  var e = document.getElementById(id);
  if (!e) console.warn('Элемент не найден: ' + id);
  return e;
}

var screens = {
  mainMenu:     el('main-menu'),
  instructions: el('instructions-screen'),
  about:        el('about-screen'),
  settings:     el('settings-screen'),
  shop:         el('shop-screen'),
  game:         el('game-screen'),
  gameOver:     el('game-over-overlay'),
  pause:        el('pause-overlay'),
  levelBanner:  el('level-up-banner'),
  exitConfirm:  el('exit-confirm')
};

var ui = {
  play:            el('btn-play'),
  shop:            el('btn-shop'),
  shopBack:        el('btn-back-from-shop'),
  shopItems:       el('shop-items'),
  shopCoins:       el('shop-coins-value'),
  settings:        el('btn-settings'),
  instructions:    el('btn-instructions'),
  about:           el('btn-about'),
  backAbout:       el('btn-back-from-about'),
  exit:            el('btn-exit'),
  exitYes:         el('btn-exit-yes'),
  exitNo:          el('btn-exit-no'),
  backInstr:       el('btn-back-from-instructions'),
  backSettings:    el('btn-back-from-settings'),
  saveSettings:    el('btn-save-settings'),
  resetSettings:   el('btn-reset-settings'),
  pauseBtn:        el('btn-pause'),
  restart:         el('btn-restart'),
  toMenu:          el('btn-to-menu'),
  restartOverlay:  el('btn-restart-from-overlay'),
  backToMenu:      el('btn-back-to-menu'),
  resume:          el('btn-resume'),
  pauseToMenu:     el('btn-pause-to-menu'),
  score:           el('score-display'),
  level:           el('level-display'),
  highScore:       el('high-score-display'),
  finalScore:      el('final-score'),
  finalLevel:      el('final-level'),
  finalEaten:      el('final-eaten'),
  finalTime:       el('final-time'),
  finalCombo:      el('final-combo'),
  finalCoins:      el('final-coins'),
  newRecord:       el('new-record'),
  combo:           el('combo-display'),
  comboVal:        el('combo-val'),
  powerupBar:      el('powerup-bar'),
  levelUpNum:      el('level-up-num'),
  canvasContainer: el('canvas-container'),
  feverOverlay:    el('fever-overlay'),
  msHighscore:     el('ms-highscore'),
  msGames:         el('ms-games'),
  msEaten:         el('ms-eaten'),
  coinsValue:      el('coins-value'),
  hudCoins:        el('hud-coins'),
  aboutGames:      el('about-games'),
  aboutEaten:      el('about-eaten'),
  aboutBest:       el('about-best'),
  aboutCoins:      el('about-coins'),
  difficulty:      el('difficulty-select'),
  gridSize:        el('grid-size-select'),
  theme:           el('theme-select'),
  gridToggle:      el('grid-toggle'),
  trailToggle:     el('trail-toggle'),
  speedSlider:     el('speed-slider'),
  speedValue:      el('speed-value'),
  snakeColor:      el('snake-color-picker'),
  volume:          el('volume-slider'),
  volumeValue:     el('volume-value'),
  particles:       el('particles-toggle'),
  shake:           el('shake-toggle'),
  vibration:       el('vibration-toggle'),
  autoPause:       el('auto-pause-toggle'),
  mobileSize:      el('mobile-size-select'),
  leftHanded:      el('left-handed-toggle'),
  highContrast:    el('contrast-toggle'),
  performanceMode: el('performance-mode-select'),
  skinOptions:     document.querySelectorAll('.skin-option'),
  btnContinue:     el('btn-continue'),
  mobilePause:     el('btn-mobile-pause'),
  directionButtons: document.querySelectorAll('.direction-btn[data-direction]'),
  questsList:      el('quests-list')
};

var ACHIEVEMENTS = {
  firstGame:  { name: 'Новичок',    desc: 'Сыграйте первую игру',            icon: '🏆' },
  eaten10:    { name: 'Голодный',   desc: 'Съешьте 10 яблок за всё время',   icon: '🍎' },
  eaten50:    { name: 'Обжора',     desc: 'Съешьте 50 яблок за всё время',   icon: '🍔' },
  played10:   { name: 'Ветеран',    desc: 'Сыграйте 10 игр',                 icon: '🎮' },
  score100:   { name: 'Сотка',      desc: 'Наберите 100 очков за игру',       icon: '💯' },
  score500:   { name: 'Мастер',     desc: 'Наберите 500 очков за игру',      icon: '⭐' },
  level5:     { name: 'Альпинист',  desc: 'Достигните 5 уровня',             icon: '🧗' },
  combo8:     { name: 'Комбо-мастер', desc: 'Соберите комбо x8',            icon: '🔥' },
  fever3:     { name: 'Лихорадка',  desc: 'Активируйте лихорадку 3 раза',    icon: '😵' },
  coins100:   { name: 'Копилка',    desc: 'Соберите 100 монет за всё время', icon: '💰' }
};


var SKIN_CATALOG = [
  { id: 'classic',    color: '#2ecc71', name: 'Классика',     price: 0 },
  { id: 'neon',       color: '#00FFFF', name: 'Неоновый',     price: 0 },
  { id: 'violet',     color: '#8E44AD', name: 'Фиолетовый',   price: 0 },
  { id: 'golden',     color: '#F1C40F', name: 'Золотой',      price: 0 },
  { id: 'scarlet',    color: '#e74c3c', name: 'Алый',         price: 0 },
  { id: 'shadow',     color: '#000000', name: 'Тень',         price: 0 },
  { id: 'turquoise',  color: '#1abc9c', name: 'Бирюзовый',    price: 50 },
  { id: 'coral',      color: '#ff6b6b', name: 'Коралловый',   price: 50 },
  { id: 'indigo',     color: '#4b0082', name: 'Индиго',       price: 75 },
  { id: 'lime',       color: '#c4e538', name: 'Лаймовый',     price: 75 },
  { id: 'raspberry',  color: '#e91e63', name: 'Малиновый',    price: 100 },
  { id: 'bronze',     color: '#cd7f32', name: 'Бронзовый',    price: 100 },
  { id: 'silver',     color: '#c0c0c0', name: 'Серебряный',   price: 120 },
  { id: 'mint',       color: '#98fb98', name: 'Мятный',       price: 120 },
  { id: 'peach',      color: '#ffb07c', name: 'Персиковый',   price: 150 },
  { id: 'sapphire',   color: '#0f52ba', name: 'Сапфировый',   price: 150 },
  { id: 'fuchsia',    color: '#ff00ff', name: 'Фуксия',       price: 200 },
  { id: 'lavender',   color: '#e6e6fa', name: 'Лавандовый',   price: 200 },
  { id: 'flame',      color: 'flame',   name: 'Огненный',  price: 9000 },
  { id: 'rainbow',    color: 'rainbow', name: 'Радужный',     price: 500 }
];

var S = {
  grid: 16,
  count: 0,
  snake: { x: 160, y: 160, dx: 0, dy: 0, cells: [], maxCells: 4 },
  foods: [],
  obstacles: [],
  score: 0,
  highScore: 0,
  totalEaten: 0,
  gamesPlayed: 0,
  level: 1,
  foodPerLevel: 5,
  eatenThisLevel: 0,
  isRunning: false,
  isPaused: false,
  isMoving: false,
  difficulty: 'normal',
  particles: [],
  trail: [],
  showTrail: true,
  showParticles: true,
  showShake: true,
  vibration: true,
  autoPause: true,
  mobileSize: 'standard',
  leftHanded: false,
  highContrast: false,
  performanceMode: 'balanced',
  showGrid: true,
  volume: 0.5,
  shakeAmount: 0,
  theme: 'dark',
  baseSpeed: 5,
  snakeColor: '#2ecc71',
  snakeSkinId: 'classic',
  combo: 1,
  comboTimer: 0,
  comboTimeout: 2500,
  shield: 0,
  slow: 0,
  magnet: 0,
  fever: 0,
  popups: [],
  deathFragments: [],
  maxComboThisGame: 1,
  sessionStartTime: 0,
  hasSavedGame: false,
  coins: 0,
  totalCoins: 0,
  sessionCoins: 0,
  feverCount: 0,
  ownedSkins: ['classic', 'neon', 'violet', 'golden', 'scarlet', 'shadow', 'flame'],
  dailyQuests: [],
  dailyQuestsDate: ''
};

var sessionEaten = 0;
var lastTime = 0;
var audioCtx = null;
var touchStartX = 0;
var touchStartY = 0;
var touchActive = false;

function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
}

function beep(f, d, t, v) {
  if (!audioCtx || S.volume <= 0) return;
  var o = audioCtx.createOscillator();
  var g = audioCtx.createGain();
  o.type = t || 'square';
  o.frequency.setValueAtTime(f, audioCtx.currentTime);
  g.gain.setValueAtTime(S.volume * 0.25 * (v || 1), audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + d);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + d);
}

function haptic(pattern) {
  if (!S.vibration || !navigator.vibrate) return;
  try { navigator.vibrate(pattern); } catch (e) {}
}

var sfx = {
  eat:     function() { beep(660, 0.1, 'square'); },
  gold:    function() { beep(880, 0.08, 'triangle'); setTimeout(function() { beep(1100, 0.1, 'triangle'); }, 70); },
  shield:  function() { beep(440, 0.2, 'sine'); },
  slow:    function() { beep(300, 0.25, 'sine'); },
  magnet:  function() { beep(550, 0.08, 'sawtooth'); setTimeout(function() { beep(700, 0.1, 'sawtooth'); }, 60); },
  fever:   function() { 
    beep(523, 0.08, 'triangle'); 
    setTimeout(function() { beep(659, 0.08, 'triangle'); }, 60);
    setTimeout(function() { beep(784, 0.08, 'triangle'); }, 120);
    setTimeout(function() { beep(1047, 0.15, 'triangle'); }, 180);
  },
  coin:    function() { beep(1200, 0.06, 'sine', 0.6); setTimeout(function() { beep(1600, 0.08, 'sine', 0.6); }, 50); },
  levelUp: function() { beep(523, 0.1, 'triangle'); setTimeout(function() { beep(659, 0.1, 'triangle'); }, 100); setTimeout(function() { beep(784, 0.15, 'triangle'); }, 200); },
  death:   function() { beep(220, 0.3, 'sawtooth'); setTimeout(function() { beep(165, 0.4, 'sawtooth'); }, 150); },
  turn:    function() { beep(440, 0.04, 'sine', 0.5); },
  purchase:function() { beep(800, 0.1, 'triangle'); setTimeout(function() { beep(1000, 0.15, 'triangle'); }, 80); },
  achievement: function() { beep(659, 0.1, 'triangle'); setTimeout(function() { beep(784, 0.1, 'triangle'); }, 100); setTimeout(function() { beep(988, 0.15, 'triangle'); }, 200); }
};

function randInt(a, b) { return Math.floor(Math.random() * (b - a)) + a; }
function now() { return performance.now(); }


function hexToRgb(h) {
  if (h === 'rainbow') return [255, 100, 200];
  if (h === 'flame')   return [255, 100, 0];
  var m = h.replace('#', '').match(/.{2}/g);
  return m ? m.map(function(x) { return parseInt(x, 16); }) : [46, 204, 113];
}


function getFlameColor(t, segmentIndex) {
  var flicker = Math.sin(t * 8 + segmentIndex * 0.5) * 0.5 + 0.5;
  var r = 255;
  var g = Math.floor(60 + flicker * 160);
  var b = Math.floor(flicker * 40);
  return [r, g, b];
}

function getRainbowColor(t) {
  var r = Math.floor(Math.sin(t * 2) * 127 + 128);
  var g = Math.floor(Math.sin(t * 2 + 2) * 127 + 128);
  var b = Math.floor(Math.sin(t * 2 + 4) * 127 + 128);
  return [r, g, b];
}

var THEME_PALETTES = {
    dark: {
        bgDark: '#0a0a0f', panel: '#16161e', card: '#1c1c28',
        accent: '#00e0c6', accent2: '#7b61ff', text: '#e8e8f0',
        dim: '#8888a0', canvas: '#050508',
        background: 'linear-gradient(-45deg, #0a0a0f, #16161e, #1a1a2e, #0f0f1a)'
    },
    light: {
        bgDark: '#f0f2f5', panel: '#ffffff', card: '#f1f3f6',
        accent: '#00a884', accent2: '#6c5ce7', text: '#1a1a1d',
        dim: '#777777', canvas: '#f8f9fa',
        background: 'linear-gradient(-45deg, #f0f2f5, #ffffff, #f1f3f6, #e8eaf0)'
    },
    midnight: {
        bgDark: '#080b1a', panel: '#10162d', card: '#182241',
        accent: '#6ea8fe', accent2: '#8b5cf6', text: '#eef4ff',
        dim: '#9aaed1', canvas: '#050816',
        background: 'linear-gradient(-45deg, #080b1a, #10162d, #161d3d, #090d20)'
    },
    forest: {
        bgDark: '#07140f', panel: '#0d2118', card: '#123321',
        accent: '#57e389', accent2: '#b8e986', text: '#effff4',
        dim: '#86aa94', canvas: '#04100b',
        background: 'linear-gradient(-45deg, #07140f, #0d2118, #123321, #06110c)'
    },
    sunset: {
        bgDark: '#1c0b12', panel: '#2a111a', card: '#391821',
        accent: '#ff9f68', accent2: '#ff5c8a', text: '#fff3ec',
        dim: '#c39aa8', canvas: '#14070c',
        background: 'linear-gradient(-45deg, #1c0b12, #2a111a, #4a1d2a, #211020)'
    },
    cyberpunk: {
        bgDark: '#10051c', panel: '#1b0a31', card: '#291143',
        accent: '#ff4ecd', accent2: '#7df9ff', text: '#fff0fb',
        dim: '#c399c5', canvas: '#080111',
        background: 'linear-gradient(-45deg, #10051c, #1b0a31, #28124b, #09051c)'
    },
    'cyber-sunset': {
        bgDark: '#1a0820', panel: '#2d0f3a', card: '#3d1850',
        accent: '#ff6b9d', accent2: '#feca57', text: '#fff5f9',
        dim: '#d4a5c4', canvas: '#120518',
        background: 'linear-gradient(-45deg, #1a0820, #2d0f3a, #4a1850, #ff6b9d22)'
    },
    ocean: {
        bgDark: '#04131c', panel: '#09232e', card: '#0d3440',
        accent: '#31e7d0', accent2: '#4fa3ff', text: '#e4fbff',
        dim: '#85b6c0', canvas: '#021017',
        background: 'linear-gradient(-45deg, #04131c, #09232e, #0d3440, #031018)'
    },
    rose: {
        bgDark: '#1c0a14', panel: '#29101e', card: '#3b1728',
        accent: '#ff7aa8', accent2: '#c084fc', text: '#fff0f5',
        dim: '#c59aaa', canvas: '#14070e',
        background: 'linear-gradient(-45deg, #1c0a14, #29101e, #471b37, #1d0b20)'
    },
    paper: {
        bgDark: '#f3efe5', panel: '#fffdf7', card: '#ebe5d8',
        accent: '#a85d31', accent2: '#6a7d3b', text: '#302921',
        dim: '#7a6d5e', canvas: '#f8f4eb',
        background: 'linear-gradient(-45deg, #f3efe5, #fffdf7, #ebe5d8, #e9dfd0)'
    },
    retro: {
        bgDark: '#0d0221', panel: '#1a0533', card: '#2d0a4e',
        accent: '#ff00ff', accent2: '#00ffff', text: '#ffffff',
        dim: '#b8b8ff', canvas: '#0a0118',
        background: 'linear-gradient(-45deg, #0d0221, #1a0533, #2d0a4e, #150428)'
    },
    galaxy: {
        bgDark: '#0a0e27', panel: '#151b3d', card: '#1e2654',
        accent: '#a78bfa', accent2: '#60a5fa', text: '#f0f4ff',
        dim: '#9ca3af', canvas: '#070b1f',
        background: 'linear-gradient(-45deg, #0a0e27, #151b3d, #1e2654, #0f1435)'
    },
    matrix: {
        bgDark: '#000000', panel: '#0a0a0a', card: '#141414',
        accent: '#00ff41', accent2: '#008f11', text: '#00ff41',
        dim: '#006400', canvas: '#000000',
        background: 'linear-gradient(-45deg, #000000, #0a0a0a, #141414, #050505)'
    },
    lava: {
        bgDark: '#1a0505', panel: '#2d0a0a', card: '#3d1111',
        accent: '#ff4500', accent2: '#ff6347', text: '#fff5ee',
        dim: '#cd853f', canvas: '#120303',
        background: 'linear-gradient(-45deg, #1a0505, #2d0a0a, #3d1111, #1f0606)'
    },
    arctic: {
        bgDark: '#e8f4f8', panel: '#f0f9ff', card: '#dbeafe',
        accent: '#0ea5e9', accent2: '#06b6d4', text: '#0c4a6e',
        dim: '#64748b', canvas: '#f0f9ff',
        background: 'linear-gradient(-45deg, #e8f4f8, #f0f9ff, #dbeafe, #e0f2fe)'
    },
    autumn: {
        bgDark: '#1c1410', panel: '#2d2018', card: '#3d2c20',
        accent: '#d97706', accent2: '#dc2626', text: '#fef3c7',
        dim: '#a8a29e', canvas: '#140f0a',
        background: 'linear-gradient(-45deg, #1c1410, #2d2018, #3d2c20, #1f1610)'
    },
    spring: {
        bgDark: '#f0fdf4', panel: '#ffffff', card: '#dcfce7',
        accent: '#10b981', accent2: '#f472b6', text: '#064e3b',
        dim: '#6b7280', canvas: '#f0fdf4',
        background: 'linear-gradient(-45deg, #f0fdf4, #ffffff, #dcfce7, #ecfdf5)'
    },
    vampire: {
        bgDark: '#0f0000', panel: '#1a0000', card: '#2d0000',
        accent: '#dc143c', accent2: '#8b0000', text: '#ffe4e1',
        dim: '#a52a2a', canvas: '#0a0000',
        background: 'linear-gradient(-45deg, #0f0000, #1a0000, #2d0000, #140000)'
    },
    samurai: {
        bgDark: '#1a0a0a', panel: '#2d1414', card: '#3d1e1e',
        accent: '#dc2626', accent2: '#fbbf24', text: '#fef2f2',
        dim: '#a3a3a3', canvas: '#120707',
        background: 'linear-gradient(-45deg, #1a0a0a, #2d1414, #3d1e1e, #1f0c0c)'
    },
    mint: {
        bgDark: '#f0fdfa', panel: '#ffffff', card: '#ccfbf1',
        accent: '#14b8a6', accent2: '#06b6d4', text: '#134e4a',
        dim: '#6b7280', canvas: '#f0fdfa',
        background: 'linear-gradient(-45deg, #f0fdfa, #ffffff, #ccfbf1, #e6fffa)'
    },
    chocolate: {
        bgDark: '#1c1410', panel: '#2d2018', card: '#3d2c20',
        accent: '#92400e', accent2: '#78350f', text: '#fef3c7',
        dim: '#a8a29e', canvas: '#140f0a',
        background: 'linear-gradient(-45deg, #1c1410, #2d2018, #3d2c20, #1f1610)'
    },
    silver: {
        bgDark: '#1f2937', panel: '#374151', card: '#4b5563',
        accent: '#9ca3af', accent2: '#6b7280', text: '#f9fafb',
        dim: '#9ca3af', canvas: '#111827',
        background: 'linear-gradient(-45deg, #1f2937, #374151, #4b5563, #2d3748)'
    }
};

function applyTheme(t) {
  if (!THEME_PALETTES[t]) t = 'dark';
  var palette = THEME_PALETTES[t];
  var root = document.body;
  var vars = {
    '--bg-dark': palette.bgDark,
    '--bg-panel': palette.panel,
    '--bg-card': palette.card,
    '--accent': palette.accent,
    '--accent2': palette.accent2,
    '--text': palette.text,
    '--text-dim': palette.dim,
    '--canvas-bg': palette.canvas
  };

  Object.keys(vars).forEach(function(key) {
    root.style.setProperty(key, vars[key]);
  });
  root.classList.toggle('theme-light', t === 'light' || t === 'paper' || t === 'arctic' || t === 'spring' || t === 'mint');
  root.dataset.theme = t;
  root.style.background = palette.background;
  root.style.backgroundSize = '400% 400%';
  root.style.animation = 'gradientShift 15s ease infinite';
}

function applyMobileSize(size) {
  var allowed = { compact: true, standard: true, large: true };
  if (!allowed[size]) size = 'standard';
  document.body.classList.remove('mobile-controls-compact', 'mobile-controls-standard', 'mobile-controls-large');
  document.body.classList.add('mobile-controls-' + size);
  S.mobileSize = size;
}

function applyMobileLayout(leftHanded) {
  S.leftHanded = Boolean(leftHanded);
  document.body.classList.toggle('mobile-controls-left', S.leftHanded);
}

function applyHighContrast(enabled) {
  S.highContrast = Boolean(enabled);
  document.body.classList.toggle('high-contrast', S.highContrast);
}

function applyPerformanceMode(mode) {
  var allowed = { quality: true, balanced: true, performance: true };
  if (!allowed[mode]) mode = 'balanced';
  S.performanceMode = mode;
  document.body.classList.remove('performance-quality', 'performance-balanced', 'performance-mode');
  document.body.classList.add('performance-' + mode);
}

function resizeCanvas() {
  var isMobile = window.innerWidth <= 600;
  var reservedHeight = isMobile ? 255 : 150;
  var availableWidth = Math.max(S.grid * 10, window.innerWidth - (isMobile ? 24 : 40));
  var availableHeight = Math.max(S.grid * 10, window.innerHeight - reservedHeight);
  var s = Math.min(availableWidth, availableHeight, 520);
  canvas.width  = Math.floor(s / S.grid) * S.grid;
  canvas.height = Math.floor(s / S.grid) * S.grid;
}

function showNotification(text, subtext, icon) {
  var n = document.createElement('div');
  n.className = 'toast-notification';
  n.innerHTML = '<div class="toast-icon">' + (icon || '🏆') + '</div><div class="toast-text"><b>' + text + '</b>' + (subtext ? '<br><small>' + subtext + '</small>' : '') + '</div>';
  document.body.appendChild(n);
  requestAnimationFrame(function() { n.classList.add('show'); });
  setTimeout(function() {
    n.classList.remove('show');
    setTimeout(function() { if (n.parentNode) n.remove(); }, 400);
  }, 3500);
}

function loadAchievements() {
  var raw = localStorage.getItem('snake-pro-achievements');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (e) { return {}; }
}

function saveAchievement(key) {
  var ach = loadAchievements();
  ach[key] = true;
  localStorage.setItem('snake-pro-achievements', JSON.stringify(ach));
}

function checkAchievements() {
  var ach = loadAchievements();

  if (!ach.firstGame && S.gamesPlayed >= 1) {
    saveAchievement('firstGame');
    sfx.achievement();
    showNotification(ACHIEVEMENTS.firstGame.name, ACHIEVEMENTS.firstGame.desc, '🏆');
  }
  if (!ach.eaten10 && S.totalEaten >= 10) {
    saveAchievement('eaten10');
    sfx.achievement();
    showNotification(ACHIEVEMENTS.eaten10.name, ACHIEVEMENTS.eaten10.desc, '🍎');
  }
  if (!ach.eaten50 && S.totalEaten >= 50) {
    saveAchievement('eaten50');
    sfx.achievement();
    showNotification(ACHIEVEMENTS.eaten50.name, ACHIEVEMENTS.eaten50.desc, '🍔');
  }
  if (!ach.played10 && S.gamesPlayed >= 10) {
    saveAchievement('played10');
    sfx.achievement();
    showNotification(ACHIEVEMENTS.played10.name, ACHIEVEMENTS.played10.desc, '🎮');
  }
  if (!ach.score100 && S.score >= 100) {
    saveAchievement('score100');
    sfx.achievement();
    showNotification(ACHIEVEMENTS.score100.name, ACHIEVEMENTS.score100.desc, '💯');
  }
  if (!ach.score500 && S.score >= 500) {
    saveAchievement('score500');
    sfx.achievement();
    showNotification(ACHIEVEMENTS.score500.name, ACHIEVEMENTS.score500.desc, '⭐');
  }
  if (!ach.level5 && S.level >= 5) {
    saveAchievement('level5');
    sfx.achievement();
    showNotification(ACHIEVEMENTS.level5.name, ACHIEVEMENTS.level5.desc, '🧗');
  }
  if (!ach.combo8 && S.maxComboThisGame >= 8) {
    saveAchievement('combo8');
    sfx.achievement();
    showNotification(ACHIEVEMENTS.combo8.name, ACHIEVEMENTS.combo8.desc, '🔥');
  }
  if (!ach.fever3 && S.feverCount >= 3) {
    saveAchievement('fever3');
    sfx.achievement();
    showNotification(ACHIEVEMENTS.fever3.name, ACHIEVEMENTS.fever3.desc, '🔥');
  }
  if (!ach.coins100 && S.totalCoins >= 100) {
    saveAchievement('coins100');
    sfx.achievement();
    showNotification(ACHIEVEMENTS.coins100.name, ACHIEVEMENTS.coins100.desc, '💰');
  }
}

function loadCoins() {
  var raw = localStorage.getItem('snake-pro-coins');
  if (!raw) return;
  try {
    var d = JSON.parse(raw);
    S.coins = d.coins || 0;
    S.totalCoins = d.total || 0;
  } catch (e) {}
}

function saveCoins() {
  localStorage.setItem('snake-pro-coins', JSON.stringify({
    coins: S.coins,
    total: S.totalCoins
  }));
  updateCoinsUI();
}

function addCoins(amount, reason) {
  if (amount <= 0) return;
  S.coins += amount;
  S.totalCoins += amount;
  S.sessionCoins += amount;
  sfx.coin();
  saveCoins();
  if (reason) showNotification('+' + amount + '💰', reason, '💰');
}

function updateCoinsUI() {
  if (ui.coinsValue) ui.coinsValue.textContent = S.coins;
  if (ui.hudCoins) ui.hudCoins.textContent = S.coins;
  if (ui.shopCoins) ui.shopCoins.textContent = S.coins;
  if (ui.aboutCoins) ui.aboutCoins.textContent = S.totalCoins;
}

function loadOwnedSkins() {
  var raw = localStorage.getItem('snake-pro-owned-skins');
  if (!raw) return;
  try {
    var list = JSON.parse(raw);
    if (Array.isArray(list) && list.length) S.ownedSkins = list;
  } catch (e) {}
}

function saveOwnedSkins() {
  localStorage.setItem('snake-pro-owned-skins', JSON.stringify(S.ownedSkins));
}


function renderShop() {
  if (!ui.shopItems) return;
  ui.shopItems.innerHTML = '';
  SKIN_CATALOG.forEach(function(skin) {
    var owned = S.ownedSkins.indexOf(skin.id) !== -1;
    var active = S.snakeSkinId === skin.id;
    var item = document.createElement('div');
    item.className = 'shop-item' + (active ? ' active' : '') + (owned ? ' owned' : '');
    item.setAttribute('data-id', skin.id);

    var dotHtml;
    if (skin.color === 'rainbow') {
      dotHtml = '<span class="shop-dot rainbow-dot"></span>';
    } else if (skin.color === 'flame') {
      dotHtml = '<span class="shop-dot flame-dot"></span>';
    } else {
      dotHtml = '<span class="shop-dot" style="background:' + skin.color + '"></span>';
    }

    var actionHtml = '';
    if (active) {
      actionHtml = '<span class="shop-status active-status">✓ Выбран</span>';
    } else if (owned) {
      actionHtml = '<button class="shop-btn select-btn">Выбрать</button>';
    } else if (skin.price === 0) {
      actionHtml = '<button class="shop-btn free-btn">Бесплатно</button>';
    } else {
      actionHtml = '<button class="shop-btn buy-btn">Купить за ' + skin.price + ' 🪙</button>';
    }

    item.innerHTML = dotHtml + '<div class="shop-name">' + skin.name + '</div>' + actionHtml;
    ui.shopItems.appendChild(item);
  });

  ui.shopItems.querySelectorAll('.shop-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      var id = item.getAttribute('data-id');
      var skin = SKIN_CATALOG.find(function(s) { return s.id === id; });
      if (!skin) return;
      var owned = S.ownedSkins.indexOf(id) !== -1;

      if (e.target.classList.contains('buy-btn')) {
        if (S.coins < skin.price) {
          showNotification('Недостаточно монет', 'Нужно ещё ' + (skin.price - S.coins) + '💰', '💸');
          return;
        }
        S.coins -= skin.price;
        S.ownedSkins.push(id);
        saveCoins();
        saveOwnedSkins();
        sfx.purchase();
        showNotification('Куплено!', skin.name, '🛍️');
        renderShop();
        return;
      }

      if (e.target.classList.contains('select-btn') || e.target.classList.contains('free-btn')) {
        if (!owned && skin.price === 0) {
          S.ownedSkins.push(id);
          saveOwnedSkins();
        }
        S.snakeSkinId = id;
        S.snakeColor = skin.color;
        localStorage.setItem('snakeSkinColor', S.snakeColor);
        localStorage.setItem('snakeSkinId', S.snakeSkinId);
        sfx.purchase();
        renderShop();
        updateSkinOptionsActive();
        return;
      }

      if (owned) {
        S.snakeSkinId = id;
        S.snakeColor = skin.color;
        localStorage.setItem('snakeSkinColor', S.snakeColor);
        localStorage.setItem('snakeSkinId', S.snakeSkinId);
        sfx.purchase();
        renderShop();
        updateSkinOptionsActive();
      }
    });
  });
}

function updateSkinOptionsActive() {
  if (!ui.skinOptions) return;
  ui.skinOptions.forEach(function(opt) {
    var id = opt.getAttribute('data-id');
    var owned = S.ownedSkins.indexOf(id) !== -1;
    opt.classList.toggle('locked', !owned);
    opt.classList.toggle('active', S.snakeSkinId === id);
    var lockIcon = opt.querySelector('.lock-icon');
    if (lockIcon) lockIcon.style.display = owned ? 'none' : 'block';
  });
}

var QUEST_TEMPLATES = [
  { id: 'eat10',    text: 'Съешь 10 яблок',       target: 10, type: 'eat',    reward: 15 },
  { id: 'eat25',    text: 'Съешь 25 яблок',       target: 25, type: 'eat',    reward: 30 },
  { id: 'score50',  text: 'Набери 50 очков',      target: 50, type: 'score',  reward: 20 },
  { id: 'score150', text: 'Набери 150 очков',     target: 150, type: 'score', reward: 40 },
  { id: 'level3',   text: 'Достигни 3 уровня',    target: 3,  type: 'level',  reward: 25 },
  { id: 'level5',   text: 'Достигни 5 уровня',    target: 5,  type: 'level',  reward: 50 },
  { id: 'combo5',   text: 'Собери комбо x5',      target: 5,  type: 'combo',  reward: 35 },
  { id: 'games2',   text: 'Сыграй 2 игры',        target: 2,  type: 'games',  reward: 20 },
  { id: 'fever1',   text: 'Активируй лихорадку',  target: 1,  type: 'fever',  reward: 30 }
];

function loadDailyQuests() {
  var today = new Date().toISOString().slice(0, 10);
  var raw = localStorage.getItem('snake-pro-daily-quests');
  if (raw) {
    try {
      var data = JSON.parse(raw);
      if (data.date === today) {
        S.dailyQuests = data.quests || [];
        S.dailyQuestsDate = today;
        return;
      }
    } catch (e) {}
  }
  generateDailyQuests(today);
}

function generateDailyQuests(date) {
  var shuffled = QUEST_TEMPLATES.slice().sort(function() { return Math.random() - 0.5; });
  S.dailyQuests = shuffled.slice(0, 3).map(function(t) {
    return { id: t.id, text: t.text, target: t.target, type: t.type, reward: t.reward, progress: 0, claimed: false };
  });
  S.dailyQuestsDate = date;
  saveDailyQuests();
}

function saveDailyQuests() {
  localStorage.setItem('snake-pro-daily-quests', JSON.stringify({
    date: S.dailyQuestsDate,
    quests: S.dailyQuests
  }));
}

function updateQuestProgress(type, value) {
  var changed = false;
  S.dailyQuests.forEach(function(q) {
    if (q.claimed) return;
    if (q.type === type) {
      if (type === 'eat' || type === 'score' || type === 'combo' || type === 'fever' || type === 'games') {
        q.progress += value;
      } else if (type === 'level') {
        q.progress = Math.max(q.progress, value);
      }
      if (q.progress >= q.target && !q.claimed) {
        q.claimed = true;
        addCoins(q.reward, 'Задание: ' + q.text);
        changed = true;
      }
    }
  });
  if (changed) saveDailyQuests();
  renderQuests();
}

function renderQuests() {
  if (!ui.questsList) return;
  ui.questsList.innerHTML = '';
  if (!S.dailyQuests.length) {
    ui.questsList.innerHTML = '<div class="quest-empty">Задания загружаются...</div>';
    return;
  }
  S.dailyQuests.forEach(function(q) {
    var pct = Math.min(100, (q.progress / q.target) * 100);
    var done = q.progress >= q.target;
    var item = document.createElement('div');
    item.className = 'quest-item' + (done ? ' done' : '');
    item.innerHTML = 
      '<div class="quest-text">' + (done ? '✅ ' : '') + q.text + '</div>' +
      '<div class="quest-progress">' +
        '<div class="quest-bar"><div class="quest-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="quest-reward">' + (done ? '✓' : q.progress + '/' + q.target) + ' · ' + q.reward + ' 🪙</span>' +
      '</div>';
    ui.questsList.appendChild(item);
  });
}

function claimDailyReward() {
  var today = new Date().toISOString().slice(0, 10);
  var lastClaim = localStorage.getItem('snake-pro-daily-reward');
  if (lastClaim === today) return;
  S.shield = 3000;
  addCoins(5, 'Ежедневный бонус');
  localStorage.setItem('snake-pro-daily-reward', today);
  showNotification('Ежедневная награда', 'Бонусный щит и 5 💰!', '🎁');
}

function updateProgressBars() {
  var pbGames = el('pb-games');
  if (pbGames) {
    var gamesGoal = 10;
    var pct = Math.min((S.gamesPlayed / gamesGoal) * 100, 100);
    pbGames.style.width = pct + '%';
  }
  var msGamesVal = el('ms-games-val');
  if (msGamesVal) msGamesVal.textContent = S.gamesPlayed;

  var pbApples = el('pb-apples');
  if (pbApples) {
    var applesGoal = 50;
    var pct2 = Math.min((S.totalEaten / applesGoal) * 100, 100);
    pbApples.style.width = pct2 + '%';
  }
  var msEatenVal = el('ms-eaten-val');
  if (msEatenVal) msEatenVal.textContent = S.totalEaten;
}

function updateContinueButton() {
  if (ui.btnContinue) {
    ui.btnContinue.style.display = S.hasSavedGame ? 'block' : 'none';
  }
}


function setupSkinPalette() {
  if (!ui.skinOptions || ui.skinOptions.length === 0) return;

  ui.skinOptions.forEach(function(option) {
    var dot = option.querySelector('.dot');
    var color = option.getAttribute('data-color');
    var id = option.getAttribute('data-id');
    if (dot && color && color !== 'rainbow' && color !== 'flame') {
      dot.style.backgroundColor = color;
    }

    option.addEventListener('click', function() {
      var owned = S.ownedSkins.indexOf(id) !== -1;
      if (!owned) {
        showNotification('Скин заблокирован', 'Купите его в магазине 🛒', '🔒');
        return;
      }
      ui.skinOptions.forEach(function(o) { o.classList.remove('active'); });
      option.classList.add('active');
      S.snakeSkinId = id;
      S.snakeColor = color;
      localStorage.setItem('snakeSkinColor', color);
      localStorage.setItem('snakeSkinId', id);
    });
  });

  var savedId = localStorage.getItem('snakeSkinId');
  var savedColor = localStorage.getItem('snakeSkinColor');
  if (savedId && S.ownedSkins.indexOf(savedId) !== -1) {
    S.snakeSkinId = savedId;
    S.snakeColor = savedColor || '#2ecc71';
  } else if (savedColor) {
    S.snakeColor = savedColor;
  }

  updateSkinOptionsActive();
}

function showScreen(name) {
  ['mainMenu', 'instructions', 'about', 'settings', 'shop', 'exitConfirm'].forEach(function(k) {
    if (screens[k]) screens[k].classList.remove('active');
  });
  if (screens.game)     screens.game.classList.add('hidden');
  if (screens.gameOver) screens.gameOver.classList.add('hidden');
  if (screens.pause)    screens.pause.classList.add('hidden');

  if (name === 'game') {
    if (screens.game) {
      screens.game.classList.remove('hidden');
      resizeCanvas();
      startGame();
    }
  } else if (name === 'shop') {
    if (screens.shop) {
      screens.shop.classList.remove('hidden');
      screens.shop.classList.add('active');
      renderShop();
    }
  } else if (screens[name]) {
    screens[name].classList.remove('hidden');
    screens[name].classList.add('active');
  }

  if (name === 'mainMenu') {
    updateProgressBars();
    updateContinueButton();
    updateCoinsUI();
    renderQuests();
  }
}

function loadSettings() {
  var raw = localStorage.getItem('snake-pro-settings');
  if (!raw) return;
  try {
    var s = JSON.parse(raw);
    if (s.difficulty && ui.difficulty) { ui.difficulty.value = s.difficulty; S.difficulty = s.difficulty; }
    if (s.grid && ui.gridSize)         { ui.gridSize.value = String(s.grid); S.grid = s.grid; }
    if (s.theme && ui.theme)           { ui.theme.value = s.theme; S.theme = s.theme; applyTheme(S.theme); }
    if (typeof s.showGrid !== 'undefined' && ui.gridToggle)  { ui.gridToggle.checked = s.showGrid; S.showGrid = s.showGrid; }
    if (typeof s.showTrail !== 'undefined' && ui.trailToggle){ ui.trailToggle.checked = s.showTrail; S.showTrail = s.showTrail; }
    if (typeof s.baseSpeed !== 'undefined' && ui.speedSlider){ ui.speedSlider.value = String(s.baseSpeed); S.baseSpeed = s.baseSpeed; if (ui.speedValue) ui.speedValue.textContent = s.baseSpeed + '/10'; }
    if (s.snakeColor) {
      S.snakeColor = s.snakeColor;
      if (ui.snakeColor) ui.snakeColor.value = s.snakeColor;
    }
    if (typeof s.particles !== 'undefined' && ui.particles)  { ui.particles.checked = s.particles; S.showParticles = s.particles; }
    if (typeof s.shake !== 'undefined' && ui.shake)          { ui.shake.checked = s.shake; S.showShake = s.shake; }
    if (typeof s.vibration !== 'undefined' && ui.vibration)  { ui.vibration.checked = s.vibration; S.vibration = s.vibration; }
    if (typeof s.autoPause !== 'undefined' && ui.autoPause)  { ui.autoPause.checked = s.autoPause; S.autoPause = s.autoPause; }
    if (s.mobileSize && ui.mobileSize) { ui.mobileSize.value = s.mobileSize; applyMobileSize(s.mobileSize); }
    if (typeof s.leftHanded !== 'undefined' && ui.leftHanded) {
      ui.leftHanded.checked = s.leftHanded;
      applyMobileLayout(s.leftHanded);
    }
    if (typeof s.highContrast !== 'undefined' && ui.highContrast) {
      ui.highContrast.checked = s.highContrast;
      applyHighContrast(s.highContrast);
    }
    if (s.performanceMode && ui.performanceMode) {
      ui.performanceMode.value = s.performanceMode;
      applyPerformanceMode(s.performanceMode);
    }
    if (typeof s.volume !== 'undefined' && ui.volume)        { S.volume = s.volume; ui.volume.value = String(s.volume * 100); if (ui.volumeValue) ui.volumeValue.textContent = Math.round(s.volume * 100) + '%'; }
  } catch (e) {
    console.warn('Не удалось загрузить настройки', e);
  }

  var skinColor = localStorage.getItem('snakeSkinColor');
  if (skinColor) S.snakeColor = skinColor;
}

function saveSettings() {
  var s = {
    difficulty: ui.difficulty ? ui.difficulty.value : 'normal',
    grid: ui.gridSize ? Number(ui.gridSize.value) : 16,
    theme: ui.theme ? ui.theme.value : 'dark',
    showGrid: ui.gridToggle ? ui.gridToggle.checked : true,
    showTrail: ui.trailToggle ? ui.trailToggle.checked : true,
    baseSpeed: ui.speedSlider ? Number(ui.speedSlider.value) : 5,
    snakeColor: S.snakeColor,
    particles: ui.particles ? ui.particles.checked : true,
    shake: ui.shake ? ui.shake.checked : true,
    vibration: ui.vibration ? ui.vibration.checked : true,
    autoPause: ui.autoPause ? ui.autoPause.checked : true,
    mobileSize: ui.mobileSize ? ui.mobileSize.value : 'standard',
    leftHanded: ui.leftHanded ? ui.leftHanded.checked : false,
    highContrast: ui.highContrast ? ui.highContrast.checked : false,
    performanceMode: ui.performanceMode ? ui.performanceMode.value : 'balanced',
    volume: ui.volume ? Number(ui.volume.value) / 100 : 0.5
  };
  localStorage.setItem('snake-pro-settings', JSON.stringify(s));
  S.difficulty = s.difficulty; S.grid = s.grid; S.theme = s.theme;
  S.showGrid = s.showGrid; S.showTrail = s.showTrail;
  S.baseSpeed = s.baseSpeed; S.snakeColor = s.snakeColor;
  S.showParticles = s.particles; S.showShake = s.shake; S.vibration = s.vibration;
  S.autoPause = s.autoPause; S.volume = s.volume;
  applyMobileSize(s.mobileSize);
  applyMobileLayout(s.leftHanded);
  applyHighContrast(s.highContrast);
  applyPerformanceMode(s.performanceMode);

  localStorage.setItem('snakeSkinColor', s.snakeColor);
  applyTheme(S.theme);
  resizeCanvas();
  showScreen('mainMenu');
}

function resetSettings() {
  if (ui.difficulty)  ui.difficulty.value = 'normal';
  if (ui.gridSize)    ui.gridSize.value = '16';
  if (ui.theme)       ui.theme.value = 'dark';
  if (ui.gridToggle)  ui.gridToggle.checked = true;
  if (ui.trailToggle) ui.trailToggle.checked = true;
  if (ui.speedSlider) ui.speedSlider.value = '5';
  if (ui.speedValue)  ui.speedValue.textContent = '5/10';
  if (ui.snakeColor)  ui.snakeColor.value = '#2ecc71';
  if (ui.particles)   ui.particles.checked = true;
  if (ui.shake)       ui.shake.checked = true;
  if (ui.vibration)   ui.vibration.checked = true;
  if (ui.autoPause)   ui.autoPause.checked = true;
  if (ui.mobileSize)  ui.mobileSize.value = 'standard';
  if (ui.leftHanded)  ui.leftHanded.checked = false;
  if (ui.highContrast) ui.highContrast.checked = false;
  if (ui.performanceMode) ui.performanceMode.value = 'balanced';
  if (ui.volume)      ui.volume.value = '50';
  if (ui.volumeValue) ui.volumeValue.textContent = '50%';

  if (ui.skinOptions) {
    ui.skinOptions.forEach(function(o) { o.classList.remove('active'); });
    var classic = Array.prototype.find.call(ui.skinOptions, function(o) {
      return o.getAttribute('data-id') === 'classic';
    });
    if (classic) classic.classList.add('active');
  }
  localStorage.removeItem('snakeSkinColor');
  localStorage.removeItem('snakeSkinId');
  S.snakeSkinId = 'classic';
  S.snakeColor = '#2ecc71';
  updateSkinOptionsActive();

  saveSettings();
}

function loadStats() {
  var raw = localStorage.getItem('snake-pro-stats');
  if (!raw) return;
  try {
    var s = JSON.parse(raw);
    S.highScore   = s.highScore || 0;
    S.gamesPlayed = s.games || 0;
    S.totalEaten  = s.eaten || 0;
    if (ui.msHighscore) ui.msHighscore.textContent = S.highScore;
    if (ui.msGames)     ui.msGames.textContent = S.gamesPlayed;
    if (ui.msEaten)     ui.msEaten.textContent = S.totalEaten;
    if (ui.highScore)   ui.highScore.textContent = S.highScore;
    if (ui.aboutGames)   ui.aboutGames.textContent = S.gamesPlayed;
    if (ui.aboutEaten)   ui.aboutEaten.textContent = S.totalEaten;
    if (ui.aboutBest)    ui.aboutBest.textContent = S.highScore;
  } catch (e) {}
}

function saveStats() {
  localStorage.setItem('snake-pro-stats', JSON.stringify({
    highScore: S.highScore, games: S.gamesPlayed, eaten: S.totalEaten
  }));
  if (ui.msHighscore) ui.msHighscore.textContent = S.highScore;
  if (ui.msGames)     ui.msGames.textContent = S.gamesPlayed;
  if (ui.msEaten)     ui.msEaten.textContent = S.totalEaten;
  if (ui.aboutGames)   ui.aboutGames.textContent = S.gamesPlayed;
  if (ui.aboutEaten)   ui.aboutEaten.textContent = S.totalEaten;
  if (ui.aboutBest)    ui.aboutBest.textContent = S.highScore;

  updateProgressBars();
}

function loadLeaderboard() {
  var raw = localStorage.getItem('snake-pro-leaderboard');
  if (!raw) return [];
  try {
    var list = JSON.parse(raw);
    list.sort(function(a, b) { return b.score - a.score; });
    return list;
  } catch (e) {
    return [];
  }
}

function saveLeaderboard(score) {
  var list = loadLeaderboard();
  list.push({ score: score, date: new Date().toLocaleDateString() });
  list.sort(function(a, b) { return b.score - a.score; });
  if (list.length > 10) list.splice(10);
  localStorage.setItem('snake-pro-leaderboard', JSON.stringify(list));
}

function renderLeaderboard() {
  if (!ui.leaderboard) return;
  var list = loadLeaderboard().slice(0, 5);
  ui.leaderboard.innerHTML = '';
  if (list.length === 0) {
    ui.leaderboard.innerHTML = '<li style="text-align:center;color:var(--text-dim)">Пока нет рекордов</li>';
    return;
  }

  for (var i = 0; i < list.length; i++) {
    var li = document.createElement('li');
    var isHighlight = (list[i].score === S.highScore);
    li.innerHTML =
      '<span class="rank">' + (i + 1) + '</span>' +
      '<span class="score-val' + (isHighlight ? ' highlight' : '') + '">' + list[i].score + '</span>';
    ui.leaderboard.appendChild(li);
  }
}

var FOOD_TYPES = {
  normal: { color: '#e74c3c', glow: '#e74c3c', points: 1, grow: 1, weight: 65, label: '+1', coins: 1 },
  gold:   { color: '#ffd700', glow: '#ffd700', points: 5, grow: 3, weight: 10, label: '+5', coins: 3 },
  slow:   { color: '#3498db', glow: '#3498db', points: 2, grow: 1, weight: 6, label: 'SLOW', powerup: 'slow', coins: 1 },
  shield: { color: '#9b59b6', glow: '#9b59b6', points: 2, grow: 1, weight: 6, label: 'SHIELD', powerup: 'shield', coins: 1 },
  magnet: { color: '#e67e22', glow: '#e67e22', points: 2, grow: 1, weight: 5, label: 'MAGNET', powerup: 'magnet', coins: 1 },
  fever:  { color: '#ffeb3b', glow: '#ff9800', points: 3, grow: 1, weight: 4, label: 'FEVER', powerup: 'fever', coins: 2 }
};

function pickFoodType() {
  var total = 0;
  for (var k in FOOD_TYPES) total += FOOD_TYPES[k].weight;
  var r = Math.random() * total;
  for (var k2 in FOOD_TYPES) {
    r -= FOOD_TYPES[k2].weight;
    if (r <= 0) return k2;
  }
  return 'normal';
}

function placeFood() {
  var cols = canvas.width / S.grid;
  var rows = canvas.height / S.grid;
  var x, y, ok = false, tries = 0;
  while (!ok && tries++ < 300) {
    x = randInt(0, cols) * S.grid;
    y = randInt(0, rows) * S.grid;
    ok = true;
    for (var i = 0; i < S.snake.cells.length; i++) if (S.snake.cells[i].x === x && S.snake.cells[i].y === y) ok = false;
    for (var j = 0; j < S.foods.length; j++)         if (S.foods[j].x === x && S.foods[j].y === y) ok = false;
    for (var m = 0; m < S.obstacles.length; m++)     if (S.obstacles[m].x === x && S.obstacles[m].y === y) ok = false;
  }
  if (ok) S.foods.push({ x: x, y: y, type: pickFoodType(), spawnTime: now() });
}

function ensureFoods() {
  var target = Math.min(1 + Math.floor(S.level / 3), 4);
  while (S.foods.length < target) placeFood();
}

function generateObstacles() {
  S.obstacles = [];
  if (S.level < 3) return;
  var count = Math.min((S.level - 2) * 2, 12);
  var cols = canvas.width / S.grid;
  var rows = canvas.height / S.grid;
  var placed = 0, tries = 0;
  while (placed < count && tries++ < 500) {
    var x = randInt(2, cols - 2) * S.grid;
    var y = randInt(2, rows - 2) * S.grid;
    if (Math.abs(x - S.snake.x) < S.grid * 3 && Math.abs(y - S.snake.y) < S.grid * 3) continue;
    var dup = false;
    for (var i = 0; i < S.snake.cells.length; i++) if (S.snake.cells[i].x === x && S.snake.cells[i].y === y) dup = true;
    for (var j = 0; j < S.obstacles.length; j++)   if (S.obstacles[j].x === x && S.obstacles[j].y === y) dup = true;
    if (!dup) { S.obstacles.push({ x: x, y: y }); placed++; }
  }
}

function spawnParticles(x, y, n, c) {
  if (!S.showParticles) return;
  if (S.performanceMode === 'performance') return;
  if (S.performanceMode === 'balanced') n = Math.max(1, Math.floor(n * 0.65));
  for (var i = 0; i < n; i++) {
    S.particles.push({
      x: x + S.grid / 2, y: y + S.grid / 2,
      vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
      life: 1, size: S.grid * (0.15 + Math.random() * 0.2),
      color: c || '255,255,255'
    });
  }
}

function updateParticles() {
  for (var i = S.particles.length - 1; i >= 0; i--) {
    var p = S.particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.94; p.vy *= 0.94;
    p.life -= 0.035;
    if (p.life <= 0) S.particles.splice(i, 1);
  }
}

function drawParticles() {
  for (var i = 0; i < S.particles.length; i++) {
    var p = S.particles[i];
    ctx.fillStyle = 'rgba(' + p.color + ',' + p.life + ')';
    var s = Math.max(1, p.size * p.life);
    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
  }
}


function updateTrail() {
  if (!S.showTrail || !S.isMoving) return;
  if (S.performanceMode === 'performance') return;
  var head = S.snake.cells[0];
  if (!head) return;

  var trailColor;
  if (S.snakeColor === 'rainbow') {
    trailColor = getRainbowColor(now() / 300);
  } else if (S.snakeColor === 'flame') {
    trailColor = getFlameColor(now() / 300, 0);
  } else {
    trailColor = hexToRgb(S.snakeColor);
  }

  S.trail.push({
    x: head.x + S.grid / 2,
    y: head.y + S.grid / 2,
    life: 1,
    color: trailColor
  });
  var maxTrail = S.performanceMode === 'balanced' ? 12 : 20;
  while (S.trail.length > maxTrail) S.trail.shift();
  for (var i = S.trail.length - 1; i >= 0; i--) {
    S.trail[i].life -= 0.06;
    if (S.trail[i].life <= 0) S.trail.splice(i, 1);
  }
}


function drawTrail() {
  if (!S.showTrail || S.trail.length === 0) return;
  for (var i = 0; i < S.trail.length; i++) {
    var t = S.trail[i];
    var c = t.color;
    var size = S.grid * 0.5 * t.life;
    ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (t.life * 0.4) + ')';
    ctx.beginPath();
    ctx.arc(t.x, t.y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}


function spawnDeathFragments() {
  if (S.performanceMode === 'performance') return;

  var rgb;
  if (S.snakeColor === 'rainbow') {
    rgb = [255, 100, 200];
  } else if (S.snakeColor === 'flame') {
    rgb = [255, 80, 0];
  } else {
    rgb = hexToRgb(S.snakeColor);
  }

  for (var i = 0; i < S.snake.cells.length; i++) {
    var c = S.snake.cells[i];
    var angle = Math.random() * Math.PI * 2;
    var speed = 2 + Math.random() * 4;
    S.deathFragments.push({
      x: c.x + S.grid / 2,
      y: c.y + S.grid / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      size: S.grid * 0.7,
      color: rgb,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.3
    });
  }
}

function updateDeathFragments() {
  for (var i = S.deathFragments.length - 1; i >= 0; i--) {
    var f = S.deathFragments[i];
    f.x += f.vx;
    f.y += f.vy;
    f.vy += 0.2;
    f.vx *= 0.97;
    f.rot += f.vrot;
    f.life -= 0.02;
    if (f.life <= 0) S.deathFragments.splice(i, 1);
  }
}

function drawDeathFragments() {
  for (var i = 0; i < S.deathFragments.length; i++) {
    var f = S.deathFragments[i];
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);
    ctx.fillStyle = 'rgba(' + f.color[0] + ',' + f.color[1] + ',' + f.color[2] + ',' + f.life + ')';
    ctx.fillRect(-f.size / 2, -f.size / 2, f.size, f.size);
    ctx.restore();
  }
}

function spawnPopup(x, y, text, color) {
  S.popups.push({ x: x + S.grid / 2, y: y, text: text, color: color, life: 1, vy: -1.2 });
}

function updatePopups() {
  for (var i = S.popups.length - 1; i >= 0; i--) {
    var p = S.popups[i];
    p.y += p.vy; p.life -= 0.025;
    if (p.life <= 0) S.popups.splice(i, 1);
  }
}

function drawPopups() {
  ctx.font = 'bold ' + Math.max(12, S.grid * 0.8) + 'px system-ui';
  ctx.textAlign = 'center';
  for (var i = 0; i < S.popups.length; i++) {
    var p = S.popups[i];
    if (p.color.indexOf('rgb') === 0) {
      ctx.fillStyle = p.color.replace(')', ',' + p.life + ')').replace('rgb', 'rgba');
    } else {
      ctx.fillStyle = 'rgba(255,255,255,' + p.life + ')';
    }
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.textAlign = 'start';
}

function shake(a) {
  if (!S.showShake) return;
  if (S.performanceMode === 'performance') return;
  if (S.performanceMode === 'balanced') a *= 0.65;
  S.shakeAmount = Math.max(S.shakeAmount, a);
}

function applyShake() {
  if (S.shakeAmount > 0.1) {
    var dx = (Math.random() - 0.5) * S.shakeAmount;
    var dy = (Math.random() - 0.5) * S.shakeAmount;
    if (ui.canvasContainer) ui.canvasContainer.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    S.shakeAmount *= 0.85;
  } else {
    if (ui.canvasContainer) ui.canvasContainer.style.transform = '';
    S.shakeAmount = 0;
  }
}

function updatePowerupBar() {
  if (!ui.powerupBar) return;
  ui.powerupBar.innerHTML = '';
  var ups = [
    { label: 'Щит',       val: S.shield, max: 5000, cls: 'shield' },
    { label: 'Замедление', val: S.slow,   max: 5000, cls: 'slow' },
    { label: 'Магнит',    val: S.magnet, max: 8000, cls: 'magnet' },
    { label: 'Лихорадка', val: S.fever,  max: 6000, cls: 'fever' }
  ];
  for (var i = 0; i < ups.length; i++) {
    var u = ups[i];
    if (u.val <= 0) continue;
    var chip = document.createElement('div');
    chip.className = 'powerup-chip ' + u.cls;
    var pct = Math.max(0, (u.val / u.max) * 100);
    chip.innerHTML = '<span>' + u.label + '</span><div class="timer-bar"><div class="timer-fill" style="width:' + pct + '%;background:currentColor"></div></div>';
    ui.powerupBar.appendChild(chip);
  }

  if (ui.feverOverlay) {
    if (S.fever > 0) ui.feverOverlay.classList.remove('hidden');
    else ui.feverOverlay.classList.add('hidden');
  }
}

function getFrameDelay() {
  var b = S.difficulty === 'easy' ? 7 : S.difficulty === 'hard' ? 3 : 5;
  b -= Math.floor((S.level - 1) / 3);
  b += (5 - S.baseSpeed) * 0.6;
  if (S.slow > 0) b += 4;
  if (S.fever > 0) b = Math.max(2, b - 1);
  return Math.max(2, b);
}

function loop(ts) {
  if (!S.isRunning && S.deathFragments.length === 0) return;
  var dt = ts - lastTime;
  lastTime = ts;

  if (S.deathFragments.length > 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawObstacles();
    drawFoods();
    updateDeathFragments();
    drawDeathFragments();
    drawParticles();
    updateParticles();
    applyShake();
    requestAnimationFrame(loop);
    return;
  }

  if (S.isPaused) { requestAnimationFrame(loop); return; }

  if (++S.count < getFrameDelay()) { requestAnimationFrame(loop); return; }
  S.count = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (S.isMoving) {
    S.snake.x += S.snake.dx;
    S.snake.y += S.snake.dy;

    if (S.snake.x < 0)                    S.snake.x = canvas.width - S.grid;
    else if (S.snake.x >= canvas.width)  S.snake.x = 0;
    if (S.snake.y < 0)                    S.snake.y = canvas.height - S.grid;
    else if (S.snake.y >= canvas.height) S.snake.y = 0;

    S.snake.cells.unshift({ x: S.snake.x, y: S.snake.y });
    if (S.snake.cells.length > S.snake.maxCells) S.snake.cells.pop();

    for (var i = 0; i < S.obstacles.length; i++) {
      if (S.obstacles[i].x === S.snake.x && S.obstacles[i].y === S.snake.y) {
        if (S.shield > 0) {
          S.shield = 0; shake(8);
          spawnParticles(S.snake.x, S.snake.y, 12, '155,89,182');
          sfx.shield();
        } else { gameOver(); return; }
      }
    }

    for (var j = 1; j < S.snake.cells.length; j++) {
      if (S.snake.cells[j].x === S.snake.x && S.snake.cells[j].y === S.snake.y) {
        if (S.shield > 0) {
          S.shield = 0; shake(8);
          spawnParticles(S.snake.x, S.snake.y, 12, '155,89,182');
          sfx.shield();
        } else { gameOver(); return; }
      }
    }
  }

  if (S.magnet > 0 && S.isMoving) {
    var closest = null, minDist = Infinity;
    for (var mi = 0; mi < S.foods.length; mi++) {
      var d = Math.abs(S.foods[mi].x - S.snake.x) + Math.abs(S.foods[mi].y - S.snake.y);
      if (d < minDist) { minDist = d; closest = S.foods[mi]; }
    }
    if (closest && minDist > 0 && minDist < S.grid * 6) {
      var step = Math.max(1, Math.floor(S.grid / 4));
      if (closest.x < S.snake.x) closest.x += step;
      else if (closest.x > S.snake.x) closest.x -= step;
      if (closest.y < S.snake.y) closest.y += step;
      else if (closest.y > S.snake.y) closest.y -= step;
      closest.x = Math.round(closest.x / S.grid) * S.grid;
      closest.y = Math.round(closest.y / S.grid) * S.grid;
    }
  }

  for (var fi = S.foods.length - 1; fi >= 0; fi--) {
    var f = S.foods[fi];
    if (f.x === S.snake.x && f.y === S.snake.y && S.isMoving) {
      var ft = FOOD_TYPES[f.type];
      var multiplier = S.fever > 0 ? 3 : 1;
      var comboMult = S.combo;
      S.score += ft.points * comboMult * multiplier;
      S.totalEaten++; sessionEaten++; S.eatenThisLevel++;
      S.snake.maxCells += ft.grow;

      var coinsEarned = ft.coins || 1;
      if (S.fever > 0) coinsEarned *= 2;
      addCoins(coinsEarned);

      S.combo = Math.min(S.combo + 1, 8);
      S.maxComboThisGame = Math.max(S.maxComboThisGame, S.combo);
      S.comboTimer = S.comboTimeout;

      if (ui.combo) {
        ui.combo.style.display = 'inline';
        ui.comboVal.textContent = S.combo;
        ui.combo.style.animation = 'none';
        void ui.combo.offsetWidth;
        ui.combo.style.animation = '';
      }

      if (ft.powerup === 'shield') { S.shield = 5000; sfx.shield(); }
      if (ft.powerup === 'slow')    { S.slow = 5000; sfx.slow(); }
      if (ft.powerup === 'magnet')  { S.magnet = 8000; sfx.magnet(); }
      if (ft.powerup === 'fever') { 
        S.fever = 6000; 
        S.feverCount++;
        sfx.fever(); 
        shake(6);
        showNotification('😵 ЛИХОРАДКА!', 'x3 очки на 6 секунд!', '😵');
      }

      if (f.type === 'gold') sfx.gold();
      else if (!ft.powerup) sfx.eat();

      var c = hexToRgb(ft.glow).join(',');
      spawnParticles(f.x, f.y, f.type === 'gold' ? 16 : 10, c);
      var label = ft.label;
      if (S.fever > 0 && f.type !== 'fever') label += ' x3';
      spawnPopup(f.x, f.y, label, 'rgb(' + c + ')');

      S.foods.splice(fi, 1);
      if (S.eatenThisLevel >= S.foodPerLevel) levelUp();
      if (ui.score) ui.score.textContent = S.score;

      updateQuestProgress('eat', 1);
      updateQuestProgress('score', ft.points * comboMult * multiplier);
      updateQuestProgress('combo', 0);
      if (S.combo >= 5) updateQuestProgress('combo', S.combo);
      if (ft.powerup === 'fever') updateQuestProgress('fever', 1);

      checkAchievements();
    }
  }

  ensureFoods();

  if (S.comboTimer > 0) {
    S.comboTimer -= dt;
    if (S.comboTimer <= 0) { S.combo = 1; if (ui.combo) ui.combo.style.display = 'none'; }
  }

  if (S.shield > 0) S.shield = Math.max(0, S.shield - dt);
  if (S.slow > 0)   S.slow   = Math.max(0, S.slow - dt);
  if (S.magnet > 0) S.magnet = Math.max(0, S.magnet - dt);
  if (S.fever > 0)  S.fever  = Math.max(0, S.fever - dt);
  updatePowerupBar();

  updateTrail();
  drawGrid();
  drawObstacles();
  drawFoods();
  drawTrail();
  drawSnake();
  drawParticles();
  drawPopups();
  updateParticles();
  updatePopups();
  applyShake();

  requestAnimationFrame(loop);
}

function drawGrid() {
  if (!S.showGrid) return;
  var lightTheme = S.theme === 'light' || S.theme === 'paper' || S.theme === 'arctic' || S.theme === 'spring' || S.theme === 'mint';
  if (S.highContrast) {
    ctx.strokeStyle = lightTheme ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.12)';
  } else {
    ctx.strokeStyle = lightTheme ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.03)';
  }
  ctx.lineWidth = 1;
  for (var x = 0; x <= canvas.width; x += S.grid) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (var y = 0; y <= canvas.height; y += S.grid) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
}

function drawObstacles() {
  for (var i = 0; i < S.obstacles.length; i++) {
    var o = S.obstacles[i];
    ctx.fillStyle = '#555';
    ctx.fillRect(o.x, o.y, S.grid - 1, S.grid - 1);
    ctx.fillStyle = '#333';
    ctx.fillRect(o.x + 2, o.y + 2, S.grid - 5, S.grid - 5);
  }
}

function drawFoods() {
  var t = now();
  for (var i = 0; i < S.foods.length; i++) {
    var f = S.foods[i];
    var ft = FOOD_TYPES[f.type];
    var age = (t - f.spawnTime) / 1000;
    var pulse = Math.sin(age * 4) * 0.15 + 0.85;

    ctx.shadowColor = ft.glow;
    ctx.shadowBlur = f.type === 'gold' ? 16 : (f.type === 'fever' ? 20 : 8);
    var size = (S.grid - 1) * pulse;
    var off = (S.grid - size) / 2;

    if (f.type === 'fever') {
      var flicker = Math.sin(age * 12) * 0.3 + 0.7;
      ctx.fillStyle = 'rgba(255, 235, 59, ' + flicker + ')';
    } else {
      ctx.fillStyle = ft.color;
    }
    ctx.fillRect(f.x + off, f.y + off, size, size);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    if (f.type !== 'normal' && f.type !== 'gold') {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold ' + Math.max(8, S.grid * 0.55) + 'px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var labels = { slow: 'S', shield: 'D', magnet: 'M', fever: 'F' };
      ctx.fillText(labels[f.type] || '', f.x + S.grid / 2, f.y + S.grid / 2);
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    }
  }
}


function drawSnake() {
  var cells = S.snake.cells;
  var isRainbow = S.snakeColor === 'rainbow';
  var isFlame = S.snakeColor === 'flame';
  var baseRgb = (isRainbow || isFlame) ? null : hexToRgb(S.snakeColor);
  var tNow = now() / 300;

  for (var i = 0; i < cells.length; i++) {
    var c = cells[i];
    var isHead = i === 0;
    var t = i / Math.max(1, cells.length - 1);

    var rgb;
    if (isRainbow) {
      rgb = getRainbowColor(tNow + i * 0.3);
    } else if (isFlame) {
      rgb = getFlameColor(tNow, i);
    } else {
      rgb = baseRgb;
    }

    var br = rgb[0], bg = rgb[1], bb = rgb[2];

    if (isHead) {
      var headGlow;
      if (isFlame) {
        headGlow = '#ff4500';
      } else if (S.fever > 0) {
        headGlow = '#ffd700';
      } else if (S.shield > 0) {
        headGlow = '#9b59b6';
      } else {
        headGlow = S.snakeColor;
      }
      ctx.shadowColor = headGlow;
      
      ctx.shadowBlur = isFlame ? 18 : (S.fever > 0 ? 20 : 10);
    }

    if (S.shield > 0) {
      ctx.strokeStyle = 'rgba(155,89,182,' + (0.4 + Math.sin(now() / 200) * 0.2) + ')';
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x - 1, c.y - 1, S.grid + 1, S.grid + 1);
    }

    if (S.fever > 0 && !isFlame) {
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 15;
    }

    ctx.fillStyle = 'rgb(' + Math.round(br * (1 - t * 0.5)) + ',' + Math.round(bg * (1 - t * 0.5)) + ',' + Math.round(bb * (1 - t * 0.5)) + ')';
    ctx.fillRect(c.x, c.y, S.grid - 1, S.grid - 1);

    if (isHead) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      var es = Math.max(2, S.grid * 0.18);
      var cx = c.x + S.grid / 2;
      var cy = c.y + S.grid / 2;
      if (S.snake.dx !== 0) {
        ctx.beginPath();
        ctx.arc(cx + S.snake.dx * 0.18, cy - S.grid * 0.18, es, 0, Math.PI * 2);
        ctx.arc(cx + S.snake.dx * 0.18, cy + S.grid * 0.18, es, 0, Math.PI * 2);
        ctx.fill();
      } else if (S.snake.dy !== 0) {
        ctx.beginPath();
        ctx.arc(cx - S.grid * 0.18, cy + S.snake.dy * 0.18, es, 0, Math.PI * 2);
        ctx.arc(cx + S.grid * 0.18, cy + S.snake.dy * 0.18, es, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(cx - S.grid * 0.18, cy - S.grid * 0.18, es, 0, Math.PI * 2);
        ctx.arc(cx + S.grid * 0.18, cy - S.grid * 0.18, es, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }
}

function levelUp() {
  S.level++;
  S.eatenThisLevel = 0;
  S.foodPerLevel = 5 + S.level;
  if (ui.level) ui.level.textContent = S.level;
  sfx.levelUp();
  haptic([20, 40, 20]);
  if (ui.levelUpNum) ui.levelUpNum.textContent = S.level;
  if (screens.levelBanner) {
    screens.levelBanner.classList.remove('hidden');
    setTimeout(function() { screens.levelBanner.classList.add('hidden'); }, 1200);
  }
  generateObstacles();
  S.shield = Math.max(S.shield, 2000);

  var levelBonus = 5 + S.level * 2;
  addCoins(levelBonus, 'Бонус за уровень ' + S.level);
  updateQuestProgress('level', S.level);

  checkAchievements();
}

function startGame() {
  resetGame();
  S.isRunning = true;
  S.sessionStartTime = now();
  S.sessionCoins = 0;

  claimDailyReward();
  lastTime = performance.now();
  requestAnimationFrame(loop);
  updateQuestProgress('games', 1);
}

function stopGame() {
  S.isRunning = false;
}

function resetGame() {
  var g = S.grid;
  var cx = Math.floor(canvas.width / g / 2) * g;
  var cy = Math.floor(canvas.height / g / 2) * g;
  S.snake = { x: cx, y: cy, dx: 0, dy: 0, cells: [], maxCells: 4 };
  S.score = 0; S.level = 1; S.eatenThisLevel = 0; S.foodPerLevel = 5;
  S.foods = []; S.obstacles = []; S.particles = []; S.popups = []; S.trail = []; S.deathFragments = [];
  S.combo = 1; S.comboTimer = 0;
  S.shield = 0; S.slow = 0; S.magnet = 0; S.fever = 0;
  S.shakeAmount = 0;
  S.isMoving = false; S.isPaused = false; S.count = 0;
  S.maxComboThisGame = 1;
  for (var i = 0; i < S.snake.maxCells; i++) {
    S.snake.cells.push({ x: cx, y: cy });
  }
  ensureFoods();
  if (ui.score)      ui.score.textContent = '0';
  if (ui.level)      ui.level.textContent = '1';
  if (ui.combo)      ui.combo.style.display = 'none';
  if (ui.powerupBar) ui.powerupBar.innerHTML = '';
  if (ui.feverOverlay) ui.feverOverlay.classList.add('hidden');
  if (screens.gameOver) screens.gameOver.classList.add('hidden');
  if (screens.pause)    screens.pause.classList.add('hidden');
  if (ui.canvasContainer) ui.canvasContainer.style.transform = '';
}

function formatTime(ms) {
  var sec = Math.floor(ms / 1000);
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function gameOver() {
  S.isRunning = false;
  S.gamesPlayed++;
  sfx.death();
  haptic([40, 30, 80]);
  shake(16);
  spawnDeathFragments();
  spawnParticles(S.snake.x, S.snake.y, 24, '255,100,100');

  var isRecord = S.score > S.highScore;
  if (isRecord) { 
    S.highScore = S.score;
    var recordBonus = 20;
    addCoins(recordBonus, 'Бонус за новый рекорд!');
  }

  var comboBonus = S.maxComboThisGame >= 5 ? 10 : 0;
  if (comboBonus > 0) addCoins(comboBonus, 'Бонус за комбо x' + S.maxComboThisGame);

  saveStats();
  saveLeaderboard(S.score);
  renderLeaderboard();

  S.hasSavedGame = true;

  checkAchievements();
  if (ui.finalScore) ui.finalScore.textContent = S.score;
  if (ui.finalLevel) ui.finalLevel.textContent = S.level;
  if (ui.finalEaten) ui.finalEaten.textContent = sessionEaten;
  if (ui.finalTime)  ui.finalTime.textContent = formatTime(now() - S.sessionStartTime);
  if (ui.finalCombo) ui.finalCombo.textContent = 'x' + S.maxComboThisGame;
  if (ui.finalCoins) ui.finalCoins.textContent = '+' + S.sessionCoins + ' 🪙';
  if (ui.newRecord)  ui.newRecord.style.display = isRecord ? 'block' : 'none';
  setTimeout(function() {
    if (screens.gameOver) screens.gameOver.classList.remove('hidden');
  }, 800);
}

function togglePause() {
  if (!S.isRunning) return;
  S.isPaused = !S.isPaused;
  if (screens.pause) {
    if (S.isPaused) screens.pause.classList.remove('hidden');
    else            screens.pause.classList.add('hidden');
  }
}

function setDirection(direction) {
  if (!S.isRunning || S.isPaused) return false;

  var g = S.grid;
  var dx = 0;
  var dy = 0;

  if (direction === 'left') dx = -g;
  if (direction === 'up') dy = -g;
  if (direction === 'right') dx = g;
  if (direction === 'down') dy = g;

  if ((dx !== 0 && S.snake.dx !== 0) || (dy !== 0 && S.snake.dy !== 0)) return false;

  S.snake.dx = dx;
  S.snake.dy = dy;
  S.isMoving = true;
  sfx.turn();
  return true;
}

function flashDirectionButton(direction) {
  if (!ui.directionButtons) return;
  for (var i = 0; i < ui.directionButtons.length; i++) {
    var button = ui.directionButtons[i];
    if (button.getAttribute('data-direction') !== direction) continue;
    button.classList.add('pressed');
    (function(activeButton) {
      setTimeout(function() { activeButton.classList.remove('pressed'); }, 100);
    })(button);
    break;
  }
}

function handleSwipe(dx, dy) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  var direction;
  if (Math.abs(dx) > Math.abs(dy)) direction = dx > 0 ? 'right' : 'left';
  else direction = dy > 0 ? 'down' : 'up';
  if (setDirection(direction)) flashDirectionButton(direction);
}

function handleKey(e) {
  if (e.which === 32) {
    e.preventDefault();
    togglePause();
    return;
  }

  if (!S.isRunning || S.isPaused) return;

  var key = e.which;
  var direction = null;

  if (key === 37 || key === 65) direction = 'left';
  else if (key === 38 || key === 87) direction = 'up';
  else if (key === 39 || key === 68) direction = 'right';
  else if (key === 40 || key === 83) direction = 'down';

  if (direction && setDirection(direction)) e.preventDefault();
}

function bindButtons() {
  if (ui.play)         ui.play.addEventListener('click', function() { initAudio(); sessionEaten = 0; showScreen('game'); });
  if (ui.shop)         ui.shop.addEventListener('click', function() { showScreen('shop'); });
  if (ui.shopBack)     ui.shopBack.addEventListener('click', function() { showScreen('mainMenu'); });
  if (ui.settings)     ui.settings.addEventListener('click', function() { showScreen('settings'); });
  if (ui.instructions) ui.instructions.addEventListener('click', function() { showScreen('instructions'); });
  if (ui.about)        ui.about.addEventListener('click', function() { showScreen('about'); });
  if (ui.exit)          ui.exit.addEventListener('click', function() { showScreen('exitConfirm'); });

  if (ui.btnContinue)  ui.btnContinue.addEventListener('click', function() { initAudio(); sessionEaten = 0; showScreen('game'); });

  if (ui.exitYes) ui.exitYes.addEventListener('click', function() {
    S.isRunning = false;
    window.close();
    showScreen('mainMenu');
  });
  if (ui.exitNo) ui.exitNo.addEventListener('click', function() { showScreen('mainMenu'); });

  if (ui.backAbout) ui.backAbout.addEventListener('click', function() { showScreen('mainMenu'); });
  if (ui.backInstr) ui.backInstr.addEventListener('click', function() { showScreen('mainMenu'); });
  if (ui.backSettings)  ui.backSettings.addEventListener('click', function() { showScreen('mainMenu'); });
  if (ui.saveSettings)  ui.saveSettings.addEventListener('click', saveSettings);
  if (ui.resetSettings) ui.resetSettings.addEventListener('click', resetSettings);
  if (ui.volume)        ui.volume.addEventListener('input', function() { if (ui.volumeValue) ui.volumeValue.textContent = ui.volume.value + '%'; });
  if (ui.speedSlider)   ui.speedSlider.addEventListener('input', function() { if (ui.speedValue) ui.speedValue.textContent = ui.speedSlider.value + '/10'; });

  if (ui.pauseBtn) ui.pauseBtn.addEventListener('click', togglePause);
  if (ui.mobilePause) ui.mobilePause.addEventListener('click', togglePause);
  if (ui.restart)  ui.restart.addEventListener('click', function() { initAudio(); sessionEaten = 0; startGame(); });
  if (ui.toMenu)   ui.toMenu.addEventListener('click', function() { stopGame(); showScreen('mainMenu'); });

  if (ui.directionButtons) {
    ui.directionButtons.forEach(function(button) {
      button.addEventListener('pointerdown', function(e) {
        e.preventDefault();
        initAudio();
        setDirection(button.getAttribute('data-direction'));
        button.classList.add('pressed');
      });
      button.addEventListener('pointerup', function() { button.classList.remove('pressed'); });
      button.addEventListener('pointercancel', function() { button.classList.remove('pressed'); });
      button.addEventListener('pointerleave', function() { button.classList.remove('pressed'); });
    });
  }

  if (ui.canvasContainer) {
    ui.canvasContainer.addEventListener('touchstart', function(e) {
      if (!e.touches || !e.touches[0]) return;
      touchActive = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      e.preventDefault();
    }, { passive: false });
    ui.canvasContainer.addEventListener('touchmove', function(e) {
      if (touchActive) e.preventDefault();
    }, { passive: false });
    ui.canvasContainer.addEventListener('touchend', function(e) {
      if (!touchActive || !e.changedTouches || !e.changedTouches[0]) return;
      handleSwipe(
        e.changedTouches[0].clientX - touchStartX,
        e.changedTouches[0].clientY - touchStartY
      );
      touchActive = false;
      e.preventDefault();
    }, { passive: false });
    ui.canvasContainer.addEventListener('touchcancel', function() { touchActive = false; });
  }

  if (ui.restartOverlay) ui.restartOverlay.addEventListener('click', function() { initAudio(); sessionEaten = 0; startGame(); });
  if (ui.backToMenu)     ui.backToMenu.addEventListener('click', function() { stopGame(); showScreen('mainMenu'); });

  if (ui.resume)      ui.resume.addEventListener('click', togglePause);
  if (ui.pauseToMenu) ui.pauseToMenu.addEventListener('click', function() { stopGame(); showScreen('mainMenu'); });

  if (ui.snakeColor) {
    ui.snakeColor.addEventListener('input', function() {
      S.snakeColor = ui.snakeColor.value;
      localStorage.setItem('snakeSkinColor', S.snakeColor);
      if (ui.skinOptions) {
        ui.skinOptions.forEach(function(o) { o.classList.remove('active'); });
      }
    });
  }
}

function init() {
  bindButtons();
  window.addEventListener('keydown', handleKey);
  window.addEventListener('resize', function() {
    if (screens.game && !screens.game.classList.contains('hidden')) resizeCanvas();
  });
  document.addEventListener('visibilitychange', function() {
    if (S.autoPause && document.hidden && S.isRunning && !S.isPaused) togglePause();
  });
  loadSettings();
  loadStats();
  loadCoins();
  loadOwnedSkins();
  loadDailyQuests();
  renderLeaderboard();
  setupSkinPalette();
  updateProgressBars();
  updateContinueButton();
  updateCoinsUI();
  renderQuests();

  if (S.gamesPlayed > 0) S.hasSavedGame = true;
  showScreen('mainMenu');
}

init();

(function addTurboAbility() {
  var TURBO_DURATION = 2400;
  var TURBO_COOLDOWN = 7000;
  var turboButton = null;
  var lastTapAt = 0;

  S.turboUntil = 0;
  S.turboReadyAt = 0;

  var regularFrameDelay = getFrameDelay;
  getFrameDelay = function() {
    var delay = regularFrameDelay();
    if (S.turboUntil > now()) return Math.max(1, delay - 2);
    return delay;
  };

  function addTurboStyles() {
    if (document.getElementById('turbo-styles')) return;
    var style = document.createElement('style');
    style.id = 'turbo-styles';
    style.textContent =
      '.turbo-control{border-color:rgba(255,193,7,.42)!important;color:#ffd166!important}' +
      '.turbo-control.ready{background:linear-gradient(135deg,#ffb703,#fb8500)!important;color:#241400!important;border-color:transparent!important;box-shadow:0 4px 18px rgba(255,167,38,.35)!important}' +
      '.turbo-control.active{background:linear-gradient(135deg,#ffe082,#ff7b00)!important;color:#241400!important;animation:turboPulse .55s ease-in-out infinite alternate}' +
      '.turbo-control:disabled{cursor:not-allowed;opacity:.6;transform:none!important}' +
      '@keyframes turboPulse{from{filter:brightness(1)}to{filter:brightness(1.35)}}';
    document.head.appendChild(style);
  }

  function createTurboButton() {
    var controls = document.querySelector('.game-controls');
    if (!controls || document.getElementById('btn-turbo')) return;

    turboButton = document.createElement('button');
    turboButton.id = 'btn-turbo';
    turboButton.type = 'button';
    turboButton.className = 'btn btn-small turbo-control ready';
    turboButton.setAttribute('aria-label', 'Активировать турбо');
    turboButton.textContent = '⚡ Турбо';
    turboButton.addEventListener('click', activateTurbo);
    controls.insertBefore(turboButton, ui.toMenu || null);
  }

  function updateTurboButton() {
    if (!turboButton) return;

    var current = now();
    var active = S.turboUntil > current;
    var cooldown = Math.max(0, S.turboReadyAt - current);
    turboButton.classList.toggle('active', active);
    turboButton.classList.toggle('ready', !active && cooldown <= 0);
    turboButton.disabled = !S.isRunning || S.isPaused || (!active && cooldown > 0);

    if (active) {
      turboButton.textContent = '⚡ ' + (Math.max(0, S.turboUntil - current) / 1000).toFixed(1) + 'с';
    } else if (cooldown > 0) {
      turboButton.textContent = '⏳ ' + Math.ceil(cooldown / 1000) + 'с';
    } else {
      turboButton.textContent = '⚡ Турбо';
    }
  }

  function activateTurbo() {
    if (!S.isRunning || S.isPaused || now() < S.turboReadyAt) return;

    S.turboUntil = now() + TURBO_DURATION;
    S.turboReadyAt = now() + TURBO_COOLDOWN;
    if (typeof beep === 'function') beep(740, 0.12, 'triangle', 0.8);
    haptic([18, 35, 18]);
    updateTurboButton();
  }

  window.snakeActivateTurbo = activateTurbo;

  var regularResetGame = resetGame;
  resetGame = function() {
    regularResetGame();
    S.turboUntil = 0;
    S.turboReadyAt = 0;
    updateTurboButton();
  };

  function addMobileHint() {
    var list = document.querySelector('.info-list');
    if (!list || list.querySelector('.turbo-help')) return;
    var item = document.createElement('li');
    item.className = 'turbo-help';
    item.innerHTML = '<b>Турбо</b> — клавиша Shift, двойной тап или кнопка ⚡; действует 2,4 сек.';
    list.appendChild(item);
  }

  window.addEventListener('keydown', function(e) {
    if (e.key === 'Shift' || e.which === 16) {
      e.preventDefault();
      activateTurbo();
    }
  });

  if (ui.canvasContainer) {
    ui.canvasContainer.addEventListener('touchend', function(e) {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      var touch = e.changedTouches[0];
      var moved = Math.abs(touch.clientX - touchStartX) + Math.abs(touch.clientY - touchStartY);
      var current = Date.now();
      if (moved < 18 && current - lastTapAt < 300) activateTurbo();
      lastTapAt = current;
    }, { passive: true });
  }

  addTurboStyles();
  createTurboButton();
  addMobileHint();
  updateTurboButton();
  window.setInterval(updateTurboButton, 100);
})();

(function addDesktopFullscreen() {
  var fullscreenButton = null;

  function isFullscreen() {
    return document.fullscreenElement || document.webkitFullscreenElement;
  }

  function updateFullscreenButton() {
    if (!fullscreenButton) return;
    var active = Boolean(isFullscreen());
    fullscreenButton.textContent = active ? '↙ Маленький экран' : '⛶ Полный экран';
    fullscreenButton.setAttribute('aria-label', active ? 'Выйти из полноэкранного режима' : 'Включить полноэкранный режим');
    fullscreenButton.classList.toggle('fullscreen-active', active);
  }

  function toggleFullscreen() {
    if (isFullscreen()) {
      var exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) {
        var exitResult = exit.call(document);
        if (exitResult && exitResult.catch) exitResult.catch(function() {});
      }
      return;
    }

    var root = document.documentElement;
    var request = root.requestFullscreen || root.webkitRequestFullscreen;
    if (!request) {
      showNotification('Полный экран недоступен', 'Браузер не поддерживает эту функцию');
      return;
    }
    var requestResult = request.call(root);
    if (requestResult && requestResult.catch) {
      requestResult.catch(function() {
        showNotification('Не удалось включить полный экран', 'Попробуйте нажать кнопку ещё раз');
      });
    }
  }

  function addButton() {
    var controls = document.querySelector('.game-controls');
    if (!controls || document.getElementById('btn-fullscreen')) return;

    fullscreenButton = document.createElement('button');
    fullscreenButton.id = 'btn-fullscreen';
    fullscreenButton.type = 'button';
    fullscreenButton.className = 'btn btn-small desktop-only fullscreen-control';
    fullscreenButton.textContent = '⛶ Полный экран';
    fullscreenButton.addEventListener('click', toggleFullscreen);
    controls.appendChild(fullscreenButton);
    updateFullscreenButton();
  }

  function addKeyboardHint() {
    var list = document.querySelector('.info-list');
    if (!list || list.querySelector('.fullscreen-help')) return;
    var item = document.createElement('li');
    item.className = 'fullscreen-help';
    item.innerHTML = '<b>F</b> — включить или выключить полноэкранный режим на компьютере';
    list.appendChild(item);
  }

  document.addEventListener('fullscreenchange', updateFullscreenButton);
  document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
  window.addEventListener('keydown', function(e) {
    if (e.key && e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      toggleFullscreen();
    }
  });

  addButton();
  addKeyboardHint();
})();

(function addQuickActions() {
  var shareButton = null;

  function isTypingTarget(target) {
    if (!target) return false;
    var tag = target.tagName ? target.tagName.toLowerCase() : '';
    return tag === 'input' || tag === 'select' || tag === 'textarea' || target.isContentEditable;
  }

  function resultText() {
    return 'Змейка\n' +
      'Счёт: ' + S.score + '\n' +
      'Уровень: ' + S.level + '\n' +
      'Съедено: ' + sessionEaten + '\n' +
      'Попробуй побить мой результат!';
  }

  function fallbackCopy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function(resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        if (!document.execCommand('copy')) throw new Error('copy failed');
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        area.remove();
      }
    });
  }

  function shareResult() {
    var text = resultText();
    var shareData = {
      title: 'Мой результат в игре «Змейка»',
      text: text,
      url: window.location.href.split('?')[0]
    };

    if (navigator.share) {
      navigator.share(shareData).then(function() {
        haptic(12);
      }).catch(function(error) {
        if (!error || error.name !== 'AbortError') {
          showNotification('Не удалось поделиться', 'Попробуйте скопировать результат ещё раз');
        }
      });
      return;
    }

    fallbackCopy(text).then(function() {
      haptic(12);
      showNotification('Результат скопирован', 'Можно отправить его друзьям');
    }).catch(function() {
      showNotification('Скопируйте результат вручную', text.replace(/\n/g, ' · '));
    });
  }

  function addShareButton() {
    if (!screens.gameOver || !ui.restartOverlay || document.getElementById('btn-share-score')) return;
    shareButton = document.createElement('button');
    shareButton.id = 'btn-share-score';
    shareButton.type = 'button';
    shareButton.className = 'btn btn-small share-score-control';
    shareButton.textContent = '↗ Поделиться результатом';
    shareButton.addEventListener('click', shareResult);
    screens.gameOver.insertBefore(shareButton, ui.restartOverlay);
  }

  function addShortcutHelp() {
    var list = document.querySelector('.info-list');
    if (!list || list.querySelector('.shortcuts-help')) return;
    var item = document.createElement('li');
    item.className = 'shortcuts-help';
    item.innerHTML = '<b>P</b> — пауза, <b>R</b> — быстрый рестарт на компьютере.';
    list.appendChild(item);
  }

  window.addEventListener('keydown', function(e) {
    if (isTypingTarget(e.target) || e.ctrlKey || e.altKey || e.metaKey) return;

    var key = e.key ? e.key.toLowerCase() : '';
    if (key === 'p') {
      e.preventDefault();
      togglePause();
    } else if (key === 'r' && screens.game && !screens.game.classList.contains('hidden')) {
      e.preventDefault();
      initAudio();
      sessionEaten = 0;
      startGame();
    }
  });

  addShareButton();
  addShortcutHelp();
})();

(function addGameResume() {
  var STORAGE_KEY = 'snake-pro-current-game';
  var continueButton = null;

  function readCheckpoint() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveCheckpoint() {
    if (!S.isRunning || !S.snake || !S.snake.cells || S.snake.cells.length === 0) return;
    var checkpoint = {
      snake: S.snake,
      foods: S.foods,
      obstacles: S.obstacles,
      score: S.score,
      level: S.level,
      foodPerLevel: S.foodPerLevel,
      eatenThisLevel: S.eatenThisLevel,
      combo: S.combo,
      comboTimer: S.comboTimer,
      shield: S.shield,
      slow: S.slow,
      magnet: S.magnet,
      fever: S.fever,
      sessionEaten: sessionEaten,
      sessionCoins: S.sessionCoins,
      feverCount: S.feverCount,
      maxComboThisGame: S.maxComboThisGame,
      savedAt: Date.now()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkpoint));
      S.hasSavedGame = true;
      updateContinueButton();
    } catch (e) {}
  }

  function clearCheckpoint() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    S.hasSavedGame = false;
    updateContinueButton();
  }

  function updateResumeButton() {
    if (!continueButton) return;
    var checkpoint = readCheckpoint();
    continueButton.style.display = checkpoint ? 'block' : 'none';
    S.hasSavedGame = Boolean(checkpoint);
  }

  function restoreCheckpoint() {
    var checkpoint = readCheckpoint();
    if (!checkpoint || !checkpoint.snake || !checkpoint.snake.cells) {
      clearCheckpoint();
      return;
    }

    initAudio();
    showScreen('game');

    S.snake = checkpoint.snake;
    S.foods = checkpoint.foods || [];
    S.obstacles = checkpoint.obstacles || [];
    S.score = checkpoint.score || 0;
    S.level = checkpoint.level || 1;
    S.foodPerLevel = checkpoint.foodPerLevel || 5;
    S.eatenThisLevel = checkpoint.eatenThisLevel || 0;
    S.combo = checkpoint.combo || 1;
    S.comboTimer = checkpoint.comboTimer || 0;
    S.shield = checkpoint.shield || 0;
    S.slow = checkpoint.slow || 0;
    S.magnet = checkpoint.magnet || 0;
    S.fever = checkpoint.fever || 0;
    S.sessionCoins = checkpoint.sessionCoins || 0;
    S.feverCount = checkpoint.feverCount || 0;
    S.maxComboThisGame = checkpoint.maxComboThisGame || 1;
    S.isMoving = Boolean(S.snake.dx || S.snake.dy);
    S.isPaused = false;
    S.isRunning = true;
    sessionEaten = checkpoint.sessionEaten || 0;
    lastTime = performance.now();

    if (ui.score) ui.score.textContent = S.score;
    if (ui.level) ui.level.textContent = S.level;
    if (ui.combo) {
      ui.combo.style.display = S.combo > 1 ? 'inline' : 'none';
      if (ui.comboVal) ui.comboVal.textContent = S.combo;
    }
    updatePowerupBar();
    if (screens.gameOver) screens.gameOver.classList.add('hidden');
    if (screens.pause) screens.pause.classList.add('hidden');
    showNotification('Игра восстановлена', 'Продолжаем с сохранённого места');
  }

  function createContinueButton() {
    if (!ui.play || !ui.play.parentNode || document.getElementById('btn-continue')) return;
    continueButton = document.createElement('button');
    continueButton.id = 'btn-continue';
    continueButton.type = 'button';
    continueButton.className = 'btn btn-secondary';
    continueButton.textContent = '▶ Продолжить игру';
    continueButton.addEventListener('click', restoreCheckpoint);
    ui.play.parentNode.insertBefore(continueButton, ui.play.nextSibling);
    ui.btnContinue = continueButton;
    updateResumeButton();
  }

  var originalGameOver = gameOver;
  gameOver = function() {
    originalGameOver();
    clearCheckpoint();
  };

  createContinueButton();
  window.setInterval(saveCheckpoint, 2500);
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) saveCheckpoint();
    else updateResumeButton();
  });
  window.addEventListener('beforeunload', saveCheckpoint);
  updateResumeButton();
})();

(function addGamepadSupport() {
  var previousButtons = {};
  var lastDirection = null;

  function buttonPressed(gamepad, index) {
    return Boolean(gamepad.buttons[index] && gamepad.buttons[index].pressed);
  }

  function directionFromGamepad(gamepad) {
    if (buttonPressed(gamepad, 12)) return 'up';
    if (buttonPressed(gamepad, 13)) return 'down';
    if (buttonPressed(gamepad, 14)) return 'left';
    if (buttonPressed(gamepad, 15)) return 'right';

    var x = gamepad.axes[0] || 0;
    var y = gamepad.axes[1] || 0;
    if (Math.max(Math.abs(x), Math.abs(y)) < 0.55) return null;
    if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'right' : 'left';
    return y > 0 ? 'down' : 'up';
  }

  function pollGamepads() {
    if (!navigator.getGamepads) return;
    var pads = navigator.getGamepads();
    var gamepad = null;
    for (var i = 0; i < pads.length; i++) {
      if (pads[i]) {
        gamepad = pads[i];
        break;
      }
    }

    if (gamepad) {
      var direction = directionFromGamepad(gamepad);
      if (direction && direction !== lastDirection) setDirection(direction);
      lastDirection = direction;

      var startPressed = buttonPressed(gamepad, 9);
      if (startPressed && !previousButtons.start) togglePause();
      previousButtons.start = startPressed;

      var turboPressed = buttonPressed(gamepad, 0);
      if (turboPressed && !previousButtons.turbo && window.snakeActivateTurbo) {
        window.snakeActivateTurbo();
      }
      previousButtons.turbo = turboPressed;
    } else {
      lastDirection = null;
      previousButtons = {};
    }

    window.setTimeout(pollGamepads, 100);
  }

  window.addEventListener('gamepadconnected', function(e) {
    showNotification('Контроллер подключён', 'Крестовина или стик — движение, Start — пауза, A — турбо');
  });
  window.addEventListener('gamepaddisconnected', function() {
    showNotification('Контроллер отключён', 'Можно продолжить с клавиатуры или сенсорных кнопок');
  });

  var list = document.querySelector('.info-list');
  if (list && !list.querySelector('.gamepad-help')) {
    var item = document.createElement('li');
    item.className = 'gamepad-help';
    item.innerHTML = '<b>Геймпад</b> — крестовина или левый стик: движение, Start: пауза, A: турбо.';
    list.appendChild(item);
  }

  pollGamepads();
})();
