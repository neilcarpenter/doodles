(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Exp;

Exp = require('./exp');

window.EXP = new Exp;



},{"./exp":5}],2:[function(require,module,exports){
// http://en.wikipedia.org/wiki/Euclidean_distance#Three_dimensions

module.exports = function(a, b) {

  // return Math.sqrt(
  //   Math.pow(a[0]-b[0], 2) +
  //   Math.pow(a[1]-b[1], 2) +
  //   Math.pow(a[2]-b[2], 2)
  // )

  // return Math.sqrt(
  //   [0,1,2].reduce(function(prev, current, i) {
  //     return prev + Math.pow(a[i]-b[i], 2);
  //   }, 0)
  // );

  var sum = 0;
  var n;
  for (n=0; n < a.length; n++) {
    sum += Math.pow(a[n]-b[n], 2);
  }
  return Math.sqrt(sum);
}
},{}],3:[function(require,module,exports){
module.exports = {
  FONT_SIZE: {
    SMALL: '10px',
    MEDIUM: '18px',
    LARGE: '18px'
  },
  TILE_WIDTH: {
    SMALL: 10,
    MEDIUM: 16,
    LARGE: 16
  },
  MIN_RADIUS: 10,
  MAX_RADIUS: 50,
  MAX_DELTA: 150,
  MIN_CHARS_TO_SHOW: 8,
  MAX_CHARS_TO_SHOW: 12,
  THEMES: [
    {
      alphabet: {
        chars: 'codedoodl.es'.split(''),
        shuffle: true
      },
      bg: 0xEB423E,
      words: ['code', 'doodle'],
      radiusMultiplier: 1
    }, {
      alphabet: {
        chars: 'abcdefghijklmnopqrstuvwxyz0123456789!?*()@£$%^&_-+=[]{}:;\'"\\|<>,./~`'.split(''),
        shuffle: true
      },
      bg: 0x000000,
      words: [],
      radiusMultiplier: 3
    }, {
      alphabet: {
        chars: 'etaoinshrd'.split(''),
        shuffle: true
      },
      bg: 0x395CAA,
      words: ['date', 'hind', 'shot', 'haste', 'airshot', 'shorten', 'earth', 'other', 'shine', 'trash'],
      radiusMultiplier: 1.5
    }, {
      alphabet: {
        chars: '1234567890'.split(''),
        shuffle: true
      },
      bg: 0x1E502C,
      words: [],
      radiusMultiplier: 0.5
    }, {
      alphabet: {
        chars: '!?*()@£$%^&_-+=[]{}:;\'"\\|<>,./~`'.split(''),
        shuffle: false
      },
      bg: 0x5740AC,
      radiusMultiplier: 1,
      words: []
    }
  ]
};

window.config = module.exports;



},{}],4:[function(require,module,exports){
var Tile, config;

config = require('../config');

Tile = (function() {
  Tile.prototype.x = null;

  Tile.prototype.y = null;

  Tile.prototype.w = null;

  Tile.prototype.tX = null;

  Tile.prototype.tY = null;

  Tile.prototype.c = null;

  Tile.prototype.t = null;

  Tile.prototype.centre = null;

  Tile.prototype.chance = 0.9;

  Tile.prototype.charsToShow = 0;

  function Tile(_arg) {
    var bounds, opts;
    this.x = _arg.x, this.y = _arg.y, this.w = _arg.w;
    this.centre = {
      x: this.x + this.w / 2,
      y: this.y + this.w / 2
    };
    this.c = new PIXI.Container;
    this.c.width = this.c.height = this.w;
    opts = {
      font: "" + config.FONT_SIZE[Device.SIZE] + " font",
      fill: 0xffffff
    };
    this.t = new PIXI.extras.BitmapText(' ', opts);
    bounds = this.t.getLocalBounds();
    this.tX = this.centre.x - (bounds.width / 2) - bounds.x;
    this.tY = this.centre.y - (bounds.height / 2) - bounds.y - 10;
    this.t.position.set(this.tX, this.tY);
    this.c.addChild(this.t);
    this.setAlphabet();
    return null;
  }

  Tile.prototype._getNewChar = function() {
    var char;
    if (this.charCounter === this.chars.length - 1) {
      this.charCounter = 0;
    }
    char = this.chars[this.charCounter++];
    return char;
  };

  Tile.prototype.setAlphabet = function(themeIndex) {
    if (themeIndex == null) {
      themeIndex = 0;
    }
    this.chars = config.THEMES[themeIndex].alphabet.chars;
    this.chars = config.THEMES[themeIndex].alphabet.shuffle ? _.shuffle(this.chars) : this.chars;
    this.charCounter = 0;
    return null;
  };

  Tile.prototype.update = function() {
    var alpha, avChar, char;
    if (!(this.charsToShow > 0)) {
      return;
    }
    if (Math.random() > this.chance) {
      char = this.charsToShow === 1 ? ' ' : this._getNewChar();
      avChar = (config.MIN_CHARS_TO_SHOW + config.MAX_CHARS_TO_SHOW) / 2;
      alpha = Math.min(this.charsToShow / avChar, 1);
      this.t.text = char;
      this.t.alpha = alpha;
      this.charsToShow--;
    }
    return null;
  };

  return Tile;

})();

module.exports = Tile;



},{"../config":3}],5:[function(require,module,exports){
var Device, Exp, Tile, config, eDist,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Tile = require('./Tile');

Device = require('../utils/Device');

config = require('../config');

eDist = require('euclidean-distance');

Exp = (function() {
  Exp.prototype.stage = null;

  Exp.prototype.renderer = null;

  Exp.prototype.bg = null;

  Exp.prototype.w = 0;

  Exp.prototype.h = 0;

  Exp.prototype.cols = null;

  Exp.prototype.rows = null;

  Exp.prototype.pointer = {
    pos: null,
    last: null,
    delta: null
  };

  Exp.prototype.marker = {
    pos: {
      x: 0,
      y: 0
    },
    circle: null,
    indicator: null
  };

  Exp.prototype.idleTimer = null;

  Exp.prototype.hasInteracted = false;

  Exp.prototype.pointerDown = false;

  Exp.prototype.activeThemeIndex = 0;

  Exp.prototype.bgChangeCount = 0;

  Exp.prototype.themeChanging = false;

  Exp.prototype.tiles = [];

  Exp.prototype.bGsToChange = [];

  function Exp() {
    this.playAutoAnimation = __bind(this.playAutoAnimation, this);
    this.onPointerUp = __bind(this.onPointerUp, this);
    this.onPointerDown = __bind(this.onPointerDown, this);
    this.onPointerMove = __bind(this.onPointerMove, this);
    this.updateBgForce = __bind(this.updateBgForce, this);
    this.updateBg = __bind(this.updateBg, this);
    this._getBgChangeTiles = __bind(this._getBgChangeTiles, this);
    this.setNewBg = __bind(this.setNewBg, this);
    this.setupBg = __bind(this.setupBg, this);
    this.updateMarker = __bind(this.updateMarker, this);
    this.setupMarker = __bind(this.setupMarker, this);
    this.onResize = __bind(this.onResize, this);
    this.update = __bind(this.update, this);
    var loader;
    this.DEBUG = /\?debug/.test(window.location.search);
    this.setup();
    loader = PIXI.loader;
    loader.add('font', "fonts/monosten/font.fnt");
    loader.once('complete', this.init.bind(this));
    loader.load();
    return null;
  }

  Exp.prototype.setup = function() {
    this.onResize();
    return null;
  };

  Exp.prototype.addStats = function() {
    this.stats = new Stats;
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.top = '0px';
    document.body.appendChild(this.stats.domElement);
    return null;
  };

  Exp.prototype.init = function() {
    var rendererOpts;
    PIXI.RESOLUTION = window.devicePixelRatio || 1;
    PIXI.utils._saidHello = true;
    this.setDims();
    rendererOpts = {
      antialias: true,
      backgroundColor: config.THEMES[this.activeThemeIndex].bg,
      resolution: PIXI.RESOLUTION
    };
    this.renderer = PIXI.autoDetectRenderer(this.w * PIXI.RESOLUTION, this.h * PIXI.RESOLUTION, rendererOpts);
    this.stage = new PIXI.Container;
    this.setupBg();
    this.setupGrid();
    this.setupMarker();
    this.render();
    if (this.DEBUG) {
      this.addStats();
    }
    document.body.appendChild(this.renderer.view);
    this.bindEvents();
    this.playAutoAnimation();
    this.draw();
    return null;
  };

  Exp.prototype.draw = function() {
    this.setDims();
    this.update();
    return null;
  };

  Exp.prototype.update = function() {
    if (window.STOP) {
      return requestAnimationFrame(this.update);
    }
    if (this.DEBUG) {
      this.stats.begin();
    }
    this.updateMarker();
    this.updateBg();
    this.updateGrid();
    this.render();
    requestAnimationFrame(this.update);
    if (this.DEBUG) {
      this.stats.end();
    }
    return null;
  };

  Exp.prototype.render = function() {
    this.renderer.render(this.stage);
    return null;
  };

  Exp.prototype.bindEvents = function() {
    var downInteraction, moveInteraction, upInteraction;
    downInteraction = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
    upInteraction = 'ontouchstart' in window ? 'touchend' : 'mouseup';
    moveInteraction = 'ontouchstart' in window ? 'touchmove' : 'mousemove';
    this.onResize = _.debounce(this.onResize, 300);
    window.addEventListener('resize', this.onResize, false);
    window.addEventListener('orientationchange', this.onResize, false);
    this.renderer.view.addEventListener(moveInteraction, this.onPointerMove, false);
    this.renderer.view.addEventListener(downInteraction, this.onPointerDown, false);
    this.renderer.view.addEventListener(upInteraction, this.onPointerUp, false);
    return null;
  };

  Exp.prototype.onResize = function() {
    var i, tile, _i, _len, _ref;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    Device.setSize(this.w, this.h);
    this.setDims();
    this.updateBgForce();
    if (this.tiles.length) {
      _ref = this.tiles;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        tile = _ref[i];
        this.stage.removeChild(tile.c);
        this.tiles[i] = null;
      }
      this.tiles = [];
      this.setupGrid();
    }
    return null;
  };

  Exp.prototype.setDims = function() {
    var _ref;
    if ((_ref = this.renderer) != null) {
      _ref.resize(this.w, this.h);
    }
    return null;
  };

  Exp.prototype.setTheme = function(index) {
    if (index == null) {
      index = null;
    }
    if (this.themeChanging) {
      return;
    }
    if (!index) {
      index = this.activeThemeIndex === config.THEMES.length - 1 ? this.activeThemeIndex = 0 : this.activeThemeIndex + 1;
    }
    this.activeThemeIndex = index;
    this.setNewBg(this.pointer.pos.x, this.pointer.pos.y);
    this.themeChanging = true;
    return null;
  };

  Exp.prototype.setupGrid = function() {
    var i, tile, tileCount, x, y, _i;
    this.cols = Math.ceil(this.w / config.TILE_WIDTH[Device.SIZE]);
    this.rows = Math.ceil(this.h / config.TILE_WIDTH[Device.SIZE]);
    tileCount = this.cols * this.rows;
    for (i = _i = 0; 0 <= tileCount ? _i < tileCount : _i > tileCount; i = 0 <= tileCount ? ++_i : --_i) {
      x = (i % this.cols) * config.TILE_WIDTH[Device.SIZE];
      y = Math.floor(i / this.cols) * config.TILE_WIDTH[Device.SIZE];
      tile = new Tile({
        x: x,
        y: y,
        w: config.TILE_WIDTH[Device.SIZE]
      });
      this.tiles.push(tile);
      this.stage.addChild(tile.c);
    }
    return null;
  };

  Exp.prototype.updateGrid = function() {
    var i, indexes, item, tile, _i, _j, _len, _len1, _ref, _ref1;
    if (!this.pointer.pos) {
      return;
    }
    indexes = this._getIndexes();
    for (_i = 0, _len = indexes.length; _i < _len; _i++) {
      item = indexes[_i];
      if ((_ref = this.tiles[item.index]) != null) {
        _ref.charsToShow = item.chars;
      }
    }
    _ref1 = this.tiles;
    for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
      tile = _ref1[i];
      tile.update();
      if (this.themeChanging) {
        tile.setAlphabet(this.activeThemeIndex);
      }
    }
    return null;
  };

  Exp.prototype._getIndexes = function() {
    var chars, dist, index, indexes, tile, _i, _len, _ref;
    indexes = [];
    _ref = this.tiles;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      tile = _ref[index];
      if (this.marker.circle.contains(tile.centre.x, tile.centre.y)) {
        dist = eDist([this.marker.circle.x, this.marker.circle.y], [tile.centre.x, tile.centre.y]);
        dist = Math.min(dist, this.marker.circle.radius);
        chars = config.MAX_CHARS_TO_SHOW - Math.floor((dist / this.marker.circle.radius) * config.MAX_CHARS_TO_SHOW);
        chars += config.MIN_CHARS_TO_SHOW;
        indexes.push({
          index: index,
          chars: chars
        });
      }
    }
    return indexes;
  };

  Exp.prototype.setupMarker = function() {
    this.marker.pos.x = this.w / 2;
    this.marker.pos.y = this.h / 2;
    this.marker.circle = new PIXI.Circle(this.w / 2, this.h / 2, 0);
    if (this.DEBUG) {
      this.addStats();
      this.marker.indicator = new PIXI.Graphics;
      this.marker.indicator.beginFill(0xffffff);
      this.marker.indicator.drawCircle(0, 0, 10);
      this.stage.addChild(this.marker.indicator);
      this.marker.indicator.x = this.marker.pos.x;
      this.marker.indicator.y = this.marker.pos.y;
      this.marker.indicator.visible = true;
    }
    return null;
  };

  Exp.prototype.updateMarker = function() {
    var delta, radius, xD, yD;
    if (!this.pointer.pos) {
      return;
    }
    xD = this.pointer.pos.x - this.marker.pos.x;
    yD = this.pointer.pos.y - this.marker.pos.y;
    this.marker.pos.x += xD * 0.1;
    this.marker.pos.y += yD * 0.1;
    this.marker.circle.x = this.marker.pos.x;
    this.marker.circle.y = this.marker.pos.y;
    delta = Math.max(Math.abs(this.pointer.delta.x), Math.abs(this.pointer.delta.y));
    radius = (((Math.min((delta / config.MAX_DELTA) * 100, config.MAX_DELTA)) / 100) * config.MAX_RADIUS) + config.MIN_RADIUS;
    radius = radius * config.THEMES[this.activeThemeIndex].radiusMultiplier;
    this.marker.circle.radius = radius;
    this.pointer.delta.x *= 0.98;
    this.pointer.delta.y *= 0.98;
    if (this.DEBUG) {
      this.marker.indicator.x = this.marker.pos.x;
      this.marker.indicator.y = this.marker.pos.y;
    }
    return null;
  };

  Exp.prototype.setupBg = function() {
    this.bg = new PIXI.Graphics;
    this.stage.addChild(this.bg);
    return null;
  };

  Exp.prototype.setNewBg = function(fromX, fromY) {
    var sortedTiles, tile, _i, _len;
    sortedTiles = this._getBgChangeTiles(fromX, fromY);
    for (_i = 0, _len = sortedTiles.length; _i < _len; _i++) {
      tile = sortedTiles[_i];
      this.bGsToChange.push({
        x: tile.x,
        y: tile.y,
        w: tile.w,
        bg: config.THEMES[this.activeThemeIndex].bg
      });
    }
    return null;
  };

  Exp.prototype._getBgChangeTiles = function(fromX, fromY) {
    var changer, tiles;
    changer = this.bgChangeCount % 3;
    if (changer === 0) {
      tiles = _.shuffle(this.tiles.slice(0));
    } else if (changer === 1) {
      tiles = _.sortBy(this.tiles.slice(0), (function(_this) {
        return function(tile) {
          return eDist([fromX, fromY], [tile.centre.x, tile.centre.y]);
        };
      })(this));
    } else if (changer === 2) {
      tiles = _.sortBy(this.tiles.slice(0), (function(_this) {
        return function(tile) {
          return -1 * eDist([fromX, fromY], [tile.centre.x, tile.centre.y]);
        };
      })(this));
    }
    this.bgChangeCount++;
    return tiles;
  };

  Exp.prototype.updateBg = function() {
    var tile, tiles, toChange, _i, _len;
    if (!this.bGsToChange.length) {
      return;
    }
    toChange = Math.floor(this.bGsToChange.length * 0.1);
    if (toChange < 10) {
      toChange = 10;
      this.themeChanging = false;
    }
    tiles = this.bGsToChange.slice(0, toChange);
    this.bGsToChange = this.bGsToChange.slice(toChange);
    for (_i = 0, _len = tiles.length; _i < _len; _i++) {
      tile = tiles[_i];
      this.bg.beginFill(tile.bg);
      this.bg.drawRect(tile.x, tile.y, tile.w, tile.w);
    }
    return null;
  };

  Exp.prototype.updateBgForce = function() {
    if (!this.bg) {
      return;
    }
    this.bg.beginFill(config.THEMES[this.activeThemeIndex].bg);
    this.bg.drawRect(0, 0, this.w, this.h);
    return null;
  };

  Exp.prototype.onPointerMove = function(e, x, y) {
    var newDX, newDY;
    if (x == null) {
      x = null;
    }
    if (y == null) {
      y = null;
    }
    if (e) {
      this.hasInteracted = true;
      if ('ontouchstart' in window) {
        x = e.touches[0].pageX;
        y = e.touches[0].pageY;
      } else {
        x = e.pageX;
        y = e.pageY;
      }
    }
    if (this.pointer.pos) {
      this.pointer.last = {
        x: this.pointer.pos.x,
        y: this.pointer.pos.y
      };
    }
    this.pointer.pos = {
      x: x,
      y: y
    };
    if (this.pointer.last) {
      newDX = this.pointer.pos.x - this.pointer.last.x;
      newDY = this.pointer.pos.y - this.pointer.last.y;
      if (Math.max(Math.abs(newDX), Math.abs(newDY)) > Math.max(Math.abs(this.pointer.delta.x), Math.abs(this.pointer.delta.y))) {
        this.pointer.delta = {
          x: this.pointer.pos.x - this.pointer.last.x,
          y: this.pointer.pos.y - this.pointer.last.y
        };
      } else {
        this.pointer.delta.x *= 0.98;
        this.pointer.delta.y *= 0.98;
      }
    } else {
      this.pointer.delta = {
        x: 0,
        y: 0
      };
    }
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout((function(_this) {
      return function() {
        _this.hasInteracted = false;
        return _this.playAutoAnimation();
      };
    })(this), 3000);
    return null;
  };

  Exp.prototype.onPointerDown = function() {
    this.pointerDown = true;
    return null;
  };

  Exp.prototype.onPointerUp = function() {
    this.pointerDown = false;
    this.setTheme();
    return null;
  };

  Exp.prototype.playAutoAnimation = function() {
    var chance, delay, randX, randY;
    randX = _.random(this.w * 0.05, this.w * 0.95);
    randY = _.random(this.h * 0.05, this.h * 0.95);
    delay = _.random(100, 400);
    this.onPointerMove(null, randX, randY);
    chance = Math.random();
    if (chance < 0.01) {
      this.setTheme();
    }
    if (!this.hasInteracted) {
      setTimeout(this.playAutoAnimation, delay);
    }
    return null;
  };

  Exp.prototype.EXP = function() {
    return window.EXP;
  };

  return Exp;

})();

