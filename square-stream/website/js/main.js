(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ShapeStream;

ShapeStream = require('./exp/ShapeStream');

$(function() {
  window.SS = new ShapeStream;
  return SS.init();
});



},{"./exp/ShapeStream":2}],2:[function(require,module,exports){
var AbstractShape, NumberUtils, ShapeStream, ShapeStreamConfig, ShapeStreamShapeCache,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

AbstractShape = require('./shapes/AbstractShape');

NumberUtils = require('../utils/NumberUtils');

ShapeStreamConfig = require('./ShapeStreamConfig');

ShapeStreamShapeCache = require('./ShapeStreamShapeCache');

ShapeStream = (function() {
  ShapeStream.prototype.stage = null;

  ShapeStream.prototype.renderer = null;

  ShapeStream.prototype.layers = {};

  ShapeStream.prototype.w = 0;

  ShapeStream.prototype.h = 0;

  ShapeStream.prototype.counter = null;

  ShapeStream.prototype.mouse = {
    enabled: false,
    pos: null
  };

  ShapeStream.prototype.pointerDown = false;

  ShapeStream.prototype.EVENT_KILL_SHAPE = 'EVENT_KILL_SHAPE';

  ShapeStream.prototype.filters = {
    blur: null,
    RGB: null,
    pixel: null
  };

  function ShapeStream() {
    this.onPointerUp = __bind(this.onPointerUp, this);
    this.onPointerDown = __bind(this.onPointerDown, this);
    this.onMouseMove = __bind(this.onMouseMove, this);
    this.onResize = __bind(this.onResize, this);
    this.update = __bind(this.update, this);
    this._getShapeCount = __bind(this._getShapeCount, this);
    this.DEBUG = false;
    this.$window = $(window);
    this.$el = $('#shape-stream');
    this.setup();
    return null;
  }

  ShapeStream.prototype.setup = function() {
    this.onResize();
    this.bindEvents();
    return null;
  };

  ShapeStream.prototype.addGui = function() {
    var i, shape, _i, _len, _ref;
    this.gui = new dat.GUI;
    this.guiFolders = {};
    this.guiFolders.generalFolder = this.gui.addFolder('General');
    this.guiFolders.generalFolder.add(ShapeStreamConfig.general, 'GLOBAL_SPEED', 0.5, 10).name("global speed");
    this.guiFolders.generalFolder.add(ShapeStreamConfig.general, 'GLOBAL_ALPHA', 0, 1).name("global alpha");
    this.guiFolders.sizeFolder = this.gui.addFolder('Size');
    this.guiFolders.sizeFolder.add(ShapeStreamConfig.shapes, 'MIN_WIDTH', 5, 200).name('min width');
    this.guiFolders.sizeFolder.add(ShapeStreamConfig.shapes, 'MAX_WIDTH', 5, 200).name('max width');
    this.guiFolders.countFolder = this.gui.addFolder('Count');
    this.guiFolders.countFolder.add(ShapeStreamConfig.general, 'MAX_SHAPE_COUNT', 5, 1000).name('max shapes');
    this.guiFolders.shapesFolder = this.gui.addFolder('Shapes');
    _ref = ShapeStreamConfig.shapeTypes;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      shape = _ref[i];
      this.guiFolders.shapesFolder.add(ShapeStreamConfig.shapeTypes[i], 'active').name(shape.type);
    }
    this.guiFolders.blurFolder = this.gui.addFolder('Blur');
    this.guiFolders.blurFolder.add(ShapeStreamConfig.filters, 'blur').name("enable");
    this.guiFolders.blurFolder.add(this.filters.blur, 'blur', 0, 32).name("blur amount");
    this.guiFolders.RGBFolder = this.gui.addFolder('RGB Split');
    this.guiFolders.RGBFolder.add(ShapeStreamConfig.filters, 'RGB').name("enable");
    this.guiFolders.RGBFolder.add(this.filters.RGB.uniforms.red.value, 'x', -20, 20).name("red x");
    this.guiFolders.RGBFolder.add(this.filters.RGB.uniforms.red.value, 'y', -20, 20).name("red y");
    this.guiFolders.RGBFolder.add(this.filters.RGB.uniforms.green.value, 'x', -20, 20).name("green x");
    this.guiFolders.RGBFolder.add(this.filters.RGB.uniforms.green.value, 'y', -20, 20).name("green y");
    this.guiFolders.RGBFolder.add(this.filters.RGB.uniforms.blue.value, 'x', -20, 20).name("blue x");
    this.guiFolders.RGBFolder.add(this.filters.RGB.uniforms.blue.value, 'y', -20, 20).name("blue y");
    this.guiFolders.pixelateFolder = this.gui.addFolder('Pixellate');
    this.guiFolders.pixelateFolder.add(ShapeStreamConfig.filters, 'pixel').name("enable");
    this.guiFolders.pixelateFolder.add(this.filters.pixel.size, 'x', 1, 32).name("pixel size x");
    this.guiFolders.pixelateFolder.add(this.filters.pixel.size, 'y', 1, 32).name("pixel size y");
    this.guiFolders.paletteFolder = this.gui.addFolder('Colour palette');
    this.guiFolders.paletteFolder.add(ShapeStreamConfig, 'activePalette', ShapeStreamConfig.palettes).name("palette");
    return null;
  };

  ShapeStream.prototype.addStats = function() {
    this.stats = new Stats;
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.top = '0px';
    document.body.appendChild(this.stats.domElement);
    return null;
  };

  ShapeStream.prototype.addShapeCounter = function() {
    this.shapeCounter = document.createElement('div');
    this.shapeCounter.style.position = 'absolute';
    this.shapeCounter.style.left = '100px';
    this.shapeCounter.style.top = '15px';
    this.shapeCounter.style.color = '#fff';
    this.shapeCounter.style.textTransform = 'uppercase';
    this.shapeCounter.innerHTML = "0 shapes";
    document.body.appendChild(this.shapeCounter);
    return null;
  };

  ShapeStream.prototype.updateShapeCounter = function() {
    this.shapeCounter.innerHTML = "" + (this._getShapeCount()) + " shapes";
    return null;
  };

  ShapeStream.prototype.createStageFilters = function() {
    this.filters.RGB = new PIXI.RGBSplitFilter;
    this.filters.RGB.uniforms.red.value = ShapeStreamConfig.filterDefaults.RGB.red;
    this.filters.RGB.uniforms.green.value = ShapeStreamConfig.filterDefaults.RGB.green;
    this.filters.RGB.uniforms.blue.value = ShapeStreamConfig.filterDefaults.RGB.blue;
    return null;
  };

  ShapeStream.prototype.init = function() {
    PIXI.dontSayHello = true;
    this.setDims();
    this.setStreamDirection();
    this.shapes = [];
    this.stage = new PIXI.Stage(0x111111);
    this.renderer = PIXI.autoDetectRenderer(this.w, this.h, {
      antialias: true
    });
    this.render();
    ShapeStreamShapeCache.createCache();
    this.container = new PIXI.DisplayObjectContainer;
    this.stage.addChild(this.container);
    this.createStageFilters();
    if (this.DEBUG) {
      this.addGui();
      this.addStats();
      this.addShapeCounter();
    }
    this.$el.append(this.renderer.view);
    this.draw();
    return null;
  };

  ShapeStream.prototype.draw = function() {
    this.counter = 0;
    this.setDims();
    this.addShapes(ShapeStreamConfig.general.INITIAL_SHAPE_COUNT);
    this.update();
    return null;
  };

  ShapeStream.prototype.addShapes = function(count) {
    var i, shape, _i;
    for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
      shape = new AbstractShape(this);
      shape.setProps(true);
      this._positionShape(shape);
      this.container.addChild(shape.getSprite());
      this.shapes.push(shape);
    }
    return null;
  };

  ShapeStream.prototype._positionShape = function(shape) {
    var pos, sprite;
    pos = this._getShapeStartPos();
    sprite = shape.getSprite();
    sprite.position.x = sprite._position.x = pos.x;
    sprite.position.y = sprite._position.y = pos.y;
    return null;
  };

  ShapeStream.prototype._getShapeStartPos = function() {
    var h, seed, w, x, y;
    seed = Math.random();
    if (seed > 0.5) {
      w = seed > 0.7 ? this.w5 * 4 : this.w3 * 2;
      x = NumberUtils.getRandomFloat(w, this.w);
      y = -ShapeStreamConfig.shapes.MAX_WIDTH;
    } else {
      h = seed > 0.2 ? this.h5 : this.h3;
      x = this.w + ShapeStreamConfig.shapes.MAX_WIDTH;
      y = NumberUtils.getRandomFloat(-ShapeStreamConfig.shapes.MAX_WIDTH, h);
    }
    return {
      x: x,
      y: y
    };
  };

  ShapeStream.prototype._getShapeCount = function() {
    return this.container.children.length;
  };

  ShapeStream.prototype.onShapeDie = function(shape) {
    if (this._getShapeCount() > ShapeStreamConfig.general.MAX_SHAPE_COUNT) {
      this.removeShape(shape);
    } else {
      this.resetShape(shape);
    }
    return null;
  };

  ShapeStream.prototype.resetShape = function(shape) {
    shape.reset();
    this._positionShape(shape);
    return null;
  };

  ShapeStream.prototype.removeShape = function(shape) {
    var index;
    index = this.shapes.indexOf(shape);
    this.shapes[index] = null;
    this.container.removeChild(shape.getSprite());
    return null;
  };

  ShapeStream.prototype.update = function() {
    var enabled, filter, filtersToApply, _ref;
    if (window.STOP) {
      return requestAnimFrame(this.update);
    }
    if (this.DEBUG) {
      this.stats.begin();
    }
    this.counter++;
    if (this._getShapeCount() < ShapeStreamConfig.general.MAX_SHAPE_COUNT) {
      this.addShapes(1);
    }
    this.updateShapes();
    this.render();
    filtersToApply = [];
    _ref = ShapeStreamConfig.filters;
    for (filter in _ref) {
      enabled = _ref[filter];
      if (enabled) {
        filtersToApply.push(this.filters[filter]);
      }
    }
    this.stage.filters = filtersToApply.length ? filtersToApply : null;
    this.updateSpeedAndAlpha();
    requestAnimFrame(this.update);
    if (this.DEBUG) {
      this.updateShapeCounter();
      this.stats.end();
    }
    return null;
  };

  ShapeStream.prototype.updateShapes = function() {
    var shape, _i, _len, _ref;
    _ref = this.shapes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      shape = _ref[_i];
      if (shape != null) {
        shape.callAnimate();
      }
    }
    return null;
  };

  ShapeStream.prototype.updateSpeedAndAlpha = function() {
    if (this.pointerDown) {
      if (ShapeStreamConfig.general.GLOBAL_SPEED < ShapeStreamConfig.general.MAX_GLOBAL_SPEED) {
        ShapeStreamConfig.general.GLOBAL_SPEED += ShapeStreamConfig.general.GLOBAL_SPEED_INC_RATE;
      }
      if (ShapeStreamConfig.general.GLOBAL_ALPHA < ShapeStreamConfig.general.MAX_GLOBAL_ALPHA) {
        ShapeStreamConfig.general.GLOBAL_ALPHA += ShapeStreamConfig.general.GLOBAL_ALPHA_INC_RATE;
      }
    } else {
      if (ShapeStreamConfig.general.GLOBAL_SPEED > ShapeStreamConfig.general.MIN_GLOBAL_SPEED) {
        ShapeStreamConfig.general.GLOBAL_SPEED -= ShapeStreamConfig.general.GLOBAL_SPEED_DEC_RATE;
      }
      if (ShapeStreamConfig.general.GLOBAL_ALPHA > ShapeStreamConfig.general.MIN_GLOBAL_ALPHA) {
        ShapeStreamConfig.general.GLOBAL_ALPHA -= ShapeStreamConfig.general.GLOBAL_ALPHA_DEC_RATE;
      }
    }
    return null;
  };

  ShapeStream.prototype.render = function() {
    this.renderer.render(this.stage);
    return null;
  };

  ShapeStream.prototype.bindEvents = function() {
    var downInteraction, upInteraction;
    downInteraction = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
    upInteraction = 'ontouchstart' in window ? 'touchend' : 'mouseup';
    this.onResize = _.debounce(this.onResize, 300);
    this.$window.on('resize orientationchange', this.onResize);
    this.$window.on('mousemove', this.onMouseMove);
    this.$el.on(downInteraction, this.onPointerDown);
    this.$el.on(upInteraction, this.onPointerUp);
    return null;
  };

  ShapeStream.prototype.onResize = function() {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.setDims();
    return null;
  };

  ShapeStream.prototype.setDims = function() {
    var _ref;
    this.w3 = this.w / 3;
    this.h3 = this.h / 3;
    this.w5 = this.w / 5;
    this.h5 = this.h / 5;
    this.setStreamDirection();
    if ((_ref = this.renderer) != null) {
      _ref.resize(this.w, this.h);
    }
    return null;
  };

  ShapeStream.prototype.onMouseMove = function(e) {
    var max, min;
    this.mouse.multiplier = 1;
    this.mouse.pos = {
      x: e.pageX,
      y: e.pageY
    };
    this.mouse.enabled = true;
    if (ShapeStreamConfig.filters.RGB) {
      min = ShapeStreamConfig.filterDefaults.RGB.red.MIN;
      max = ShapeStreamConfig.filterDefaults.RGB.red.MAX;
      ShapeStreamConfig.filterDefaults.RGB.red.x = NumberUtils.map(this.mouse.pos.x, 0, this.w, min, max);
      ShapeStreamConfig.filterDefaults.RGB.red.y = NumberUtils.map(this.mouse.pos.y, 0, this.h, min, max);
    }
    return null;
  };

  ShapeStream.prototype.setStreamDirection = function() {
    var x, y;
    if (this.w > this.h) {
      x = 1;
      y = this.h / this.w;
    } else {
      y = 1;
      x = this.w / this.h;
    }
    ShapeStreamConfig.general.DIRECTION_RATIO = {
      x: x,
      y: y
    };
    return null;
  };

  ShapeStream.prototype.onPointerDown = function() {
    this.pointerDown = true;
    return null;
  };

  ShapeStream.prototype.onPointerUp = function() {
    this.pointerDown = false;
    ShapeStreamConfig.setNextPalette();
    return null;
  };

  ShapeStream.prototype.SS = function() {
    return window.SS;
  };

  return ShapeStream;

})();

