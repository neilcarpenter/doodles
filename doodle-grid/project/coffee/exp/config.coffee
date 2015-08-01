module.exports =

	TILE_WIDTH: 16

	MIN_RADIUS: 10
	MAX_RADIUS: 50
	MAX_DELTA : 150

	MIN_CHARS_TO_SHOW : 8
	MAX_CHARS_TO_SHOW : 12

	THEMES: [
		{
			alphabet:
				chars   : 'codedoodl.es'.split('')
				shuffle : true
			bg: 0xEB423E
			words: [ 'code', 'doodle' ]
			radiusMultiplier: 1
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
				chars   : 'abcdefghijklmnopqrstuvwxyz0123456789!?*()@£$%^&_-+=[]{}:;\'"\\|<>,./~`'.split('')
				shuffle : true
			bg: 0x000000
			words: []
			radiusMultiplier: 3
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
