Tile   = require './Tile'
Device = require '../utils/Device'
config = require '../config'
eDist  = require 'euclidean-distance'

class Exp

    stage    : null
    renderer : null
    bg       : null

    w : 0
    h : 0

    cols : null
    rows : null

    pointer :
        pos   : null
        last  : null
        delta : null

    marker :
        pos    : x : 0, y : 0
        circle    : null
        indicator : null

    idleTimer     : null
    hasInteracted : false
    pointerDown   : false

    activeThemeIndex : 0
    bgChangeCount    : 0
    themeChanging    : false

    tiles       : []
    bGsToChange : []

    constructor : ->

        @DEBUG = /\?debug/.test(window.location.search)

        @setup()

        loader = PIXI.loader
        loader.add 'font', "fonts/monofonto-blue/font.fnt"
        loader.once 'complete', @init.bind(@)
        loader.load()

        return null

    setup : ->

        @onResize()

        null

    addStats : ->

        @stats = new Stats
        @stats.domElement.style.position = 'absolute'
        @stats.domElement.style.left = '0px'
        @stats.domElement.style.top = '0px'
        document.body.appendChild @stats.domElement

        null

    init: ->

        PIXI.RESOLUTION = window.devicePixelRatio or 1
        PIXI.utils._saidHello = true

        @setDims()

        rendererOpts = antialias : true, backgroundColor : config.THEMES[@activeThemeIndex].bg, resolution : PIXI.RESOLUTION

        @renderer = PIXI.autoDetectRenderer @w*PIXI.RESOLUTION, @h*PIXI.RESOLUTION, rendererOpts
        @stage    = new PIXI.Container

        @setupBg()
        @setupGrid()
        @setupMarker()

        @render()

        if @DEBUG
            @addStats()

        document.body.appendChild @renderer.view

        @bindEvents()
        @playAutoAnimation()

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
        @updateBg()
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

        window.addEventListener 'resize', @onResize, false
        window.addEventListener 'orientationchange', @onResize, false

        @renderer.view.addEventListener moveInteraction, @onPointerMove, false
        @renderer.view.addEventListener downInteraction, @onPointerDown, false
        @renderer.view.addEventListener upInteraction, @onPointerUp, false

        null

    onResize : =>

        @w = window.innerWidth
        @h = window.innerHeight

        Device.setSize(@w, @h)

        @setDims()
        @updateBgForce()

        if @tiles.length
            for tile, i in @tiles
                @stage.removeChild tile.c
                @tiles[i] = null
            @tiles = []

            @setupGrid()

        null

    setDims : ->

        @renderer?.resize @w, @h

        null

    setTheme : (index=null) ->

        return

        return if @themeChanging

        if !index
            index = if @activeThemeIndex is config.THEMES.length-1 then @activeThemeIndex = 0 else @activeThemeIndex+1

        @activeThemeIndex = index

        @setNewBg(@pointer.pos.x, @pointer.pos.y)

        @themeChanging = true

        null

    setupGrid : ->

        @cols = Math.ceil @w / config.TILE_WIDTH[Device.SIZE]
        @rows = Math.ceil @h / config.TILE_WIDTH[Device.SIZE]

        tileCount = @cols * @rows

        for i in [0...tileCount]

            x = ( i % @cols ) * config.TILE_WIDTH[Device.SIZE]
            y = Math.floor( i / @cols ) * config.TILE_WIDTH[Device.SIZE]

            tile = new Tile x: x, y: y, w: config.TILE_WIDTH[Device.SIZE]

            @tiles.push tile
            @stage.addChild tile.c

        null

    updateGrid : ->

        return unless @pointer.pos

        for item in @_getIndexes()

            # @tiles[item.index]?.charsToShow = item.chars
            @tiles[item.index]?.charsToShow = Math.min (@tiles[item.index]?.charsToShow + (item.chars / 3)), config.MAX_CHARS_TO_SHOW

        # if config.THEMES[@activeThemeIndex].words.length

        #     @_checkForWords()

        for tile, i in @tiles

            tile.update()

            if @themeChanging
                tile.setAlphabet @activeThemeIndex

        null

    _getIndexes : ->

        indexes = []

        for tile, index in @tiles

            if @marker.circle.contains tile.centre.x, tile.centre.y

                dist  = eDist [@marker.circle.x, @marker.circle.y], [tile.centre.x, tile.centre.y]
                dist = Math.min dist, @marker.circle.radius

                chars = config.MAX_CHARS_TO_SHOW - Math.floor((dist / @marker.circle.radius) * config.MAX_CHARS_TO_SHOW)
                chars += config.MIN_CHARS_TO_SHOW

                indexes.push { index, chars }

        indexes

    # _checkForWords : ->

    #     hChars = []
    #     hTiles = []
    #     vChars = []
    #     vTiles = []

    #     for tile, i in @tiles

    #         hChars.push tile.t.text
    #         hTiles.push tile

    #         vIndex = (i % @cols) * @rows + Math.floor(i / @rows)
    #         vChars[vIndex] = tile.t.text
    #         vTiles[vIndex] = tile

    #     found = []

    #     for word in config.THEMES[@activeThemeIndex].words

    #         L2RStr = hChars.join('')
    #         R2LStr = hChars.reverse().join('')
    #         T2BStr = vChars.join('')
    #         B2TStr = vChars.reverse().join('')

    #         if L2RStr.indexOf(word) > -1
    #             # console.log "L->R", hTiles[L2RStr.indexOf(word)]
    #             indices = @_getFoundIndices word, L2RStr
    #             for index in indices
    #                 found.push @_captureFoundWord hTiles, index, word

    #         # if R2LStr.indexOf(word) > -1
    #             # console.log "R->L", hTiles.reverse()[R2LStr.indexOf(word)]
    #             # indices = @_getFoundIndices word, R2LStr
    #             # for index in indices
    #             #     found.push @_captureFoundWord hTiles.reverse(), index, word

    #         if T2BStr.indexOf(word) > -1
    #             # console.log "T->B", vTiles[T2BStr.indexOf(word)]
    #             indices = @_getFoundIndices word, T2BStr
    #             for index in indices
    #                 found.push @_captureFoundWord vTiles, index, word

    #         # if B2TStr.indexOf(word) > -1
    #             # console.log "B->T", vTiles.reverse()[B2TStr.indexOf(word)]
    #             # found = true

    #         # if L2RStr.indexOf(word) > -1 or R2LStr.indexOf(word) > -1 or T2BStr.indexOf(word) > -1 or B2TStr.indexOf(word) > -1
    #             # console.log word + ' :)'
    #             # found = true

    #         for foundWord in found

    #             for char in foundWord

    #                 if !char.item.FOUND
    #                     char.item.setFoundChar char.char

    #     null

    # _getFoundIndices : (searchStr, str) ->

    #     startIndex   = 0
    #     indices      = []
    #     searchStrLen = searchStr.length

    #     while (index = str.indexOf(searchStr, startIndex)) > -1
    #         indices.push(index)
    #         startIndex = index + searchStrLen

    #     indices

    # _captureFoundWord : (itemArray, index, word) ->

    #     foundWord = []

    #     for item, i in itemArray.slice index, index+word.length

    #         foundWord.push
    #             item : item
    #             char : word.charAt i


    #     foundWord

    setupMarker : =>

        @marker.pos.x = @w/2
        @marker.pos.y = @h/2

        @marker.circle = new PIXI.Circle @w/2, @h/2, 0

        if @DEBUG
            @addStats()

            @marker.indicator = new PIXI.Graphics
            @marker.indicator.beginFill(0xffff00)
            @marker.indicator.drawCircle(0, 0, 10)
            @stage.addChild @marker.indicator
            @marker.indicator.x = @marker.pos.x
            @marker.indicator.y = @marker.pos.y

            @marker.indicator.visible = true

        null

    updateMarker : =>

        return unless @pointer.pos

        xD = @pointer.pos.x - @marker.pos.x
        yD = @pointer.pos.y - @marker.pos.y

        @marker.pos.x += (xD * config.THEMES[@activeThemeIndex].markerSpeed or 0.1)
        @marker.pos.y += (yD * config.THEMES[@activeThemeIndex].markerSpeed or 0.1)

        @marker.circle.x = @marker.pos.x
        @marker.circle.y = @marker.pos.y

        delta  = Math.max(Math.abs(@pointer.delta.x), Math.abs(@pointer.delta.y))
        radius = (((Math.min((delta / config.MAX_DELTA)*100, config.MAX_DELTA)) / 100) * config.MAX_RADIUS) + config.MIN_RADIUS
        radius = radius * config.THEMES[@activeThemeIndex].radiusMultiplier

        @marker.circle.radius = radius
        @pointer.delta.x *= 0.98
        @pointer.delta.y *= 0.98

        if @DEBUG
            @marker.indicator.x = @marker.pos.x
            @marker.indicator.y = @marker.pos.y

        null

    setupBg : =>

        @bg = new PIXI.Graphics
        # @bg.beginFill 0xff0000
        # @bg.alpha = 0.3
        # @bg.drawRect 0, 0, @w, @w

        @stage.addChild @bg

        null

    setNewBg : (fromX, fromY) =>

        sortedTiles = @_getBgChangeTiles(fromX, fromY)

        for tile in sortedTiles

            @bGsToChange.push(
                x  : tile.x
                y  : tile.y
                w  : tile.w
                bg : config.THEMES[@activeThemeIndex].bg
            )

        null

    _getBgChangeTiles : (fromX, fromY) =>

        changer = @bgChangeCount % 3

        # if changer is 0
        #     tiles = _.sortBy _.shuffle(@tiles.slice(0)), (tile) => return tile.t.alpha
        # else if changer is 1
        #     tiles = _.sortBy _.shuffle(@tiles.slice(0)), (tile) => return -1*tile.t.alpha
        if changer is 0
            tiles = _.shuffle(@tiles.slice(0))
        else if changer is 1
            tiles = _.sortBy @tiles.slice(0), (tile) => return eDist [fromX, fromY], [tile.centre.x, tile.centre.y]
        else if changer is 2
            tiles = _.sortBy @tiles.slice(0), (tile) => return -1*eDist [fromX, fromY], [tile.centre.x, tile.centre.y]
        # else if changer is 5
        #     tiles = _.sortBy _.shuffle(@tiles.slice(0)), (tile) => return tile.t.x
        # else if changer is 6
        #     tiles = _.sortBy _.shuffle(@tiles.slice(0)), (tile) => return -1*tile.t.x
        # else if changer is 7
        #     tiles = _.sortBy _.shuffle(@tiles.slice(0)), (tile) => return tile.t.y
        # else if changer is 8
        #     tiles = _.sortBy _.shuffle(@tiles.slice(0)), (tile) => return -1*tile.t.y

        @bgChangeCount++

        tiles

    updateBg : =>

        return unless @bGsToChange.length

        toChange = Math.floor(@bGsToChange.length * 0.1)

        if toChange < 10
            toChange = 10
            @themeChanging = false

        tiles        = @bGsToChange.slice(0, toChange)
        @bGsToChange = @bGsToChange.slice(toChange)

        for tile in tiles
            @bg.beginFill tile.bg
            @bg.drawRect tile.x, tile.y, tile.w, tile.w

        null

    updateBgForce : =>

        return unless @bg

        @bg.beginFill config.THEMES[@activeThemeIndex].bg
        @bg.drawRect 0, 0, @w, @h

        null

    onPointerMove : (e, x=null, y=null) =>

        if e

            @hasInteracted = true

            if 'ontouchstart' of window
                x = e.touches[0].pageX
                y = e.touches[0].pageY
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

        clearTimeout @idleTimer
        @idleTimer = setTimeout =>
            @hasInteracted = false
            @playAutoAnimation()
        , 3000

        null

    onPointerDown : =>

        @pointerDown = true

        null

    onPointerUp : =>

        @pointerDown = false
        @setTheme()

        null

    playAutoAnimation : =>

        randX = _.random(@w*0.05, @w*0.95)
        randY = _.random(@h*0.05, @h*0.95)
        delay = _.random(300, 600)

        @onPointerMove null, randX, randY

        chance = Math.random()

        if chance < 0.01
            @setTheme()

        if !@hasInteracted
            setTimeout @playAutoAnimation, delay

        null

    EXP : ->

        return window.EXP

module.exports = Exp