module.exports = Exp;



},{"../config":3,"../utils/Device":6,"./Tile":4,"euclidean-distance":2}],6:[function(require,module,exports){
var Device;

Device = (function() {
  function Device() {}

  Device.SIZES = {
    SMALL: 'SMALL',
    MEDIUM: 'MEDIUM',
    LARGE: 'LARGE'
  };

  Device.SIZE = null;

  Device.setSize = function(w, h) {
    var size;
    size = (function() {
      switch (true) {
        case w > 1300 || h > 1300:
          return Device.SIZES.LARGE;
        case w <= 700 || h <= 700:
          return Device.SIZES.SMALL;
        default:
          return Device.SIZES.MEDIUM;
      }
    })();
    Device.SIZE = size;
    return null;
  };

  return Device;

})();

module.exports = Device;

window.Device = Device;



},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbmVpbGNhcnBlbnRlci9TaXRlcy9kb29kbGVzL2FzY2lpLXRyYWlsL3Byb2plY3QvY29mZmVlL01haW4uY29mZmVlIiwibm9kZV9tb2R1bGVzL2V1Y2xpZGVhbi1kaXN0YW5jZS9pbmRleC5qcyIsIi9Vc2Vycy9uZWlsY2FycGVudGVyL1NpdGVzL2Rvb2RsZXMvYXNjaWktdHJhaWwvcHJvamVjdC9jb2ZmZWUvY29uZmlnL2luZGV4LmNvZmZlZSIsIi9Vc2Vycy9uZWlsY2FycGVudGVyL1NpdGVzL2Rvb2RsZXMvYXNjaWktdHJhaWwvcHJvamVjdC9jb2ZmZWUvZXhwL1RpbGUuY29mZmVlIiwiL1VzZXJzL25laWxjYXJwZW50ZXIvU2l0ZXMvZG9vZGxlcy9hc2NpaS10cmFpbC9wcm9qZWN0L2NvZmZlZS9leHAvaW5kZXguY29mZmVlIiwiL1VzZXJzL25laWxjYXJwZW50ZXIvU2l0ZXMvZG9vZGxlcy9hc2NpaS10cmFpbC9wcm9qZWN0L2NvZmZlZS91dGlscy9EZXZpY2UuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxHQUFBOztBQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUixDQUFOLENBQUE7O0FBQUEsTUFFTSxDQUFDLEdBQVAsR0FBYSxHQUFBLENBQUEsR0FGYixDQUFBOzs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBLE1BQU0sQ0FBQyxPQUFQLEdBRUM7QUFBQSxFQUFBLFNBQUEsRUFDQztBQUFBLElBQUEsS0FBQSxFQUFTLE1BQVQ7QUFBQSxJQUNBLE1BQUEsRUFBUyxNQURUO0FBQUEsSUFFQSxLQUFBLEVB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ZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiRXhwID0gcmVxdWlyZSAnLi9leHAnXG5cbndpbmRvdy5FWFAgPSBuZXcgRXhwXG4iLCIvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0V1Y2xpZGVhbl9kaXN0YW5jZSNUaHJlZV9kaW1lbnNpb25zXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYSwgYikge1xuXG4gIC8vIHJldHVybiBNYXRoLnNxcnQoXG4gIC8vICAgTWF0aC5wb3coYVswXS1iWzBdLCAyKSArXG4gIC8vICAgTWF0aC5wb3coYVsxXS1iWzFdLCAyKSArXG4gIC8vICAgTWF0aC5wb3coYVsyXS1iWzJdLCAyKVxuICAvLyApXG5cbiAgLy8gcmV0dXJuIE1hdGguc3FydChcbiAgLy8gICBbMCwxLDJdLnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXJyZW50LCBpKSB7XG4gIC8vICAgICByZXR1cm4gcHJldiArIE1hdGgucG93KGFbaV0tYltpXSwgMik7XG4gIC8vICAgfSwgMClcbiAgLy8gKTtcblxuICB2YXIgc3VtID0gMDtcbiAgdmFyIG47XG4gIGZvciAobj0wOyBuIDwgYS5sZW5ndGg7IG4rKykge1xuICAgIHN1bSArPSBNYXRoLnBvdyhhW25dLWJbbl0sIDIpO1xuICB9XG4gIHJldHVybiBNYXRoLnNxcnQoc3VtKTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9XG5cblx0Rk9OVF9TSVpFIDpcblx0XHRTTUFMTCAgOiAnMTBweCdcblx0XHRNRURJVU0gOiAnMThweCdcblx0XHRMQVJHRSAgOiAnMThweCdcblxuXHRUSUxFX1dJRFRIIDpcblx0XHRTTUFMTCAgOiAxMFxuXHRcdE1FRElVTSA6IDE2XG5cdFx0TEFSR0UgIDogMTZcblxuXHRNSU5fUkFESVVTOiAxMFxuXHRNQVhfUkFESVVTOiA1MFxuXHRNQVhfREVMVEEgOiAxNTBcblxuXHRNSU5fQ0hBUlNfVE9fU0hPVyA6IDhcblx0TUFYX0NIQVJTX1RPX1NIT1cgOiAxMlxuXG5cdFRIRU1FUzogW1xuXHRcdHtcblx0XHRcdGFscGhhYmV0OlxuXHRcdFx0XHRjaGFycyAgIDogJ2NvZGVkb29kbC5lcycuc3BsaXQoJycpXG5cdFx0XHRcdHNodWZmbGUgOiB0cnVlXG5cdFx0XHRiZzogMHhFQjQyM0Vcblx0XHRcdHdvcmRzOiBbICdjb2RlJywgJ2Rvb2RsZScgXVxuXHRcdFx0cmFkaXVzTXVsdGlwbGllcjogMVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0YWxwaGFiZXQ6XG5cdFx0XHRcdGNoYXJzICAgOiAnYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5IT8qKClAwqMkJV4mXy0rPVtde306O1xcJ1wiXFxcXHw8PiwuL35gJy5zcGxpdCgnJylcblx0XHRcdFx0c2h1ZmZsZSA6IHRydWVcblx0XHRcdGJnOiAweDAwMDAwMFxuXHRcdFx0d29yZHM6IFtdXG5cdFx0XHRyYWRpdXNNdWx0aXBsaWVyOiAzXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRhbHBoYWJldDpcblx0XHRcdFx0Y2hhcnMgICA6ICdldGFvaW5zaHJkJy5zcGxpdCgnJylcblx0XHRcdFx0c2h1ZmZsZSA6IHRydWVcblx0XHRcdGJnOiAweDM5NUNBQVxuXHRcdFx0d29yZHM6IFsgJ2RhdGUnLCAnaGluZCcsICdzaG90JywgJ2hhc3RlJywgJ2FpcnNob3QnLCAnc2hvcnRlbicsICdlYXJ0aCcsICdvdGhlcicsICdzaGluZScsICd0cmFzaCcgXVxuXHRcdFx0cmFkaXVzTXVsdGlwbGllcjogMS41XG5cdFx0fSxcblx0XHR7XG5cdFx0XHRhbHBoYWJldDpcblx0XHRcdFx0Y2hhcnMgICA6ICcxMjM0NTY3ODkwJy5zcGxpdCgnJylcblx0XHRcdFx0c2h1ZmZsZSA6IHRydWVcblx0XHRcdGJnOiAweDFFNTAyQ1xuXHRcdFx0d29yZHM6IFtdXG5cdFx0XHRyYWRpdXNNdWx0aXBsaWVyOiAwLjVcblx0XHR9LFxuXHRcdHtcblx0XHRcdGFscGhhYmV0OlxuXHRcdFx0XHRjaGFycyAgIDogJyE/KigpQMKjJCVeJl8tKz1bXXt9OjtcXCdcIlxcXFx8PD4sLi9+YCcuc3BsaXQoJycpXG5cdFx0XHRcdHNodWZmbGUgOiBmYWxzZVxuXHRcdFx0Ymc6IDB4NTc0MEFDXG5cdFx0XHRyYWRpdXNNdWx0aXBsaWVyOiAxXG5cdFx0XHR3b3JkczogW11cblx0XHR9XG5cdF1cblxud2luZG93LmNvbmZpZyA9IG1vZHVsZS5leHBvcnRzXG4iLCJjb25maWcgPSByZXF1aXJlICcuLi9jb25maWcnXG5cbmNsYXNzIFRpbGVcblxuXHR4OiBudWxsXG5cdHk6IG51bGxcblx0dzogbnVsbFx0XG5cblx0dFg6IG51bGxcblx0dFk6IG51bGxcblxuXHRjOiBudWxsXG5cdHQ6IG51bGxcblxuXHRjZW50cmUgOiBudWxsXG5cdGNoYW5jZSA6IDAuOVxuXG5cdGNoYXJzVG9TaG93IDogMFxuXG5cdCMgRk9VTkQgOiBmYWxzZVxuXG5cdGNvbnN0cnVjdG9yIDogKHtAeCwgQHksIEB3fSkgLT5cblxuXHRcdEBjZW50cmUgPSAgeDogQHggKyBAdy8yLCB5OiBAeSArIEB3LzJcblxuXHRcdEBjID0gbmV3IFBJWEkuQ29udGFpbmVyXG5cdFx0QGMud2lkdGggPSBAYy5oZWlnaHQgPSBAd1xuXG5cdFx0b3B0cyA9XG5cdFx0XHRmb250IDogXCIje2NvbmZpZy5GT05UX1NJWkVbRGV2aWNlLlNJWkVdfSBmb250XCJcblx0XHRcdGZpbGwgOiAweGZmZmZmZlxuXG5cdFx0QHQgPSBuZXcgUElYSS5leHRyYXMuQml0bWFwVGV4dCAnICcsIG9wdHNcblx0XHRib3VuZHMgPSBAdC5nZXRMb2NhbEJvdW5kcygpXG5cdFx0QHRYID0gQGNlbnRyZS54IC0gKGJvdW5kcy53aWR0aC8yKSAtIGJvdW5kcy54XG5cdFx0QHRZID0gQGNlbnRyZS55IC0gKGJvdW5kcy5oZWlnaHQvMikgLSBib3VuZHMueSAtIDEwICMgd2h5IHRoaXMgMTA/IGRvbid0IGtub3dcblx0XHRAdC5wb3NpdGlvbi5zZXQgQHRYLCBAdFlcblx0XHRcblx0XHQjIEBiID0gbmV3IFBJWEkuR3JhcGhpY3Ncblx0XHQjIEBiLmJlZ2luRmlsbCAweGZmZmZmZlxuXHRcdCMgQGIuYWxwaGEgPSAwLjNcblx0XHQjIEBiLmRyYXdSZWN0IEB4KzIsIEB5KzIsIEB3LTQsIEB3LTRcblxuXHRcdCMgQGMuYWRkQ2hpbGQgQGJcblx0XHRAYy5hZGRDaGlsZCBAdFxuXG5cdFx0QHNldEFscGhhYmV0KClcblxuXHRcdHJldHVybiBudWxsXG5cblx0X2dldE5ld0NoYXIgOiAtPlxuXG5cdFx0aWYgQGNoYXJDb3VudGVyIGlzIEBjaGFycy5sZW5ndGgtMSB0aGVuIEBjaGFyQ291bnRlciA9IDBcblxuXHRcdGNoYXIgPSBAY2hhcnNbQGNoYXJDb3VudGVyKytdXG5cblx0XHRjaGFyXG5cblx0c2V0QWxwaGFiZXQgOiAodGhlbWVJbmRleD0wKSAtPlxuXG5cdFx0QGNoYXJzID0gY29uZmlnLlRIRU1FU1t0aGVtZUluZGV4XS5hbHBoYWJldC5jaGFyc1xuXHRcdEBjaGFycyA9IGlmIGNvbmZpZy5USEVNRVNbdGhlbWVJbmRleF0uYWxwaGFiZXQuc2h1ZmZsZSB0aGVuIF8uc2h1ZmZsZSBAY2hhcnMgZWxzZSBAY2hhcnNcblxuXHRcdEBjaGFyQ291bnRlciA9IDBcblxuXHRcdG51bGxcblxuXHQjIHNldEZvdW5kQ2hhciA6IChjaGFyKSAtPlxuXG5cdCMgXHRAdC50ZXh0ID0gY2hhclxuXHQjIFx0QHQuYWxwaGEgPSAxXG5cblx0IyBcdEBGT1VORCA9IHRydWVcblxuXHQjIFx0c2V0VGltZW91dCA9PlxuXHQjIFx0XHRARk9VTkQgPSBmYWxzZVxuXHQjIFx0XHRAY2hhcnNUb1Nob3cgPSBjb25maWcuTUFYX0NIQVJTX1RPX1NIT1dcblx0IyBcdFx0QHVwZGF0ZSgpXG5cdCMgXHQsIDEwMDBcblxuXHQjIFx0bnVsbFxuXG5cdHVwZGF0ZSA6IC0+XG5cblx0XHQjIHJldHVybiB1bmxlc3MgQGNoYXJzVG9TaG93ID4gMCBhbmQgIUBGT1VORFxuXHRcdHJldHVybiB1bmxlc3MgQGNoYXJzVG9TaG93ID4gMFxuXG5cdFx0aWYgTWF0aC5yYW5kb20oKSA+IEBjaGFuY2VcblxuXHRcdFx0Y2hhciA9IGlmIEBjaGFyc1RvU2hvdyBpcyAxIHRoZW4gJyAnIGVsc2UgQF9nZXROZXdDaGFyKClcblxuXHRcdFx0YXZDaGFyID0gKGNvbmZpZy5NSU5fQ0hBUlNfVE9fU0hPVyArIGNvbmZpZy5NQVhfQ0hBUlNfVE9fU0hPVykgLyAyXG5cdFx0XHRhbHBoYSAgPSBNYXRoLm1pbiBAY2hhcnNUb1Nob3cgLyBhdkNoYXIsIDFcblxuXHRcdFx0QHQudGV4dCAgPSBjaGFyXG5cdFx0XHRAdC5hbHBoYSA9IGFscGhhXG5cblx0XHRcdEBjaGFyc1RvU2hvdy0tXG5cblx0XHRudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gVGlsZVxuIiwiVGlsZSAgID0gcmVxdWlyZSAnLi9UaWxlJ1xuRGV2aWNlID0gcmVxdWlyZSAnLi4vdXRpbHMvRGV2aWNlJ1xuY29uZmlnID0gcmVxdWlyZSAnLi4vY29uZmlnJ1xuZURpc3QgID0gcmVxdWlyZSAnZXVjbGlkZWFuLWRpc3RhbmNlJ1xuXG5jbGFzcyBFeHBcblxuICAgIHN0YWdlICAgIDogbnVsbFxuICAgIHJlbmRlcmVyIDogbnVsbFxuICAgIGJnICAgICAgIDogbnVsbFxuXG4gICAgdyA6IDBcbiAgICBoIDogMFxuXG4gICAgY29scyA6IG51bGxcbiAgICByb3dzIDogbnVsbFxuXG4gICAgcG9pbnRlciA6XG4gICAgICAgIHBvcyAgIDogbnVsbFxuICAgICAgICBsYXN0ICA6IG51bGxcbiAgICAgICAgZGVsdGEgOiBudWxsXG5cbiAgICBtYXJrZXIgOlxuICAgICAgICBwb3MgICAgOiB4IDogMCwgeSA6IDBcbiAgICAgICAgY2lyY2xlICAgIDogbnVsbFxuICAgICAgICBpbmRpY2F0b3IgOiBudWxsXG5cbiAgICBpZGxlVGltZXIgICAgIDogbnVsbFxuICAgIGhhc0ludGVyYWN0ZWQgOiBmYWxzZVxuICAgIHBvaW50ZXJEb3duICAgOiBmYWxzZVxuXG4gICAgYWN0aXZlVGhlbWVJbmRleCA6IDBcbiAgICBiZ0NoYW5nZUNvdW50ICAgIDogMFxuICAgIHRoZW1lQ2hhbmdpbmcgICAgOiBmYWxzZVxuXG4gICAgdGlsZXMgICAgICAgOiBbXVxuICAgIGJHc1RvQ2hhbmdlIDogW11cblxuICAgIGNvbnN0cnVjdG9yIDogLT5cblxuICAgICAgICBAREVCVUcgPSAvXFw/ZGVidWcvLnRlc3Qod2luZG93LmxvY2F0aW9uLnNlYXJjaClcblxuICAgICAgICBAc2V0dXAoKVxuXG4gICAgICAgIGxvYWRlciA9IFBJWEkubG9hZGVyXG4gICAgICAgIGxvYWRlci5hZGQgJ2ZvbnQnLCBcImZvbnRzL21vbm9zdGVuL2ZvbnQuZm50XCJcbiAgICAgICAgbG9hZGVyLm9uY2UgJ2NvbXBsZXRlJywgQGluaXQuYmluZChAKVxuICAgICAgICBsb2FkZXIubG9hZCgpXG5cbiAgICAgICAgcmV0dXJuIG51bGxcblxuICAgIHNldHVwIDogLT5cblxuICAgICAgICBAb25SZXNpemUoKVxuXG4gICAgICAgIG51bGxcblxuICAgIGFkZFN0YXRzIDogLT5cblxuICAgICAgICBAc3RhdHMgPSBuZXcgU3RhdHNcbiAgICAgICAgQHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gICAgICAgIEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4J1xuICAgICAgICBAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4J1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIEBzdGF0cy5kb21FbGVtZW50XG5cbiAgICAgICAgbnVsbFxuXG4gICAgaW5pdDogLT5cblxuICAgICAgICBQSVhJLlJFU09MVVRJT04gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyBvciAxXG4gICAgICAgIFBJWEkudXRpbHMuX3NhaWRIZWxsbyA9IHRydWVcblxuICAgICAgICBAc2V0RGltcygpXG5cbiAgICAgICAgcmVuZGVyZXJPcHRzID0gYW50aWFsaWFzIDogdHJ1ZSwgYmFja2dyb3VuZENvbG9yIDogY29uZmlnLlRIRU1FU1tAYWN0aXZlVGhlbWVJbmRleF0uYmcsIHJlc29sdXRpb24gOiBQSVhJLlJFU09MVVRJT05cblxuICAgICAgICBAcmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlciBAdypQSVhJLlJFU09MVVRJT04sIEBoKlBJWEkuUkVTT0xVVElPTiwgcmVuZGVyZXJPcHRzXG4gICAgICAgIEBzdGFnZSAgICA9IG5ldyBQSVhJLkNvbnRhaW5lclxuXG4gICAgICAgIEBzZXR1cEJnKClcbiAgICAgICAgQHNldHVwR3JpZCgpXG4gICAgICAgIEBzZXR1cE1hcmtlcigpXG5cbiAgICAgICAgQHJlbmRlcigpXG5cbiAgICAgICAgaWYgQERFQlVHXG4gICAgICAgICAgICBAYWRkU3RhdHMoKVxuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgQHJlbmRlcmVyLnZpZXdcblxuICAgICAgICBAYmluZEV2ZW50cygpXG4gICAgICAgIEBwbGF5QXV0b0FuaW1hdGlvbigpXG5cbiAgICAgICAgQGRyYXcoKVxuXG4gICAgICAgIG51bGxcblxuICAgIGRyYXcgOiAtPlxuXG4gICAgICAgICMgQGNvdW50ZXIgPSAwXG5cbiAgICAgICAgQHNldERpbXMoKVxuXG4gICAgICAgIEB1cGRhdGUoKVxuXG4gICAgICAgIG51bGxcblxuICAgIHVwZGF0ZSA6ID0+XG5cbiAgICAgICAgaWYgd2luZG93LlNUT1AgdGhlbiByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIEB1cGRhdGVcblxuICAgICAgICBpZiBAREVCVUcgdGhlbiBAc3RhdHMuYmVnaW4oKVxuXG4gICAgICAgICMgQGNvdW50ZXIrK1xuXG4gICAgICAgIEB1cGRhdGVNYXJrZXIoKVxuICAgICAgICBAdXBkYXRlQmcoKVxuICAgICAgICBAdXBkYXRlR3JpZCgpXG5cbiAgICAgICAgQHJlbmRlcigpXG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIEB1cGRhdGVcblxuICAgICAgICBpZiBAREVCVUdcbiAgICAgICAgICAgIEBzdGF0cy5lbmQoKVxuXG4gICAgICAgIG51bGxcblxuICAgIHJlbmRlciA6IC0+XG5cbiAgICAgICAgQHJlbmRlcmVyLnJlbmRlciBAc3RhZ2VcblxuICAgICAgICBudWxsXG5cbiAgICBiaW5kRXZlbnRzIDogLT5cblxuICAgICAgICBkb3duSW50ZXJhY3Rpb24gPSBpZiAnb250b3VjaHN0YXJ0JyBvZiB3aW5kb3cgdGhlbiAndG91Y2hzdGFydCcgZWxzZSAnbW91c2Vkb3duJ1xuICAgICAgICB1cEludGVyYWN0aW9uICAgPSBpZiAnb250b3VjaHN0YXJ0JyBvZiB3aW5kb3cgdGhlbiAndG91Y2hlbmQnIGVsc2UgJ21vdXNldXAnXG4gICAgICAgIG1vdmVJbnRlcmFjdGlvbiA9IGlmICdvbnRvdWNoc3RhcnQnIG9mIHdpbmRvdyB0aGVuICd0b3VjaG1vdmUnIGVsc2UgJ21vdXNlbW92ZSdcblxuICAgICAgICBAb25SZXNpemUgPSBfLmRlYm91bmNlIEBvblJlc2l6ZSwgMzAwXG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3Jlc2l6ZScsIEBvblJlc2l6ZSwgZmFsc2VcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ29yaWVudGF0aW9uY2hhbmdlJywgQG9uUmVzaXplLCBmYWxzZVxuXG4gICAgICAgIEByZW5kZXJlci52aWV3LmFkZEV2ZW50TGlzdGVuZXIgbW92ZUludGVyYWN0aW9uLCBAb25Qb2ludGVyTW92ZSwgZmFsc2VcbiAgICAgICAgQHJlbmRlcmVyLnZpZXcuYWRkRXZlbnRMaXN0ZW5lciBkb3duSW50ZXJhY3Rpb24sIEBvblBvaW50ZXJEb3duLCBmYWxzZVxuICAgICAgICBAcmVuZGVyZXIudmlldy5hZGRFdmVudExpc3RlbmVyIHVwSW50ZXJhY3Rpb24sIEBvblBvaW50ZXJVcCwgZmFsc2VcblxuICAgICAgICBudWxsXG5cbiAgICBvblJlc2l6ZSA6ID0+XG5cbiAgICAgICAgQHcgPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgICAgICBAaCA9IHdpbmRvdy5pbm5lckhlaWdodFxuXG4gICAgICAgIERldmljZS5zZXRTaXplKEB3LCBAaClcblxuICAgICAgICBAc2V0RGltcygpXG4gICAgICAgIEB1cGRhdGVCZ0ZvcmNlKClcblxuICAgICAgICBpZiBAdGlsZXMubGVuZ3RoXG4gICAgICAgICAgICBmb3IgdGlsZSwgaSBpbiBAdGlsZXNcbiAgICAgICAgICAgICAgICBAc3RhZ2UucmVtb3ZlQ2hpbGQgdGlsZS5jXG4gICAgICAgICAgICAgICAgQHRpbGVzW2ldID0gbnVsbFxuICAgICAgICAgICAgQHRpbGVzID0gW11cblxuICAgICAgICAgICAgQHNldHVwR3JpZCgpXG5cbiAgICAgICAgbnVsbFxuXG4gICAgc2V0RGltcyA6IC0+XG5cbiAgICAgICAgQHJlbmRlcmVyPy5yZXNpemUgQHcsIEBoXG5cbiAgICAgICAgbnVsbFxuXG4gICAgc2V0VGhlbWUgOiAoaW5kZXg9bnVsbCkgLT5cblxuICAgICAgICByZXR1cm4gaWYgQHRoZW1lQ2hhbmdpbmdcblxuICAgICAgICBpZiAhaW5kZXhcbiAgICAgICAgICAgIGluZGV4ID0gaWYgQGFjdGl2ZVRoZW1lSW5kZXggaXMgY29uZmlnLlRIRU1FUy5sZW5ndGgtMSB0aGVuIEBhY3RpdmVUaGVtZUluZGV4ID0gMCBlbHNlIEBhY3RpdmVUaGVtZUluZGV4KzFcblxuICAgICAgICBAYWN0aXZlVGhlbWVJbmRleCA9IGluZGV4XG5cbiAgICAgICAgQHNldE5ld0JnKEBwb2ludGVyLnBvcy54LCBAcG9pbnRlci5wb3MueSlcblxuICAgICAgICBAdGhlbWVDaGFuZ2luZyA9IHRydWVcblxuICAgICAgICBudWxsXG5cbiAgICBzZXR1cEdyaWQgOiAtPlxuXG4gICAgICAgIEBjb2xzID0gTWF0aC5jZWlsIEB3IC8gY29uZmlnLlRJTEVfV0lEVEhbRGV2aWNlLlNJWkVdXG4gICAgICAgIEByb3dzID0gTWF0aC5jZWlsIEBoIC8gY29uZmlnLlRJTEVfV0lEVEhbRGV2aWNlLlNJWkVdXG5cbiAgICAgICAgdGlsZUNvdW50ID0gQGNvbHMgKiBAcm93c1xuXG4gICAgICAgIGZvciBpIGluIFswLi4udGlsZUNvdW50XVxuXG4gICAgICAgICAgICB4ID0gKCBpICUgQGNvbHMgKSAqIGNvbmZpZy5USUxFX1dJRFRIW0RldmljZS5TSVpFXVxuICAgICAgICAgICAgeSA9IE1hdGguZmxvb3IoIGkgLyBAY29scyApICogY29uZmlnLlRJTEVfV0lEVEhbRGV2aWNlLlNJWkVdXG5cbiAgICAgICAgICAgIHRpbGUgPSBuZXcgVGlsZSB4OiB4LCB5OiB5LCB3OiBjb25maWcuVElMRV9XSURUSFtEZXZpY2UuU0laRV1cblxuICAgICAgICAgICAgQHRpbGVzLnB1c2ggdGlsZVxuICAgICAgICAgICAgQHN0YWdlLmFkZENoaWxkIHRpbGUuY1xuXG4gICAgICAgIG51bGxcblxuICAgIHVwZGF0ZUdyaWQgOiAtPlxuXG4gICAgICAgIHJldHVybiB1bmxlc3MgQHBvaW50ZXIucG9zXG5cbiAgICAgICAgaW5kZXhlcyA9IEBfZ2V0SW5kZXhlcygpXG4gICAgICAgIGZvciBpdGVtIGluIGluZGV4ZXNcblxuICAgICAgICAgICAgQHRpbGVzW2l0ZW0uaW5kZXhdPy5jaGFyc1RvU2hvdyA9IGl0ZW0uY2hhcnNcblxuICAgICAgICAjIGlmIGNvbmZpZy5USEVNRVNbQGFjdGl2ZVRoZW1lSW5kZXhdLndvcmRzLmxlbmd0aFxuXG4gICAgICAgICMgICAgIEBfY2hlY2tGb3JXb3JkcygpXG5cbiAgICAgICAgZm9yIHRpbGUsIGkgaW4gQHRpbGVzXG5cbiAgICAgICAgICAgIHRpbGUudXBkYXRlKClcblxuICAgICAgICAgICAgaWYgQHRoZW1lQ2hhbmdpbmdcbiAgICAgICAgICAgICAgICB0aWxlLnNldEFscGhhYmV0IEBhY3RpdmVUaGVtZUluZGV4XG5cbiAgICAgICAgbnVsbFxuXG4gICAgX2dldEluZGV4ZXMgOiAtPlxuXG4gICAgICAgIGluZGV4ZXMgPSBbXVxuXG4gICAgICAgIGZvciB0aWxlLCBpbmRleCBpbiBAdGlsZXNcblxuICAgICAgICAgICAgaWYgQG1hcmtlci5jaXJjbGUuY29udGFpbnMgdGlsZS5jZW50cmUueCwgdGlsZS5jZW50cmUueVxuXG4gICAgICAgICAgICAgICAgZGlzdCAgPSBlRGlzdCBbQG1hcmtlci5jaXJjbGUueCwgQG1hcmtlci5jaXJjbGUueV0sIFt0aWxlLmNlbnRyZS54LCB0aWxlLmNlbnRyZS55XVxuICAgICAgICAgICAgICAgIGRpc3QgPSBNYXRoLm1pbiBkaXN0LCBAbWFya2VyLmNpcmNsZS5yYWRpdXNcblxuICAgICAgICAgICAgICAgIGNoYXJzID0gY29uZmlnLk1BWF9DSEFSU19UT19TSE9XIC0gTWF0aC5mbG9vcigoZGlzdCAvIEBtYXJrZXIuY2lyY2xlLnJhZGl1cykgKiBjb25maWcuTUFYX0NIQVJTX1RPX1NIT1cpXG4gICAgICAgICAgICAgICAgY2hhcnMgKz0gY29uZmlnLk1JTl9DSEFSU19UT19TSE9XXG5cbiAgICAgICAgICAgICAgICBpbmRleGVzLnB1c2ggeyBpbmRleCwgY2hhcnMgfVxuXG4gICAgICAgIGluZGV4ZXNcblxuICAgICMgX2NoZWNrRm9yV29yZHMgOiAtPlxuXG4gICAgIyAgICAgaENoYXJzID0gW11cbiAgICAjICAgICBoVGlsZXMgPSBbXVxuICAgICMgICAgIHZDaGFycyA9IFtdXG4gICAgIyAgICAgdlRpbGVzID0gW11cblxuICAgICMgICAgIGZvciB0aWxlLCBpIGluIEB0aWxlc1xuXG4gICAgIyAgICAgICAgIGhDaGFycy5wdXNoIHRpbGUudC50ZXh0XG4gICAgIyAgICAgICAgIGhUaWxlcy5wdXNoIHRpbGVcblxuICAgICMgICAgICAgICB2SW5kZXggPSAoaSAlIEBjb2xzKSAqIEByb3dzICsgTWF0aC5mbG9vcihpIC8gQHJvd3MpXG4gICAgIyAgICAgICAgIHZDaGFyc1t2SW5kZXhdID0gdGlsZS50LnRleHRcbiAgICAjICAgICAgICAgdlRpbGVzW3ZJbmRleF0gPSB0aWxlXG5cbiAgICAjICAgICBmb3VuZCA9IFtdXG5cbiAgICAjICAgICBmb3Igd29yZCBpbiBjb25maWcuVEhFTUVTW0BhY3RpdmVUaGVtZUluZGV4XS53b3Jkc1xuXG4gICAgIyAgICAgICAgIEwyUlN0ciA9IGhDaGFycy5qb2luKCcnKVxuICAgICMgICAgICAgICBSMkxTdHIgPSBoQ2hhcnMucmV2ZXJzZSgpLmpvaW4oJycpXG4gICAgIyAgICAgICAgIFQyQlN0ciA9IHZDaGFycy5qb2luKCcnKVxuICAgICMgICAgICAgICBCMlRTdHIgPSB2Q2hhcnMucmV2ZXJzZSgpLmpvaW4oJycpXG5cbiAgICAjICAgICAgICAgaWYgTDJSU3RyLmluZGV4T2Yod29yZCkgPiAtMVxuICAgICMgICAgICAgICAgICAgIyBjb25zb2xlLmxvZyBcIkwtPlJcIiwgaFRpbGVzW0wyUlN0ci5pbmRleE9mKHdvcmQpXVxuICAgICMgICAgICAgICAgICAgaW5kaWNlcyA9IEBfZ2V0Rm91bmRJbmRpY2VzIHdvcmQsIEwyUlN0clxuICAgICMgICAgICAgICAgICAgZm9yIGluZGV4IGluIGluZGljZXNcbiAgICAjICAgICAgICAgICAgICAgICBmb3VuZC5wdXNoIEBfY2FwdHVyZUZvdW5kV29yZCBoVGlsZXMsIGluZGV4LCB3b3JkXG5cbiAgICAjICAgICAgICAgIyBpZiBSMkxTdHIuaW5kZXhPZih3b3JkKSA+IC0xXG4gICAgIyAgICAgICAgICAgICAjIGNvbnNvbGUubG9nIFwiUi0+TFwiLCBoVGlsZXMucmV2ZXJzZSgpW1IyTFN0ci5pbmRleE9mKHdvcmQpXVxuICAgICMgICAgICAgICAgICAgIyBpbmRpY2VzID0gQF9nZXRGb3VuZEluZGljZXMgd29yZCwgUjJMU3RyXG4gICAgIyAgICAgICAgICAgICAjIGZvciBpbmRleCBpbiBpbmRpY2VzXG4gICAgIyAgICAgICAgICAgICAjICAgICBmb3VuZC5wdXNoIEBfY2FwdHVyZUZvdW5kV29yZCBoVGlsZXMucmV2ZXJzZSgpLCBpbmRleCwgd29yZFxuXG4gICAgIyAgICAgICAgIGlmIFQyQlN0ci5pbmRleE9mKHdvcmQpID4gLTFcbiAgICAjICAgICAgICAgICAgICMgY29uc29sZS5sb2cgXCJULT5CXCIsIHZUaWxlc1tUMkJTdHIuaW5kZXhPZih3b3JkKV1cbiAgICAjICAgICAgICAgICAgIGluZGljZXMgPSBAX2dldEZvdW5kSW5kaWNlcyB3b3JkLCBUMkJTdHJcbiAgICAjICAgICAgICAgICAgIGZvciBpbmRleCBpbiBpbmRpY2VzXG4gICAgIyAgICAgICAgICAgICAgICAgZm91bmQucHVzaCBAX2NhcHR1cmVGb3VuZFdvcmQgdlRpbGVzLCBpbmRleCwgd29yZFxuXG4gICAgIyAgICAgICAgICMgaWYgQjJUU3RyLmluZGV4T2Yod29yZCkgPiAtMVxuICAgICMgICAgICAgICAgICAgIyBjb25zb2xlLmxvZyBcIkItPlRcIiwgdlRpbGVzLnJldmVyc2UoKVtCMlRTdHIuaW5kZXhPZih3b3JkKV1cbiAgICAjICAgICAgICAgICAgICMgZm91bmQgPSB0cnVlXG5cbiAgICAjICAgICAgICAgIyBpZiBMMlJTdHIuaW5kZXhPZih3b3JkKSA+IC0xIG9yIFIyTFN0ci5pbmRleE9mKHdvcmQpID4gLTEgb3IgVDJCU3RyLmluZGV4T2Yod29yZCkgPiAtMSBvciBCMlRTdHIuaW5kZXhPZih3b3JkKSA+IC0xXG4gICAgIyAgICAgICAgICAgICAjIGNvbnNvbGUubG9nIHdvcmQgKyAnIDopJ1xuICAgICMgICAgICAgICAgICAgIyBmb3VuZCA9IHRydWVcblxuICAgICMgICAgICAgICBmb3IgZm91bmRXb3JkIGluIGZvdW5kXG5cbiAgICAjICAgICAgICAgICAgIGZvciBjaGFyIGluIGZvdW5kV29yZFxuXG4gICAgIyAgICAgICAgICAgICAgICAgaWYgIWNoYXIuaXRlbS5GT1VORFxuICAgICMgICAgICAgICAgICAgICAgICAgICBjaGFyLml0ZW0uc2V0Rm91bmRDaGFyIGNoYXIuY2hhclxuXG4gICAgIyAgICAgbnVsbFxuXG4gICAgIyBfZ2V0Rm91bmRJbmRpY2VzIDogKHNlYXJjaFN0ciwgc3RyKSAtPlxuXG4gICAgIyAgICAgc3RhcnRJbmRleCAgID0gMFxuICAgICMgICAgIGluZGljZXMgICAgICA9IFtdXG4gICAgIyAgICAgc2VhcmNoU3RyTGVuID0gc2VhcmNoU3RyLmxlbmd0aFxuXG4gICAgIyAgICAgd2hpbGUgKGluZGV4ID0gc3RyLmluZGV4T2Yoc2VhcmNoU3RyLCBzdGFydEluZGV4KSkgPiAtMVxuICAgICMgICAgICAgICBpbmRpY2VzLnB1c2goaW5kZXgpXG4gICAgIyAgICAgICAgIHN0YXJ0SW5kZXggPSBpbmRleCArIHNlYXJjaFN0ckxlblxuXG4gICAgIyAgICAgaW5kaWNlc1xuXG4gICAgIyBfY2FwdHVyZUZvdW5kV29yZCA6IChpdGVtQXJyYXksIGluZGV4LCB3b3JkKSAtPlxuXG4gICAgIyAgICAgZm91bmRXb3JkID0gW11cblxuICAgICMgICAgIGZvciBpdGVtLCBpIGluIGl0ZW1BcnJheS5zbGljZSBpbmRleCwgaW5kZXgrd29yZC5sZW5ndGhcblxuICAgICMgICAgICAgICBmb3VuZFdvcmQucHVzaFxuICAgICMgICAgICAgICAgICAgaXRlbSA6IGl0ZW1cbiAgICAjICAgICAgICAgICAgIGNoYXIgOiB3b3JkLmNoYXJBdCBpXG5cblxuICAgICMgICAgIGZvdW5kV29yZFxuXG4gICAgc2V0dXBNYXJrZXIgOiA9PlxuXG4gICAgICAgIEBtYXJrZXIucG9zLnggPSBAdy8yXG4gICAgICAgIEBtYXJrZXIucG9zLnkgPSBAaC8yXG5cbiAgICAgICAgQG1hcmtlci5jaXJjbGUgPSBuZXcgUElYSS5DaXJjbGUgQHcvMiwgQGgvMiwgMFxuXG4gICAgICAgIGlmIEBERUJVR1xuICAgICAgICAgICAgQGFkZFN0YXRzKClcblxuICAgICAgICAgICAgQG1hcmtlci5pbmRpY2F0b3IgPSBuZXcgUElYSS5HcmFwaGljc1xuICAgICAgICAgICAgQG1hcmtlci5pbmRpY2F0b3IuYmVnaW5GaWxsKDB4ZmZmZmZmKVxuICAgICAgICAgICAgQG1hcmtlci5pbmRpY2F0b3IuZHJhd0NpcmNsZSgwLCAwLCAxMClcbiAgICAgICAgICAgIEBzdGFnZS5hZGRDaGlsZCBAbWFya2VyLmluZGljYXRvclxuICAgICAgICAgICAgQG1hcmtlci5pbmRpY2F0b3IueCA9IEBtYXJrZXIucG9zLnhcbiAgICAgICAgICAgIEBtYXJrZXIuaW5kaWNhdG9yLnkgPSBAbWFya2VyLnBvcy55XG5cbiAgICAgICAgICAgIEBtYXJrZXIuaW5kaWNhdG9yLnZpc2libGUgPSB0cnVlXG5cbiAgICAgICAgbnVsbFxuXG4gICAgdXBkYXRlTWFya2VyIDogPT5cblxuICAgICAgICByZXR1cm4gdW5sZXNzIEBwb2ludGVyLnBvc1xuXG4gICAgICAgIHhEID0gQHBvaW50ZXIucG9zLnggLSBAbWFya2VyLnBvcy54XG4gICAgICAgIHlEID0gQHBvaW50ZXIucG9zLnkgLSBAbWFya2VyLnBvcy55XG5cbiAgICAgICAgQG1hcmtlci5wb3MueCArPSAoeEQgKiAwLjEpXG4gICAgICAgIEBtYXJrZXIucG9zLnkgKz0gKHlEICogMC4xKVxuXG4gICAgICAgIEBtYXJrZXIuY2lyY2xlLnggPSBAbWFya2VyLnBvcy54XG4gICAgICAgIEBtYXJrZXIuY2lyY2xlLnkgPSBAbWFya2VyLnBvcy55XG5cbiAgICAgICAgZGVsdGEgID0gTWF0aC5tYXgoTWF0aC5hYnMoQHBvaW50ZXIuZGVsdGEueCksIE1hdGguYWJzKEBwb2ludGVyLmRlbHRhLnkpKVxuICAgICAgICByYWRpdXMgPSAoKChNYXRoLm1pbigoZGVsdGEgLyBjb25maWcuTUFYX0RFTFRBKSoxMDAsIGNvbmZpZy5NQVhfREVMVEEpKSAvIDEwMCkgKiBjb25maWcuTUFYX1JBRElVUykgKyBjb25maWcuTUlOX1JBRElVU1xuICAgICAgICByYWRpdXMgPSByYWRpdXMgKiBjb25maWcuVEhFTUVTW0BhY3RpdmVUaGVtZUluZGV4XS5yYWRpdXNNdWx0aXBsaWVyXG5cbiAgICAgICAgQG1hcmtlci5jaXJjbGUucmFkaXVzID0gcmFkaXVzXG4gICAgICAgIEBwb2ludGVyLmRlbHRhLnggKj0gMC45OFxuICAgICAgICBAcG9pbnRlci5kZWx0YS55ICo9IDAuOThcblxuICAgICAgICBpZiBAREVCVUdcbiAgICAgICAgICAgIEBtYXJrZXIuaW5kaWNhdG9yLnggPSBAbWFya2VyLnBvcy54XG4gICAgICAgICAgICBAbWFya2VyLmluZGljYXRvci55ID0gQG1hcmtlci5wb3MueVxuXG4gICAgICAgIG51bGxcblxuICAgIHNldHVwQmcgOiA9PlxuXG4gICAgICAgIEBiZyA9IG5ldyBQSVhJLkdyYXBoaWNzXG4gICAgICAgICMgQGJnLmJlZ2luRmlsbCAweGZmMDAwMFxuICAgICAgICAjIEBiZy5hbHBoYSA9IDAuM1xuICAgICAgICAjIEBiZy5kcmF3UmVjdCAwLCAwLCBAdywgQHdcblxuICAgICAgICBAc3RhZ2UuYWRkQ2hpbGQgQGJnXG5cbiAgICAgICAgbnVsbFxuXG4gICAgc2V0TmV3QmcgOiAoZnJvbVgsIGZyb21ZKSA9PlxuXG4gICAgICAgIHNvcnRlZFRpbGVzID0gQF9nZXRCZ0NoYW5nZVRpbGVzKGZyb21YLCBmcm9tWSlcblxuICAgICAgICBmb3IgdGlsZSBpbiBzb3J0ZWRUaWxlc1xuXG4gICAgICAgICAgICBAYkdzVG9DaGFuZ2UucHVzaChcbiAgICAgICAgICAgICAgICB4ICA6IHRpbGUueFxuICAgICAgICAgICAgICAgIHkgIDogdGlsZS55XG4gICAgICAgICAgICAgICAgdyAgOiB0aWxlLndcbiAgICAgICAgICAgICAgICBiZyA6IGNvbmZpZy5USEVNRVNbQGFjdGl2ZVRoZW1lSW5kZXhdLmJnXG4gICAgICAgICAgICApXG5cbiAgICAgICAgbnVsbFxuXG4gICAgX2dldEJnQ2hhbmdlVGlsZXMgOiAoZnJvbVgsIGZyb21ZKSA9PlxuXG4gICAgICAgIGNoYW5nZXIgPSBAYmdDaGFuZ2VDb3VudCAlIDNcblxuICAgICAgICAjIGlmIGNoYW5nZXIgaXMgMFxuICAgICAgICAjICAgICB0aWxlcyA9IF8uc29ydEJ5IF8uc2h1ZmZsZShAdGlsZXMuc2xpY2UoMCkpLCAodGlsZSkgPT4gcmV0dXJuIHRpbGUudC5hbHBoYVxuICAgICAgICAjIGVsc2UgaWYgY2hhbmdlciBpcyAxXG4gICAgICAgICMgICAgIHRpbGVzID0gXy5zb3J0QnkgXy5zaHVmZmxlKEB0aWxlcy5zbGljZSgwKSksICh0aWxlKSA9PiByZXR1cm4gLTEqdGlsZS50LmFscGhhXG4gICAgICAgIGlmIGNoYW5nZXIgaXMgMFxuICAgICAgICAgICAgdGlsZXMgPSBfLnNodWZmbGUoQHRpbGVzLnNsaWNlKDApKVxuICAgICAgICBlbHNlIGlmIGNoYW5nZXIgaXMgMVxuICAgICAgICAgICAgdGlsZXMgPSBfLnNvcnRCeSBAdGlsZXMuc2xpY2UoMCksICh0aWxlKSA9PiByZXR1cm4gZURpc3QgW2Zyb21YLCBmcm9tWV0sIFt0aWxlLmNlbnRyZS54LCB0aWxlLmNlbnRyZS55XVxuICAgICAgICBlbHNlIGlmIGNoYW5nZXIgaXMgMlxuICAgICAgICAgICAgdGlsZXMgPSBfLnNvcnRCeSBAdGlsZXMuc2xpY2UoMCksICh0aWxlKSA9PiByZXR1cm4gLTEqZURpc3QgW2Zyb21YLCBmcm9tWV0sIFt0aWxlLmNlbnRyZS54LCB0aWxlLmNlbnRyZS55XVxuICAgICAgICAjIGVsc2UgaWYgY2hhbmdlciBpcyA1XG4gICAgICAgICMgICAgIHRpbGVzID0gXy5zb3J0QnkgXy5zaHVmZmxlKEB0aWxlcy5zbGljZSgwKSksICh0aWxlKSA9PiByZXR1cm4gdGlsZS50LnhcbiAgICAgICAgIyBlbHNlIGlmIGNoYW5nZXIgaXMgNlxuICAgICAgICAjICAgICB0aWxlcyA9IF8uc29ydEJ5IF8uc2h1ZmZsZShAdGlsZXMuc2xpY2UoMCkpLCAodGlsZSkgPT4gcmV0dXJuIC0xKnRpbGUudC54XG4gICAgICAgICMgZWxzZSBpZiBjaGFuZ2VyIGlzIDdcbiAgICAgICAgIyAgICAgdGlsZXMgPSBfLnNvcnRCeSBfLnNodWZmbGUoQHRpbGVzLnNsaWNlKDApKSwgKHRpbGUpID0+IHJldHVybiB0aWxlLnQueVxuICAgICAgICAjIGVsc2UgaWYgY2hhbmdlciBpcyA4XG4gICAgICAgICMgICAgIHRpbGVzID0gXy5zb3J0QnkgXy5zaHVmZmxlKEB0aWxlcy5zbGljZSgwKSksICh0aWxlKSA9PiByZXR1cm4gLTEqdGlsZS50LnlcblxuICAgICAgICBAYmdDaGFuZ2VDb3VudCsrXG5cbiAgICAgICAgdGlsZXNcblxuICAgIHVwZGF0ZUJnIDogPT5cblxuICAgICAgICByZXR1cm4gdW5sZXNzIEBiR3NUb0NoYW5nZS5sZW5ndGhcblxuICAgICAgICB0b0NoYW5nZSA9IE1hdGguZmxvb3IoQGJHc1RvQ2hhbmdlLmxlbmd0aCAqIDAuMSlcblxuICAgICAgICBpZiB0b0NoYW5nZSA8IDEwXG4gICAgICAgICAgICB0b0NoYW5nZSA9IDEwXG4gICAgICAgICAgICBAdGhlbWVDaGFuZ2luZyA9IGZhbHNlXG5cbiAgICAgICAgdGlsZXMgICAgICAgID0gQGJHc1RvQ2hhbmdlLnNsaWNlKDAsIHRvQ2hhbmdlKVxuICAgICAgICBAYkdzVG9DaGFuZ2UgPSBAYkdzVG9DaGFuZ2Uuc2xpY2UodG9DaGFuZ2UpXG5cbiAgICAgICAgZm9yIHRpbGUgaW4gdGlsZXNcbiAgICAgICAgICAgIEBiZy5iZWdpbkZpbGwgdGlsZS5iZ1xuICAgICAgICAgICAgQGJnLmRyYXdSZWN0IHRpbGUueCwgdGlsZS55LCB0aWxlLncsIHRpbGUud1xuXG4gICAgICAgIG51bGxcblxuICAgIHVwZGF0ZUJnRm9yY2UgOiA9PlxuXG4gICAgICAgIHJldHVybiB1bmxlc3MgQGJnXG5cbiAgICAgICAgQGJnLmJlZ2luRmlsbCBjb25maWcuVEhFTUVTW0BhY3RpdmVUaGVtZUluZGV4XS5iZ1xuICAgICAgICBAYmcuZHJhd1JlY3QgMCwgMCwgQHcsIEBoXG5cbiAgICAgICAgbnVsbFxuXG4gICAgb25Qb2ludGVyTW92ZSA6IChlLCB4PW51bGwsIHk9bnVsbCkgPT5cblxuICAgICAgICBpZiBlXG5cbiAgICAgICAgICAgIEBoYXNJbnRlcmFjdGVkID0gdHJ1ZVxuXG4gICAgICAgICAgICBpZiAnb250b3VjaHN0YXJ0JyBvZiB3aW5kb3dcbiAgICAgICAgICAgICAgICB4ID0gZS50b3VjaGVzWzBdLnBhZ2VYXG4gICAgICAgICAgICAgICAgeSA9IGUudG91Y2hlc1swXS5wYWdlWVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHggPSBlLnBhZ2VYXG4gICAgICAgICAgICAgICAgeSA9IGUucGFnZVlcblxuICAgICAgICBpZiBAcG9pbnRlci5wb3MgdGhlbiBAcG9pbnRlci5sYXN0ID0geCA6IEBwb2ludGVyLnBvcy54LCB5IDogQHBvaW50ZXIucG9zLnlcblxuICAgICAgICBAcG9pbnRlci5wb3MgID0geCA6IHgsIHkgOiB5XG5cbiAgICAgICAgaWYgQHBvaW50ZXIubGFzdFxuICAgICAgICAgICAgbmV3RFggPSBAcG9pbnRlci5wb3MueCAtIEBwb2ludGVyLmxhc3QueFxuICAgICAgICAgICAgbmV3RFkgPSBAcG9pbnRlci5wb3MueSAtIEBwb2ludGVyLmxhc3QueVxuICAgICAgICAgICAgaWYgTWF0aC5tYXgoTWF0aC5hYnMobmV3RFgpLCBNYXRoLmFicyhuZXdEWSkpID4gTWF0aC5tYXgoTWF0aC5hYnMoQHBvaW50ZXIuZGVsdGEueCksIE1hdGguYWJzKEBwb2ludGVyLmRlbHRhLnkpKVxuICAgICAgICAgICAgICAgIEBwb2ludGVyLmRlbHRhID0geCA6IEBwb2ludGVyLnBvcy54IC0gQHBvaW50ZXIubGFzdC54LCB5IDogQHBvaW50ZXIucG9zLnkgLSBAcG9pbnRlci5sYXN0LnlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcG9pbnRlci5kZWx0YS54ICo9IDAuOThcbiAgICAgICAgICAgICAgICBAcG9pbnRlci5kZWx0YS55ICo9IDAuOThcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAcG9pbnRlci5kZWx0YSA9IHggOiAwLCB5IDogMFxuXG4gICAgICAgIGNsZWFyVGltZW91dCBAaWRsZVRpbWVyXG4gICAgICAgIEBpZGxlVGltZXIgPSBzZXRUaW1lb3V0ID0+XG4gICAgICAgICAgICBAaGFzSW50ZXJhY3RlZCA9IGZhbHNlXG4gICAgICAgICAgICBAcGxheUF1dG9BbmltYXRpb24oKVxuICAgICAgICAsIDMwMDBcblxuICAgICAgICBudWxsXG5cbiAgICBvblBvaW50ZXJEb3duIDogPT5cblxuICAgICAgICBAcG9pbnRlckRvd24gPSB0cnVlXG5cbiAgICAgICAgbnVsbFxuXG4gICAgb25Qb2ludGVyVXAgOiA9PlxuXG4gICAgICAgIEBwb2ludGVyRG93biA9IGZhbHNlXG4gICAgICAgIEBzZXRUaGVtZSgpXG5cbiAgICAgICAgbnVsbFxuXG4gICAgcGxheUF1dG9BbmltYXRpb24gOiA9PlxuXG4gICAgICAgIHJhbmRYID0gXy5yYW5kb20oQHcqMC4wNSwgQHcqMC45NSlcbiAgICAgICAgcmFuZFkgPSBfLnJhbmRvbShAaCowLjA1LCBAaCowLjk1KVxuICAgICAgICBkZWxheSA9IF8ucmFuZG9tKDEwMCwgNDAwKVxuXG4gICAgICAgIEBvblBvaW50ZXJNb3ZlIG51bGwsIHJhbmRYLCByYW5kWVxuXG4gICAgICAgIGNoYW5jZSA9IE1hdGgucmFuZG9tKClcblxuICAgICAgICBpZiBjaGFuY2UgPCAwLjAxXG4gICAgICAgICAgICBAc2V0VGhlbWUoKVxuXG4gICAgICAgIGlmICFAaGFzSW50ZXJhY3RlZFxuICAgICAgICAgICAgc2V0VGltZW91dCBAcGxheUF1dG9BbmltYXRpb24sIGRlbGF5XG5cbiAgICAgICAgbnVsbFxuXG4gICAgRVhQIDogLT5cblxuICAgICAgICByZXR1cm4gd2luZG93LkVYUFxuXG5tb2R1bGUuZXhwb3J0cyA9IEV4cFxuIiwiY2xhc3MgRGV2aWNlXG5cbiAgICBAU0laRVMgOiBcbiAgICAgICAgU01BTEwgIDogJ1NNQUxMJ1xuICAgICAgICBNRURJVU0gOiAnTUVESVVNJ1xuICAgICAgICBMQVJHRSAgOiAnTEFSR0UnXG5cbiAgICBAU0laRSA6IG51bGxcblxuICAgIEBzZXRTaXplIDogKHcsIGgpID0+XG5cbiAgICAgICAgc2l6ZSA9IHN3aXRjaCB0cnVlXG4gICAgICAgICAgICB3aGVuIHcgPiAxMzAwIG9yIGggPiAxMzAwIHRoZW4gRGV2aWNlLlNJWkVTLkxBUkdFXG4gICAgICAgICAgICB3aGVuIHcgPD0gNzAwIG9yIGggPD0gNzAwIHRoZW4gRGV2aWNlLlNJWkVTLlNNQUxMXG4gICAgICAgICAgICBlbHNlIERldmljZS5TSVpFUy5NRURJVU1cblxuICAgICAgICBEZXZpY2UuU0laRSA9IHNpemVcblxuICAgICAgICBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRGV2aWNlXG53aW5kb3cuRGV2aWNlID0gRGV2aWNlIl19