module.exports = ShapeStream;



},{"../utils/NumberUtils":6,"./ShapeStreamConfig":3,"./ShapeStreamShapeCache":4,"./shapes/AbstractShape":5}],3:[function(require,module,exports){
var ShapeStreamConfig;

ShapeStreamConfig = (function() {
  function ShapeStreamConfig() {}

  ShapeStreamConfig.colors = {
    FLAT: ['19B698', '2CC36B', '2E8ECE', '9B50BA', 'E98B39', 'EA6153', 'F2CA27'],
    BW: ['E8E8E8', 'D1D1D1', 'B9B9B9', 'A3A3A3', '8C8C8C', '767676', '5E5E5E'],
    RED: ['AA3939', 'D46A6A', 'FFAAAA', '801515', '550000'],
    BLUE: ['9FD4F6', '6EBCEF', '48A9E8', '2495DE', '0981CF'],
    GREEN: ['9FF4C1', '6DE99F', '46DD83', '25D06A', '00C24F'],
    YELLOW: ['FFEF8F', 'FFE964', 'FFE441', 'F3D310', 'B8A006']
  };

  ShapeStreamConfig.palettes = {
    'flat': 'FLAT',
    'b&w': 'BW',
    'red': 'RED',
    'blue': 'BLUE',
    'green': 'GREEN',
    'yellow': 'YELLOW'
  };

  ShapeStreamConfig.palettesArray = ['FLAT', 'BW', 'RED', 'BLUE', 'GREEN', 'YELLOW'];

  ShapeStreamConfig.activePalette = 'BW';

  ShapeStreamConfig.shapeTypes = [
    {
      type: 'Circle',
      active: false
    }, {
      type: 'Square',
      active: true
    }, {
      type: 'Triangle',
      active: false
    }
  ];

  ShapeStreamConfig.shapeTypesArray = ['Circle', 'Square', 'Triangle'];

  ShapeStreamConfig.activeShape = 'Square';

  ShapeStreamConfig.shapes = {
    MIN_WIDTH_PERC: 3,
    MAX_WIDTH_PERC: 7,
    MIN_WIDTH: 30,
    MAX_WIDTH: 70,
    MIN_SPEED_MOVE: 2,
    MAX_SPEED_MOVE: 3.5,
    MIN_SPEED_ROTATE: -0.01,
    MAX_SPEED_ROTATE: 0.01,
    MIN_ALPHA: 1,
    MAX_ALPHA: 1,
    MIN_BLUR: 0,
    MAX_BLUR: 10
  };

  ShapeStreamConfig.general = {
    GLOBAL_SPEED: 8,
    MIN_GLOBAL_SPEED: 4,
    MAX_GLOBAL_SPEED: 9,
    GLOBAL_SPEED_INC_RATE: 0.1,
    GLOBAL_SPEED_DEC_RATE: 0.03,
    GLOBAL_ALPHA: 0.75,
    MIN_GLOBAL_ALPHA: 0.75,
    MAX_GLOBAL_ALPHA: 1,
    GLOBAL_ALPHA_INC_RATE: 0.005,
    GLOBAL_ALPHA_DEC_RATE: 0.001,
    MAX_SHAPE_COUNT: 300,
    INITIAL_SHAPE_COUNT: 1,
    DIRECTION_RATIO: {
      x: 1,
      y: 1
    }
  };

  ShapeStreamConfig.layers = {
    BACKGROUND: 'BACKGROUND',
    MIDGROUND: 'MIDGROUND',
    FOREGROUND: 'FOREGROUND'
  };

  ShapeStreamConfig.filters = {
    blur: false,
    RGB: true,
    pixel: false
  };

  ShapeStreamConfig.filterDefaults = {
    blur: {
      general: 10,
      foreground: 0,
      midground: 0,
      background: 0
    },
    RGB: {
      red: {
        x: 2,
        y: 2,
        MIN: -5,
        MAX: 5
      },
      green: {
        x: -2,
        y: 2
      },
      blue: {
        x: 2,
        y: -2
      }
    },
    pixel: {
      amount: {
        x: 4,
        y: 4
      }
    }
  };

  ShapeStreamConfig.interaction = {
    MOUSE_RADIUS: 800,
    DISPLACEMENT_MAX_INC: 0.2,
    DISPLACEMENT_DECAY: 0.01
  };

  ShapeStreamConfig.getRandomColor = function() {
    return this.colors[this.activePalette][_.random(0, this.colors[this.activePalette].length - 1)];
  };

  ShapeStreamConfig.getRandomShape = function() {
    var activeShapes;
    activeShapes = _.filter(this.shapeTypes, function(s) {
      return s.active;
    });
    return activeShapes[_.random(0, activeShapes.length - 1)].type;
  };

  ShapeStreamConfig._setNextPalette = function() {
    var idx;
    idx = this.palettesArray.indexOf(this.activePalette);
    idx = idx === this.palettesArray.length - 1 ? 0 : idx + 1;
    this.activePalette = this.palettesArray[idx];
    return null;
  };

  ShapeStreamConfig.setNextPalette = _.debounce(ShapeStreamConfig._setNextPalette, 300);

  ShapeStreamConfig.setNextShape = function() {
    var idx;
    idx = this.shapeTypesArray.indexOf(this.activeShape);
    idx = idx === this.shapeTypesArray.length - 1 ? 0 : idx + 1;
    this.activeShape = this.shapeTypesArray[idx];
    return null;
  };

  return ShapeStreamConfig;

})();

window.ShapeStreamConfig = ShapeStreamConfig;

module.exports = ShapeStreamConfig;



},{}],4:[function(require,module,exports){
var AbstractShape, ShapeStreamConfig, ShapeStreamShapeCache;

ShapeStreamConfig = require('./ShapeStreamConfig');

AbstractShape = require('./shapes/AbstractShape');

ShapeStreamShapeCache = (function() {
  function ShapeStreamShapeCache() {}

  ShapeStreamShapeCache.shapes = {};

  ShapeStreamShapeCache.triangleRatio = Math.cos(Math.PI / 6);

  ShapeStreamShapeCache.createCache = function() {
    var color, colors, palette, paletteColors, shape, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    _ref = ShapeStreamConfig.shapeTypes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      shape = _ref[_i];
      this.shapes[shape.type] = {};
    }
    _ref1 = ShapeStreamConfig.colors;
    for (palette in _ref1) {
      paletteColors = _ref1[palette];
      for (_j = 0, _len1 = paletteColors.length; _j < _len1; _j++) {
        color = paletteColors[_j];
        _ref2 = this.shapes;
        for (shape in _ref2) {
          colors = _ref2[shape];
          this.shapes[shape][color] = new PIXI.Texture.fromImage(this._createShape(shape, color));
        }
      }
    }
    return null;
  };

  ShapeStreamShapeCache._createShape = function(shape, color) {
    var c, ctx, height;
    height = this._getHeight(shape, ShapeStreamConfig.shapes.MAX_WIDTH);
    c = document.createElement('canvas');
    c.width = ShapeStreamConfig.shapes.MAX_WIDTH;
    c.height = height;
    ctx = c.getContext('2d');
    ctx.fillStyle = '#' + color;
    ctx.beginPath();
    this["_draw" + shape](ctx, height);
    ctx.closePath();
    ctx.fill();
    return c.toDataURL();
  };

  ShapeStreamShapeCache._drawSquare = function(ctx, height) {
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.lineTo(ShapeStreamConfig.shapes.MAX_WIDTH, height);
    ctx.lineTo(ShapeStreamConfig.shapes.MAX_WIDTH, 0);
    ctx.lineTo(0, 0);
    return null;
  };

  ShapeStreamShapeCache._drawTriangle = function(ctx, height) {
    ctx.moveTo(ShapeStreamConfig.shapes.MAX_WIDTH / 2, 0);
    ctx.lineTo(0, height);
    ctx.lineTo(ShapeStreamConfig.shapes.MAX_WIDTH, height);
    ctx.lineTo(ShapeStreamConfig.shapes.MAX_WIDTH / 2, 0);
    return null;
  };

  ShapeStreamShapeCache._drawCircle = function(ctx) {
    var halfWidth;
    halfWidth = ShapeStreamConfig.shapes.MAX_WIDTH / 2;
    ctx.arc(halfWidth, halfWidth, halfWidth, 0, 2 * Math.PI);
    return null;
  };

  ShapeStreamShapeCache._getHeight = function(shape, width) {
    var height;
    height = (function() {
      switch (true) {
        case shape === 'Triangle':
          return width * this.triangleRatio;
        default:
          return width;
      }
    }).call(ShapeStreamShapeCache);
    return height;
  };

  return ShapeStreamShapeCache;

})();

module.exports = ShapeStreamShapeCache;



},{"./ShapeStreamConfig":3,"./shapes/AbstractShape":5}],5:[function(require,module,exports){
var AbstractShape, NumberUtils, ShapeStreamConfig, ShapeStreamShapeCache;

ShapeStreamConfig = require('../ShapeStreamConfig');

ShapeStreamShapeCache = require('../ShapeStreamShapeCache');

NumberUtils = require('../../utils/NumberUtils');

AbstractShape = (function() {
  function AbstractShape() {}

  AbstractShape.prototype.s = null;

  AbstractShape.prototype._shape = null;

  AbstractShape.prototype._color = null;

  AbstractShape.prototype.width = null;

  AbstractShape.prototype.speedMove = null;

  AbstractShape.prototype.speedRotate = null;

  AbstractShape.prototype.alphaValue = null;

  AbstractShape.prototype.dead = false;

  AbstractShape.prototype.displacement = 0;

  AbstractShape.triangleRatio = Math.cos(Math.PI / 6);

  AbstractShape.prototype.setProps = function(firstInit) {
    if (firstInit == null) {
      firstInit = false;
    }
    this._shape = ShapeStreamConfig.activeShape;
    this._color = ShapeStreamConfig.getRandomColor();
    this.width = this._getWidth();
    this.height = this._getHeight(this._shape, this.width);
    this.speedMove = this._getSpeedMove();
    this.speedRotate = this._getSpeedRotate();
    this.alphaValue = this._getAlphaValue();
    if (firstInit) {
      this.s = new PIXI.Sprite(ShapeStreamShapeCache.shapes[this._shape][this._color]);
    } else {
      this.s.setTexture(ShapeStreamShapeCache.shapes[this._shape][this._color]);
    }
    this.s.width = this.width;
    this.s.height = this.height;
    this.s.blendMode = PIXI.blendModes.ADD;
    this.s.alpha = this.alphaValue;
    this.s.anchor.x = this.s.anchor.y = 0.5;
    this.s._position = {
      x: 0,
      y: 0
    };
    return null;
  };

  AbstractShape.prototype.reset = function() {
    this.setProps();
    this.dead = false;
    return null;
  };

  AbstractShape.prototype._getWidth = function() {
    return NumberUtils.getRandomFloat(ShapeStreamConfig.shapes.MIN_WIDTH, ShapeStreamConfig.shapes.MAX_WIDTH);
  };

  AbstractShape.prototype._getHeight = function(shape, width) {
    var height;
    height = (function() {
      switch (true) {
        case shape === 'Triangle':
          return width * AbstractShape.triangleRatio;
        default:
          return width;
      }
    })();
    return height;
  };

  AbstractShape.prototype._getSpeedMove = function() {
    return NumberUtils.getRandomFloat(ShapeStreamConfig.shapes.MIN_SPEED_MOVE, ShapeStreamConfig.shapes.MAX_SPEED_MOVE);
  };

  AbstractShape.prototype._getSpeedRotate = function() {
    return NumberUtils.getRandomFloat(ShapeStreamConfig.shapes.MIN_SPEED_ROTATE, ShapeStreamConfig.shapes.MAX_SPEED_ROTATE);
  };

  AbstractShape.prototype._getAlphaValue = function() {
    var alpha, range;
    range = ShapeStreamConfig.shapes.MAX_ALPHA - ShapeStreamConfig.shapes.MIN_ALPHA;
    alpha = ((this.width / ShapeStreamConfig.shapes.MAX_WIDTH) * range) + ShapeStreamConfig.shapes.MIN_ALPHA;
    return alpha;
  };

  AbstractShape.prototype._getDisplacement = function(axis) {
    var dist, strength, value;
    if (!this.SS().mouse.enabled) {
      return 0;
    }
    dist = this.SS().mouse.pos[axis] - this.s.position[axis];
    dist = dist < 0 ? -dist : dist;
    if (dist < ShapeStreamConfig.interaction.MOUSE_RADIUS) {
      strength = (ShapeStreamConfig.interaction.MOUSE_RADIUS - dist) / ShapeStreamConfig.interaction.MOUSE_RADIUS;
      value = ShapeStreamConfig.interaction.DISPLACEMENT_MAX_INC * ShapeStreamConfig.general.GLOBAL_SPEED * strength;
      this.displacement = this.s.position[axis] > this.SS().mouse.pos[axis] ? this.displacement - value : this.displacement + value;
    }
    if (this.displacement !== 0) {
      if (this.displacement > 0) {
        this.displacement -= ShapeStreamConfig.interaction.DISPLACEMENT_DECAY;
        this.displacement = this.displacement < 0 ? 0 : this.displacement;
      } else {
        this.displacement += ShapeStreamConfig.interaction.DISPLACEMENT_DECAY;
        this.displacement = this.displacement > 0 ? 0 : this.displacement;
      }
    }
    return this.displacement;
  };

  AbstractShape.prototype.callAnimate = function() {
    if (!!this.dead) {
      return;
    }
    this.s.alpha = this.alphaValue * ShapeStreamConfig.general.GLOBAL_ALPHA;
    this.s._position.x -= (this.speedMove * ShapeStreamConfig.general.GLOBAL_SPEED) * ShapeStreamConfig.general.DIRECTION_RATIO.x;
    this.s._position.y += (this.speedMove * ShapeStreamConfig.general.GLOBAL_SPEED) * ShapeStreamConfig.general.DIRECTION_RATIO.y;
    this.s.position.x = this.s._position.x + this._getDisplacement('x');
    this.s.position.y = this.s._position.y + this._getDisplacement('y');
    this.s.rotation += this.speedRotate * ShapeStreamConfig.general.GLOBAL_SPEED;
    if ((this.s.position.x + (this.width / 2) < 0) || (this.s.position.y - (this.width / 2) > this.SS().h)) {
      this.kill();
    }
    return null;
  };

  AbstractShape.prototype.kill = function() {
    this.dead = true;
    return this.SS().onShapeDie(this);
  };

  AbstractShape.prototype.getSprite = function() {
    return this.s;
  };

  AbstractShape.prototype.SS = function() {
    return window.SS;
  };

  return AbstractShape;

})();

module.exports = AbstractShape;



},{"../../utils/NumberUtils":6,"../ShapeStreamConfig":3,"../ShapeStreamShapeCache":4}],6:[function(require,module,exports){
var NumberUtils;

NumberUtils = (function() {
  function NumberUtils() {}

  NumberUtils.MATH_COS = Math.cos;

  NumberUtils.MATH_SIN = Math.sin;

  NumberUtils.MATH_RANDOM = Math.random;

  NumberUtils.MATH_ABS = Math.abs;

  NumberUtils.MATH_ATAN2 = Math.atan2;

  NumberUtils.limit = function(number, min, max) {
    return Math.min(Math.max(min, number), max);
  };

  NumberUtils.map = function(num, min1, max1, min2, max2, round, constrainMin, constrainMax) {
    var num1, num2;
    if (round == null) {
      round = false;
    }
    if (constrainMin == null) {
      constrainMin = true;
    }
    if (constrainMax == null) {
      constrainMax = true;
    }
    if (constrainMin && num < min1) {
      return min2;
    }
    if (constrainMax && num > max1) {
      return max2;
    }
    num1 = (num - min1) / (max1 - min1);
    num2 = (num1 * (max2 - min2)) + min2;
    if (round) {
      return Math.round(num2);
    }
    return num2;
  };

  NumberUtils.getRandomColor = function() {
    var color, i, letters, _i;
    letters = '0123456789ABCDEF'.split('');
    color = '#';
    for (i = _i = 0; _i < 6; i = ++_i) {
      color += letters[Math.round(Math.random() * 15)];
    }
    return color;
  };

  NumberUtils.getRandomFloat = function(min, max) {
    return Math.random() * (max - min) + min;
  };

  NumberUtils.getTimeStampDiff = function(date1, date2) {
    var date1_ms, date2_ms, difference_ms, one_day, time;
    one_day = 1000 * 60 * 60 * 24;
    time = {};
    date1_ms = date1.getTime();
    date2_ms = date2.getTime();
    difference_ms = date2_ms - date1_ms;
    difference_ms = difference_ms / 1000;
    time.seconds = Math.floor(difference_ms % 60);
    difference_ms = difference_ms / 60;
    time.minutes = Math.floor(difference_ms % 60);
    difference_ms = difference_ms / 60;
    time.hours = Math.floor(difference_ms % 24);
    time.days = Math.floor(difference_ms / 24);
    return time;
  };

  NumberUtils.map = function(num, min1, max1, min2, max2, round, constrainMin, constrainMax) {
    var num1, num2;
    if (round == null) {
      round = false;
    }
    if (constrainMin == null) {
      constrainMin = true;
    }
    if (constrainMax == null) {
      constrainMax = true;
    }
    if (constrainMin && num < min1) {
      return min2;
    }
    if (constrainMax && num > max1) {
      return max2;
    }
    num1 = (num - min1) / (max1 - min1);
    num2 = (num1 * (max2 - min2)) + min2;
    if (round) {
      return Math.round(num2);
    }
    return num2;
  };

  NumberUtils.toRadians = function(degree) {
    return degree * (Math.PI / 180);
  };

  NumberUtils.toDegree = function(radians) {
    return radians * (180 / Math.PI);
  };

  NumberUtils.isInRange = function(num, min, max, canBeEqual) {
    if (canBeEqual) {
      return num >= min && num <= max;
    } else {
      return num >= min && num <= max;
    }
  };

  NumberUtils.getNiceDistance = function(metres) {
    var km;
    if (metres < 1000) {
      return "" + (Math.round(metres)) + "M";
    } else {
      km = (metres / 1000).toFixed(2);
      return "" + km + "KM";
    }
  };

  NumberUtils.shuffle = function(o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);;
    return o;
  };

  NumberUtils.randomRange = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  return NumberUtils;

})();

module.exports = NumberUtils;

window.NumberUtils = NumberUtils;



},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbmVpbGNhcnBlbnRlci9TaXRlcy9kb29kbGVzL3NxdWFyZS1zdHJlYW0vcHJvamVjdC9jb2ZmZWUvTWFpbi5jb2ZmZWUiLCIvVXNlcnMvbmVpbGNhcnBlbnRlci9TaXRlcy9kb29kbGVzL3NxdWFyZS1zdHJlYW0vcHJvamVjdC9jb2ZmZWUvZXhwL1NoYXBlU3RyZWFtLmNvZmZlZSIsIi9Vc2Vycy9uZWlsY2FycGVudGVyL1NpdGVzL2Rvb2RsZXMvc3F1YXJlLXN0cmVhbS9wcm9qZWN0L2NvZmZlZS9leHAvU2hhcGVTdHJlYW1Db25maWcuY29mZmVlIiwiL1VzZXJzL25laWxjYXJwZW50ZXIvU2l0ZXMvZG9vZGxlcy9zcXVhcmUtc3RyZWFtL3Byb2plY3QvY29mZmVlL2V4cC9TaGFwZVN0cmVhbVNoYXBlQ2FjaGUuY29mZmVlIiwiL1VzZXJzL25laWxjYXJwZW50ZXIvU2l0ZXMvZG9vZGxlcy9zcXVhcmUtc3RyZWFtL3Byb2plY3QvY29mZmVlL2V4cC9zaGFwZXMvQWJzdHJhY3RTaGFwZS5jb2ZmZWUiLCIvVXNlcnMvbmVpbGNhcnBlbnRlci9TaXRlcy9kb29kbGVzL3NxdWFyZS1zdHJlYW0vcHJvamVjdC9jb2ZmZWUvdXRpbHMvTnVtYmVyVXRpbHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxXQUFBOztBQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsbUJBQVIsQ0FBZCxDQUFBOztBQUFBLENBQ0EsQ0FBRSxTQUFBLEdBQUE7QUFDRCxFQUFBLE1BQU0sQ0FBQyxFQUFQLEdBQVksR0FBQSxDQUFBLFdBQVosQ0FBQTtTQUNBLEVBQUUsQ0FBQyxJQUFILENBQUEsRUFGQztBQUFBLENBQUYsQ0FEQSxDQUFBOzs7OztBQ0FBLElBQUEsaUZBQUE7RUFBQSxrRkFBQTs7QUFBQSxhQUFBLEdBQXdCLE9B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S0FBQSxNQUFBO0FBTUksTUFBQSxFQUFBLEdBQUssQ0FBQyxNQUFBLEdBQU8sSUFBUixDQUFhLENBQUMsT0FBZCxDQUFzQixDQUF0QixDQUFMLENBQUE7QUFDQSxhQUFPLEVBQUEsR0FBRyxFQUFILEdBQU0sSUFBYixDQVBKO0tBRmM7RUFBQSxDQS9FbEIsQ0FBQTs7QUFBQSxFQTBGQSxXQUFDLENBQUEsT0FBRCxHQUFXLFNBQUMsQ0FBRCxHQUFBO0FBQ1AsSUFBQSxxR0FBQSxDQUFBO0FBQ0EsV0FBTyxDQUFQLENBRk87RUFBQSxDQTFGWCxDQUFBOztBQUFBLEVBOEZBLFdBQUMsQ0FBQSxXQUFELEdBQWUsU0FBQyxHQUFELEVBQUssR0FBTCxHQUFBO0FBQ1gsV0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFjLENBQUMsR0FBQSxHQUFJLEdBQUosR0FBUSxDQUFULENBQWQsR0FBMEIsR0FBckMsQ0FBUCxDQURXO0VBQUEsQ0E5RmYsQ0FBQTs7cUJBQUE7O0lBRkosQ0FBQTs7QUFBQSxNQW1HTSxDQUFDLE9BQVAsR0FBaUIsV0FuR2pCLENBQUE7O0FBQUEsTUFvR00sQ0FBQyxXQUFQLEdBQXFCLFdBcEdyQixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlNoYXBlU3RyZWFtID0gcmVxdWlyZSAnLi9leHAvU2hhcGVTdHJlYW0nXG4kIC0+XG5cdHdpbmRvdy5TUyA9IG5ldyBTaGFwZVN0cmVhbVxuXHRTUy5pbml0KClcbiIsIkFic3RyYWN0U2hhcGUgICAgICAgICA9IHJlcXVpcmUgJy4vc2hhcGVzL0Fic3RyYWN0U2hhcGUnXG5OdW1iZXJVdGlscyAgICAgICAgICAgPSByZXF1aXJlICcuLi91dGlscy9OdW1iZXJVdGlscydcblNoYXBlU3RyZWFtQ29uZmlnICAgICA9IHJlcXVpcmUgJy4vU2hhcGVTdHJlYW1Db25maWcnXG5TaGFwZVN0cmVhbVNoYXBlQ2FjaGUgPSByZXF1aXJlICcuL1NoYXBlU3RyZWFtU2hhcGVDYWNoZSdcblxuY2xhc3MgU2hhcGVTdHJlYW1cblxuICAgIHN0YWdlICAgIDogbnVsbFxuICAgIHJlbmRlcmVyIDogbnVsbFxuICAgIGxheWVycyAgIDoge31cbiAgICBcbiAgICB3IDogMFxuICAgIGggOiAwXG5cbiAgICBjb3VudGVyIDogbnVsbFxuXG4gICAgbW91c2UgOlxuICAgICAgICBlbmFibGVkIDogZmFsc2VcbiAgICAgICAgcG9zICAgICA6IG51bGxcblxuICAgIHBvaW50ZXJEb3duIDogZmFsc2VcblxuICAgIEVWRU5UX0tJTExfU0hBUEUgOiAnRVZFTlRfS0lMTF9TSEFQRSdcblxuICAgIGZpbHRlcnMgOlxuICAgICAgICBibHVyICA6IG51bGxcbiAgICAgICAgUkdCICAgOiBudWxsXG4gICAgICAgIHBpeGVsIDogbnVsbFxuXG4gICAgY29uc3RydWN0b3IgOiAtPlxuXG4gICAgICAgIEBERUJVRyA9IGZhbHNlXG5cbiAgICAgICAgQCR3aW5kb3cgPSAkKHdpbmRvdylcbiAgICAgICAgQCRlbCAgICAgPSAkKCcjc2hhcGUtc3RyZWFtJylcblxuICAgICAgICBAc2V0dXAoKVxuXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICBzZXR1cCA6IC0+XG5cbiAgICAgICAgQG9uUmVzaXplKClcbiAgICAgICAgQGJpbmRFdmVudHMoKVxuXG4gICAgICAgIG51bGxcblxuICAgIGFkZEd1aSA6IC0+XG5cbiAgICAgICAgQGd1aSAgICAgICAgPSBuZXcgZGF0LkdVSVxuICAgICAgICBAZ3VpRm9sZGVycyA9IHt9XG5cbiAgICAgICAgIyBAZ3VpID0gbmV3IGRhdC5HVUkgYXV0b1BsYWNlIDogZmFsc2VcbiAgICAgICAgIyBAZ3VpLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnXG4gICAgICAgICMgQGd1aS5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnXG4gICAgICAgICMgQGd1aS5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMTBweCdcbiAgICAgICAgIyBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIEBndWkuZG9tRWxlbWVudFxuXG4gICAgICAgIEBndWlGb2xkZXJzLmdlbmVyYWxGb2xkZXIgPSBAZ3VpLmFkZEZvbGRlcignR2VuZXJhbCcpXG4gICAgICAgIEBndWlGb2xkZXJzLmdlbmVyYWxGb2xkZXIuYWRkKFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwsICdHTE9CQUxfU1BFRUQnLCAwLjUsIDEwKS5uYW1lKFwiZ2xvYmFsIHNwZWVkXCIpXG4gICAgICAgIEBndWlGb2xkZXJzLmdlbmVyYWxGb2xkZXIuYWRkKFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwsICdHTE9CQUxfQUxQSEEnLCAwLCAxKS5uYW1lKFwiZ2xvYmFsIGFscGhhXCIpXG5cbiAgICAgICAgQGd1aUZvbGRlcnMuc2l6ZUZvbGRlciA9IEBndWkuYWRkRm9sZGVyKCdTaXplJylcbiAgICAgICAgQGd1aUZvbGRlcnMuc2l6ZUZvbGRlci5hZGQoU2hhcGVTdHJlYW1Db25maWcuc2hhcGVzLCAnTUlOX1dJRFRIJywgNSwgMjAwKS5uYW1lKCdtaW4gd2lkdGgnKVxuICAgICAgICBAZ3VpRm9sZGVycy5zaXplRm9sZGVyLmFkZChTaGFwZVN0cmVhbUNvbmZpZy5zaGFwZXMsICdNQVhfV0lEVEgnLCA1LCAyMDApLm5hbWUoJ21heCB3aWR0aCcpXG5cbiAgICAgICAgQGd1aUZvbGRlcnMuY291bnRGb2xkZXIgPSBAZ3VpLmFkZEZvbGRlcignQ291bnQnKVxuICAgICAgICBAZ3VpRm9sZGVycy5jb3VudEZvbGRlci5hZGQoU2hhcGVTdHJlYW1Db25maWcuZ2VuZXJhbCwgJ01BWF9TSEFQRV9DT1VOVCcsIDUsIDEwMDApLm5hbWUoJ21heCBzaGFwZXMnKVxuXG4gICAgICAgIEBndWlGb2xkZXJzLnNoYXBlc0ZvbGRlciA9IEBndWkuYWRkRm9sZGVyKCdTaGFwZXMnKVxuICAgICAgICBmb3Igc2hhcGUsIGkgaW4gU2hhcGVTdHJlYW1Db25maWcuc2hhcGVUeXBlc1xuICAgICAgICAgICAgQGd1aUZvbGRlcnMuc2hhcGVzRm9sZGVyLmFkZChTaGFwZVN0cmVhbUNvbmZpZy5zaGFwZVR5cGVzW2ldLCAnYWN0aXZlJykubmFtZShzaGFwZS50eXBlKVxuXG4gICAgICAgIEBndWlGb2xkZXJzLmJsdXJGb2xkZXIgPSBAZ3VpLmFkZEZvbGRlcignQmx1cicpXG4gICAgICAgIEBndWlGb2xkZXJzLmJsdXJGb2xkZXIuYWRkKFNoYXBlU3RyZWFtQ29uZmlnLmZpbHRlcnMsICdibHVyJykubmFtZShcImVuYWJsZVwiKVxuICAgICAgICBAZ3VpRm9sZGVycy5ibHVyRm9sZGVyLmFkZChAZmlsdGVycy5ibHVyLCAnYmx1cicsIDAsIDMyKS5uYW1lKFwiYmx1ciBhbW91bnRcIilcblxuICAgICAgICBAZ3VpRm9sZGVycy5SR0JGb2xkZXIgPSBAZ3VpLmFkZEZvbGRlcignUkdCIFNwbGl0JylcbiAgICAgICAgQGd1aUZvbGRlcnMuUkdCRm9sZGVyLmFkZChTaGFwZVN0cmVhbUNvbmZpZy5maWx0ZXJzLCAnUkdCJykubmFtZShcImVuYWJsZVwiKVxuICAgICAgICBAZ3VpRm9sZGVycy5SR0JGb2xkZXIuYWRkKEBmaWx0ZXJzLlJHQi51bmlmb3Jtcy5yZWQudmFsdWUsICd4JywgLTIwLCAyMCkubmFtZShcInJlZCB4XCIpXG4gICAgICAgIEBndWlGb2xkZXJzLlJHQkZvbGRlci5hZGQoQGZpbHRlcnMuUkdCLnVuaWZvcm1zLnJlZC52YWx1ZSwgJ3knLCAtMjAsIDIwKS5uYW1lKFwicmVkIHlcIilcbiAgICAgICAgQGd1aUZvbGRlcnMuUkdCRm9sZGVyLmFkZChAZmlsdGVycy5SR0IudW5pZm9ybXMuZ3JlZW4udmFsdWUsICd4JywgLTIwLCAyMCkubmFtZShcImdyZWVuIHhcIilcbiAgICAgICAgQGd1aUZvbGRlcnMuUkdCRm9sZGVyLmFkZChAZmlsdGVycy5SR0IudW5pZm9ybXMuZ3JlZW4udmFsdWUsICd5JywgLTIwLCAyMCkubmFtZShcImdyZWVuIHlcIilcbiAgICAgICAgQGd1aUZvbGRlcnMuUkdCRm9sZGVyLmFkZChAZmlsdGVycy5SR0IudW5pZm9ybXMuYmx1ZS52YWx1ZSwgJ3gnLCAtMjAsIDIwKS5uYW1lKFwiYmx1ZSB4XCIpXG4gICAgICAgIEBndWlGb2xkZXJzLlJHQkZvbGRlci5hZGQoQGZpbHRlcnMuUkdCLnVuaWZvcm1zLmJsdWUudmFsdWUsICd5JywgLTIwLCAyMCkubmFtZShcImJsdWUgeVwiKVxuXG4gICAgICAgIEBndWlGb2xkZXJzLnBpeGVsYXRlRm9sZGVyID0gQGd1aS5hZGRGb2xkZXIoJ1BpeGVsbGF0ZScpXG4gICAgICAgIEBndWlGb2xkZXJzLnBpeGVsYXRlRm9sZGVyLmFkZChTaGFwZVN0cmVhbUNvbmZpZy5maWx0ZXJzLCAncGl4ZWwnKS5uYW1lKFwiZW5hYmxlXCIpXG4gICAgICAgIEBndWlGb2xkZXJzLnBpeGVsYXRlRm9sZGVyLmFkZChAZmlsdGVycy5waXhlbC5zaXplLCAneCcsIDEsIDMyKS5uYW1lKFwicGl4ZWwgc2l6ZSB4XCIpXG4gICAgICAgIEBndWlGb2xkZXJzLnBpeGVsYXRlRm9sZGVyLmFkZChAZmlsdGVycy5waXhlbC5zaXplLCAneScsIDEsIDMyKS5uYW1lKFwicGl4ZWwgc2l6ZSB5XCIpXG5cbiAgICAgICAgQGd1aUZvbGRlcnMucGFsZXR0ZUZvbGRlciA9IEBndWkuYWRkRm9sZGVyKCdDb2xvdXIgcGFsZXR0ZScpXG4gICAgICAgIEBndWlGb2xkZXJzLnBhbGV0dGVGb2xkZXIuYWRkKFNoYXBlU3RyZWFtQ29uZmlnLCAnYWN0aXZlUGFsZXR0ZScsIFNoYXBlU3RyZWFtQ29uZmlnLnBhbGV0dGVzKS5uYW1lKFwicGFsZXR0ZVwiKVxuXG4gICAgICAgIG51bGxcblxuICAgIGFkZFN0YXRzIDogLT5cblxuICAgICAgICBAc3RhdHMgPSBuZXcgU3RhdHNcbiAgICAgICAgQHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gICAgICAgIEBzdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4J1xuICAgICAgICBAc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4J1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIEBzdGF0cy5kb21FbGVtZW50XG5cbiAgICAgICAgbnVsbFxuXG4gICAgYWRkU2hhcGVDb3VudGVyIDogLT5cblxuICAgICAgICBAc2hhcGVDb3VudGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnZGl2J1xuICAgICAgICBAc2hhcGVDb3VudGVyLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICAgICAgICBAc2hhcGVDb3VudGVyLnN0eWxlLmxlZnQgPSAnMTAwcHgnXG4gICAgICAgIEBzaGFwZUNvdW50ZXIuc3R5bGUudG9wID0gJzE1cHgnXG4gICAgICAgIEBzaGFwZUNvdW50ZXIuc3R5bGUuY29sb3IgPSAnI2ZmZidcbiAgICAgICAgQHNoYXBlQ291bnRlci5zdHlsZS50ZXh0VHJhbnNmb3JtID0gJ3VwcGVyY2FzZSdcbiAgICAgICAgQHNoYXBlQ291bnRlci5pbm5lckhUTUwgPSBcIjAgc2hhcGVzXCJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCBAc2hhcGVDb3VudGVyXG5cbiAgICAgICAgbnVsbFxuXG4gICAgdXBkYXRlU2hhcGVDb3VudGVyIDogLT5cblxuICAgICAgICBAc2hhcGVDb3VudGVyLmlubmVySFRNTCA9IFwiI3tAX2dldFNoYXBlQ291bnQoKX0gc2hhcGVzXCJcblxuICAgICAgICBudWxsXG5cbiAgICBjcmVhdGVTdGFnZUZpbHRlcnMgOiAtPlxuXG4gICAgICAgICMgQGZpbHRlcnMuYmx1ciAgPSBuZXcgUElYSS5CbHVyRmlsdGVyXG4gICAgICAgIEBmaWx0ZXJzLlJHQiAgID0gbmV3IFBJWEkuUkdCU3BsaXRGaWx0ZXJcbiAgICAgICAgIyBAZmlsdGVycy5waXhlbCA9IG5ldyBQSVhJLlBpeGVsYXRlRmlsdGVyXG5cbiAgICAgICAgIyBAZmlsdGVycy5ibHVyLmJsdXIgPSBTaGFwZVN0cmVhbUNvbmZpZy5maWx0ZXJEZWZhdWx0cy5ibHVyLmdlbmVyYWxcblxuICAgICAgICBAZmlsdGVycy5SR0IudW5pZm9ybXMucmVkLnZhbHVlICAgPSBTaGFwZVN0cmVhbUNvbmZpZy5maWx0ZXJEZWZhdWx0cy5SR0IucmVkXG4gICAgICAgIEBmaWx0ZXJzLlJHQi51bmlmb3Jtcy5ncmVlbi52YWx1ZSA9IFNoYXBlU3RyZWFtQ29uZmlnLmZpbHRlckRlZmF1bHRzLlJHQi5ncmVlblxuICAgICAgICBAZmlsdGVycy5SR0IudW5pZm9ybXMuYmx1ZS52YWx1ZSAgPSBTaGFwZVN0cmVhbUNvbmZpZy5maWx0ZXJEZWZhdWx0cy5SR0IuYmx1ZVxuXG4gICAgICAgICMgQGZpbHRlcnMucGl4ZWwudW5pZm9ybXMucGl4ZWxTaXplLnZhbHVlID0gU2hhcGVTdHJlYW1Db25maWcuZmlsdGVyRGVmYXVsdHMucGl4ZWwuYW1vdW50XG5cbiAgICAgICAgbnVsbFxuXG4gICAgaW5pdDogLT5cblxuICAgICAgICBQSVhJLmRvbnRTYXlIZWxsbyA9IHRydWVcblxuICAgICAgICBAc2V0RGltcygpXG4gICAgICAgIEBzZXRTdHJlYW1EaXJlY3Rpb24oKVxuXG4gICAgICAgIEBzaGFwZXMgICA9IFtdXG4gICAgICAgIEBzdGFnZSAgICA9IG5ldyBQSVhJLlN0YWdlIDB4MTExMTExXG4gICAgICAgIEByZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyIEB3LCBAaCwgYW50aWFsaWFzIDogdHJ1ZVxuICAgICAgICBAcmVuZGVyKClcblxuICAgICAgICBTaGFwZVN0cmVhbVNoYXBlQ2FjaGUuY3JlYXRlQ2FjaGUoKVxuXG4gICAgICAgIEBjb250YWluZXIgPSBuZXcgUElYSS5EaXNwbGF5T2JqZWN0Q29udGFpbmVyXG4gICAgICAgIEBzdGFnZS5hZGRDaGlsZCBAY29udGFpbmVyXG5cbiAgICAgICAgQGNyZWF0ZVN0YWdlRmlsdGVycygpXG5cbiAgICAgICAgaWYgQERFQlVHXG4gICAgICAgICAgICBAYWRkR3VpKClcbiAgICAgICAgICAgIEBhZGRTdGF0cygpXG4gICAgICAgICAgICBAYWRkU2hhcGVDb3VudGVyKClcblxuICAgICAgICBAJGVsLmFwcGVuZCBAcmVuZGVyZXIudmlld1xuXG4gICAgICAgIEBkcmF3KClcblxuICAgICAgICBudWxsXG5cbiAgICBkcmF3IDogLT5cblxuICAgICAgICBAY291bnRlciA9IDBcblxuICAgICAgICBAc2V0RGltcygpXG5cbiAgICAgICAgQGFkZFNoYXBlcyBTaGFwZVN0cmVhbUNvbmZpZy5nZW5lcmFsLklOSVRJQUxfU0hBUEVfQ09VTlRcbiAgICAgICAgQHVwZGF0ZSgpXG5cbiAgICAgICAgbnVsbFxuXG4gICAgYWRkU2hhcGVzIDogKGNvdW50KSAtPlxuXG4gICAgICAgIGZvciBpIGluIFswLi4uY291bnRdXG5cbiAgICAgICAgICAgIHNoYXBlICA9IG5ldyBBYnN0cmFjdFNoYXBlIEBcbiAgICAgICAgICAgIHNoYXBlLnNldFByb3BzIHRydWVcblxuICAgICAgICAgICAgQF9wb3NpdGlvblNoYXBlIHNoYXBlXG5cbiAgICAgICAgICAgIEBjb250YWluZXIuYWRkQ2hpbGQgc2hhcGUuZ2V0U3ByaXRlKClcblxuICAgICAgICAgICAgQHNoYXBlcy5wdXNoIHNoYXBlXG5cbiAgICAgICAgbnVsbFxuXG4gICAgX3Bvc2l0aW9uU2hhcGUgOiAoc2hhcGUpIC0+XG5cbiAgICAgICAgcG9zID0gQF9nZXRTaGFwZVN0YXJ0UG9zKClcblxuICAgICAgICBzcHJpdGUgICAgICAgICAgICA9IHNoYXBlLmdldFNwcml0ZSgpXG4gICAgICAgIHNwcml0ZS5wb3NpdGlvbi54ID0gc3ByaXRlLl9wb3NpdGlvbi54ID0gcG9zLnhcbiAgICAgICAgc3ByaXRlLnBvc2l0aW9uLnkgPSBzcHJpdGUuX3Bvc2l0aW9uLnkgPSBwb3MueVxuXG4gICAgICAgIG51bGxcblxuICAgIF9nZXRTaGFwZVN0YXJ0UG9zIDogLT5cblxuICAgICAgICBzZWVkID0gTWF0aC5yYW5kb20oKVxuXG4gICAgICAgIGlmIHNlZWQgPiAwLjVcbiAgICAgICAgICAgIHcgPSBpZiBzZWVkID4gMC43IHRoZW4gKEB3NSo0KSBlbHNlIChAdzMqMilcbiAgICAgICAgICAgIHggPSAoTnVtYmVyVXRpbHMuZ2V0UmFuZG9tRmxvYXQgdywgQHcpXG4gICAgICAgICAgICB5ID0gLVNoYXBlU3RyZWFtQ29uZmlnLnNoYXBlcy5NQVhfV0lEVEhcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaCA9IGlmIHNlZWQgPiAwLjIgdGhlbiBAaDUgZWxzZSBAaDNcbiAgICAgICAgICAgIHggPSBAdytTaGFwZVN0cmVhbUNvbmZpZy5zaGFwZXMuTUFYX1dJRFRIXG4gICAgICAgICAgICB5ID0gKE51bWJlclV0aWxzLmdldFJhbmRvbUZsb2F0IC1TaGFwZVN0cmVhbUNvbmZpZy5zaGFwZXMuTUFYX1dJRFRILCBoKVxuXG4gICAgICAgIHJldHVybiB7eCwgeX1cblxuICAgIF9nZXRTaGFwZUNvdW50IDogPT5cblxuICAgICAgICBAY29udGFpbmVyLmNoaWxkcmVuLmxlbmd0aFxuXG4gICAgb25TaGFwZURpZSA6IChzaGFwZSkgLT5cblxuICAgICAgICBpZiBAX2dldFNoYXBlQ291bnQoKSA+IFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuTUFYX1NIQVBFX0NPVU5UXG4gICAgICAgICAgICBAcmVtb3ZlU2hhcGUgc2hhcGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHJlc2V0U2hhcGUgc2hhcGVcblxuICAgICAgICBudWxsXG5cbiAgICByZXNldFNoYXBlIDogKHNoYXBlKSAtPlxuXG4gICAgICAgIHNoYXBlLnJlc2V0KClcbiAgICAgICAgQF9wb3NpdGlvblNoYXBlIHNoYXBlXG5cbiAgICAgICAgbnVsbFxuXG4gICAgcmVtb3ZlU2hhcGUgOiAoc2hhcGUpIC0+XG5cbiAgICAgICAgaW5kZXggPSBAc2hhcGVzLmluZGV4T2Ygc2hhcGVcbiAgICAgICAgQHNoYXBlc1tpbmRleF0gPSBudWxsXG5cbiAgICAgICAgQGNvbnRhaW5lci5yZW1vdmVDaGlsZCBzaGFwZS5nZXRTcHJpdGUoKVxuXG4gICAgICAgIG51bGxcblxuICAgIHVwZGF0ZSA6ID0+XG5cbiAgICAgICAgaWYgd2luZG93LlNUT1AgdGhlbiByZXR1cm4gcmVxdWVzdEFuaW1GcmFtZSBAdXBkYXRlXG5cbiAgICAgICAgaWYgQERFQlVHIHRoZW4gQHN0YXRzLmJlZ2luKClcblxuICAgICAgICBAY291bnRlcisrXG5cbiAgICAgICAgaWYgKEBfZ2V0U2hhcGVDb3VudCgpIDwgU2hhcGVTdHJlYW1Db25maWcuZ2VuZXJhbC5NQVhfU0hBUEVfQ09VTlQpIHRoZW4gQGFkZFNoYXBlcyAxXG5cbiAgICAgICAgQHVwZGF0ZVNoYXBlcygpXG4gICAgICAgIEByZW5kZXIoKVxuXG4gICAgICAgIGZpbHRlcnNUb0FwcGx5ID0gW11cbiAgICAgICAgKGZpbHRlcnNUb0FwcGx5LnB1c2ggQGZpbHRlcnNbZmlsdGVyXSBpZiBlbmFibGVkKSBmb3IgZmlsdGVyLCBlbmFibGVkIG9mIFNoYXBlU3RyZWFtQ29uZmlnLmZpbHRlcnNcblxuICAgICAgICBAc3RhZ2UuZmlsdGVycyA9IGlmIGZpbHRlcnNUb0FwcGx5Lmxlbmd0aCB0aGVuIGZpbHRlcnNUb0FwcGx5IGVsc2UgbnVsbFxuXG4gICAgICAgIEB1cGRhdGVTcGVlZEFuZEFscGhhKClcblxuICAgICAgICByZXF1ZXN0QW5pbUZyYW1lIEB1cGRhdGVcblxuICAgICAgICBpZiBAREVCVUdcbiAgICAgICAgICAgIEB1cGRhdGVTaGFwZUNvdW50ZXIoKVxuICAgICAgICAgICAgQHN0YXRzLmVuZCgpXG5cbiAgICAgICAgbnVsbFxuXG4gICAgdXBkYXRlU2hhcGVzIDogLT5cblxuICAgICAgICAoc2hhcGU/LmNhbGxBbmltYXRlKCkpIGZvciBzaGFwZSBpbiBAc2hhcGVzXG5cbiAgICAgICAgbnVsbFxuXG4gICAgdXBkYXRlU3BlZWRBbmRBbHBoYSA6IC0+XG5cbiAgICAgICAgaWYgQHBvaW50ZXJEb3duXG4gICAgICAgICAgICBpZiBTaGFwZVN0cmVhbUNvbmZpZy5nZW5lcmFsLkdMT0JBTF9TUEVFRCA8IFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuTUFYX0dMT0JBTF9TUEVFRFxuICAgICAgICAgICAgICAgIFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuR0xPQkFMX1NQRUVEICs9IFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuR0xPQkFMX1NQRUVEX0lOQ19SQVRFXG5cbiAgICAgICAgICAgIGlmIFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuR0xPQkFMX0FMUEhBIDwgU2hhcGVTdHJlYW1Db25maWcuZ2VuZXJhbC5NQVhfR0xPQkFMX0FMUEhBXG4gICAgICAgICAgICAgICAgU2hhcGVTdHJlYW1Db25maWcuZ2VuZXJhbC5HTE9CQUxfQUxQSEEgKz0gU2hhcGVTdHJlYW1Db25maWcuZ2VuZXJhbC5HTE9CQUxfQUxQSEFfSU5DX1JBVEVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgU2hhcGVTdHJlYW1Db25maWcuZ2VuZXJhbC5HTE9CQUxfU1BFRUQgPiBTaGFwZVN0cmVhbUNvbmZpZy5nZW5lcmFsLk1JTl9HTE9CQUxfU1BFRURcbiAgICAgICAgICAgICAgICBTaGFwZVN0cmVhbUNvbmZpZy5nZW5lcmFsLkdMT0JBTF9TUEVFRCAtPSBTaGFwZVN0cmVhbUNvbmZpZy5nZW5lcmFsLkdMT0JBTF9TUEVFRF9ERUNfUkFURVxuXG4gICAgICAgICAgICBpZiBTaGFwZVN0cmVhbUNvbmZpZy5nZW5lcmFsLkdMT0JBTF9BTFBIQSA+IFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuTUlOX0dMT0JBTF9BTFBIQVxuICAgICAgICAgICAgICAgIFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuR0xPQkFMX0FMUEhBIC09IFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuR0xPQkFMX0FMUEhBX0RFQ19SQVRFXG5cbiAgICAgICAgbnVsbFxuXG4gICAgcmVuZGVyIDogLT5cblxuICAgICAgICBAcmVuZGVyZXIucmVuZGVyIEBzdGFnZSBcblxuICAgICAgICBudWxsXG5cbiAgICBiaW5kRXZlbnRzIDogLT5cblxuICAgICAgICBkb3duSW50ZXJhY3Rpb24gPSBpZiAnb250b3VjaHN0YXJ0JyBvZiB3aW5kb3cgdGhlbiAndG91Y2hzdGFydCcgZWxzZSAnbW91c2Vkb3duJ1xuICAgICAgICB1cEludGVyYWN0aW9uID0gaWYgJ29udG91Y2hzdGFydCcgb2Ygd2luZG93IHRoZW4gJ3RvdWNoZW5kJyBlbHNlICdtb3VzZXVwJ1xuXG4gICAgICAgIEBvblJlc2l6ZSA9IF8uZGVib3VuY2UgQG9uUmVzaXplLCAzMDBcblxuICAgICAgICBAJHdpbmRvdy5vbiAncmVzaXplIG9yaWVudGF0aW9uY2hhbmdlJywgQG9uUmVzaXplXG4gICAgICAgIEAkd2luZG93Lm9uICdtb3VzZW1vdmUnLCBAb25Nb3VzZU1vdmVcblxuICAgICAgICBAJGVsLm9uIGRvd25JbnRlcmFjdGlvbiwgQG9uUG9pbnRlckRvd25cbiAgICAgICAgQCRlbC5vbiB1cEludGVyYWN0aW9uLCBAb25Qb2ludGVyVXBcblxuICAgICAgICBudWxsXG5cbiAgICBvblJlc2l6ZSA6ID0+XG5cbiAgICAgICAgQHcgPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgICAgICBAaCA9IHdpbmRvdy5pbm5lckhlaWdodFxuXG4gICAgICAgIEBzZXREaW1zKClcblxuICAgICAgICBudWxsXG5cbiAgICBzZXREaW1zIDogLT5cblxuICAgICAgICBAdzMgPSBAdy8zXG4gICAgICAgIEBoMyA9IEBoLzNcblxuICAgICAgICBAdzUgPSBAdy81XG4gICAgICAgIEBoNSA9IEBoLzVcblxuICAgICAgICAjIGp1c3QgdXNlIG5vbi1yZWxhdGl2ZSBzaXplcyBmb3Igbm93XG4gICAgICAgICMgU2hhcGVTdHJlYW1Db25maWcuc2hhcGVzLk1JTl9XSURUSCA9IChTaGFwZVN0cmVhbUNvbmZpZy5zaGFwZXMuTUlOX1dJRFRIX1BFUkMvMTAwKSpAd1xuICAgICAgICAjIFNoYXBlU3RyZWFtQ29uZmlnLnNoYXBlcy5NQVhfV0lEVEggPSAoU2hhcGVTdHJlYW1Db25maWcuc2hhcGVzLk1BWF9XSURUSF9QRVJDLzEwMCkqQHdcblxuICAgICAgICBAc2V0U3RyZWFtRGlyZWN0aW9uKClcblxuICAgICAgICBAcmVuZGVyZXI/LnJlc2l6ZSBAdywgQGhcblxuICAgICAgICBudWxsXG5cbiAgICBvbk1vdXNlTW92ZSA6IChlKSA9PlxuXG4gICAgICAgIEBtb3VzZS5tdWx0aXBsaWVyID0gMVxuICAgICAgICBAbW91c2UucG9zICAgICAgICA9IHggOiBlLnBhZ2VYLCB5IDogZS5wYWdlWVxuICAgICAgICBAbW91c2UuZW5hYmxlZCAgICA9IHRydWVcblxuICAgICAgICBpZiBTaGFwZVN0cmVhbUNvbmZpZy5maWx0ZXJzLlJHQlxuICAgICAgICAgICAgbWluID0gU2hhcGVTdHJlYW1Db25maWcuZmlsdGVyRGVmYXVsdHMuUkdCLnJlZC5NSU5cbiAgICAgICAgICAgIG1heCA9IFNoYXBlU3RyZWFtQ29uZmlnLmZpbHRlckRlZmF1bHRzLlJHQi5yZWQuTUFYXG4gICAgICAgICAgICBTaGFwZVN0cmVhbUNvbmZpZy5maWx0ZXJEZWZhdWx0cy5SR0IucmVkLnggPSBOdW1iZXJVdGlscy5tYXAgQG1vdXNlLnBvcy54LCAwLCBAdywgbWluLCBtYXhcbiAgICAgICAgICAgIFNoYXBlU3RyZWFtQ29uZmlnLmZpbHRlckRlZmF1bHRzLlJHQi5yZWQueSA9IE51bWJlclV0aWxzLm1hcCBAbW91c2UucG9zLnksIDAsIEBoLCBtaW4sIG1heFxuXG4gICAgICAgIG51bGxcblxuICAgIHNldFN0cmVhbURpcmVjdGlvbiA6IC0+XG5cbiAgICAgICAgaWYgQHcgPiBAaFxuICAgICAgICAgICAgeCA9IDFcbiAgICAgICAgICAgIHkgPSBAaCAvIEB3XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHkgPSAxXG4gICAgICAgICAgICB4ID0gQHcgLyBAaFxuXG4gICAgICAgIFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuRElSRUNUSU9OX1JBVElPID0ge3gsIHl9XG5cbiAgICAgICAgbnVsbFxuXG4gICAgb25Qb2ludGVyRG93biA6ID0+XG5cbiAgICAgICAgQHBvaW50ZXJEb3duID0gdHJ1ZVxuXG4gICAgICAgIG51bGxcblxuICAgIG9uUG9pbnRlclVwIDogPT5cblxuICAgICAgICBAcG9pbnRlckRvd24gPSBmYWxzZVxuICAgICAgICBTaGFwZVN0cmVhbUNvbmZpZy5zZXROZXh0UGFsZXR0ZSgpXG4gICAgICAgICMgU2hhcGVTdHJlYW1Db25maWcuc2V0TmV4dFNoYXBlKClcblxuICAgICAgICBudWxsXG5cbiAgICBTUyA6IC0+XG5cbiAgICAgICAgcmV0dXJuIHdpbmRvdy5TU1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXBlU3RyZWFtXG4iLCJjbGFzcyBTaGFwZVN0cmVhbUNvbmZpZ1xuXG5cdEBjb2xvcnMgOlxuXHRcdCMgaHR0cDovL2ZsYXR1aWNvbG9ycy5jb20vXG5cdFx0RkxBVCA6IFtcblx0XHRcdCcxOUI2OTgnLFxuXHRcdFx0JzJDQzM2QicsXG5cdFx0XHQnMkU4RUNFJyxcblx0XHRcdCc5QjUwQkEnLFxuXHRcdFx0J0U5OEIzOScsXG5cdFx0XHQnRUE2MTUzJyxcblx0XHRcdCdGMkNBMjcnXG5cdFx0XVxuXHRcdEJXIDogW1xuXHRcdFx0J0U4RThFOCcsXG5cdFx0XHQnRDFEMUQxJyxcblx0XHRcdCdCOUI5QjknLFxuXHRcdFx0J0EzQTNBMycsXG5cdFx0XHQnOEM4QzhDJyxcblx0XHRcdCc3Njc2NzYnLFxuXHRcdFx0JzVFNUU1RSdcblx0XHRdXG5cdFx0UkVEIDogW1xuXHRcdFx0J0FBMzkzOScsXG5cdFx0XHQnRDQ2QTZBJyxcblx0XHRcdCdGRkFBQUEnLFxuXHRcdFx0JzgwMTUxNScsXG5cdFx0XHQnNTUwMDAwJ1xuXHRcdF1cblx0XHQjIGh0dHA6Ly9wYWxldHRvbi5jb20vI3VpZD0xM3YwdTBrbnRTK2M2WFVpa1Z0c3ZQekRSS2Fcblx0XHRCTFVFIDogW1xuXHRcdFx0JzlGRDRGNicsXG5cdFx0XHQnNkVCQ0VGJyxcblx0XHRcdCc0OEE5RTgnLFxuXHRcdFx0JzI0OTVERScsXG5cdFx0XHQnMDk4MUNGJ1xuXHRcdF1cblx0XHQjIGh0dHA6Ly9wYWxldHRvbi5jb20vI3VpZD0xMlkwdTBrbFNMT2I1VlZoM1FZcW9HN3hTLVlcblx0XHRHUkVFTiA6IFtcblx0XHRcdCc5RkY0QzEnLFxuXHRcdFx0JzZERTk5RicsXG5cdFx0XHQnNDZERDgzJyxcblx0XHRcdCcyNUQwNkEnLFxuXHRcdFx0JzAwQzI0Ridcblx0XHRdXG5cdFx0IyBodHRwOi8vcGFsZXR0b24uY29tLyN1aWQ9MTF3MHUwa25SdzBlNExFanJDRXRUdXR1WG45XG5cdFx0WUVMTE9XIDogW1xuXHRcdFx0J0ZGRUY4RicsXG5cdFx0XHQnRkZFOTY0Jyxcblx0XHRcdCdGRkU0NDEnLFxuXHRcdFx0J0YzRDMxMCcsXG5cdFx0XHQnQjhBMDA2J1xuXHRcdF1cblxuXHRAcGFsZXR0ZXMgICAgICA6ICdmbGF0JyA6ICdGTEFUJywgJ2ImdycgOiAnQlcnLCAncmVkJyA6ICdSRUQnLCAnYmx1ZScgOiAnQkxVRScsICdncmVlbicgOiAnR1JFRU4nLCAneWVsbG93JyA6ICdZRUxMT1cnXG5cdEBwYWxldHRlc0FycmF5IDogWyAnRkxBVCcsICdCVycsICdSRUQnLCAnQkxVRScsICdHUkVFTicsICdZRUxMT1cnIF1cblx0QGFjdGl2ZVBhbGV0dGUgOiAnQlcnXG5cblx0QHNoYXBlVHlwZXMgOiBbXG5cdFx0e1xuXHRcdFx0dHlwZSAgIDogJ0NpcmNsZSdcblx0XHRcdGFjdGl2ZSA6IGZhbHNlXG5cdFx0fVxuXHRcdHtcblx0XHRcdHR5cGUgICA6ICdTcXVhcmUnXG5cdFx0XHRhY3RpdmUgOiB0cnVlXG5cdFx0fVxuXHRcdHtcblx0XHRcdHR5cGUgICA6ICdUcmlhbmdsZSdcblx0XHRcdGFjdGl2ZSA6IGZhbHNlXG5cdFx0fVxuXHRdXG5cblx0QHNoYXBlVHlwZXNBcnJheSA6IFsgJ0NpcmNsZScsICdTcXVhcmUnLCAnVHJpYW5nbGUnIF1cblx0QGFjdGl2ZVNoYXBlIDogJ1NxdWFyZSdcblxuXHRAc2hhcGVzIDpcblx0XHRNSU5fV0lEVEhfUEVSQyA6IDNcblx0XHRNQVhfV0lEVEhfUEVSQyA6IDdcblxuXHRcdCMgc2V0IHRoaXMgZGVwZW5kaW5nIG9uIHZpZXdwb3J0IHNpemVcblx0XHRNSU5fV0lEVEggOiAzMFxuXHRcdE1BWF9XSURUSCA6IDcwXG5cblx0XHRNSU5fU1BFRURfTU9WRSA6IDJcblx0XHRNQVhfU1BFRURfTU9WRSA6IDMuNVxuXG5cdFx0TUlOX1NQRUVEX1JPVEFURSA6IC0wLjAxXG5cdFx0TUFYX1NQRUVEX1JPVEFURSA6IDAuMDFcblxuXHRcdE1JTl9BTFBIQSA6IDFcblx0XHRNQVhfQUxQSEEgOiAxXG5cblx0XHRNSU5fQkxVUiA6IDBcblx0XHRNQVhfQkxVUiA6IDEwXG5cblx0QGdlbmVyYWwgOiBcblx0XHRHTE9CQUxfU1BFRUQgICAgICAgICAgOiA4XG5cdFx0TUlOX0dMT0JBTF9TUEVFRCAgICAgIDogNFxuXHRcdE1BWF9HTE9CQUxfU1BFRUQgICAgICA6IDlcblx0XHRHTE9CQUxfU1BFRURfSU5DX1JBVEUgOiAwLjFcblx0XHRHTE9CQUxfU1BFRURfREVDX1JBVEUgOiAwLjAzXG5cblx0XHRHTE9CQUxfQUxQSEEgICAgICAgICAgOiAwLjc1XG5cdFx0TUlOX0dMT0JBTF9BTFBIQSAgICAgIDogMC43NVxuXHRcdE1BWF9HTE9CQUxfQUxQSEEgICAgICA6IDFcblx0XHRHTE9CQUxfQUxQSEFfSU5DX1JBVEUgOiAwLjAwNVxuXHRcdEdMT0JBTF9BTFBIQV9ERUNfUkFURSA6IDAuMDAxXG5cblx0XHRNQVhfU0hBUEVfQ09VTlQgICAgIDogMzAwXG5cdFx0SU5JVElBTF9TSEFQRV9DT1VOVCA6IDFcblx0XHRESVJFQ1RJT05fUkFUSU8gICAgIDogeCA6IDEsIHkgOiAxXG5cblx0QGxheWVycyA6XG5cdFx0QkFDS0dST1VORCA6ICdCQUNLR1JPVU5EJ1xuXHRcdE1JREdST1VORCAgOiAnTUlER1JPVU5EJ1xuXHRcdEZPUkVHUk9VTkQgOiAnRk9SRUdST1VORCdcblxuXHRAZmlsdGVycyA6XG5cdFx0Ymx1ciAgOiBmYWxzZVxuXHRcdFJHQiAgIDogdHJ1ZVxuXHRcdHBpeGVsIDogZmFsc2VcblxuXHRAZmlsdGVyRGVmYXVsdHMgOlxuXHRcdGJsdXIgOlxuXHRcdFx0Z2VuZXJhbCAgICA6IDEwXG5cdFx0XHRmb3JlZ3JvdW5kIDogMFxuXHRcdFx0bWlkZ3JvdW5kICA6IDBcblx0XHRcdGJhY2tncm91bmQgOiAwXG5cdFx0UkdCIDpcblx0XHRcdHJlZCAgIDogeCA6IDIsIHkgOiAyLCBNSU4gOiAtNSwgTUFYIDogNVxuXHRcdFx0Z3JlZW4gOiB4IDogLTIsIHkgOiAyXG5cdFx0XHRibHVlICA6IHggOiAyLCB5IDogLTJcblx0XHRwaXhlbCA6XG5cdFx0XHRhbW91bnQgOiB4IDogNCwgeSA6IDRcblxuXHRAaW50ZXJhY3Rpb24gOlxuXHRcdE1PVVNFX1JBRElVUyAgICAgICAgIDogODAwXG5cdFx0RElTUExBQ0VNRU5UX01BWF9JTkMgOiAwLjJcblx0XHRESVNQTEFDRU1FTlRfREVDQVkgICA6IDAuMDFcblxuXHRAZ2V0UmFuZG9tQ29sb3IgOiAtPlxuXG5cdFx0cmV0dXJuIEBjb2xvcnNbQGFjdGl2ZVBhbGV0dGVdW18ucmFuZG9tKDAsIEBjb2xvcnNbQGFjdGl2ZVBhbGV0dGVdLmxlbmd0aC0xKV1cblxuXHRAZ2V0UmFuZG9tU2hhcGUgOiAtPlxuXG5cdFx0YWN0aXZlU2hhcGVzID0gXy5maWx0ZXIgQHNoYXBlVHlwZXMsIChzKSAtPiBzLmFjdGl2ZVxuXG5cdFx0cmV0dXJuIGFjdGl2ZVNoYXBlc1tfLnJhbmRvbSgwLCBhY3RpdmVTaGFwZXMubGVuZ3RoLTEpXS50eXBlXG5cblx0QF9zZXROZXh0UGFsZXR0ZSA6IC0+XG5cblx0XHRpZHggPSBAcGFsZXR0ZXNBcnJheS5pbmRleE9mIEBhY3RpdmVQYWxldHRlXG5cdFx0aWR4ID0gaWYgaWR4IGlzIEBwYWxldHRlc0FycmF5Lmxlbmd0aC0xIHRoZW4gMCBlbHNlIGlkeCsxXG5cblx0XHRAYWN0aXZlUGFsZXR0ZSA9IEBwYWxldHRlc0FycmF5W2lkeF1cblxuXHRcdG51bGxcblxuXHRAc2V0TmV4dFBhbGV0dGUgOiBfLmRlYm91bmNlIEBfc2V0TmV4dFBhbGV0dGUsIDMwMFxuXG5cdEBzZXROZXh0U2hhcGUgOiAtPlxuXG5cdFx0aWR4ID0gQHNoYXBlVHlwZXNBcnJheS5pbmRleE9mIEBhY3RpdmVTaGFwZVxuXHRcdGlkeCA9IGlmIGlkeCBpcyBAc2hhcGVUeXBlc0FycmF5Lmxlbmd0aC0xIHRoZW4gMCBlbHNlIGlkeCsxXG5cdFx0QGFjdGl2ZVNoYXBlID0gQHNoYXBlVHlwZXNBcnJheVtpZHhdXG5cblx0XHRudWxsXG5cbndpbmRvdy5TaGFwZVN0cmVhbUNvbmZpZz1TaGFwZVN0cmVhbUNvbmZpZ1xubW9kdWxlLmV4cG9ydHMgPSBTaGFwZVN0cmVhbUNvbmZpZ1xuIiwiU2hhcGVTdHJlYW1Db25maWcgPSByZXF1aXJlICcuL1NoYXBlU3RyZWFtQ29uZmlnJ1xuQWJzdHJhY3RTaGFwZSAgICAgPSByZXF1aXJlICcuL3NoYXBlcy9BYnN0cmFjdFNoYXBlJ1xuXG5jbGFzcyBTaGFwZVN0cmVhbVNoYXBlQ2FjaGVcblxuXHRAc2hhcGVzIDoge31cblxuXHRAdHJpYW5nbGVSYXRpbyA6IE1hdGguY29zKE1hdGguUEkvNilcblxuXHRAY3JlYXRlQ2FjaGUgOiAtPlxuXG5cdFx0IyBjb3VudGVyID0gMFxuXHRcdCMgc3RhcnRUaW1lID0gRGF0ZS5ub3coKVxuXG5cdFx0KEBzaGFwZXNbc2hhcGUudHlwZV0gPSB7fSkgZm9yIHNoYXBlIGluIFNoYXBlU3RyZWFtQ29uZmlnLnNoYXBlVHlwZXNcblxuXHRcdGZvciBwYWxldHRlLCBwYWxldHRlQ29sb3JzIG9mIFNoYXBlU3RyZWFtQ29uZmlnLmNvbG9yc1xuXHRcdFx0Zm9yIGNvbG9yIGluIHBhbGV0dGVDb2xvcnNcblx0XHRcdFx0Zm9yIHNoYXBlLCBjb2xvcnMgb2YgQHNoYXBlc1xuXHRcdFx0XHRcdCMgY291bnRlcisrXG5cdFx0XHRcdFx0QHNoYXBlc1tzaGFwZV1bY29sb3JdID0gbmV3IFBJWEkuVGV4dHVyZS5mcm9tSW1hZ2UgQF9jcmVhdGVTaGFwZSBzaGFwZSwgY29sb3JcblxuXG5cdFx0IyB0aW1lVGFrZW4gPSBEYXRlLm5vdygpLXN0YXJ0VGltZVxuXHRcdCMgY29uc29sZS5sb2cgXCIje2NvdW50ZXJ9IHNoYXBlIGNhY2hlcyBjcmVhdGVkIGluICN7dGltZVRha2VufW1zXCJcblxuXHRcdG51bGxcblxuXHRAX2NyZWF0ZVNoYXBlIDogKHNoYXBlLCBjb2xvcikgLT5cblxuXHRcdGhlaWdodCA9IEBfZ2V0SGVpZ2h0IHNoYXBlLCBTaGFwZVN0cmVhbUNvbmZpZy5zaGFwZXMuTUFYX1dJRFRIXG5cblx0XHRjICAgICAgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG5cdFx0Yy53aWR0aCAgPSBTaGFwZVN0cmVhbUNvbmZpZy5zaGFwZXMuTUFYX1dJRFRIXG5cdFx0Yy5oZWlnaHQgPSBoZWlnaHRcblxuXHRcdGN0eCA9IGMuZ2V0Q29udGV4dCgnMmQnKVxuXHRcdGN0eC5maWxsU3R5bGUgPSAnIycrY29sb3Jcblx0XHRjdHguYmVnaW5QYXRoKClcblxuXHRcdEBbXCJfZHJhdyN7c2hhcGV9XCJdIGN0eCwgaGVpZ2h0XG5cblx0XHRjdHguY2xvc2VQYXRoKClcblx0XHRjdHguZmlsbCgpXG5cblx0XHRyZXR1cm4gYy50b0RhdGFVUkwoKVxuXG5cdEBfZHJhd1NxdWFyZSA6IChjdHgsIGhlaWdodCkgLT5cblxuXHRcdGN0eC5tb3ZlVG8oMCwgMClcblx0XHRjdHgubGluZVRvKDAsIGhlaWdodClcblx0XHRjdHgubGluZVRvKFNoYXBlU3RyZWFtQ29uZmlnLnNoYXBlcy5NQVhfV0lEVEgsIGhlaWdodClcblx0XHRjdHgubGluZVRvKFNoYXBlU3RyZWFtQ29uZmlnLnNoYXBlcy5NQVhfV0lEVEgsIDApXG5cdFx0Y3R4LmxpbmVUbygwLCAwKVxuXG5cdFx0bnVsbFxuXG5cdEBfZHJhd1RyaWFuZ2xlIDogKGN0eCwgaGVpZ2h0KSAtPlxuXG5cdFx0Y3R4Lm1vdmVUbyhTaGFwZVN0cmVhbUNvbmZpZy5zaGFwZXMuTUFYX1dJRFRILzIsIDApXG5cdFx0Y3R4LmxpbmVUbygwLGhlaWdodClcblx0XHRjdHgubGluZVRvKFNoYXBlU3RyZWFtQ29uZmlnLnNoYXBlcy5NQVhfV0lEVEgsIGhlaWdodClcblx0XHRjdHgubGluZVRvKFNoYXBlU3RyZWFtQ29uZmlnLnNoYXBlcy5NQVhfV0lEVEgvMiwgMClcblxuXHRcdG51bGxcblxuXHRAX2RyYXdDaXJjbGUgOiAoY3R4KSAtPlxuXG5cdFx0aGFsZldpZHRoID0gU2hhcGVTdHJlYW1Db25maWcuc2hhcGVzLk1BWF9XSURUSC8yXG5cblx0XHRjdHguYXJjKGhhbGZXaWR0aCwgaGFsZldpZHRoLCBoYWxmV2lkdGgsIDAsIDIqTWF0aC5QSSlcblxuXHRcdG51bGxcblxuXHRAX2dldEhlaWdodCA6IChzaGFwZSwgd2lkdGgpID0+XG5cblx0XHRoZWlnaHQgPSBzd2l0Y2ggdHJ1ZVxuXHRcdFx0d2hlbiBzaGFwZSBpcyAnVHJpYW5nbGUnIHRoZW4gKHdpZHRoICogQHRyaWFuZ2xlUmF0aW8pXG5cdFx0XHRlbHNlIHdpZHRoXG5cblx0XHRoZWlnaHRcblxubW9kdWxlLmV4cG9ydHMgPSBTaGFwZVN0cmVhbVNoYXBlQ2FjaGVcbiIsIlNoYXBlU3RyZWFtQ29uZmlnICAgICA9IHJlcXVpcmUgJy4uL1NoYXBlU3RyZWFtQ29uZmlnJ1xuU2hhcGVTdHJlYW1TaGFwZUNhY2hlID0gcmVxdWlyZSAnLi4vU2hhcGVTdHJlYW1TaGFwZUNhY2hlJ1xuTnVtYmVyVXRpbHMgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vdXRpbHMvTnVtYmVyVXRpbHMnXG5cbmNsYXNzIEFic3RyYWN0U2hhcGVcblxuXHRzIDogbnVsbFxuXG5cdF9zaGFwZSA6IG51bGxcblx0X2NvbG9yIDogbnVsbFxuXG5cdHdpZHRoICAgICAgIDogbnVsbFxuXHRzcGVlZE1vdmUgICA6IG51bGxcblx0c3BlZWRSb3RhdGUgOiBudWxsXG5cdGFscGhhVmFsdWUgIDogbnVsbFxuXG5cdCMgX3Bvc2l0aW9uVmFyaWFuY2VYIDogbnVsbFxuXHQjIF9wb3NpdGlvblZhcmlhbmNlWSA6IG51bGxcblxuXHRkZWFkIDogZmFsc2VcblxuXHRkaXNwbGFjZW1lbnQgOiAwXG5cblx0QHRyaWFuZ2xlUmF0aW8gOiBNYXRoLmNvcyhNYXRoLlBJLzYpXG5cblx0c2V0UHJvcHMgOiAoZmlyc3RJbml0PWZhbHNlKSAtPlxuXG5cdFx0IyBAX3NoYXBlID0gU2hhcGVTdHJlYW1Db25maWcuZ2V0UmFuZG9tU2hhcGUoKVxuXHRcdEBfc2hhcGUgPSBTaGFwZVN0cmVhbUNvbmZpZy5hY3RpdmVTaGFwZVxuXHRcdEBfY29sb3IgPSBTaGFwZVN0cmVhbUNvbmZpZy5nZXRSYW5kb21Db2xvcigpXG5cblx0XHRAd2lkdGggICAgICAgPSBAX2dldFdpZHRoKClcblx0XHRAaGVpZ2h0ICAgICAgPSBAX2dldEhlaWdodCBAX3NoYXBlLCBAd2lkdGhcblx0XHRAc3BlZWRNb3ZlICAgPSBAX2dldFNwZWVkTW92ZSgpXG5cdFx0QHNwZWVkUm90YXRlID0gQF9nZXRTcGVlZFJvdGF0ZSgpXG5cdFx0QGFscGhhVmFsdWUgID0gQF9nZXRBbHBoYVZhbHVlKClcblxuXHRcdGlmIGZpcnN0SW5pdFxuXHRcdFx0QHMgPSBuZXcgUElYSS5TcHJpdGUgU2hhcGVTdHJlYW1TaGFwZUNhY2hlLnNoYXBlc1tAX3NoYXBlXVtAX2NvbG9yXVxuXHRcdGVsc2Vcblx0XHRcdEBzLnNldFRleHR1cmUgU2hhcGVTdHJlYW1TaGFwZUNhY2hlLnNoYXBlc1tAX3NoYXBlXVtAX2NvbG9yXVxuXG5cdFx0QHMud2lkdGggICAgID0gQHdpZHRoXG5cdFx0QHMuaGVpZ2h0ICAgID0gQGhlaWdodFxuXHRcdEBzLmJsZW5kTW9kZSA9IFBJWEkuYmxlbmRNb2Rlcy5BRERcblx0XHRAcy5hbHBoYSAgICAgPSBAYWxwaGFWYWx1ZVxuXHRcdEBzLmFuY2hvci54ICA9IEBzLmFuY2hvci55ID0gMC41XG5cblx0XHQjIHRyYWNrIG5hdHVyYWwsIG5vbi1kaXNwbGFjZWQgcG9zaXRpb25pbmdcblx0XHRAcy5fcG9zaXRpb24gPSB4IDogMCwgeSA6IDBcblxuXHRcdG51bGxcblxuXHRyZXNldCA6IC0+XG5cblx0XHRAc2V0UHJvcHMoKVxuXHRcdEBkZWFkID0gZmFsc2VcblxuXHRcdG51bGxcblxuXHRfZ2V0V2lkdGggOiAtPlxuXG5cdFx0TnVtYmVyVXRpbHMuZ2V0UmFuZG9tRmxvYXQgU2hhcGVTdHJlYW1Db25maWcuc2hhcGVzLk1JTl9XSURUSCwgU2hhcGVTdHJlYW1Db25maWcuc2hhcGVzLk1BWF9XSURUSFxuXG5cdF9nZXRIZWlnaHQgOiAoc2hhcGUsIHdpZHRoKSAtPlxuXG5cdFx0aGVpZ2h0ID0gc3dpdGNoIHRydWVcblx0XHRcdHdoZW4gc2hhcGUgaXMgJ1RyaWFuZ2xlJyB0aGVuICh3aWR0aCAqIEFic3RyYWN0U2hhcGUudHJpYW5nbGVSYXRpbylcblx0XHRcdGVsc2Ugd2lkdGhcblxuXHRcdGhlaWdodFxuXG5cdF9nZXRTcGVlZE1vdmUgOiAtPlxuXG5cdFx0TnVtYmVyVXRpbHMuZ2V0UmFuZG9tRmxvYXQgU2hhcGVTdHJlYW1Db25maWcuc2hhcGVzLk1JTl9TUEVFRF9NT1ZFLCBTaGFwZVN0cmVhbUNvbmZpZy5zaGFwZXMuTUFYX1NQRUVEX01PVkVcblxuXHRfZ2V0U3BlZWRSb3RhdGUgOiAtPlxuXG5cdFx0TnVtYmVyVXRpbHMuZ2V0UmFuZG9tRmxvYXQgU2hhcGVTdHJlYW1Db25maWcuc2hhcGVzLk1JTl9TUEVFRF9ST1RBVEUsIFNoYXBlU3RyZWFtQ29uZmlnLnNoYXBlcy5NQVhfU1BFRURfUk9UQVRFXG5cblx0X2dldEFscGhhVmFsdWUgOiAtPlxuXG5cdFx0cmFuZ2UgPSBTaGFwZVN0cmVhbUNvbmZpZy5zaGFwZXMuTUFYX0FMUEhBIC0gU2hhcGVTdHJlYW1Db25maWcuc2hhcGVzLk1JTl9BTFBIQVxuXHRcdGFscGhhID0gKChAd2lkdGggLyBTaGFwZVN0cmVhbUNvbmZpZy5zaGFwZXMuTUFYX1dJRFRIKSAqIHJhbmdlKSArIFNoYXBlU3RyZWFtQ29uZmlnLnNoYXBlcy5NSU5fQUxQSEFcblxuXHRcdGFscGhhXG5cblx0X2dldERpc3BsYWNlbWVudCA6IChheGlzKSAtPlxuXG5cdFx0IyByZXR1cm4gMFxuXHRcdHJldHVybiAwIHVubGVzcyBAU1MoKS5tb3VzZS5lbmFibGVkXG5cblx0XHRkaXN0ID0gQFNTKCkubW91c2UucG9zW2F4aXNdLUBzLnBvc2l0aW9uW2F4aXNdXG5cdFx0ZGlzdCA9IGlmIGRpc3QgPCAwIHRoZW4gLWRpc3QgZWxzZSBkaXN0XG5cblx0XHRpZiBkaXN0IDwgU2hhcGVTdHJlYW1Db25maWcuaW50ZXJhY3Rpb24uTU9VU0VfUkFESVVTXG5cdFx0XHRzdHJlbmd0aCA9IChTaGFwZVN0cmVhbUNvbmZpZy5pbnRlcmFjdGlvbi5NT1VTRV9SQURJVVMgLSBkaXN0KSAvIFNoYXBlU3RyZWFtQ29uZmlnLmludGVyYWN0aW9uLk1PVVNFX1JBRElVU1xuXHRcdFx0dmFsdWUgICAgPSAoU2hhcGVTdHJlYW1Db25maWcuaW50ZXJhY3Rpb24uRElTUExBQ0VNRU5UX01BWF9JTkMqU2hhcGVTdHJlYW1Db25maWcuZ2VuZXJhbC5HTE9CQUxfU1BFRUQqc3RyZW5ndGgpXG5cdFx0XHRAZGlzcGxhY2VtZW50ID0gaWYgQHMucG9zaXRpb25bYXhpc10gPiBAU1MoKS5tb3VzZS5wb3NbYXhpc10gdGhlbiBAZGlzcGxhY2VtZW50LXZhbHVlIGVsc2UgQGRpc3BsYWNlbWVudCt2YWx1ZVxuXHRcdFxuXHRcdGlmIEBkaXNwbGFjZW1lbnQgaXNudCAwXG5cdFx0XHRpZiBAZGlzcGxhY2VtZW50ID4gMFxuXHRcdFx0XHRAZGlzcGxhY2VtZW50LT1TaGFwZVN0cmVhbUNvbmZpZy5pbnRlcmFjdGlvbi5ESVNQTEFDRU1FTlRfREVDQVlcblx0XHRcdFx0QGRpc3BsYWNlbWVudCA9IGlmIEBkaXNwbGFjZW1lbnQgPCAwIHRoZW4gMCBlbHNlIEBkaXNwbGFjZW1lbnRcblx0XHRcdGVsc2Vcblx0XHRcdFx0QGRpc3BsYWNlbWVudCs9U2hhcGVTdHJlYW1Db25maWcuaW50ZXJhY3Rpb24uRElTUExBQ0VNRU5UX0RFQ0FZXG5cdFx0XHRcdEBkaXNwbGFjZW1lbnQgPSBpZiBAZGlzcGxhY2VtZW50ID4gMCB0aGVuIDAgZWxzZSBAZGlzcGxhY2VtZW50XG5cblx0XHRAZGlzcGxhY2VtZW50XG5cblx0IyBfcG9zaXRpb25WYXJpYW5jZV8xIDogKHQpID0+XG5cblx0IyBcdE1hdGguY29zIHQgKiAwLjAwMSAvIFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuR0xPQkFMX1NQRUVEXG5cblx0IyBfcG9zaXRpb25WYXJpYW5jZV8yIDogKHQpID0+XG5cblx0IyBcdE1hdGguc2luIHQgKiAwLjAwMSAvIFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuR0xPQkFMX1NQRUVEXG5cblx0IyBfcG9zaXRpb25WYXJpYW5jZV8zIDogKHQpID0+XG5cblx0IyBcdE1hdGguY29zIHQgKiAwLjAwNSAvIFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuR0xPQkFMX1NQRUVEXG5cblx0IyBfcG9zaXRpb25WYXJpYW5jZV80IDogKHQpID0+XG5cblx0IyBcdE1hdGguc2luIHQgKiAwLjAwNSAvIFNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuR0xPQkFMX1NQRUVEXG5cblx0Y2FsbEFuaW1hdGUgOiAtPlxuXG5cdFx0cmV0dXJuIHVubGVzcyAhQGRlYWRcblxuXHRcdEBzLmFscGhhID0gQGFscGhhVmFsdWUqU2hhcGVTdHJlYW1Db25maWcuZ2VuZXJhbC5HTE9CQUxfQUxQSEFcblxuXHRcdEBzLl9wb3NpdGlvbi54IC09IChAc3BlZWRNb3ZlKlNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuR0xPQkFMX1NQRUVEKSpTaGFwZVN0cmVhbUNvbmZpZy5nZW5lcmFsLkRJUkVDVElPTl9SQVRJTy54XG5cdFx0QHMuX3Bvc2l0aW9uLnkgKz0gKEBzcGVlZE1vdmUqU2hhcGVTdHJlYW1Db25maWcuZ2VuZXJhbC5HTE9CQUxfU1BFRUQpKlNoYXBlU3RyZWFtQ29uZmlnLmdlbmVyYWwuRElSRUNUSU9OX1JBVElPLnlcblxuXHRcdEBzLnBvc2l0aW9uLnggPSBAcy5fcG9zaXRpb24ueCtAX2dldERpc3BsYWNlbWVudCgneCcpXG5cdFx0QHMucG9zaXRpb24ueSA9IEBzLl9wb3NpdGlvbi55K0BfZ2V0RGlzcGxhY2VtZW50KCd5JylcblxuXHRcdEBzLnJvdGF0aW9uICs9IEBzcGVlZFJvdGF0ZSpTaGFwZVN0cmVhbUNvbmZpZy5nZW5lcmFsLkdMT0JBTF9TUEVFRFxuXG5cdFx0aWYgKEBzLnBvc2l0aW9uLnggKyAoQHdpZHRoLzIpIDwgMCkgb3IgKEBzLnBvc2l0aW9uLnkgLSAoQHdpZHRoLzIpID4gQFNTKCkuaCkgdGhlbiBAa2lsbCgpXG5cblx0XHRudWxsXG5cblx0a2lsbCA6IC0+XG5cblx0XHRAZGVhZCA9IHRydWVcblxuXHRcdEBTUygpLm9uU2hhcGVEaWUgQFxuXG5cdGdldFNwcml0ZSA6IC0+XG5cblx0XHRyZXR1cm4gQHNcblxuXHRTUyA6IC0+XG5cblx0XHRyZXR1cm4gd2luZG93LlNTXG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RTaGFwZVxuIiwiY2xhc3MgTnVtYmVyVXRpbHNcblxuICAgIEBNQVRIX0NPUzogTWF0aC5jb3MgXG4gICAgQE1BVEhfU0lOOiBNYXRoLnNpbiBcbiAgICBATUFUSF9SQU5ET006IE1hdGgucmFuZG9tIFxuICAgIEBNQVRIX0FCUzogTWF0aC5hYnNcbiAgICBATUFUSF9BVEFOMjogTWF0aC5hdGFuMlxuXG4gICAgQGxpbWl0OihudW1iZXIsIG1pbiwgbWF4KS0+XG4gICAgICAgIHJldHVybiBNYXRoLm1pbiggTWF0aC5tYXgobWluLG51bWJlciksIG1heCApXG5cbiAgICBAbWFwIDogKG51bSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Miwgcm91bmQgPSBmYWxzZSwgY29uc3RyYWluTWluID0gdHJ1ZSwgY29uc3RyYWluTWF4ID0gdHJ1ZSkgLT5cbiAgICAgICAgICAgIGlmIGNvbnN0cmFpbk1pbiBhbmQgbnVtIDwgbWluMSB0aGVuIHJldHVybiBtaW4yXG4gICAgICAgICAgICBpZiBjb25zdHJhaW5NYXggYW5kIG51bSA+IG1heDEgdGhlbiByZXR1cm4gbWF4MlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBudW0xID0gKG51bSAtIG1pbjEpIC8gKG1heDEgLSBtaW4xKVxuICAgICAgICAgICAgbnVtMiA9IChudW0xICogKG1heDIgLSBtaW4yKSkgKyBtaW4yXG4gICAgICAgICAgICBpZiByb3VuZFxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKG51bTIpXG4gICAgICAgICAgICByZXR1cm4gbnVtMlxuXG4gICAgQGdldFJhbmRvbUNvbG9yOiAtPlxuXG4gICAgICAgIGxldHRlcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRicuc3BsaXQoJycpXG4gICAgICAgIGNvbG9yID0gJyMnXG4gICAgICAgIGZvciBpIGluIFswLi4uNl1cbiAgICAgICAgICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTUpXVxuICAgICAgICBjb2xvclxuXG4gICAgQGdldFJhbmRvbUZsb2F0IDogKG1pbiwgbWF4KSAtPlxuXG4gICAgICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluKVxuXG4gICAgQGdldFRpbWVTdGFtcERpZmYgOiAoZGF0ZTEsIGRhdGUyKSAtPlxuXG4gICAgICAgICMgR2V0IDEgZGF5IGluIG1pbGxpc2Vjb25kc1xuICAgICAgICBvbmVfZGF5ID0gMTAwMCo2MCo2MCoyNFxuICAgICAgICB0aW1lICAgID0ge31cblxuICAgICAgICAjIENvbnZlcnQgYm90aCBkYXRlcyB0byBtaWxsaXNlY29uZHNcbiAgICAgICAgZGF0ZTFfbXMgPSBkYXRlMS5nZXRUaW1lKClcbiAgICAgICAgZGF0ZTJfbXMgPSBkYXRlMi5nZXRUaW1lKClcblxuICAgICAgICAjIENhbGN1bGF0ZSB0aGUgZGlmZmVyZW5jZSBpbiBtaWxsaXNlY29uZHNcbiAgICAgICAgZGlmZmVyZW5jZV9tcyA9IGRhdGUyX21zIC0gZGF0ZTFfbXNcblxuICAgICAgICAjIHRha2Ugb3V0IG1pbGxpc2Vjb25kc1xuICAgICAgICBkaWZmZXJlbmNlX21zID0gZGlmZmVyZW5jZV9tcy8xMDAwXG4gICAgICAgIHRpbWUuc2Vjb25kcyAgPSBNYXRoLmZsb29yKGRpZmZlcmVuY2VfbXMgJSA2MClcblxuICAgICAgICBkaWZmZXJlbmNlX21zID0gZGlmZmVyZW5jZV9tcy82MCBcbiAgICAgICAgdGltZS5taW51dGVzICA9IE1hdGguZmxvb3IoZGlmZmVyZW5jZV9tcyAlIDYwKVxuXG4gICAgICAgIGRpZmZlcmVuY2VfbXMgPSBkaWZmZXJlbmNlX21zLzYwIFxuICAgICAgICB0aW1lLmhvdXJzICAgID0gTWF0aC5mbG9vcihkaWZmZXJlbmNlX21zICUgMjQpICBcblxuICAgICAgICB0aW1lLmRheXMgICAgID0gTWF0aC5mbG9vcihkaWZmZXJlbmNlX21zLzI0KVxuXG4gICAgICAgIHRpbWVcblxuICAgIEBtYXA6ICggbnVtLCBtaW4xLCBtYXgxLCBtaW4yLCBtYXgyLCByb3VuZCA9IGZhbHNlLCBjb25zdHJhaW5NaW4gPSB0cnVlLCBjb25zdHJhaW5NYXggPSB0cnVlICkgLT5cbiAgICAgICAgaWYgY29uc3RyYWluTWluIGFuZCBudW0gPCBtaW4xIHRoZW4gcmV0dXJuIG1pbjJcbiAgICAgICAgaWYgY29uc3RyYWluTWF4IGFuZCBudW0gPiBtYXgxIHRoZW4gcmV0dXJuIG1heDJcbiAgICAgICAgXG4gICAgICAgIG51bTEgPSAobnVtIC0gbWluMSkgLyAobWF4MSAtIG1pbjEpXG4gICAgICAgIG51bTIgPSAobnVtMSAqIChtYXgyIC0gbWluMikpICsgbWluMlxuICAgICAgICBpZiByb3VuZCB0aGVuIHJldHVybiBNYXRoLnJvdW5kKG51bTIpXG5cbiAgICAgICAgcmV0dXJuIG51bTJcblxuICAgIEB0b1JhZGlhbnM6ICggZGVncmVlICkgLT5cbiAgICAgICAgcmV0dXJuIGRlZ3JlZSAqICggTWF0aC5QSSAvIDE4MCApXG5cbiAgICBAdG9EZWdyZWU6ICggcmFkaWFucyApIC0+XG4gICAgICAgIHJldHVybiByYWRpYW5zICogKCAxODAgLyBNYXRoLlBJIClcblxuICAgIEBpc0luUmFuZ2U6ICggbnVtLCBtaW4sIG1heCwgY2FuQmVFcXVhbCApIC0+XG4gICAgICAgIGlmIGNhbkJlRXF1YWwgdGhlbiByZXR1cm4gbnVtID49IG1pbiAmJiBudW0gPD0gbWF4XG4gICAgICAgIGVsc2UgcmV0dXJuIG51bSA+PSBtaW4gJiYgbnVtIDw9IG1heFxuXG4gICAgIyBjb252ZXJ0IG1ldHJlcyBpbiB0byBtIC8gS01cbiAgICBAZ2V0TmljZURpc3RhbmNlOiAobWV0cmVzKSA9PlxuXG4gICAgICAgIGlmIG1ldHJlcyA8IDEwMDBcblxuICAgICAgICAgICAgcmV0dXJuIFwiI3tNYXRoLnJvdW5kKG1ldHJlcyl9TVwiXG5cbiAgICAgICAgZWxzZVxuXG4gICAgICAgICAgICBrbSA9IChtZXRyZXMvMTAwMCkudG9GaXhlZCgyKVxuICAgICAgICAgICAgcmV0dXJuIFwiI3trbX1LTVwiXG5cbiAgICBAc2h1ZmZsZSA6IChvKSA9PlxuICAgICAgICBgZm9yKHZhciBqLCB4LCBpID0gby5sZW5ndGg7IGk7IGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpKSwgeCA9IG9bLS1pXSwgb1tpXSA9IG9bal0sIG9bal0gPSB4KTtgXG4gICAgICAgIHJldHVybiBvXG5cbiAgICBAcmFuZG9tUmFuZ2UgOiAobWluLG1heCkgPT5cbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoobWF4LW1pbisxKSttaW4pXG5cbm1vZHVsZS5leHBvcnRzID0gTnVtYmVyVXRpbHNcbndpbmRvdy5OdW1iZXJVdGlscyA9IE51bWJlclV0aWxzXG4iXX0=
