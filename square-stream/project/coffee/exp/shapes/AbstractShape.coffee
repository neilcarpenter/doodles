ShapeStreamConfig     = require '../ShapeStreamConfig'
ShapeStreamShapeCache = require '../ShapeStreamShapeCache'
NumberUtils           = require '../../utils/NumberUtils'

class AbstractShape

	s : null

	_shape : null
	_color : null

	width       : null
	speedMove   : null
	speedRotate : null
	alphaValue  : null

	# _positionVarianceX : null
	# _positionVarianceY : null

	dead : false

	displacement : 0

	@triangleRatio : Math.cos(Math.PI/6)

	setProps : (firstInit=false) =>

		# @_shape = ShapeStreamConfig.getRandomShape()
		@_shape = ShapeStreamConfig.activeShape
		@_color = ShapeStreamConfig.getRandomColor()

		@width       = @_getWidth()
		@height      = @_getHeight @_shape, @width
		@speedMove   = @_getSpeedMove()
		@speedRotate = @_getSpeedRotate()
		@alphaValue  = @_getAlphaValue()

		if firstInit
			@s = new PIXI.Sprite ShapeStreamShapeCache.shapes[@_shape][@_color]
		else
			@s.setTexture ShapeStreamShapeCache.shapes[@_shape][@_color]

		@s.width     = @width
		@s.height    = @height
		@s.blendMode = PIXI.blendModes.ADD
		@s.alpha     = @alphaValue
		@s.anchor.x  = @s.anchor.y = 0.5

		# track natural, non-displaced positioning
		@s._position = x : 0, y : 0

		null

	reset : =>

		@setProps()
		@dead = false

		null

	_getWidth : =>

		NumberUtils.getRandomFloat ShapeStreamConfig.shapes.MIN_WIDTH, ShapeStreamConfig.shapes.MAX_WIDTH

	_getHeight : (shape, width) =>

		height = switch true
			when shape is 'Triangle' then (width * AbstractShape.triangleRatio)
			else width

		height

	_getSpeedMove : =>

		NumberUtils.getRandomFloat ShapeStreamConfig.shapes.MIN_SPEED_MOVE, ShapeStreamConfig.shapes.MAX_SPEED_MOVE

	_getSpeedRotate : =>

		NumberUtils.getRandomFloat ShapeStreamConfig.shapes.MIN_SPEED_ROTATE, ShapeStreamConfig.shapes.MAX_SPEED_ROTATE

	_getAlphaValue : =>

		range = ShapeStreamConfig.shapes.MAX_ALPHA - ShapeStreamConfig.shapes.MIN_ALPHA
		alpha = ((@width / ShapeStreamConfig.shapes.MAX_WIDTH) * range) + ShapeStreamConfig.shapes.MIN_ALPHA

		alpha

	_getDisplacement : (axis) =>

		# return 0
		return 0 unless @SS().mouse.enabled

		dist = @SS().mouse.pos[axis]-@s.position[axis]
		dist = if dist < 0 then -dist else dist

		if dist < ShapeStreamConfig.interaction.MOUSE_RADIUS
			strength = (ShapeStreamConfig.interaction.MOUSE_RADIUS - dist) / ShapeStreamConfig.interaction.MOUSE_RADIUS
			value    = (ShapeStreamConfig.interaction.DISPLACEMENT_MAX_INC*ShapeStreamConfig.general.GLOBAL_SPEED*strength)
			@displacement = if @s.position[axis] > @SS().mouse.pos[axis] then @displacement-value else @displacement+value
		
		if @displacement isnt 0
			if @displacement > 0
				@displacement-=ShapeStreamConfig.interaction.DISPLACEMENT_DECAY
				@displacement = if @displacement < 0 then 0 else @displacement
			else
				@displacement+=ShapeStreamConfig.interaction.DISPLACEMENT_DECAY
				@displacement = if @displacement > 0 then 0 else @displacement

		@displacement

	# _positionVariance_1 : (t) =>

	# 	Math.cos t * 0.001 / ShapeStreamConfig.general.GLOBAL_SPEED

	# _positionVariance_2 : (t) =>

	# 	Math.sin t * 0.001 / ShapeStreamConfig.general.GLOBAL_SPEED

	# _positionVariance_3 : (t) =>

	# 	Math.cos t * 0.005 / ShapeStreamConfig.general.GLOBAL_SPEED

	# _positionVariance_4 : (t) =>

	# 	Math.sin t * 0.005 / ShapeStreamConfig.general.GLOBAL_SPEED

	callAnimate : =>

		return unless !@dead

		@s.alpha = @alphaValue*ShapeStreamConfig.general.GLOBAL_ALPHA

		@s._position.x -= (@speedMove*ShapeStreamConfig.general.GLOBAL_SPEED)*ShapeStreamConfig.general.DIRECTION_RATIO.x
		@s._position.y += (@speedMove*ShapeStreamConfig.general.GLOBAL_SPEED)*ShapeStreamConfig.general.DIRECTION_RATIO.y

		@s.position.x = @s._position.x+@_getDisplacement('x')
		@s.position.y = @s._position.y+@_getDisplacement('y')

		@s.rotation += @speedRotate*ShapeStreamConfig.general.GLOBAL_SPEED

		if (@s.position.x + (@width/2) < 0) or (@s.position.y - (@width/2) > @SS().h) then @kill()

		null

	kill : =>

		@dead = true

		@SS().onShapeDie @

	getSprite : =>

		return @s

	SS : =>

		return window.SS

module.exports = AbstractShape
