!function t(e,i,s){function r(o,h){if(!i[o]){if(!e[o]){var a="function"==typeof require&&require;if(!h&&a)return a(o,!0);if(n)return n(o,!0);var l=new Error("Cannot find module '"+o+"'");throw l.code="MODULE_NOT_FOUND",l}var p=i[o]={exports:{}};e[o][0].call(p.exports,function(t){var i=e[o][1][t];return r(i?i:t)},p,p.exports,t,e,i,s)}return i[o].exports}for(var n="function"==typeof require&&require,o=0;o<s.length;o++)r(s[o]);return r}({1:[function(t){var e;e=t("./exp"),window.EXP=new e},{"./exp":5}],2:[function(t,e){e.exports=function(t,e){var i,s=0;for(i=0;i<t.length;i++)s+=Math.pow(t[i]-e[i],2);return Math.sqrt(s)}},{}],3:[function(t,e){var i,s;s=t("./config"),i=function(){function t(t){var e;return this.x=t.x,this.y=t.y,this.w=t.w,this.centre={x:this.x+this.w/2,y:this.y+this.w/2},this.c=new PIXI.Container,this.c.width=this.c.height=this.w,this.t=new PIXI.extras.BitmapText(" ",this.opts),e=this.t.getLocalBounds(),this.tX=this.centre.x-e.width/2-e.x,this.tY=this.centre.y-e.height/2-e.y-10,this.t.position.set(this.tX,this.tY),this.c.addChild(this.t),this.setAlphabet(),null}return t.prototype.x=null,t.prototype.y=null,t.prototype.w=null,t.prototype.tX=null,t.prototype.tY=null,t.prototype.c=null,t.prototype.t=null,t.prototype.centre=null,t.prototype.chance=.9,t.prototype.charsToShow=0,t.prototype.opts={font:"18px font",fill:16777215},t.prototype._getNewChar=function(){var t;return this.charCounter===this.chars.length-1&&(this.charCounter=0),t=this.chars[this.charCounter++]},t.prototype.setAlphabet=function(t){return null==t&&(t=0),this.chars=s.THEMES[t].alphabet.chars,this.chars=s.THEMES[t].alphabet.shuffle?_.shuffle(this.chars):this.chars,this.charCounter=0,null},t.prototype.update=function(){var t,e,i;if(this.charsToShow>0)return Math.random()>this.chance&&(i=1===this.charsToShow?" ":this._getNewChar(),e=(s.MIN_CHARS_TO_SHOW+s.MAX_CHARS_TO_SHOW)/2,t=Math.min(this.charsToShow/e,1),this.t.text=i,this.t.alpha=t,this.charsToShow--),null},t}(),e.exports=i},{"./config":4}],4:[function(t,e){e.exports={TILE_WIDTH:16,MIN_RADIUS:10,MAX_RADIUS:50,MAX_DELTA:150,MIN_CHARS_TO_SHOW:8,MAX_CHARS_TO_SHOW:12,THEMES:[{alphabet:{chars:"codedoodl.es".split(""),shuffle:!0},bg:15417918,words:["code","doodle"],radiusMultiplier:1},{alphabet:{chars:"abcdefghijklmnopqrstuvwxyz0123456789!?*()@£$%^&_-+=[]{}:;'\"\\|<>,./~`".split(""),shuffle:!0},bg:0,words:[],radiusMultiplier:3},{alphabet:{chars:"etaoinshrd".split(""),shuffle:!0},bg:3759274,words:["date","hind","shot","haste","airshot","shorten","earth","other","shine","trash"],radiusMultiplier:1.5},{alphabet:{chars:"1234567890".split(""),shuffle:!0},bg:1986604,words:[],radiusMultiplier:.5},{alphabet:{chars:"!?*()@£$%^&_-+=[]{}:;'\"\\|<>,./~`".split(""),shuffle:!1},bg:5718188,radiusMultiplier:1,words:[]}]},window.config=e.exports},{}],5:[function(t,e){var i,s,r,n,o=function(t,e){return function(){return t.apply(e,arguments)}};s=t("./Tile"),r=t("./config"),n=t("euclidean-distance"),i=function(){function t(){this.playAutoAnimation=o(this.playAutoAnimation,this),this.onPointerUp=o(this.onPointerUp,this),this.onPointerDown=o(this.onPointerDown,this),this.onPointerMove=o(this.onPointerMove,this),this.updateBg=o(this.updateBg,this),this._getBgChangeTiles=o(this._getBgChangeTiles,this),this.setNewBg=o(this.setNewBg,this),this.setupBg=o(this.setupBg,this),this.updateMarker=o(this.updateMarker,this),this.setupMarker=o(this.setupMarker,this),this.onResize=o(this.onResize,this),this.update=o(this.update,this);var t;return this.DEBUG=/\?debug/.test(window.location.search),this.setup(),t=PIXI.loader,t.add("font","fonts/monosten/font.fnt"),t.once("complete",this.init.bind(this)),t.load(),null}return t.prototype.stage=null,t.prototype.renderer=null,t.prototype.bg=null,t.prototype.w=0,t.prototype.h=0,t.prototype.cols=null,t.prototype.rows=null,t.prototype.pointer={pos:null,last:null,delta:null},t.prototype.marker={pos:{x:0,y:0},circle:null,indicator:null},t.prototype.idleTimer=null,t.prototype.hasInteracted=!1,t.prototype.pointerDown=!1,t.prototype.activeThemeIndex=0,t.prototype.bgChangeCount=0,t.prototype.themeChanging=!1,t.prototype.tiles=[],t.prototype.bGsToChange=[],t.prototype.setup=function(){return this.onResize(),null},t.prototype.addStats=function(){return this.stats=new Stats,this.stats.domElement.style.position="absolute",this.stats.domElement.style.left="0px",this.stats.domElement.style.top="0px",document.body.appendChild(this.stats.domElement),null},t.prototype.init=function(){var t;return PIXI.RESOLUTION=window.devicePixelRatio||1,PIXI.utils._saidHello=!0,this.setDims(),t={antialias:!0,backgroundColor:r.THEMES[this.activeThemeIndex].bg,resolution:PIXI.RESOLUTION},this.renderer=PIXI.autoDetectRenderer(this.w*PIXI.RESOLUTION,this.h*PIXI.RESOLUTION,t),this.stage=new PIXI.Container,this.setupBg(),this.setupGrid(),this.setupMarker(),this.render(),this.DEBUG&&this.addStats(),document.body.appendChild(this.renderer.view),this.bindEvents(),this.playAutoAnimation(),this.draw(),null},t.prototype.draw=function(){return this.setDims(),this.update(),null},t.prototype.update=function(){return window.STOP?requestAnimationFrame(this.update):(this.DEBUG&&this.stats.begin(),this.updateMarker(),this.updateBg(),this.updateGrid(),this.render(),requestAnimationFrame(this.update),this.DEBUG&&this.stats.end(),null)},t.prototype.render=function(){return this.renderer.render(this.stage),null},t.prototype.bindEvents=function(){var t,e,i;return t="ontouchstart"in window?"touchstart":"mousedown",i="ontouchstart"in window?"touchend":"mouseup",e="ontouchstart"in window?"touchmove":"mousemove",this.onResize=_.debounce(this.onResize,300),window.addEventListener("resize",this.onResize,!1),window.addEventListener("orientationchange",this.onResize,!1),this.renderer.view.addEventListener(e,this.onPointerMove,!1),this.renderer.view.addEventListener(t,this.onPointerDown,!1),this.renderer.view.addEventListener(i,this.onPointerUp,!1),null},t.prototype.onResize=function(){var t,e,i,s,r;if(this.w=window.innerWidth,this.h=window.innerHeight,this.setDims(),this.tiles.length){for(r=this.tiles,t=i=0,s=r.length;s>i;t=++i)e=r[t],this.stage.removeChild(e.c),this.tiles[t]=null;this.tiles=[],this.setupGrid()}return null},t.prototype.setDims=function(){var t;return null!=(t=this.renderer)&&t.resize(this.w,this.h),null},t.prototype.setTheme=function(t){return null==t&&(t=null),this.themeChanging?void 0:(t||(t=this.activeThemeIndex===r.THEMES.length-1?this.activeThemeIndex=0:this.activeThemeIndex+1),this.activeThemeIndex=t,this.setNewBg(this.pointer.pos.x,this.pointer.pos.y),this.themeChanging=!0,null)},t.prototype.setupGrid=function(){var t,e,i,n,o,h;for(this.cols=Math.ceil(this.w/r.TILE_WIDTH),this.rows=Math.ceil(this.h/r.TILE_WIDTH),i=this.cols*this.rows,t=h=0;i>=0?i>h:h>i;t=i>=0?++h:--h)n=t%this.cols*r.TILE_WIDTH,o=Math.floor(t/this.cols)*r.TILE_WIDTH,e=new s({x:n,y:o,w:r.TILE_WIDTH}),this.tiles.push(e),this.stage.addChild(e.c);return null},t.prototype.updateGrid=function(){var t,e,i,s,r,n,o,h,a,l;if(this.pointer.pos){for(e=this._getIndexes(),r=0,o=e.length;o>r;r++)i=e[r],null!=(a=this.tiles[i.index])&&(a.charsToShow=i.chars);for(l=this.tiles,t=n=0,h=l.length;h>n;t=++n)s=l[t],s.update(),this.themeChanging&&s.setAlphabet(this.activeThemeIndex);return null}},t.prototype._getIndexes=function(){var t,e,i,s,o,h,a,l;for(s=[],l=this.tiles,i=h=0,a=l.length;a>h;i=++h)o=l[i],this.marker.circle.contains(o.centre.x,o.centre.y)&&(e=n([this.marker.circle.x,this.marker.circle.y],[o.centre.x,o.centre.y]),e=Math.min(e,this.marker.circle.radius),t=r.MAX_CHARS_TO_SHOW-Math.floor(e/this.marker.circle.radius*r.MAX_CHARS_TO_SHOW),t+=r.MIN_CHARS_TO_SHOW,s.push({index:i,chars:t}));return s},t.prototype.setupMarker=function(){return this.marker.pos.x=this.w/2,this.marker.pos.y=this.h/2,this.marker.circle=new PIXI.Circle(this.w/2,this.h/2,0),this.DEBUG&&(this.addStats(),this.marker.indicator=new PIXI.Graphics,this.marker.indicator.beginFill(16777215),this.marker.indicator.drawCircle(0,0,10),this.stage.addChild(this.marker.indicator),this.marker.indicator.x=this.marker.pos.x,this.marker.indicator.y=this.marker.pos.y,this.marker.indicator.visible=!0),null},t.prototype.updateMarker=function(){var t,e,i,s;if(this.pointer.pos)return i=this.pointer.pos.x-this.marker.pos.x,s=this.pointer.pos.y-this.marker.pos.y,this.marker.pos.x+=.1*i,this.marker.pos.y+=.1*s,this.marker.circle.x=this.marker.pos.x,this.marker.circle.y=this.marker.pos.y,t=Math.max(Math.abs(this.pointer.delta.x),Math.abs(this.pointer.delta.y)),e=Math.min(t/r.MAX_DELTA*100,r.MAX_DELTA)/100*r.MAX_RADIUS+r.MIN_RADIUS,e*=r.THEMES[this.activeThemeIndex].radiusMultiplier,this.marker.circle.radius=e,this.pointer.delta.x*=.98,this.pointer.delta.y*=.98,this.DEBUG&&(this.marker.indicator.x=this.marker.pos.x,this.marker.indicator.y=this.marker.pos.y),null},t.prototype.setupBg=function(){return this.bg=new PIXI.Graphics,this.stage.addChild(this.bg),null},t.prototype.setNewBg=function(t,e){var i,s,n,o;for(i=this._getBgChangeTiles(t,e),n=0,o=i.length;o>n;n++)s=i[n],this.bGsToChange.push({x:s.x,y:s.y,w:s.w,bg:r.THEMES[this.activeThemeIndex].bg});return null},t.prototype._getBgChangeTiles=function(t,e){var i,s;return i=this.bgChangeCount%3,0===i?s=_.shuffle(this.tiles.slice(0)):1===i?s=_.sortBy(this.tiles.slice(0),function(){return function(i){return n([t,e],[i.centre.x,i.centre.y])}}(this)):2===i&&(s=_.sortBy(this.tiles.slice(0),function(){return function(i){return-1*n([t,e],[i.centre.x,i.centre.y])}}(this))),this.bgChangeCount++,s},t.prototype.updateBg=function(){var t,e,i,s,r;if(this.bGsToChange.length){for(i=Math.floor(.1*this.bGsToChange.length),10>i&&(i=10,this.themeChanging=!1),e=this.bGsToChange.slice(0,i),this.bGsToChange=this.bGsToChange.slice(i),s=0,r=e.length;r>s;s++)t=e[s],this.bg.beginFill(t.bg),this.bg.drawRect(t.x,t.y,t.w,t.w);return null}},t.prototype.onPointerMove=function(t,e,i){var s,r;return null==e&&(e=null),null==i&&(i=null),t&&(this.hasInteracted=!0,"ontouchstart"in window?(e=t.originalEvent.touches[0].pageX,i=t.originalEvent.touches[0].pageY):(e=t.pageX,i=t.pageY)),this.pointer.pos&&(this.pointer.last={x:this.pointer.pos.x,y:this.pointer.pos.y}),this.pointer.pos={x:e,y:i},this.pointer.last?(s=this.pointer.pos.x-this.pointer.last.x,r=this.pointer.pos.y-this.pointer.last.y,Math.max(Math.abs(s),Math.abs(r))>Math.max(Math.abs(this.pointer.delta.x),Math.abs(this.pointer.delta.y))?this.pointer.delta={x:this.pointer.pos.x-this.pointer.last.x,y:this.pointer.pos.y-this.pointer.last.y}:(this.pointer.delta.x*=.98,this.pointer.delta.y*=.98)):this.pointer.delta={x:0,y:0},clearTimeout(this.idleTimer),this.idleTimer=setTimeout(function(t){return function(){return t.hasInteracted=!1,t.playAutoAnimation()}}(this),3e3),null},t.prototype.onPointerDown=function(){return this.pointerDown=!0,null},t.prototype.onPointerUp=function(){return this.pointerDown=!1,this.setTheme(),null},t.prototype.playAutoAnimation=function(){var t,e,i,s;return i=_.random(.05*this.w,.95*this.w),s=_.random(.05*this.h,.95*this.h),e=_.random(100,400),this.onPointerMove(null,i,s),t=Math.random(),.01>t&&this.setTheme(),this.hasInteracted||setTimeout(this.playAutoAnimation,e),null},t.prototype.EXP=function(){return window.EXP},t}(),e.exports=i},{"./Tile":3,"./config":4,"euclidean-distance":2}]},{},[1]);