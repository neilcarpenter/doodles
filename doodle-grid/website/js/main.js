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
var Tile, config;

config = require('./config');

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

  Tile.prototype.opts = {
    font: '18px font',
    fill: 0xffffff
  };

  function Tile(_arg) {
    var bounds;
    this.x = _arg.x, this.y = _arg.y, this.w = _arg.w;
    this.centre = {
      x: this.x + this.w / 2,
      y: this.y + this.w / 2
    };
    this.c = new PIXI.Container;
    this.c.width = this.c.height = this.w;
    this.t = new PIXI.extras.BitmapText(' ', this.opts);
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



},{"./config":4}],4:[function(require,module,exports){
module.exports = {
  TILE_WIDTH: 16,
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



},{}],5:[function(require,module,exports){
var Exp, Tile, config, eDist,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Tile = require('./Tile');

config = require('./config');

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
    this.setDims();
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
    this.cols = Math.ceil(this.w / config.TILE_WIDTH);
    this.rows = Math.ceil(this.h / config.TILE_WIDTH);
    tileCount = this.cols * this.rows;
    for (i = _i = 0; 0 <= tileCount ? _i < tileCount : _i > tileCount; i = 0 <= tileCount ? ++_i : --_i) {
      x = (i % this.cols) * config.TILE_WIDTH;
      y = Math.floor(i / this.cols) * config.TILE_WIDTH;
      tile = new Tile({
        x: x,
        y: y,
        w: config.TILE_WIDTH
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
        x = e.originalEvent.touches[0].pageX;
        y = e.originalEvent.touches[0].pageY;
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
    if (chance < 0.02) {
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



},{"./Tile":3,"./config":4,"euclidean-distance":2}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbmVpbGNhcnBlbnRlci9TaXRlcy9kb29kbGVzL2Rvb2RsZS1ncmlkL3Byb2plY3QvY29mZmVlL01haW4uY29mZmVlIiwibm9kZV9tb2R1bGVzL2V1Y2xpZGVhbi1kaXN0YW5jZS9pbmRleC5qcyIsIi9Vc2Vycy9uZWlsY2FycGVudGVyL1NpdGVzL2Rvb2RsZXMvZG9vZGxlLWdyaWQvcHJvamVjdC9jb2ZmZWUvZXhwL1RpbGUuY29mZmVlIiwiL1VzZXJzL25laWxjYXJwZW50ZXIvU2l0ZXMvZG9vZGxlcy9kb29kbGUtZ3JpZC9wcm9qZWN0L2NvZmZlZS9leHAvY29uZmlnLmNvZmZlZSIsIi9Vc2Vycy9uZWlsY2FycGVudGVyL1NpdGVzL2Rvb2RsZXMvZG9vZGxlLWdyaWQvcHJvamVjdC9jb2ZmZWUvZXhwL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsR0FBQTs7QUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVIsQ0FBTixDQUFBOztBQUFBLE1BRU0sQ0FBQyxHQUFQLEdBQWEsR0FBQSxDQUFBLEdBRmIsQ0FBQTs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQSxJQUFBLFlBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQTtBQUlDLGlCQUFBLENBQUEsR0FBRyxJQUFILENBQUE7O0FBQUEsaUJBQ0EsQ0FBQSxHQUFHLElBREgsQ0FBQTs7QUFBQSxpQkFFQSxDQUFBLEdBQUcsSUFGSCxDQUFBOztBQUFBLGlCQUlBLEVBQUEsR0FBSSxJQUpKLENBQUE7O0FBQUEsaUJB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QyxDQUFBLGlCQUFaLEVBQStCLEtBQS9CLENBQUEsQ0FESjtLQVhBO1dBY0EsS0FoQmdCO0VBQUEsQ0FoZnBCLENBQUE7O0FBQUEsZ0JBa2dCQSxHQUFBLEdBQU0sU0FBQSxHQUFBO0FBRUYsV0FBTyxNQUFNLENBQUMsR0FBZCxDQUZFO0VBQUEsQ0FsZ0JOLENBQUE7O2FBQUE7O0lBTkosQ0FBQTs7QUFBQSxNQTRnQk0sQ0FBQyxPQUFQLEdBQWlCLEdBNWdCakIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJFeHAgPSByZXF1aXJlICcuL2V4cCdcblxud2luZG93LkVYUCA9IG5ldyBFeHBcbiIsIi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRXVjbGlkZWFuX2Rpc3RhbmNlI1RocmVlX2RpbWVuc2lvbnNcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhLCBiKSB7XG5cbiAgLy8gcmV0dXJuIE1hdGguc3FydChcbiAgLy8gICBNYXRoLnBvdyhhWzBdLWJbMF0sIDIpICtcbiAgLy8gICBNYXRoLnBvdyhhWzFdLWJbMV0sIDIpICtcbiAgLy8gICBNYXRoLnBvdyhhWzJdLWJbMl0sIDIpXG4gIC8vIClcblxuICAvLyByZXR1cm4gTWF0aC5zcXJ0KFxuICAvLyAgIFswLDEsMl0ucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cnJlbnQsIGkpIHtcbiAgLy8gICAgIHJldHVybiBwcmV2ICsgTWF0aC5wb3coYVtpXS1iW2ldLCAyKTtcbiAgLy8gICB9LCAwKVxuICAvLyApO1xuXG4gIHZhciBzdW0gPSAwO1xuICB2YXIgbjtcbiAgZm9yIChuPTA7IG4gPCBhLmxlbmd0aDsgbisrKSB7XG4gICAgc3VtICs9IE1hdGgucG93KGFbbl0tYltuXSwgMik7XG4gIH1cbiAgcmV0dXJuIE1hdGguc3FydChzdW0pO1xufSIsImNvbmZpZyA9IHJlcXVpcmUgJy4vY29uZmlnJ1xuXG5jbGFzcyBUaWxlXG5cblx0eDogbnVsbFxuXHR5OiBudWxsXG5cdHc6IG51bGxcdFxuXG5cdHRYOiBudWxsXG5cdHRZOiBudWxsXG5cblx0YzogbnVsbFxuXHR0OiBudWxsXG5cblx0Y2VudHJlIDogbnVsbFxuXHRjaGFuY2UgOiAwLjlcblxuXHRjaGFyc1RvU2hvdyA6IDBcblxuXHQjIEZPVU5EIDogZmFsc2VcblxuXHRvcHRzIDogZm9udCA6ICcxOHB4IGZvbnQnLCBmaWxsIDogMHhmZmZmZmZcblxuXHRjb25zdHJ1Y3RvciA6ICh7QHgsIEB5LCBAd30pIC0+XG5cblx0XHRAY2VudHJlID0gIHg6IEB4ICsgQHcvMiwgeTogQHkgKyBAdy8yXG5cblx0XHRAYyA9IG5ldyBQSVhJLkNvbnRhaW5lclxuXHRcdEBjLndpZHRoID0gQGMuaGVpZ2h0ID0gQHdcblxuXHRcdEB0ID0gbmV3IFBJWEkuZXh0cmFzLkJpdG1hcFRleHQgJyAnLCBAb3B0c1xuXHRcdGJvdW5kcyA9IEB0LmdldExvY2FsQm91bmRzKClcblx0XHRAdFggPSBAY2VudHJlLnggLSAoYm91bmRzLndpZHRoLzIpIC0gYm91bmRzLnhcblx0XHRAdFkgPSBAY2VudHJlLnkgLSAoYm91bmRzLmhlaWdodC8yKSAtIGJvdW5kcy55IC0gMTAgIyB3aHkgdGhpcyAxMD8gZG9uJ3Qga25vd1xuXHRcdEB0LnBvc2l0aW9uLnNldCBAdFgsIEB0WVxuXHRcdFxuXHRcdCMgQGIgPSBuZXcgUElYSS5HcmFwaGljc1xuXHRcdCMgQGIuYmVnaW5GaWxsIDB4ZmZmZmZmXG5cdFx0IyBAYi5hbHBoYSA9IDAuM1xuXHRcdCMgQGIuZHJhd1JlY3QgQHgrMiwgQHkrMiwgQHctNCwgQHctNFxuXG5cdFx0IyBAYy5hZGRDaGlsZCBAYlxuXHRcdEBjLmFkZENoaWxkIEB0XG5cblx0XHRAc2V0QWxwaGFiZXQoKVxuXG5cdFx0cmV0dXJuIG51bGxcblxuXHRfZ2V0TmV3Q2hhciA6IC0+XG5cblx0XHRpZiBAY2hhckNvdW50ZXIgaXMgQGNoYXJzLmxlbmd0aC0xIHRoZW4gQGNoYXJDb3VudGVyID0gMFxuXG5cdFx0Y2hhciA9IEBjaGFyc1tAY2hhckNvdW50ZXIrK11cblxuXHRcdGNoYXJcblxuXHRzZXRBbHBoYWJldCA6ICh0aGVtZUluZGV4PTApIC0+XG5cblx0XHRAY2hhcnMgPSBjb25maWcuVEhFTUVTW3RoZW1lSW5kZXhdLmFscGhhYmV0LmNoYXJzXG5cdFx0QGNoYXJzID0gaWYgY29uZmlnLlRIRU1FU1t0aGVtZUluZGV4XS5hbHBoYWJldC5zaHVmZmxlIHRoZW4gXy5zaHVmZmxlIEBjaGFycyBlbHNlIEBjaGFyc1xuXG5cdFx0QGNoYXJDb3VudGVyID0gMFxuXG5cdFx0bnVsbFxuXG5cdCMgc2V0Rm91bmRDaGFyIDogKGNoYXIpIC0+XG5cblx0IyBcdEB0LnRleHQgPSBjaGFyXG5cdCMgXHRAdC5hbHBoYSA9IDFcblxuXHQjIFx0QEZPVU5EID0gdHJ1ZVxuXG5cdCMgXHRzZXRUaW1lb3V0ID0+XG5cdCMgXHRcdEBGT1VORCA9IGZhbHNlXG5cdCMgXHRcdEBjaGFyc1RvU2hvdyA9IGNvbmZpZy5NQVhfQ0hBUlNfVE9fU0hPV1xuXHQjIFx0XHRAdXBkYXRlKClcblx0IyBcdCwgMTAwMFxuXG5cdCMgXHRudWxsXG5cblx0dXBkYXRlIDogLT5cblxuXHRcdCMgcmV0dXJuIHVubGVzcyBAY2hhcnNUb1Nob3cgPiAwIGFuZCAhQEZPVU5EXG5cdFx0cmV0dXJuIHVubGVzcyBAY2hhcnNUb1Nob3cgPiAwXG5cblx0XHRpZiBNYXRoLnJhbmRvbSgpID4gQGNoYW5jZVxuXG5cdFx0XHRjaGFyID0gaWYgQGNoYXJzVG9TaG93IGlzIDEgdGhlbiAnICcgZWxzZSBAX2dldE5ld0NoYXIoKVxuXG5cdFx0XHRhdkNoYXIgPSAoY29uZmlnLk1JTl9DSEFSU19UT19TSE9XICsgY29uZmlnLk1BWF9DSEFSU19UT19TSE9XKSAvIDJcblx0XHRcdGFscGhhICA9IE1hdGgubWluIEBjaGFyc1RvU2hvdyAvIGF2Q2hhciwgMVxuXG5cdFx0XHRAdC50ZXh0ICA9IGNoYXJcblx0XHRcdEB0LmFscGhhID0gYWxwaGFcblxuXHRcdFx0QGNoYXJzVG9TaG93LS1cblxuXHRcdG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG5cblx0VElMRV9XSURUSDogMTZcblxuXHRNSU5fUkFESVVTOiAxMFxuXHRNQVhfUkFESVVTOiA1MFxuXHRNQVhfREVMVEEgOiAxNTBcblxuXHRNSU5fQ0hBUlNfVE9fU0hPVyA6IDhcblx0TUFYX0NIQVJTX1RPX1NIT1cgOiAxMlxuXG5cdFRIRU1FUzogW1xuXHRcdHtcblx0XHRcdGFscGhhYmV0OlxuXHRcdFx0XHRjaGFycyAgIDogJ2NvZGVkb29kbC5lcycuc3BsaXQoJycpXG5cdFx0XHRcdHNodWZmbGUgOiB0cnVlXG5cdFx0XHRiZzogMHhFQjQyM0Vcblx0XHRcdHdvcmRzOiBbICdjb2RlJywgJ2Rvb2RsZScgXVxuXHRcdFx0cmFkaXVzTXVsdGlwbGllcjogMVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0YWxwaGFiZXQ6XG5cdFx0XHRcdGNoYXJzICAgOiAnYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5IT8qKClAwqMkJV4mXy0rPVtde306O1xcJ1wiXFxcXHw8PiwuL35gJy5zcGxpdCgnJylcblx0XHRcdFx0c2h1ZmZsZSA6IHRydWVcblx0XHRcdGJnOiAweDAwMDAwMFxuXHRcdFx0d29yZHM6IFtdXG5cdFx0XHRyYWRpdXNNdWx0aXBsaWVyOiAzXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRhbHBoYWJldDpcblx0XHRcdFx0Y2hhcnMgICA6ICdldGFvaW5zaHJkJy5zcGxpdCgnJylcblx0XHRcdFx0c2h1ZmZsZSA6IHRydWVcblx0XHRcdGJnOiAweDM5NUNBQVxuXHRcdFx0d29yZHM6IFsgJ2RhdGUnLCAnaGluZCcsICdzaG90JywgJ2hhc3RlJywgJ2FpcnNob3QnLCAnc2hvcnRlbicsICdlYXJ0aCcsICdvdGhlcicsICdzaGluZScsICd0cmFzaCcgXVxuXHRcdFx0cmFkaXVzTXVsdGlwbGllcjogMS41XG5cdFx0fSxcblx0XHR7XG5cdFx0XHRhbHBoYWJldDpcblx0XHRcdFx0Y2hhcnMgICA6ICcxMjM0NTY3ODkwJy5zcGxpdCgnJylcblx0XHRcdFx0c2h1ZmZsZSA6IHRydWVcblx0XHRcdGJnOiAweDFFNTAyQ1xuXHRcdFx0d29yZHM6IFtdXG5cdFx0XHRyYWRpdXNNdWx0aXBsaWVyOiAwLjVcblx0XHR9LFxuXHRcdHtcblx0XHRcdGFscGhhYmV0OlxuXHRcdFx0XHRjaGFycyAgIDogJyE/KigpQMKjJCVeJl8tKz1bXXt9OjtcXCdcIlxcXFx8PD4sLi9+YCcuc3BsaXQoJycpXG5cdFx0XHRcdHNodWZmbGUgOiBmYWxzZVxuXHRcdFx0Ymc6IDB4NTc0MEFDXG5cdFx0XHRyYWRpdXNNdWx0aXBsaWVyOiAxXG5cdFx0XHR3b3JkczogW11cblx0XHR9XG5cdF1cblxud2luZG93LmNvbmZpZyA9IG1vZHVsZS5leHBvcnRzXG4iLCJUaWxlICAgPSByZXF1aXJlICcuL1RpbGUnXG5jb25maWcgPSByZXF1aXJlICcuL2NvbmZpZydcbmVEaXN0ICA9IHJlcXVpcmUgJ2V1Y2xpZGVhbi1kaXN0YW5jZSdcblxuY2xhc3MgRXhwXG5cbiAgICBzdGFnZSAgICA6IG51bGxcbiAgICByZW5kZXJlciA6IG51bGxcbiAgICBiZyAgICAgICA6IG51bGxcblxuICAgIHcgOiAwXG4gICAgaCA6IDBcblxuICAgIGNvbHMgOiBudWxsXG4gICAgcm93cyA6IG51bGxcblxuICAgIHBvaW50ZXIgOlxuICAgICAgICBwb3MgICA6IG51bGxcbiAgICAgICAgbGFzdCAgOiBudWxsXG4gICAgICAgIGRlbHRhIDogbnVsbFxuXG4gICAgbWFya2VyIDpcbiAgICAgICAgcG9zICAgIDogeCA6IDAsIHkgOiAwXG4gICAgICAgIGNpcmNsZSAgICA6IG51bGxcbiAgICAgICAgaW5kaWNhdG9yIDogbnVsbFxuXG4gICAgaWRsZVRpbWVyICAgICA6IG51bGxcbiAgICBoYXNJbnRlcmFjdGVkIDogZmFsc2VcbiAgICBwb2ludGVyRG93biAgIDogZmFsc2VcblxuICAgIGFjdGl2ZVRoZW1lSW5kZXggOiAwXG4gICAgYmdDaGFuZ2VDb3VudCAgICA6IDBcbiAgICB0aGVtZUNoYW5naW5nICAgIDogZmFsc2VcblxuICAgIHRpbGVzICAgICAgIDogW11cbiAgICBiR3NUb0NoYW5nZSA6IFtdXG5cbiAgICBjb25zdHJ1Y3RvciA6IC0+XG5cbiAgICAgICAgQERFQlVHID0gL1xcP2RlYnVnLy50ZXN0KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpXG5cbiAgICAgICAgQHNldHVwKClcblxuICAgICAgICBsb2FkZXIgPSBQSVhJLmxvYWRlclxuICAgICAgICBsb2FkZXIuYWRkICdmb250JywgXCJmb250cy9tb25vc3Rlbi9mb250LmZudFwiXG4gICAgICAgIGxvYWRlci5vbmNlICdjb21wbGV0ZScsIEBpbml0LmJpbmQoQClcbiAgICAgICAgbG9hZGVyLmxvYWQoKVxuXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICBzZXR1cCA6IC0+XG5cbiAgICAgICAgQG9uUmVzaXplKClcblxuICAgICAgICBudWxsXG5cbiAgICBhZGRTdGF0cyA6IC0+XG5cbiAgICAgICAgQHN0YXRzID0gbmV3IFN0YXRzXG4gICAgICAgIEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICAgICAgICBAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCdcbiAgICAgICAgQHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCdcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBAc3RhdHMuZG9tRWxlbWVudFxuXG4gICAgICAgIG51bGxcblxuICAgIGluaXQ6IC0+XG5cbiAgICAgICAgUElYSS5SRVNPTFVUSU9OID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gb3IgMVxuICAgICAgICBQSVhJLnV0aWxzLl9zYWlkSGVsbG8gPSB0cnVlXG5cbiAgICAgICAgQHNldERpbXMoKVxuXG4gICAgICAgIHJlbmRlcmVyT3B0cyA9IGFudGlhbGlhcyA6IHRydWUsIGJhY2tncm91bmRDb2xvciA6IGNvbmZpZy5USEVNRVNbQGFjdGl2ZVRoZW1lSW5kZXhdLmJnLCByZXNvbHV0aW9uIDogUElYSS5SRVNPTFVUSU9OXG5cbiAgICAgICAgQHJlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIgQHcqUElYSS5SRVNPTFVUSU9OLCBAaCpQSVhJLlJFU09MVVRJT04sIHJlbmRlcmVyT3B0c1xuICAgICAgICBAc3RhZ2UgICAgPSBuZXcgUElYSS5Db250YWluZXJcblxuICAgICAgICBAc2V0dXBCZygpXG4gICAgICAgIEBzZXR1cEdyaWQoKVxuICAgICAgICBAc2V0dXBNYXJrZXIoKVxuXG4gICAgICAgIEByZW5kZXIoKVxuXG4gICAgICAgIGlmIEBERUJVR1xuICAgICAgICAgICAgQGFkZFN0YXRzKClcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIEByZW5kZXJlci52aWV3XG5cbiAgICAgICAgQGJpbmRFdmVudHMoKVxuICAgICAgICBAcGxheUF1dG9BbmltYXRpb24oKVxuXG4gICAgICAgIEBkcmF3KClcblxuICAgICAgICBudWxsXG5cbiAgICBkcmF3IDogLT5cblxuICAgICAgICAjIEBjb3VudGVyID0gMFxuXG4gICAgICAgIEBzZXREaW1zKClcblxuICAgICAgICBAdXBkYXRlKClcblxuICAgICAgICBudWxsXG5cbiAgICB1cGRhdGUgOiA9PlxuXG4gICAgICAgIGlmIHdpbmRvdy5TVE9QIHRoZW4gcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZSBAdXBkYXRlXG5cbiAgICAgICAgaWYgQERFQlVHIHRoZW4gQHN0YXRzLmJlZ2luKClcblxuICAgICAgICAjIEBjb3VudGVyKytcblxuICAgICAgICBAdXBkYXRlTWFya2VyKClcbiAgICAgICAgQHVwZGF0ZUJnKClcbiAgICAgICAgQHVwZGF0ZUdyaWQoKVxuXG4gICAgICAgIEByZW5kZXIoKVxuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSBAdXBkYXRlXG5cbiAgICAgICAgaWYgQERFQlVHXG4gICAgICAgICAgICBAc3RhdHMuZW5kKClcblxuICAgICAgICBudWxsXG5cbiAgICByZW5kZXIgOiAtPlxuXG4gICAgICAgIEByZW5kZXJlci5yZW5kZXIgQHN0YWdlXG5cbiAgICAgICAgbnVsbFxuXG4gICAgYmluZEV2ZW50cyA6IC0+XG5cbiAgICAgICAgZG93bkludGVyYWN0aW9uID0gaWYgJ29udG91Y2hzdGFydCcgb2Ygd2luZG93IHRoZW4gJ3RvdWNoc3RhcnQnIGVsc2UgJ21vdXNlZG93bidcbiAgICAgICAgdXBJbnRlcmFjdGlvbiAgID0gaWYgJ29udG91Y2hzdGFydCcgb2Ygd2luZG93IHRoZW4gJ3RvdWNoZW5kJyBlbHNlICdtb3VzZXVwJ1xuICAgICAgICBtb3ZlSW50ZXJhY3Rpb24gPSBpZiAnb250b3VjaHN0YXJ0JyBvZiB3aW5kb3cgdGhlbiAndG91Y2htb3ZlJyBlbHNlICdtb3VzZW1vdmUnXG5cbiAgICAgICAgQG9uUmVzaXplID0gXy5kZWJvdW5jZSBAb25SZXNpemUsIDMwMFxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdyZXNpemUnLCBAb25SZXNpemUsIGZhbHNlXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdvcmllbnRhdGlvbmNoYW5nZScsIEBvblJlc2l6ZSwgZmFsc2VcblxuICAgICAgICBAcmVuZGVyZXIudmlldy5hZGRFdmVudExpc3RlbmVyIG1vdmVJbnRlcmFjdGlvbiwgQG9uUG9pbnRlck1vdmUsIGZhbHNlXG4gICAgICAgIEByZW5kZXJlci52aWV3LmFkZEV2ZW50TGlzdGVuZXIgZG93bkludGVyYWN0aW9uLCBAb25Qb2ludGVyRG93biwgZmFsc2VcbiAgICAgICAgQHJlbmRlcmVyLnZpZXcuYWRkRXZlbnRMaXN0ZW5lciB1cEludGVyYWN0aW9uLCBAb25Qb2ludGVyVXAsIGZhbHNlXG5cbiAgICAgICAgbnVsbFxuXG4gICAgb25SZXNpemUgOiA9PlxuXG4gICAgICAgIEB3ID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgQGggPSB3aW5kb3cuaW5uZXJIZWlnaHRcblxuICAgICAgICBAc2V0RGltcygpXG5cbiAgICAgICAgaWYgQHRpbGVzLmxlbmd0aFxuICAgICAgICAgICAgZm9yIHRpbGUsIGkgaW4gQHRpbGVzXG4gICAgICAgICAgICAgICAgQHN0YWdlLnJlbW92ZUNoaWxkIHRpbGUuY1xuICAgICAgICAgICAgICAgIEB0aWxlc1tpXSA9IG51bGxcbiAgICAgICAgICAgIEB0aWxlcyA9IFtdXG5cbiAgICAgICAgICAgIEBzZXR1cEdyaWQoKVxuXG4gICAgICAgIG51bGxcblxuICAgIHNldERpbXMgOiAtPlxuXG4gICAgICAgIEByZW5kZXJlcj8ucmVzaXplIEB3LCBAaFxuXG4gICAgICAgIG51bGxcblxuICAgIHNldFRoZW1lIDogKGluZGV4PW51bGwpIC0+XG5cbiAgICAgICAgcmV0dXJuIGlmIEB0aGVtZUNoYW5naW5nXG5cbiAgICAgICAgaWYgIWluZGV4XG4gICAgICAgICAgICBpbmRleCA9IGlmIEBhY3RpdmVUaGVtZUluZGV4IGlzIGNvbmZpZy5USEVNRVMubGVuZ3RoLTEgdGhlbiBAYWN0aXZlVGhlbWVJbmRleCA9IDAgZWxzZSBAYWN0aXZlVGhlbWVJbmRleCsxXG5cbiAgICAgICAgQGFjdGl2ZVRoZW1lSW5kZXggPSBpbmRleFxuXG4gICAgICAgIEBzZXROZXdCZyhAcG9pbnRlci5wb3MueCwgQHBvaW50ZXIucG9zLnkpXG5cbiAgICAgICAgQHRoZW1lQ2hhbmdpbmcgPSB0cnVlXG5cbiAgICAgICAgbnVsbFxuXG4gICAgc2V0dXBHcmlkIDogLT5cblxuICAgICAgICBAY29scyA9IE1hdGguY2VpbCBAdyAvIGNvbmZpZy5USUxFX1dJRFRIXG4gICAgICAgIEByb3dzID0gTWF0aC5jZWlsIEBoIC8gY29uZmlnLlRJTEVfV0lEVEhcblxuICAgICAgICB0aWxlQ291bnQgPSBAY29scyAqIEByb3dzXG5cbiAgICAgICAgZm9yIGkgaW4gWzAuLi50aWxlQ291bnRdXG5cbiAgICAgICAgICAgIHggPSAoIGkgJSBAY29scyApICogY29uZmlnLlRJTEVfV0lEVEhcbiAgICAgICAgICAgIHkgPSBNYXRoLmZsb29yKCBpIC8gQGNvbHMgKSAqIGNvbmZpZy5USUxFX1dJRFRIXG5cbiAgICAgICAgICAgIHRpbGUgPSBuZXcgVGlsZSB4OiB4LCB5OiB5LCB3OiBjb25maWcuVElMRV9XSURUSFxuXG4gICAgICAgICAgICBAdGlsZXMucHVzaCB0aWxlXG4gICAgICAgICAgICBAc3RhZ2UuYWRkQ2hpbGQgdGlsZS5jXG5cbiAgICAgICAgbnVsbFxuXG4gICAgdXBkYXRlR3JpZCA6IC0+XG5cbiAgICAgICAgcmV0dXJuIHVubGVzcyBAcG9pbnRlci5wb3NcblxuICAgICAgICBpbmRleGVzID0gQF9nZXRJbmRleGVzKClcbiAgICAgICAgZm9yIGl0ZW0gaW4gaW5kZXhlc1xuXG4gICAgICAgICAgICBAdGlsZXNbaXRlbS5pbmRleF0/LmNoYXJzVG9TaG93ID0gaXRlbS5jaGFyc1xuXG4gICAgICAgICMgaWYgY29uZmlnLlRIRU1FU1tAYWN0aXZlVGhlbWVJbmRleF0ud29yZHMubGVuZ3RoXG5cbiAgICAgICAgIyAgICAgQF9jaGVja0ZvcldvcmRzKClcblxuICAgICAgICBmb3IgdGlsZSwgaSBpbiBAdGlsZXNcblxuICAgICAgICAgICAgdGlsZS51cGRhdGUoKVxuXG4gICAgICAgICAgICBpZiBAdGhlbWVDaGFuZ2luZ1xuICAgICAgICAgICAgICAgIHRpbGUuc2V0QWxwaGFiZXQgQGFjdGl2ZVRoZW1lSW5kZXhcblxuICAgICAgICBudWxsXG5cbiAgICBfZ2V0SW5kZXhlcyA6IC0+XG5cbiAgICAgICAgaW5kZXhlcyA9IFtdXG5cbiAgICAgICAgZm9yIHRpbGUsIGluZGV4IGluIEB0aWxlc1xuXG4gICAgICAgICAgICBpZiBAbWFya2VyLmNpcmNsZS5jb250YWlucyB0aWxlLmNlbnRyZS54LCB0aWxlLmNlbnRyZS55XG5cbiAgICAgICAgICAgICAgICBkaXN0ICA9IGVEaXN0IFtAbWFya2VyLmNpcmNsZS54LCBAbWFya2VyLmNpcmNsZS55XSwgW3RpbGUuY2VudHJlLngsIHRpbGUuY2VudHJlLnldXG4gICAgICAgICAgICAgICAgZGlzdCA9IE1hdGgubWluIGRpc3QsIEBtYXJrZXIuY2lyY2xlLnJhZGl1c1xuXG4gICAgICAgICAgICAgICAgY2hhcnMgPSBjb25maWcuTUFYX0NIQVJTX1RPX1NIT1cgLSBNYXRoLmZsb29yKChkaXN0IC8gQG1hcmtlci5jaXJjbGUucmFkaXVzKSAqIGNvbmZpZy5NQVhfQ0hBUlNfVE9fU0hPVylcbiAgICAgICAgICAgICAgICBjaGFycyArPSBjb25maWcuTUlOX0NIQVJTX1RPX1NIT1dcblxuICAgICAgICAgICAgICAgIGluZGV4ZXMucHVzaCB7IGluZGV4LCBjaGFycyB9XG5cbiAgICAgICAgaW5kZXhlc1xuXG4gICAgIyBfY2hlY2tGb3JXb3JkcyA6IC0+XG5cbiAgICAjICAgICBoQ2hhcnMgPSBbXVxuICAgICMgICAgIGhUaWxlcyA9IFtdXG4gICAgIyAgICAgdkNoYXJzID0gW11cbiAgICAjICAgICB2VGlsZXMgPSBbXVxuXG4gICAgIyAgICAgZm9yIHRpbGUsIGkgaW4gQHRpbGVzXG5cbiAgICAjICAgICAgICAgaENoYXJzLnB1c2ggdGlsZS50LnRleHRcbiAgICAjICAgICAgICAgaFRpbGVzLnB1c2ggdGlsZVxuXG4gICAgIyAgICAgICAgIHZJbmRleCA9IChpICUgQGNvbHMpICogQHJvd3MgKyBNYXRoLmZsb29yKGkgLyBAcm93cylcbiAgICAjICAgICAgICAgdkNoYXJzW3ZJbmRleF0gPSB0aWxlLnQudGV4dFxuICAgICMgICAgICAgICB2VGlsZXNbdkluZGV4XSA9IHRpbGVcblxuICAgICMgICAgIGZvdW5kID0gW11cblxuICAgICMgICAgIGZvciB3b3JkIGluIGNvbmZpZy5USEVNRVNbQGFjdGl2ZVRoZW1lSW5kZXhdLndvcmRzXG5cbiAgICAjICAgICAgICAgTDJSU3RyID0gaENoYXJzLmpvaW4oJycpXG4gICAgIyAgICAgICAgIFIyTFN0ciA9IGhDaGFycy5yZXZlcnNlKCkuam9pbignJylcbiAgICAjICAgICAgICAgVDJCU3RyID0gdkNoYXJzLmpvaW4oJycpXG4gICAgIyAgICAgICAgIEIyVFN0ciA9IHZDaGFycy5yZXZlcnNlKCkuam9pbignJylcblxuICAgICMgICAgICAgICBpZiBMMlJTdHIuaW5kZXhPZih3b3JkKSA+IC0xXG4gICAgIyAgICAgICAgICAgICAjIGNvbnNvbGUubG9nIFwiTC0+UlwiLCBoVGlsZXNbTDJSU3RyLmluZGV4T2Yod29yZCldXG4gICAgIyAgICAgICAgICAgICBpbmRpY2VzID0gQF9nZXRGb3VuZEluZGljZXMgd29yZCwgTDJSU3RyXG4gICAgIyAgICAgICAgICAgICBmb3IgaW5kZXggaW4gaW5kaWNlc1xuICAgICMgICAgICAgICAgICAgICAgIGZvdW5kLnB1c2ggQF9jYXB0dXJlRm91bmRXb3JkIGhUaWxlcywgaW5kZXgsIHdvcmRcblxuICAgICMgICAgICAgICAjIGlmIFIyTFN0ci5pbmRleE9mKHdvcmQpID4gLTFcbiAgICAjICAgICAgICAgICAgICMgY29uc29sZS5sb2cgXCJSLT5MXCIsIGhUaWxlcy5yZXZlcnNlKClbUjJMU3RyLmluZGV4T2Yod29yZCldXG4gICAgIyAgICAgICAgICAgICAjIGluZGljZXMgPSBAX2dldEZvdW5kSW5kaWNlcyB3b3JkLCBSMkxTdHJcbiAgICAjICAgICAgICAgICAgICMgZm9yIGluZGV4IGluIGluZGljZXNcbiAgICAjICAgICAgICAgICAgICMgICAgIGZvdW5kLnB1c2ggQF9jYXB0dXJlRm91bmRXb3JkIGhUaWxlcy5yZXZlcnNlKCksIGluZGV4LCB3b3JkXG5cbiAgICAjICAgICAgICAgaWYgVDJCU3RyLmluZGV4T2Yod29yZCkgPiAtMVxuICAgICMgICAgICAgICAgICAgIyBjb25zb2xlLmxvZyBcIlQtPkJcIiwgdlRpbGVzW1QyQlN0ci5pbmRleE9mKHdvcmQpXVxuICAgICMgICAgICAgICAgICAgaW5kaWNlcyA9IEBfZ2V0Rm91bmRJbmRpY2VzIHdvcmQsIFQyQlN0clxuICAgICMgICAgICAgICAgICAgZm9yIGluZGV4IGluIGluZGljZXNcbiAgICAjICAgICAgICAgICAgICAgICBmb3VuZC5wdXNoIEBfY2FwdHVyZUZvdW5kV29yZCB2VGlsZXMsIGluZGV4LCB3b3JkXG5cbiAgICAjICAgICAgICAgIyBpZiBCMlRTdHIuaW5kZXhPZih3b3JkKSA+IC0xXG4gICAgIyAgICAgICAgICAgICAjIGNvbnNvbGUubG9nIFwiQi0+VFwiLCB2VGlsZXMucmV2ZXJzZSgpW0IyVFN0ci5pbmRleE9mKHdvcmQpXVxuICAgICMgICAgICAgICAgICAgIyBmb3VuZCA9IHRydWVcblxuICAgICMgICAgICAgICAjIGlmIEwyUlN0ci5pbmRleE9mKHdvcmQpID4gLTEgb3IgUjJMU3RyLmluZGV4T2Yod29yZCkgPiAtMSBvciBUMkJTdHIuaW5kZXhPZih3b3JkKSA+IC0xIG9yIEIyVFN0ci5pbmRleE9mKHdvcmQpID4gLTFcbiAgICAjICAgICAgICAgICAgICMgY29uc29sZS5sb2cgd29yZCArICcgOiknXG4gICAgIyAgICAgICAgICAgICAjIGZvdW5kID0gdHJ1ZVxuXG4gICAgIyAgICAgICAgIGZvciBmb3VuZFdvcmQgaW4gZm91bmRcblxuICAgICMgICAgICAgICAgICAgZm9yIGNoYXIgaW4gZm91bmRXb3JkXG5cbiAgICAjICAgICAgICAgICAgICAgICBpZiAhY2hhci5pdGVtLkZPVU5EXG4gICAgIyAgICAgICAgICAgICAgICAgICAgIGNoYXIuaXRlbS5zZXRGb3VuZENoYXIgY2hhci5jaGFyXG5cbiAgICAjICAgICBudWxsXG5cbiAgICAjIF9nZXRGb3VuZEluZGljZXMgOiAoc2VhcmNoU3RyLCBzdHIpIC0+XG5cbiAgICAjICAgICBzdGFydEluZGV4ICAgPSAwXG4gICAgIyAgICAgaW5kaWNlcyAgICAgID0gW11cbiAgICAjICAgICBzZWFyY2hTdHJMZW4gPSBzZWFyY2hTdHIubGVuZ3RoXG5cbiAgICAjICAgICB3aGlsZSAoaW5kZXggPSBzdHIuaW5kZXhPZihzZWFyY2hTdHIsIHN0YXJ0SW5kZXgpKSA+IC0xXG4gICAgIyAgICAgICAgIGluZGljZXMucHVzaChpbmRleClcbiAgICAjICAgICAgICAgc3RhcnRJbmRleCA9IGluZGV4ICsgc2VhcmNoU3RyTGVuXG5cbiAgICAjICAgICBpbmRpY2VzXG5cbiAgICAjIF9jYXB0dXJlRm91bmRXb3JkIDogKGl0ZW1BcnJheSwgaW5kZXgsIHdvcmQpIC0+XG5cbiAgICAjICAgICBmb3VuZFdvcmQgPSBbXVxuXG4gICAgIyAgICAgZm9yIGl0ZW0sIGkgaW4gaXRlbUFycmF5LnNsaWNlIGluZGV4LCBpbmRleCt3b3JkLmxlbmd0aFxuXG4gICAgIyAgICAgICAgIGZvdW5kV29yZC5wdXNoXG4gICAgIyAgICAgICAgICAgICBpdGVtIDogaXRlbVxuICAgICMgICAgICAgICAgICAgY2hhciA6IHdvcmQuY2hhckF0IGlcblxuXG4gICAgIyAgICAgZm91bmRXb3JkXG5cbiAgICBzZXR1cE1hcmtlciA6ID0+XG5cbiAgICAgICAgQG1hcmtlci5wb3MueCA9IEB3LzJcbiAgICAgICAgQG1hcmtlci5wb3MueSA9IEBoLzJcblxuICAgICAgICBAbWFya2VyLmNpcmNsZSA9IG5ldyBQSVhJLkNpcmNsZSBAdy8yLCBAaC8yLCAwXG5cbiAgICAgICAgaWYgQERFQlVHXG4gICAgICAgICAgICBAYWRkU3RhdHMoKVxuXG4gICAgICAgICAgICBAbWFya2VyLmluZGljYXRvciA9IG5ldyBQSVhJLkdyYXBoaWNzXG4gICAgICAgICAgICBAbWFya2VyLmluZGljYXRvci5iZWdpbkZpbGwoMHhmZmZmZmYpXG4gICAgICAgICAgICBAbWFya2VyLmluZGljYXRvci5kcmF3Q2lyY2xlKDAsIDAsIDEwKVxuICAgICAgICAgICAgQHN0YWdlLmFkZENoaWxkIEBtYXJrZXIuaW5kaWNhdG9yXG4gICAgICAgICAgICBAbWFya2VyLmluZGljYXRvci54ID0gQG1hcmtlci5wb3MueFxuICAgICAgICAgICAgQG1hcmtlci5pbmRpY2F0b3IueSA9IEBtYXJrZXIucG9zLnlcblxuICAgICAgICAgICAgQG1hcmtlci5pbmRpY2F0b3IudmlzaWJsZSA9IHRydWVcblxuICAgICAgICBudWxsXG5cbiAgICB1cGRhdGVNYXJrZXIgOiA9PlxuXG4gICAgICAgIHJldHVybiB1bmxlc3MgQHBvaW50ZXIucG9zXG5cbiAgICAgICAgeEQgPSBAcG9pbnRlci5wb3MueCAtIEBtYXJrZXIucG9zLnhcbiAgICAgICAgeUQgPSBAcG9pbnRlci5wb3MueSAtIEBtYXJrZXIucG9zLnlcblxuICAgICAgICBAbWFya2VyLnBvcy54ICs9ICh4RCAqIDAuMSlcbiAgICAgICAgQG1hcmtlci5wb3MueSArPSAoeUQgKiAwLjEpXG5cbiAgICAgICAgQG1hcmtlci5jaXJjbGUueCA9IEBtYXJrZXIucG9zLnhcbiAgICAgICAgQG1hcmtlci5jaXJjbGUueSA9IEBtYXJrZXIucG9zLnlcblxuICAgICAgICBkZWx0YSAgPSBNYXRoLm1heChNYXRoLmFicyhAcG9pbnRlci5kZWx0YS54KSwgTWF0aC5hYnMoQHBvaW50ZXIuZGVsdGEueSkpXG4gICAgICAgIHJhZGl1cyA9ICgoKE1hdGgubWluKChkZWx0YSAvIGNvbmZpZy5NQVhfREVMVEEpKjEwMCwgY29uZmlnLk1BWF9ERUxUQSkpIC8gMTAwKSAqIGNvbmZpZy5NQVhfUkFESVVTKSArIGNvbmZpZy5NSU5fUkFESVVTXG4gICAgICAgIHJhZGl1cyA9IHJhZGl1cyAqIGNvbmZpZy5USEVNRVNbQGFjdGl2ZVRoZW1lSW5kZXhdLnJhZGl1c011bHRpcGxpZXJcblxuICAgICAgICBAbWFya2VyLmNpcmNsZS5yYWRpdXMgPSByYWRpdXNcbiAgICAgICAgQHBvaW50ZXIuZGVsdGEueCAqPSAwLjk4XG4gICAgICAgIEBwb2ludGVyLmRlbHRhLnkgKj0gMC45OFxuXG4gICAgICAgIGlmIEBERUJVR1xuICAgICAgICAgICAgQG1hcmtlci5pbmRpY2F0b3IueCA9IEBtYXJrZXIucG9zLnhcbiAgICAgICAgICAgIEBtYXJrZXIuaW5kaWNhdG9yLnkgPSBAbWFya2VyLnBvcy55XG5cbiAgICAgICAgbnVsbFxuXG4gICAgc2V0dXBCZyA6ID0+XG5cbiAgICAgICAgQGJnID0gbmV3IFBJWEkuR3JhcGhpY3NcbiAgICAgICAgIyBAYmcuYmVnaW5GaWxsIDB4ZmYwMDAwXG4gICAgICAgICMgQGJnLmFscGhhID0gMC4zXG4gICAgICAgICMgQGJnLmRyYXdSZWN0IDAsIDAsIEB3LCBAd1xuXG4gICAgICAgIEBzdGFnZS5hZGRDaGlsZCBAYmdcblxuICAgICAgICBudWxsXG5cbiAgICBzZXROZXdCZyA6IChmcm9tWCwgZnJvbVkpID0+XG5cbiAgICAgICAgc29ydGVkVGlsZXMgPSBAX2dldEJnQ2hhbmdlVGlsZXMoZnJvbVgsIGZyb21ZKVxuXG4gICAgICAgIGZvciB0aWxlIGluIHNvcnRlZFRpbGVzXG5cbiAgICAgICAgICAgIEBiR3NUb0NoYW5nZS5wdXNoKFxuICAgICAgICAgICAgICAgIHggIDogdGlsZS54XG4gICAgICAgICAgICAgICAgeSAgOiB0aWxlLnlcbiAgICAgICAgICAgICAgICB3ICA6IHRpbGUud1xuICAgICAgICAgICAgICAgIGJnIDogY29uZmlnLlRIRU1FU1tAYWN0aXZlVGhlbWVJbmRleF0uYmdcbiAgICAgICAgICAgIClcblxuICAgICAgICBudWxsXG5cbiAgICBfZ2V0QmdDaGFuZ2VUaWxlcyA6IChmcm9tWCwgZnJvbVkpID0+XG5cbiAgICAgICAgY2hhbmdlciA9IEBiZ0NoYW5nZUNvdW50ICUgM1xuXG4gICAgICAgICMgaWYgY2hhbmdlciBpcyAwXG4gICAgICAgICMgICAgIHRpbGVzID0gXy5zb3J0QnkgXy5zaHVmZmxlKEB0aWxlcy5zbGljZSgwKSksICh0aWxlKSA9PiByZXR1cm4gdGlsZS50LmFscGhhXG4gICAgICAgICMgZWxzZSBpZiBjaGFuZ2VyIGlzIDFcbiAgICAgICAgIyAgICAgdGlsZXMgPSBfLnNvcnRCeSBfLnNodWZmbGUoQHRpbGVzLnNsaWNlKDApKSwgKHRpbGUpID0+IHJldHVybiAtMSp0aWxlLnQuYWxwaGFcbiAgICAgICAgaWYgY2hhbmdlciBpcyAwXG4gICAgICAgICAgICB0aWxlcyA9IF8uc2h1ZmZsZShAdGlsZXMuc2xpY2UoMCkpXG4gICAgICAgIGVsc2UgaWYgY2hhbmdlciBpcyAxXG4gICAgICAgICAgICB0aWxlcyA9IF8uc29ydEJ5IEB0aWxlcy5zbGljZSgwKSwgKHRpbGUpID0+IHJldHVybiBlRGlzdCBbZnJvbVgsIGZyb21ZXSwgW3RpbGUuY2VudHJlLngsIHRpbGUuY2VudHJlLnldXG4gICAgICAgIGVsc2UgaWYgY2hhbmdlciBpcyAyXG4gICAgICAgICAgICB0aWxlcyA9IF8uc29ydEJ5IEB0aWxlcy5zbGljZSgwKSwgKHRpbGUpID0+IHJldHVybiAtMSplRGlzdCBbZnJvbVgsIGZyb21ZXSwgW3RpbGUuY2VudHJlLngsIHRpbGUuY2VudHJlLnldXG4gICAgICAgICMgZWxzZSBpZiBjaGFuZ2VyIGlzIDVcbiAgICAgICAgIyAgICAgdGlsZXMgPSBfLnNvcnRCeSBfLnNodWZmbGUoQHRpbGVzLnNsaWNlKDApKSwgKHRpbGUpID0+IHJldHVybiB0aWxlLnQueFxuICAgICAgICAjIGVsc2UgaWYgY2hhbmdlciBpcyA2XG4gICAgICAgICMgICAgIHRpbGVzID0gXy5zb3J0QnkgXy5zaHVmZmxlKEB0aWxlcy5zbGljZSgwKSksICh0aWxlKSA9PiByZXR1cm4gLTEqdGlsZS50LnhcbiAgICAgICAgIyBlbHNlIGlmIGNoYW5nZXIgaXMgN1xuICAgICAgICAjICAgICB0aWxlcyA9IF8uc29ydEJ5IF8uc2h1ZmZsZShAdGlsZXMuc2xpY2UoMCkpLCAodGlsZSkgPT4gcmV0dXJuIHRpbGUudC55XG4gICAgICAgICMgZWxzZSBpZiBjaGFuZ2VyIGlzIDhcbiAgICAgICAgIyAgICAgdGlsZXMgPSBfLnNvcnRCeSBfLnNodWZmbGUoQHRpbGVzLnNsaWNlKDApKSwgKHRpbGUpID0+IHJldHVybiAtMSp0aWxlLnQueVxuXG4gICAgICAgIEBiZ0NoYW5nZUNvdW50KytcblxuICAgICAgICB0aWxlc1xuXG4gICAgdXBkYXRlQmcgOiA9PlxuXG4gICAgICAgIHJldHVybiB1bmxlc3MgQGJHc1RvQ2hhbmdlLmxlbmd0aFxuXG4gICAgICAgIHRvQ2hhbmdlID0gTWF0aC5mbG9vcihAYkdzVG9DaGFuZ2UubGVuZ3RoICogMC4xKVxuXG4gICAgICAgIGlmIHRvQ2hhbmdlIDwgMTBcbiAgICAgICAgICAgIHRvQ2hhbmdlID0gMTBcbiAgICAgICAgICAgIEB0aGVtZUNoYW5naW5nID0gZmFsc2VcblxuICAgICAgICB0aWxlcyAgICAgICAgPSBAYkdzVG9DaGFuZ2Uuc2xpY2UoMCwgdG9DaGFuZ2UpXG4gICAgICAgIEBiR3NUb0NoYW5nZSA9IEBiR3NUb0NoYW5nZS5zbGljZSh0b0NoYW5nZSlcblxuICAgICAgICBmb3IgdGlsZSBpbiB0aWxlc1xuICAgICAgICAgICAgQGJnLmJlZ2luRmlsbCB0aWxlLmJnXG4gICAgICAgICAgICBAYmcuZHJhd1JlY3QgdGlsZS54LCB0aWxlLnksIHRpbGUudywgdGlsZS53XG5cbiAgICAgICAgbnVsbFxuXG4gICAgb25Qb2ludGVyTW92ZSA6IChlLCB4PW51bGwsIHk9bnVsbCkgPT5cblxuICAgICAgICBpZiBlXG5cbiAgICAgICAgICAgIEBoYXNJbnRlcmFjdGVkID0gdHJ1ZVxuXG4gICAgICAgICAgICBpZiAnb250b3VjaHN0YXJ0JyBvZiB3aW5kb3dcbiAgICAgICAgICAgICAgICB4ID0gZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVhcbiAgICAgICAgICAgICAgICB5ID0gZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0ucGFnZVlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB4ID0gZS5wYWdlWFxuICAgICAgICAgICAgICAgIHkgPSBlLnBhZ2VZXG5cbiAgICAgICAgaWYgQHBvaW50ZXIucG9zIHRoZW4gQHBvaW50ZXIubGFzdCA9IHggOiBAcG9pbnRlci5wb3MueCwgeSA6IEBwb2ludGVyLnBvcy55XG5cbiAgICAgICAgQHBvaW50ZXIucG9zICA9IHggOiB4LCB5IDogeVxuXG4gICAgICAgIGlmIEBwb2ludGVyLmxhc3RcbiAgICAgICAgICAgIG5ld0RYID0gQHBvaW50ZXIucG9zLnggLSBAcG9pbnRlci5sYXN0LnhcbiAgICAgICAgICAgIG5ld0RZID0gQHBvaW50ZXIucG9zLnkgLSBAcG9pbnRlci5sYXN0LnlcbiAgICAgICAgICAgIGlmIE1hdGgubWF4KE1hdGguYWJzKG5ld0RYKSwgTWF0aC5hYnMobmV3RFkpKSA+IE1hdGgubWF4KE1hdGguYWJzKEBwb2ludGVyLmRlbHRhLngpLCBNYXRoLmFicyhAcG9pbnRlci5kZWx0YS55KSlcbiAgICAgICAgICAgICAgICBAcG9pbnRlci5kZWx0YSA9IHggOiBAcG9pbnRlci5wb3MueCAtIEBwb2ludGVyLmxhc3QueCwgeSA6IEBwb2ludGVyLnBvcy55IC0gQHBvaW50ZXIubGFzdC55XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHBvaW50ZXIuZGVsdGEueCAqPSAwLjk4XG4gICAgICAgICAgICAgICAgQHBvaW50ZXIuZGVsdGEueSAqPSAwLjk4XG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHBvaW50ZXIuZGVsdGEgPSB4IDogMCwgeSA6IDBcblxuICAgICAgICBjbGVhclRpbWVvdXQgQGlkbGVUaW1lclxuICAgICAgICBAaWRsZVRpbWVyID0gc2V0VGltZW91dCA9PlxuICAgICAgICAgICAgQGhhc0ludGVyYWN0ZWQgPSBmYWxzZVxuICAgICAgICAgICAgQHBsYXlBdXRvQW5pbWF0aW9uKClcbiAgICAgICAgLCAzMDAwXG5cbiAgICAgICAgbnVsbFxuXG4gICAgb25Qb2ludGVyRG93biA6ID0+XG5cbiAgICAgICAgQHBvaW50ZXJEb3duID0gdHJ1ZVxuXG4gICAgICAgIG51bGxcblxuICAgIG9uUG9pbnRlclVwIDogPT5cblxuICAgICAgICBAcG9pbnRlckRvd24gPSBmYWxzZVxuICAgICAgICBAc2V0VGhlbWUoKVxuXG4gICAgICAgIG51bGxcblxuICAgIHBsYXlBdXRvQW5pbWF0aW9uIDogPT5cblxuICAgICAgICByYW5kWCA9IF8ucmFuZG9tKEB3KjAuMDUsIEB3KjAuOTUpXG4gICAgICAgIHJhbmRZID0gXy5yYW5kb20oQGgqMC4wNSwgQGgqMC45NSlcbiAgICAgICAgZGVsYXkgPSBfLnJhbmRvbSgxMDAsIDQwMClcblxuICAgICAgICBAb25Qb2ludGVyTW92ZSBudWxsLCByYW5kWCwgcmFuZFlcblxuICAgICAgICBjaGFuY2UgPSBNYXRoLnJhbmRvbSgpXG5cbiAgICAgICAgaWYgY2hhbmNlIDwgMC4wMlxuICAgICAgICAgICAgQHNldFRoZW1lKClcblxuICAgICAgICBpZiAhQGhhc0ludGVyYWN0ZWRcbiAgICAgICAgICAgIHNldFRpbWVvdXQgQHBsYXlBdXRvQW5pbWF0aW9uLCBkZWxheVxuXG4gICAgICAgIG51bGxcblxuICAgIEVYUCA6IC0+XG5cbiAgICAgICAgcmV0dXJuIHdpbmRvdy5FWFBcblxubW9kdWxlLmV4cG9ydHMgPSBFeHBcbiJdfQ==
