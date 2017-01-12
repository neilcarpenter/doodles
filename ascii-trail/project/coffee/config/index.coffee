module.exports =

	FONT_SIZE :
		SMALL  : '10px'
		MEDIUM : '12px'
		LARGE  : '12px'

	TILE_WIDTH :
		SMALL  : 8
		MEDIUM : 10
		LARGE  : 10

	MIN_RADIUS: 10
	MAX_RADIUS: 50
	MAX_DELTA : 150

	MIN_CHARS_TO_SHOW : 1
	MAX_CHARS_TO_SHOW : 20

	THEMES: [
		{
			alphabet:
				chars   : 'Museum Digital Art'.split('')
				# chars   : 'abcdefghijklmnopqrstuvwxyz'.split('')
				shuffle : true
			bg: 0xFFFFFF
			words: [ 'code', 'doodle' ]
			radiusMultiplier: 2
			markerSpeed: 0.1
			autoplayMinDelay: 200
			autoplayMaxDelay: 700
		},
		{
			alphabet:
				chars   : 'abcdefghijklmnopqrstuvwxyz0123456789!?*()@£$%^&_-+=[]{}:;\'"\\|<>,./~`'.split('')
				shuffle : true
			bg: 0x000000
			words: []
			radiusMultiplier: 3
		},
		{
			alphabet:
				chars   : 'etaoinshrd'.split('')
				shuffle : true
			bg: 0x395CAA
			words: [ 'date', 'hind', 'shot', 'haste', 'airshot', 'shorten', 'earth', 'other', 'shine', 'trash' ]
			radiusMultiplier: 1.5
		},
		{
			alphabet:
				chars   : '1234567890'.split('')
				shuffle : true
			bg: 0x1E502C
			words: []
			radiusMultiplier: 0.5
		},
		{
			alphabet:
				chars   : '!?*()@£$%^&_-+=[]{}:;\'"\\|<>,./~`'.split('')
				shuffle : false
			bg: 0x5740AC
			radiusMultiplier: 1
			words: []
		}
	]

window.config = module.exports
