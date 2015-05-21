AbstractShape         = require './shapes/AbstractShape'
NumberUtils           = require '../utils/NumberUtils'
ShapeStreamConfig     = require './ShapeStreamConfig'
ShapeStreamShapeCache = require './ShapeStreamShapeCache'

class ShapeStream

    stage    : null
    renderer : null
    layers   : {}
    
    w : 0
    h : 0

    counter : null

    mouse :
        enabled : false
        pos     : null

    pointerDown : false

    EVENT_KILL_SHAPE : 'EVENT_KILL_SHAPE'

    filters :
        blur  : null
        RGB   : null
        pixel : null

    constructor : ->

        @DEBUG = false

        @$window = $(window)
        @$el     = $('#shape-stream')

        @setup()

        return null

    setup : =>

        @onResize()
        @bindEvents()

        null

    addGui : =>

        @gui        = new dat.GUI
        @guiFolders = {}

        # @gui = new dat.GUI autoPlace : false
        # @gui.domElement.style.position = 'fixed'
        # @gui.domElement.style.top = '0px'
        # @gui.domElement.style.left = '10px'
        # document.body.appendChild @gui.domElement

        @guiFolders.generalFolder = @gui.addFolder('General')
        @guiFolders.generalFolder.add(ShapeStreamConfig.general, 'GLOBAL_SPEED', 0.5, 10).name("global speed")
        @guiFolders.generalFolder.add(ShapeStreamConfig.general, 'GLOBAL_ALPHA', 0, 1).name("global alpha")

        @guiFolders.sizeFolder = @gui.addFolder('Size')
        @guiFolders.sizeFolder.add(ShapeStreamConfig.shapes, 'MIN_WIDTH', 5, 200).name('min width')
        @guiFolders.sizeFolder.add(ShapeStreamConfig.shapes, 'MAX_WIDTH', 5, 200).name('max width')

        @guiFolders.countFolder = @gui.addFolder('Count')
        @guiFolders.countFolder.add(ShapeStreamConfig.general, 'MAX_SHAPE_COUNT', 5, 1000).name('max shapes')

        @guiFolders.shapesFolder = @gui.addFolder('Shapes')
        for shape, i in ShapeStreamConfig.shapeTypes
            @guiFolders.shapesFolder.add(ShapeStreamConfig.shapeTypes[i], 'active').name(shape.type)

        @guiFolders.blurFolder = @gui.addFolder('Blur')
        @guiFolders.blurFolder.add(ShapeStreamConfig.filters, 'blur').name("enable")
        @guiFolders.blurFolder.add(@filters.blur, 'blur', 0, 32).name("blur amount")

        @guiFolders.RGBFolder = @gui.addFolder('RGB Split')
        @guiFolders.RGBFolder.add(ShapeStreamConfig.filters, 'RGB').name("enable")
        @guiFolders.RGBFolder.add(@filters.RGB.uniforms.red.value, 'x', -20, 20).name("red x")
        @guiFolders.RGBFolder.add(@filters.RGB.uniforms.red.value, 'y', -20, 20).name("red y")
        @guiFolders.RGBFolder.add(@filters.RGB.uniforms.green.value, 'x', -20, 20).name("green x")
        @guiFolders.RGBFolder.add(@filters.RGB.uniforms.green.value, 'y', -20, 20).name("green y")
        @guiFolders.RGBFolder.add(@filters.RGB.uniforms.blue.value, 'x', -20, 20).name("blue x")
        @guiFolders.RGBFolder.add(@filters.RGB.uniforms.blue.value, 'y', -20, 20).name("blue y")

        @guiFolders.pixelateFolder = @gui.addFolder('Pixellate')
        @guiFolders.pixelateFolder.add(ShapeStreamConfig.filters, 'pixel').name("enable")
        @guiFolders.pixelateFolder.add(@filters.pixel.size, 'x', 1, 32).name("pixel size x")
        @guiFolders.pixelateFolder.add(@filters.pixel.size, 'y', 1, 32).name("pixel size y")

        @guiFolders.paletteFolder = @gui.addFolder('Colour palette')
        @guiFolders.paletteFolder.add(ShapeStreamConfig, 'activePalette', ShapeStreamConfig.palettes).name("palette")

        null

    addStats : =>

        @stats = new Stats
        @stats.domElement.style.position = 'absolute'
        @stats.domElement.style.left = '0px'
        @stats.domElement.style.top = '0px'
        document.body.appendChild @stats.domElement

        null

    addShapeCounter : =>

        @shapeCounter = document.createElement 'div'
        @shapeCounter.style.position = 'absolute'
        @shapeCounter.style.left = '100px'
        @shapeCounter.style.top = '15px'
        @shapeCounter.style.color = '#fff'
        @shapeCounter.style.textTransform = 'uppercase'
        @shapeCounter.innerHTML = "0 shapes"
        document.body.appendChild @shapeCounter

        null

    updateShapeCounter : =>

        @shapeCounter.innerHTML = "#{@_getShapeCount()} shapes"

        null

    createStageFilters : =>

        @filters.blur  = new PIXI.BlurFilter
        @filters.RGB   = new PIXI.RGBSplitFilter
        @filters.pixel = new PIXI.PixelateFilter

        @filters.blur.blur = ShapeStreamConfig.filterDefaults.blur.general

        @filters.RGB.uniforms.red.value   = ShapeStreamConfig.filterDefaults.RGB.red
        @filters.RGB.uniforms.green.value = ShapeStreamConfig.filterDefaults.RGB.green
        @filters.RGB.uniforms.blue.value  = ShapeStreamConfig.filterDefaults.RGB.blue

        @filters.pixel.uniforms.pixelSize.value = ShapeStreamConfig.filterDefaults.pixel.amount

        null

    init: =>

        PIXI.dontSayHello = true

        @setDims()
        @setStreamDirection()

        @shapes   = []
        @stage    = new PIXI.Stage 0x1A1A1A
        @renderer = PIXI.autoDetectRenderer @w, @h, antialias : true
        @render()

        ShapeStreamShapeCache.createCache()

        @container = new PIXI.DisplayObjectContainer
        @stage.addChild @container

        @createStageFilters()

        if @DEBUG
            @addGui()
            @addStats()
            @addShapeCounter()

        @$el.append @renderer.view

        @draw()

        null

    draw : =>

        @counter = 0

        @setDims()

        @addShapes ShapeStreamConfig.general.INITIAL_SHAPE_COUNT
        @update()

        null

    addShapes : (count) =>

        for i in [0...count]

            shape  = new AbstractShape @
            shape.setProps true

            @_positionShape shape

            @container.addChild shape.getSprite()

            @shapes.push shape

        null

    _positionShape : (shape) =>

        pos = @_getShapeStartPos()

        sprite            = shape.getSprite()
        sprite.position.x = sprite._position.x = pos.x
        sprite.position.y = sprite._position.y = pos.y

        null

    _getShapeStartPos : =>

        seed = Math.random()

        if seed > 0.5
            w = if seed > 0.7 then (@w5*4) else (@w3*2)
            x = (NumberUtils.getRandomFloat w, @w)
            y = -ShapeStreamConfig.shapes.MAX_WIDTH
        else
            h = if seed > 0.2 then @h5 else @h3
            x = @w+ShapeStreamConfig.shapes.MAX_WIDTH
            y = (NumberUtils.getRandomFloat -ShapeStreamConfig.shapes.MAX_WIDTH, h)

        return {x, y}

    _getShapeCount : =>

        @container.children.length

    onShapeDie : (shape) =>

        if @_getShapeCount() > ShapeStreamConfig.general.MAX_SHAPE_COUNT
            @removeShape shape
        else
            @resetShape shape

        null

    resetShape : (shape) =>

        shape.reset()
        @_positionShape shape

        null

    removeShape : (shape) =>

        index = @shapes.indexOf shape
        @shapes[index] = null

        @container.removeChild shape.getSprite()

        null

    update : =>

        if window.STOP then return requestAnimFrame @update

        if @DEBUG then @stats.begin()

        @counter++

        if (@_getShapeCount() < ShapeStreamConfig.general.MAX_SHAPE_COUNT) then @addShapes 1

        @updateShapes()
        @render()

        filtersToApply = []
        (filtersToApply.push @filters[filter] if enabled) for filter, enabled of ShapeStreamConfig.filters

        @stage.filters = if filtersToApply.length then filtersToApply else null

        @updateSpeedAndAlpha()

        requestAnimFrame @update

        if @DEBUG
            @updateShapeCounter()
            @stats.end()

        null

    updateShapes : =>

        (shape?.callAnimate()) for shape in @shapes

        null

    updateSpeedAndAlpha : =>

        if @pointerDown
            if ShapeStreamConfig.general.GLOBAL_SPEED < ShapeStreamConfig.general.MAX_GLOBAL_SPEED
                ShapeStreamConfig.general.GLOBAL_SPEED += ShapeStreamConfig.general.GLOBAL_SPEED_INC_RATE

            if ShapeStreamConfig.general.GLOBAL_ALPHA < ShapeStreamConfig.general.MAX_GLOBAL_ALPHA
                ShapeStreamConfig.general.GLOBAL_ALPHA += ShapeStreamConfig.general.GLOBAL_ALPHA_INC_RATE
        else
            if ShapeStreamConfig.general.GLOBAL_SPEED > ShapeStreamConfig.general.MIN_GLOBAL_SPEED
                ShapeStreamConfig.general.GLOBAL_SPEED -= ShapeStreamConfig.general.GLOBAL_SPEED_DEC_RATE

            if ShapeStreamConfig.general.GLOBAL_ALPHA > ShapeStreamConfig.general.MIN_GLOBAL_ALPHA
                ShapeStreamConfig.general.GLOBAL_ALPHA -= ShapeStreamConfig.general.GLOBAL_ALPHA_DEC_RATE

        null

    render : =>

        @renderer.render @stage 

        null

    bindEvents : =>

        downInteraction = if 'ontouchstart' of window then 'touchstart' else 'mousedown'
        upInteraction = if 'ontouchstart' of window then 'touchend' else 'mouseup'

        @onResize = _.debounce @onResize, 300

        @$window.on 'resize orientationchange', @onResize
        @$window.on 'mousemove', @onMouseMove

        @$el.on downInteraction, @onPointerDown
        @$el.on upInteraction, @onPointerUp

        null

    onResize : =>

        @w = window.innerWidth
        @h = window.innerHeight

        @setDims()

        null

    setDims : =>

        @w3 = @w/3
        @h3 = @h/3

        @w5 = @w/5
        @h5 = @h/5

        # just use non-relative sizes for now
        # ShapeStreamConfig.shapes.MIN_WIDTH = (ShapeStreamConfig.shapes.MIN_WIDTH_PERC/100)*@w
        # ShapeStreamConfig.shapes.MAX_WIDTH = (ShapeStreamConfig.shapes.MAX_WIDTH_PERC/100)*@w

        @setStreamDirection()

        @renderer?.resize @w, @h

        null

    onMouseMove : (e) =>

        @mouse.multiplier = 1
        @mouse.pos        = x : e.pageX, y : e.pageY
        @mouse.enabled    = true

        if ShapeStreamConfig.filters.RGB
            min = ShapeStreamConfig.filterDefaults.RGB.red.MIN
            max = ShapeStreamConfig.filterDefaults.RGB.red.MAX
            ShapeStreamConfig.filterDefaults.RGB.red.x = NumberUtils.map @mouse.pos.x, 0, @w, min, max
            ShapeStreamConfig.filterDefaults.RGB.red.y = NumberUtils.map @mouse.pos.y, 0, @h, min, max

        null

    setStreamDirection : =>

        if @w > @h
            x = 1
            y = @h / @w
        else
            y = 1
            x = @w / @h

        ShapeStreamConfig.general.DIRECTION_RATIO = {x, y}

        null

    onPointerDown : =>

        @pointerDown = true

        null

    onPointerUp : =>

        @pointerDown = false
        ShapeStreamConfig.setNextPalette()
        # ShapeStreamConfig.setNextShape()

        null

    SS : =>

        return window.SS

module.exports = ShapeStream
