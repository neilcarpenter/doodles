config = require '../config'

class Tile

	x: null
	y: null
	w: null	

	tX: null
	tY: null

	c: null
	t: null

	centre : null
	chance : 0.8
	charChangeChance: 0.6

	charsToShow : 0

	# FOUND : false

	constructor : ({@x, @y, @w}) ->

		@centre =  x: @x + @w/2, y: @y + @w/2

		@c = new PIXI.Container
		@c.width = @c.height = @w

		opts =
			font : "#{config.FONT_SIZE[Device.SIZE]} font"
			fill : 0xffffff

		@t = new PIXI.extras.BitmapText ' ', opts
		bounds = @t.getLocalBounds()
		@tX = @centre.x - (bounds.width/2) - bounds.x
		@tY = @centre.y - (bounds.height/2) - bounds.y - 10 # why this 10? don't know
		@t.position.set @tX, @tY

		@maxFontSize = parseInt config.FONT_SIZE[Device.SIZE], 10
		
		# @b = new PIXI.Graphics
		# @b.beginFill 0xffffff
		# @b.alpha = 0.3
		# @b.drawRect @x+2, @y+2, @w-4, @w-4

		# @c.addChild @b
		@c.addChild @t

		@setAlphabet()

		return null

	_getNewChar : ->

		if @charCounter is @chars.length-1 then @charCounter = 0

		char = @chars[@charCounter++]

		char

	setAlphabet : (themeIndex=0) ->

		@chars = config.THEMES[themeIndex].alphabet.chars
		@chars = if config.THEMES[themeIndex].alphabet.shuffle then _.shuffle @chars else @chars

		@charCounter = 0

		null

	# setFoundChar : (char) ->

	# 	@t.text = char
	# 	@t.alpha = 1

	# 	@FOUND = true

	# 	setTimeout =>
	# 		@FOUND = false
	# 		@charsToShow = config.MAX_CHARS_TO_SHOW
	# 		@update()
	# 	, 1000

	# 	null

	update : ->

		# return unless @charsToShow > 0 and !@FOUND
		return unless @charsToShow > 0

		if Math.random() > @chance

			char = if @charsToShow is 1 then ' ' else @_getNewChar()

			# avChar = (config.MIN_CHARS_TO_SHOW + config.MAX_CHARS_TO_SHOW) / 2
			# alpha  = Math.min @charsToShow / avChar, 1
			alpha  = Math.min @charsToShow / config.MAX_CHARS_TO_SHOW, 1

			@t.alpha = alpha
			@t.font.size = Math.min (Math.ceil alpha * @maxFontSize) + (@maxFontSize / 3), @maxFontSize

			if Math.random() > @charChangeChance or @charsToShow is 1 then @t.text  = char

			@charsToShow--

		null

module.exports = Tile
