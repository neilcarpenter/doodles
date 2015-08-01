Tile   = require './Tile'
config = require './config'

class Exp

    stage    : null
    renderer : null

    w : 0
    h : 0

    cols : null
    rows : null

    marker :
        pos    : x : 0, y : 0
        circle : null

    pointer :
        pos   : null
        last  : null
        delta : null

    pointerDown : false

    tiles : []

    constructor : ->

        @DEBUG = /\?debug/.test(window.location.search)

        @$window = $(window)
        @$el     = $('#exp')

        @setup()

        loader = PIXI.loader
        loader.add 'font', "fonts/monosten/font.fnt"
        loader.once 'complete', @init.bind(@)
        loader.load()

        return null

    setup : ->

        @onResize()
        @bindEvents()

        null

    addStats : ->

        @stats = new Stats
        @stats.domElement.style.position = 'absolute'
        @stats.domElement.style.left = '0px'
        @stats.domElement.style.top = '0px'
        document.body.appendChild @stats.domElement

        null

    init: ->

        console.log "init: ->", @

        PIXI.RESOLUTION = window.devicePixelRatio or 1
        PIXI.utils._saidHello = true

        @setDims()

        @renderer = PIXI.autoDetectRenderer @w*2, @h*2, antialias : true, backgroundColor : 0xEB423E, resolution : window.devicePixelRatio or 1
        @stage = new PIXI.Container
        @setupGrid()

        @render()

        @marker.pos.x = @w/2
        @marker.pos.y = @h/2

        if @DEBUG
            @addStats()

            @marker.circle = new PIXI.Graphics
            @marker.circle.beginFill(0xffffff)
            @marker.circle.drawCircle(0, 0, 10)
            @stage.addChild @marker.circle
            @marker.circle.x = @marker.pos.x
            @marker.circle.y = @marker.pos.y

            @marker.circle.visible = true

        @$el.append @renderer.view

        @draw()

        null

    draw : ->

        # @counter = 0

        @setDims()

        @update()

        null

    update : =>

        if window.STOP then return requestAnimationFrame @update

        if @DEBUG then @stats.begin()

        # @counter++

        @updateMarker()
        @updateGrid()

        @render()

        requestAnimationFrame @update

        if @DEBUG
            @stats.end()

        null

    render : ->

        @renderer.render @stage

        null

    bindEvents : ->

        downInteraction = if 'ontouchstart' of window then 'touchstart' else 'mousedown'
        upInteraction   = if 'ontouchstart' of window then 'touchend' else 'mouseup'
        moveInteraction = if 'ontouchstart' of window then 'touchmove' else 'mousemove'

        @onResize = _.debounce @onResize, 300

        @$window.on 'resize orientationchange', @onResize

        @$el.on moveInteraction, @onPointerMove
        @$el.on downInteraction, @onPointerDown
        @$el.on upInteraction, @onPointerUp

        null

    onResize : =>

        # TODO - reset grid items

        @w = window.innerWidth
        @h = window.innerHeight

        @setDims()

        null

    setDims : ->

        @renderer?.resize @w, @h

        null

    setupGrid : ->

        @cols = Math.ceil @w / config.TILE_WIDTH
        @rows = Math.ceil @h / config.TILE_WIDTH

        tileCount = @cols * @rows

        for i in [0...tileCount]

            x = ( i % @cols ) * config.TILE_WIDTH
            y = Math.floor( i / @cols ) * config.TILE_WIDTH

            tile = new Tile x: x, y: y, w: config.TILE_WIDTH

            @tiles.push tile
            @stage.addChild tile.c

        null

    updateGrid : ->

        return unless @pointer.pos

        indexes = @_getIndexes()
        for index in indexes

            @tiles[index]?.charsToShow = 10

        hChars = []
        vChars = Array.apply(null, Array(@tiles.length)).map((x, i) -> return ' ' )
        for tile, i in @tiles

            tile.update()

        #     hChars.push tile.t.text
        #     vChars[ (i % @cols) + Math.floor(i / @cols) ] = tile.t.text

        # if hChars.join('').indexOf(config.WORD) > -1 or hChars.reverse().join('').indexOf(config.WORD) > -1 or vChars.join('').indexOf(config.WORD) > -1 or vChars.reverse().join('').indexOf(config.WORD) > -1
        #     window.STOP = 1

        # console.log "L-R", hChars.join('').indexOf(config.WORD)
        # console.log "R-L", hChars.reverse().join('').indexOf(config.WORD)
        # console.log "T-B", vChars.join('').indexOf(config.WORD)
        # console.log "B-T", vChars.reverse().join('').indexOf(config.WORD)

        null

    _getIndexes : ->

        closestIndex = (Math.floor(@marker.pos.x / config.TILE_WIDTH)) + ((Math.floor(@marker.pos.y / config.TILE_WIDTH)) * @cols)-@cols
        delta        = Math.max(Math.abs(@pointer.delta.x), Math.abs(@pointer.delta.y))

        indexes = [ closestIndex ]

        if delta > 50
            indexes.push(
                closestIndex - 1,
                closestIndex + 1,
                closestIndex - @cols,
                closestIndex + @cols
            )

        if delta > 80
            indexes.push(
                closestIndex - 2,
                closestIndex + 2,
                closestIndex - @cols-1,
                closestIndex - @cols+1,
                closestIndex + @cols-1,
                closestIndex + @cols+1,
                closestIndex - @cols*2,
                closestIndex + @cols*2
            )

        if delta > 120
            indexes.push(
                closestIndex - 3,
                closestIndex + 3,
                closestIndex - @cols-2,
                closestIndex - @cols+2,
                closestIndex + @cols-2,
                closestIndex + @cols+2,
                closestIndex - (@cols*2)-1,
                closestIndex - (@cols*2)+1,
                closestIndex + (@cols*2)-1,
                closestIndex + (@cols*2)+1,
                closestIndex - @cols*3,
                closestIndex + @cols*3
            )

        indexes

    updateMarker : =>

        return unless @pointer.pos

        xD = @pointer.pos.x - @marker.pos.x
        yD = @pointer.pos.y - @marker.pos.y

        @marker.pos.x += (xD * 0.1)
        @marker.pos.y += (yD * 0.1)

        if @DEBUG
            @marker.circle.x = @marker.pos.x
            @marker.circle.y = @marker.pos.y

        null

    onPointerMove : (e) =>

        if 'ontouchstart' of window
            x = e.originalEvent.touches[0].pageX
            y = e.originalEvent.touches[0].pageY
        else
            x = e.pageX
            y = e.pageY

        if @pointer.pos then @pointer.last = x : @pointer.pos.x, y : @pointer.pos.y

        @pointer.pos  = x : x, y : y

        if @pointer.last
            newDX = @pointer.pos.x - @pointer.last.x
            newDY = @pointer.pos.y - @pointer.last.y
            if Math.max(Math.abs(newDX), Math.abs(newDY)) > Math.max(Math.abs(@pointer.delta.x), Math.abs(@pointer.delta.y))
                @pointer.delta = x : @pointer.pos.x - @pointer.last.x, y : @pointer.pos.y - @pointer.last.y
            else
                @pointer.delta.x *= 0.98
                @pointer.delta.y *= 0.98

        else
            @pointer.delta = x : 0, y : 0

        null

    onPointerDown : =>

        @pointerDown = true

        null

    onPointerUp : =>

        @pointerDown = false

        null

    EXP : ->

        return window.EXP

module.exports = Exp
