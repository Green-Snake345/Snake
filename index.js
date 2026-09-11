'use strict';

// ═══════════════════════════════════════════════════════════
//  DOM
// ═══════════════════════════════════════════════════════════
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
  game:         el('game-screen'),
  gameOver:     el('game-over-overlay'),
  pause:        el('pause-overlay'),
  levelBanner:  el('level-up-banner'),
  exitConfirm:  el('exit-confirm')
};

var ui = {
  play:            el('btn-play'),
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
  newRecord:       el('new-record'),
  combo:           el('combo-display'),
  comboVal:        el('combo-val'),
  powerupBar:      el('powerup-bar'),
  levelUpNum:      el('level-up-num'),
  canvasContainer: el('canvas-container'),
  msHighscore:     el('ms-highscore'),
  msGames:         el('ms-games'),
  msEaten:         el('ms-eaten'),
  leaderboard:     el('leaderboard-list'),
  aboutGames:      el('about-games'),
  aboutEaten:      el('about-eaten'),
  aboutBest:       el('about-best'),
  difficulty:      el('difficulty-select'),
  gridSize:        el('grid-size-select'),
  theme:           el('theme-select'),
  gridToggle:      el('grid-toggle'),
  speedSlider:     el('speed-slider'),
  speedValue:      el('speed-value'),
  snakeColor:      el('snake-color-picker'),
  volume:          el('volume-slider'),
  volumeValue:     el('volume-value'),
  particles:       el('particles-toggle'),
  shake:           el('shake-toggle')
};

// ═══════════════════════════════════════════════════════════
//  Состояние
// ═══════════════════════════════════════════════════════════
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
  showParticles: true,
  showShake: true,
  showGrid: true,
  volume: 0.5,
  shakeAmount: 0,
  theme: 'dark',
  baseSpeed: 5,
  snakeColor: '#2ecc71',
  combo: 1,
  comboTimer: 0,
  comboTimeout: 2500,
  shield: 0,
  slow: 0,
  magnet: 0,
  popups: []
};

var sessionEaten = 0;
var lastTime = 0;
var audioCtx = null;

// ═══════════════════════════════════════════════════════════
//  Звук
// ═══════════════════════════════════════════════════════════
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

var sfx = {
  eat:     function() { beep(660, 0.1, 'square'); },
  gold:    function() { beep(880, 0.08, 'triangle'); setTimeout(function() { beep(1100, 0.1, 'triangle'); }, 70); },
  shield:  function() { beep(440, 0.2, 'sine'); },
  slow:    function() { beep(300, 0.25, 'sine'); },
  magnet:  function() { beep(550, 0.08, 'sawtooth'); setTimeout(function() { beep(700, 0.1, 'sawtooth'); }, 60); },
  levelUp: function() { beep(523, 0.1, 'triangle'); setTimeout(function() { beep(659, 0.1, 'triangle'); }, 100); setTimeout(function() { beep(784, 0.15, 'triangle'); }, 200); },
  death:   function() { beep(220, 0.3, 'sawtooth'); setTimeout(function() { beep(165, 0.4, 'sawtooth'); }, 150); },
  turn:    function() { beep(440, 0.04, 'sine', 0.5); }
};

// ═══════════════════════════════════════════════════════════
//  Утилиты
// ═══════════════════════════════════════════════════════════
function randInt(a, b) { return Math.floor(Math.random() * (b - a)) + a; }
function now() { return performance.now(); }

function hexToRgb(h) {
  var m = h.replace('#', '').match(/.{2}/g);
  return m ? m.map(function(x) { return parseInt(x, 16); }) : [46, 204, 113];
}

function applyTheme(t) {
  if (t === 'light') document.body.classList.add('theme-light');
  else document.body.classList.remove('theme-light');
}

function resizeCanvas() {
  var s = Math.min(window.innerWidth - 40, window.innerHeight - 140, 520);
  canvas.width  = Math.floor(s / S.grid) * S.grid;
  canvas.height = Math.floor(s / S.grid) * S.grid;
}

