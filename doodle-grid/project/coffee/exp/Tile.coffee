config = require './config'

class Tile

	x: null
	y: null
	w: null

	tX: null
	tY: null

	c: null
	t: null

	chance : 0.9

	charsToShow : 0

	# alphabet : 'abcdefghijklmnopqrstuvwxyz0123456789!?*()@£$%^&_-+=[]{}:;\'"\\|<>,./~`'
	# alphabet : 'codedoodl.es'

	constructor : ({@x, @y, @w}) ->

		@chars       = _.shuffle(config.WORD.split(''))
		@charCounter = 0
		# char = 'n'

		opts = font : '18px font', fill : 0xffffff, align : 'center'

		@c = new PIXI.Container
		@c.width = @c.height = @w

		@t = new PIXI.extras.BitmapText ' ', opts
		bounds = @t.getLocalBounds()
		@tX = @x + (@w/2) - (bounds.width/2) - bounds.x
		@tY = @y + (@w/2) - (bounds.height/2) - bounds.y - 10 # why this 10? don't know
		@t.position.set @tX, @tY
		
		# @b = new PIXI.Graphics
		# @b.beginFill 0xffffff
		# @b.alpha = 0.3
		# @b.drawRect @x+2, @y+2, @w-4, @w-4

		# @c.addChild @b
		@c.addChild @t

		return null

	_getNewChar : ->

		if @charCounter is @chars.length-1 then @charCounter = 0

		char = @chars[@charCounter++]

		char

	update : ->

		return unless @charsToShow > 0

		if Math.random() > @chance

			char = if @charsToShow is 1 then ' ' else @_getNewChar()

			@t.text = char
			@t.alpha = @charsToShow / 10

			@charsToShow--

		null

module.exports = Tile
