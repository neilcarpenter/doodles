config = require './config'

class Tile

	x: null
	y: null
	w: null	

	tX: null
	tY: null

	c: null
	t: null

	centre : null
	chance : 0.9

	charsToShow : 0

	# FOUND : false

	opts : font : '18px font', fill : 0xffffff

	constructor : ({@x, @y, @w}) ->

		@centre =  x: @x + @w/2, y: @y + @w/2

		@c = new PIXI.Container
		@c.width = @c.height = @w

		@t = new PIXI.extras.BitmapText ' ', @opts
		bounds = @t.getLocalBounds()
		@tX = @centre.x - (bounds.width/2) - bounds.x
		@tY = @centre.y - (bounds.height/2) - bounds.y - 10 # why this 10? don't know
		@t.position.set @tX, @tY
		
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

			avChar = (config.MIN_CHARS_TO_SHOW + config.MAX_CHARS_TO_SHOW) / 2
			alpha  = Math.min @charsToShow / avChar, 1

			@t.text  = char
			@t.alpha = alpha

			@charsToShow--

		null

module.exports = Tile