// ═══════════════════════════════════════════════════════════
//  Навигация
// ═══════════════════════════════════════════════════════════
function showScreen(name) {
  ['mainMenu', 'instructions', 'about', 'settings', 'exitConfirm'].forEach(function(k) {
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
  } else if (screens[name]) {
    screens[name].classList.remove('hidden');
    screens[name].classList.add('active');
  }
}

// ═══════════════════════════════════════════════════════════
//  Настройки
// ═══════════════════════════════════════════════════════════
function loadSettings() {
  var raw = localStorage.getItem('snake-pro-settings');
  if (!raw) return;
  try {
    var s = JSON.parse(raw);
    if (s.difficulty && ui.difficulty) { ui.difficulty.value = s.difficulty; S.difficulty = s.difficulty; }
    if (s.grid && ui.gridSize)         { ui.gridSize.value = String(s.grid); S.grid = s.grid; }
    if (s.theme && ui.theme)           { ui.theme.value = s.theme; S.theme = s.theme; applyTheme(S.theme); }
    if (typeof s.showGrid !== 'undefined' && ui.gridToggle)  { ui.gridToggle.checked = s.showGrid; S.showGrid = s.showGrid; }
    if (typeof s.baseSpeed !== 'undefined' && ui.speedSlider){ ui.speedSlider.value = String(s.baseSpeed); S.baseSpeed = s.baseSpeed; if (ui.speedValue) ui.speedValue.textContent = s.baseSpeed + '/10'; }
    if (s.snakeColor && ui.snakeColor) { ui.snakeColor.value = s.snakeColor; S.snakeColor = s.snakeColor; }
    if (typeof s.particles !== 'undefined' && ui.particles)  { ui.particles.checked = s.particles; S.showParticles = s.particles; }
    if (typeof s.shake !== 'undefined' && ui.shake)          { ui.shake.checked = s.shake; S.showShake = s.shake; }
    if (typeof s.volume !== 'undefined' && ui.volume)        { S.volume = s.volume; ui.volume.value = String(s.volume * 100); if (ui.volumeValue) ui.volumeValue.textContent = Math.round(s.volume * 100) + '%'; }
  } catch (e) {
    console.warn('Не удалось загрузить настройки', e);
  }
}

function saveSettings() {
  var s = {
    difficulty: ui.difficulty ? ui.difficulty.value : 'normal',
    grid:       ui.gridSize ? Number(ui.gridSize.value) : 16,
    theme:      ui.theme ? ui.theme.value : 'dark',
    showGrid:   ui.gridToggle ? ui.gridToggle.checked : true,
    baseSpeed:  ui.speedSlider ? Number(ui.speedSlider.value) : 5,
    snakeColor: ui.snakeColor ? ui.snakeColor.value : '#2ecc71',
    particles:  ui.particles ? ui.particles.checked : true,
    shake:      ui.shake ? ui.shake.checked : true,
    volume:     ui.volume ? Number(ui.volume.value) / 100 : 0.5
  };
  localStorage.setItem('snake-pro-settings', JSON.stringify(s));
  S.difficulty = s.difficulty; S.grid = s.grid; S.theme = s.theme;
  S.showGrid = s.showGrid; S.baseSpeed = s.baseSpeed; S.snakeColor = s.snakeColor;
  S.showParticles = s.particles; S.showShake = s.shake; S.volume = s.volume;
  applyTheme(S.theme);
  resizeCanvas();
  showScreen('mainMenu');
}

function resetSettings() {
  if (ui.difficulty)  ui.difficulty.value = 'normal';
  if (ui.gridSize)    ui.gridSize.value = '16';
  if (ui.theme)       ui.theme.value = 'dark';
  if (ui.gridToggle)  ui.gridToggle.checked = true;
  if (ui.speedSlider) ui.speedSlider.value = '5';
  if (ui.speedValue)  ui.speedValue.textContent = '5/10';
  if (ui.snakeColor)  ui.snakeColor.value = '#2ecc71';
  if (ui.particles)   ui.particles.checked = true;
  if (ui.shake)       ui.shake.checked = true;
  if (ui.volume)      ui.volume.value = '50';
  if (ui.volumeValue) ui.volumeValue.textContent = '50%';
  saveSettings();
}

// ═══════════════════════════════════════════════════════════
//  Статистика
// ═══════════════════════════════════════════════════════════
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
}

