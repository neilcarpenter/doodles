class ShapeStreamConfig

	@colors :
		# http://flatuicolors.com/
		FLAT : [
			'19B698',
			'2CC36B',
			'2E8ECE',
			'9B50BA',
			'E98B39',
			'EA6153',
			'F2CA27'
		]
		BW : [
			'E8E8E8',
			'D1D1D1',
			'B9B9B9',
			'A3A3A3',
			'8C8C8C',
			'767676',
			'5E5E5E'
		]
		RED : [
			'AA3939',
			'D46A6A',
			'FFAAAA',
			'801515',
			'550000'
		]
		# http://paletton.com/#uid=13v0u0kntS+c6XUikVtsvPzDRKa
		BLUE : [
			'9FD4F6',
			'6EBCEF',
			'48A9E8',
			'2495DE',
			'0981CF'
		]
		# http://paletton.com/#uid=12Y0u0klSLOb5VVh3QYqoG7xS-Y
		GREEN : [
			'9FF4C1',
			'6DE99F',
			'46DD83',
			'25D06A',
			'00C24F'
		]
		# http://paletton.com/#uid=11w0u0knRw0e4LEjrCEtTutuXn9
		YELLOW : [
			'FFEF8F',
			'FFE964',
			'FFE441',
			'F3D310',
			'B8A006'
		]

	@palettes      : 'flat' : 'FLAT', 'b&w' : 'BW', 'red' : 'RED', 'blue' : 'BLUE', 'green' : 'GREEN', 'yellow' : 'YELLOW'
	@palettesArray : [ 'FLAT', 'BW', 'RED', 'BLUE', 'GREEN', 'YELLOW' ]
	@activePalette : 'BW'

	@shapeTypes : [
		{
			type   : 'Circle'
			active : false
		}
		{
			type   : 'Square'
			active : true
		}
		{
			type   : 'Triangle'
			active : false
		}
	]

	@shapeTypesArray : [ 'Circle', 'Square', 'Triangle' ]
	@activeShape : 'Square'

	@shapes :
		MIN_WIDTH_PERC : 3
		MAX_WIDTH_PERC : 7

		# set this depending on viewport size
		MIN_WIDTH : 30
		MAX_WIDTH : 70

		MIN_SPEED_MOVE : 2
		MAX_SPEED_MOVE : 3.5

		MIN_SPEED_ROTATE : -0.01
		MAX_SPEED_ROTATE : 0.01

		MIN_ALPHA : 1
		MAX_ALPHA : 1

		MIN_BLUR : 0
		MAX_BLUR : 10

	@general : 
		GLOBAL_SPEED          : 8
		MIN_GLOBAL_SPEED      : 4
		MAX_GLOBAL_SPEED      : 9
		GLOBAL_SPEED_INC_RATE : 0.1
		GLOBAL_SPEED_DEC_RATE : 0.03

		GLOBAL_ALPHA          : 0.75
		MIN_GLOBAL_ALPHA      : 0.75
		MAX_GLOBAL_ALPHA      : 1
		GLOBAL_ALPHA_INC_RATE : 0.005
		GLOBAL_ALPHA_DEC_RATE : 0.001

		MAX_SHAPE_COUNT     : 300
		INITIAL_SHAPE_COUNT : 1
		DIRECTION_RATIO     : x : 1, y : 1

	@layers :
		BACKGROUND : 'BACKGROUND'
		MIDGROUND  : 'MIDGROUND'
		FOREGROUND : 'FOREGROUND'

	@filters :
		blur  : false
		RGB   : true
		pixel : false

	@filterDefaults :
		blur :
			general    : 10
			foreground : 0
			midground  : 0
			background : 0
		RGB :
			red   : x : 2, y : 2, MIN : -5, MAX : 5
			green : x : -2, y : 2
			blue  : x : 2, y : -2
		pixel :
			amount : x : 4, y : 4

	@interaction :
		MOUSE_RADIUS         : 800
		DISPLACEMENT_MAX_INC : 0.2
		DISPLACEMENT_DECAY   : 0.01

	@getRandomColor : ->

		return @colors[@activePalette][_.random(0, @colors[@activePalette].length-1)]

	@getRandomShape : ->

		activeShapes = _.filter @shapeTypes, (s) -> s.active

		return activeShapes[_.random(0, activeShapes.length-1)].type

	@_setNextPalette : ->

		idx = @palettesArray.indexOf @activePalette
		idx = if idx is @palettesArray.length-1 then 0 else idx+1

		@activePalette = @palettesArray[idx]

		null

	@setNextPalette : _.debounce @_setNextPalette, 300

	@setNextShape : ->

		idx = @shapeTypesArray.indexOf @activeShape
		idx = if idx is @shapeTypesArray.length-1 then 0 else idx+1
		@activeShape = @shapeTypesArray[idx]

		null

window.ShapeStreamConfig=ShapeStreamConfig
module.exports = ShapeStreamConfig