// ═══════════════════════════════════════════════════════════
//  Таблица рекордов
// ═══════════════════════════════════════════════════════════
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
    li.innerHTML =
      '<span class="rank">' + (i + 1) + '</span>' +
      '<span class="score-val">' + list[i].score + '</span>';
    ui.leaderboard.appendChild(li);
  }
}

// ═══════════════════════════════════════════════════════════
//  Еда
// ═══════════════════════════════════════════════════════════
var FOOD_TYPES = {
  normal: { color: '#e74c3c', glow: '#e74c3c', points: 1, grow: 1, weight: 70, label: '+1' },
  gold:   { color: '#ffd700', glow: '#ffd700', points: 5, grow: 3, weight: 10, label: '+5' },
  slow:   { color: '#3498db', glow: '#3498db', points: 2, grow: 1, weight: 7, label: 'SLOW', powerup: 'slow' },
  shield: { color: '#9b59b6', glow: '#9b59b6', points: 2, grow: 1, weight: 7, label: 'SHIELD', powerup: 'shield' },
  magnet: { color: '#e67e22', glow: '#e67e22', points: 2, grow: 1, weight: 6, label: 'MAGNET', powerup: 'magnet' }
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

// ═══════════════════════════════════════════════════════════
//  Препятствия
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
//  Частицы
// ═══════════════════════════════════════════════════════════
function spawnParticles(x, y, n, c) {
  if (!S.showParticles) return;
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

// ═══════════════════════════════════════════════════════════
//  Всплывающие очки
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
//  Тряска экрана
// ═══════════════════════════════════════════════════════════
function shake(a) {
  if (!S.showShake) return;
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

// ═══════════════════════════════════════════════════════════
//  Полоса бустов
// ═══════════════════════════════════════════════════════════
function updatePowerupBar() {
  if (!ui.powerupBar) return;
  ui.powerupBar.innerHTML = '';
  var ups = [
    { label: 'Щит',     val: S.shield, max: 5000, cls: 'shield' },
    { label: 'Замедл.', val: S.slow,   max: 5000, cls: 'slow' },
    { label: 'Магнит',   val: S.magnet, max: 8000, cls: 'magnet' }
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
}

// ═══════════════════════════════════════════════════════════
//  Скорость
// ═══════════════════════════════════════════════════════════
function getFrameDelay() {
  var b = S.difficulty === 'easy' ? 7 : S.difficulty === 'hard' ? 3 : 5;
  b -= Math.floor((S.level - 1) / 3);
  b += (5 - S.baseSpeed) * 0.6;
  if (S.slow > 0) b += 4;
  return Math.max(2, b);
}

// ═══════════════════════════════════════════════════════════
//  Игровой цикл
// ═══════════════════════════════════════════════════════════
function loop(ts) {
  if (!S.isRunning) return;
  var dt = ts - lastTime;
  lastTime = ts;

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
      S.score += ft.points * S.combo;
      S.totalEaten++; sessionEaten++; S.eatenThisLevel++;
      S.snake.maxCells += ft.grow;
      S.combo = Math.min(S.combo + 1, 8);
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

      if (f.type === 'gold') sfx.gold();
      else if (!ft.powerup) sfx.eat();

      var c = hexToRgb(ft.glow).join(',');
      spawnParticles(f.x, f.y, f.type === 'gold' ? 16 : 10, c);
      spawnPopup(f.x, f.y, ft.label, 'rgb(' + c + ')');

      S.foods.splice(fi, 1);
      if (S.eatenThisLevel >= S.foodPerLevel) levelUp();
      if (ui.score) ui.score.textContent = S.score;
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
  updatePowerupBar();

  drawGrid();
  drawObstacles();
  drawFoods();
  drawSnake();
  drawParticles();
  drawPopups();
  updateParticles();
  updatePopups();
  applyShake();

  requestAnimationFrame(loop);
}

// ═══════════════════════════════════════════════════════════
//  Отрисовка
// ═══════════════════════════════════════════════════════════
function drawGrid() {
  if (!S.showGrid) return;
  ctx.strokeStyle = S.theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.03)';
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
    ctx.shadowBlur = f.type === 'gold' ? 16 : 8;
    var size = (S.grid - 1) * pulse;
    var off = (S.grid - size) / 2;
    ctx.fillStyle = ft.color;
    ctx.fillRect(f.x + off, f.y + off, size, size);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    if (f.type !== 'normal' && f.type !== 'gold') {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold ' + Math.max(8, S.grid * 0.55) + 'px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var labels = { slow: 'S', shield: 'D', magnet: 'M' };
      ctx.fillText(labels[f.type] || '', f.x + S.grid / 2, f.y + S.grid / 2);
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    }
  }
}

function drawSnake() {
  var cells = S.snake.cells;
  var rgb = hexToRgb(S.snakeColor);
  var br = rgb[0], bg = rgb[1], bb = rgb[2];

  for (var i = 0; i < cells.length; i++) {
    var c = cells[i];
    var isHead = i === 0;
    var t = i / Math.max(1, cells.length - 1);

    if (isHead) {
      ctx.shadowColor = S.shield > 0 ? '#9b59b6' : S.snakeColor;
      ctx.shadowBlur = 10;
    }

    if (S.shield > 0) {
      ctx.strokeStyle = 'rgba(155,89,182,' + (0.4 + Math.sin(now() / 200) * 0.2) + ')';
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x - 1, c.y - 1, S.grid + 1, S.grid + 1);
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

// ═══════════════════════════════════════════════════════════
//  Уровни
// ═══════════════════════════════════════════════════════════
function levelUp() {
  S.level++;
  S.eatenThisLevel = 0;
  S.foodPerLevel = 5 + S.level;
  if (ui.level) ui.level.textContent = S.level;
  sfx.levelUp();
  if (ui.levelUpNum) ui.levelUpNum.textContent = S.level;
  if (screens.levelBanner) {
    screens.levelBanner.classList.remove('hidden');
    setTimeout(function() { screens.levelBanner.classList.add('hidden'); }, 1200);
  }
  generateObstacles();
  S.shield = Math.max(S.shield, 2000);
}

// ═══════════════════════════════════════════════════════════
//  Управление игрой
// ═══════════════════════════════════════════════════════════
function startGame() {
  resetGame();
  S.isRunning = true;
  lastTime = performance.now();
  requestAnimationFrame(loop);
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
  S.foods = []; S.obstacles = []; S.particles = []; S.popups = [];
  S.combo = 1; S.comboTimer = 0;
  S.shield = 0; S.slow = 0; S.magnet = 0;
  S.shakeAmount = 0;
  S.isMoving = false; S.isPaused = false; S.count = 0;
  for (var i = 0; i < S.snake.maxCells; i++) {
    S.snake.cells.push({ x: cx, y: cy });
  }
  ensureFoods();
  if (ui.score)      ui.score.textContent = '0';
  if (ui.level)      ui.level.textContent = '1';
  if (ui.combo)      ui.combo.style.display = 'none';
  if (ui.powerupBar) ui.powerupBar.innerHTML = '';
  if (screens.gameOver) screens.gameOver.classList.add('hidden');
  if (screens.pause)    screens.pause.classList.add('hidden');
  if (ui.canvasContainer) ui.canvasContainer.style.transform = '';
}

function gameOver() {
  S.isRunning = false;
  S.gamesPlayed++;
  sfx.death();
  shake(16);
  var isRecord = S.score > S.highScore;
  if (isRecord) { S.highScore = S.score; }
  saveStats();
  saveLeaderboard(S.score);
  renderLeaderboard();
  if (ui.finalScore) ui.finalScore.textContent = S.score;
  if (ui.finalLevel) ui.finalLevel.textContent = S.level;
  if (ui.finalEaten) ui.finalEaten.textContent = sessionEaten;
  if (ui.newRecord)  ui.newRecord.style.display = isRecord ? 'block' : 'none';
  setTimeout(function() {
    if (screens.gameOver) screens.gameOver.classList.remove('hidden');
  }, 300);
}

function togglePause() {
  if (!S.isRunning) return;
  S.isPaused = !S.isPaused;
  if (screens.pause) {
    if (S.isPaused) screens.pause.classList.remove('hidden');
    else            screens.pause.classList.add('hidden');
  }
}

// ═══════════════════════════════════════════════════════════
//  Ввод — стрелки + WASD
// ═══════════════════════════════════════════════════════════
function handleKey(e) {
  if (e.which === 32) {
    e.preventDefault();
    togglePause();
    return;
  }

  if (!S.isRunning || S.isPaused) return;

  var g = S.grid;
  var key = e.which;
  var handled = false;

  if ((key === 37 || key === 65) && S.snake.dx === 0) {
    S.snake.dx = -g; S.snake.dy = 0; S.isMoving = true; sfx.turn(); handled = true;
  }
  else if ((key === 38 || key === 87) && S.snake.dy === 0) {
    S.snake.dy = -g; S.snake.dx = 0; S.isMoving = true; sfx.turn(); handled = true;
  }
  else if ((key === 39 || key === 68) && S.snake.dx === 0) {
    S.snake.dx = g; S.snake.dy = 0; S.isMoving = true; sfx.turn(); handled = true;
  }
  else if ((key === 40 || key === 83) && S.snake.dy === 0) {
    S.snake.dy = g; S.snake.dx = 0; S.isMoving = true; sfx.turn(); handled = true;
  }

  if (handled) e.preventDefault();
}

// ═══════════════════════════════════════════════════════════
//  Привязка кнопок
// ═══════════════════════════════════════════════════════════
function bindButtons() {
  // Главное меню
  if (ui.play)         ui.play.addEventListener('click', function() { initAudio(); sessionEaten = 0; showScreen('game'); });
  if (ui.settings)     ui.settings.addEventListener('click', function() { showScreen('settings'); });
  if (ui.instructions) ui.instructions.addEventListener('click', function() { showScreen('instructions'); });
  if (ui.about)        ui.about.addEventListener('click', function() { showScreen('about'); });
  if (ui.exit)          ui.exit.addEventListener('click', function() { showScreen('exitConfirm'); });

  // Экран подтверждения выхода
  if (ui.exitYes) ui.exitYes.addEventListener('click', function() {
    S.isRunning = false;
    window.close();
    showScreen('mainMenu');
  });
  if (ui.exitNo) ui.exitNo.addEventListener('click', function() { showScreen('mainMenu'); });

  // О игре
  if (ui.backAbout) ui.backAbout.addEventListener('click', function() { showScreen('mainMenu'); });

  // Инструкции
  if (ui.backInstr) ui.backInstr.addEventListener('click', function() { showScreen('mainMenu'); });

  // Настройки
  if (ui.backSettings)  ui.backSettings.addEventListener('click', function() { showScreen('mainMenu'); });
  if (ui.saveSettings)  ui.saveSettings.addEventListener('click', saveSettings);
  if (ui.resetSettings) ui.resetSettings.addEventListener('click', resetSettings);
  if (ui.volume)        ui.volume.addEventListener('input', function() { if (ui.volumeValue) ui.volumeValue.textContent = ui.volume.value + '%'; });
  if (ui.speedSlider)   ui.speedSlider.addEventListener('input', function() { if (ui.speedValue) ui.speedValue.textContent = ui.speedSlider.value + '/10'; });

  // Игровой экран
  if (ui.pauseBtn) ui.pauseBtn.addEventListener('click', togglePause);
  if (ui.restart)  ui.restart.addEventListener('click', function() { initAudio(); sessionEaten = 0; startGame(); });
  if (ui.toMenu)   ui.toMenu.addEventListener('click', function() { stopGame(); showScreen('mainMenu'); });

  // Оверлей проигрыша
  if (ui.restartOverlay) ui.restartOverlay.addEventListener('click', function() { initAudio(); sessionEaten = 0; startGame(); });
  if (ui.backToMenu)     ui.backToMenu.addEventListener('click', function() { stopGame(); showScreen('mainMenu'); });

  // Пауза
  if (ui.resume)      ui.resume.addEventListener('click', togglePause);
  if (ui.pauseToMenu) ui.pauseToMenu.addEventListener('click', function() { stopGame(); showScreen('mainMenu'); });
}

// ═══════════════════════════════════════════════════════════
//  Инициализация
// ═══════════════════════════════════════════════════════════
function init() {
  bindButtons();
  window.addEventListener('keydown', handleKey);
  window.addEventListener('resize', function() {
    if (screens.game && !screens.game.classList.contains('hidden')) resizeCanvas();
  });
  loadSettings();
  loadStats();
  renderLeaderboard();
  showScreen('mainMenu');
}

init();
