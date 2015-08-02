class Device

    @SIZES : 
        SMALL  : 'SMALL'
        MEDIUM : 'MEDIUM'
        LARGE  : 'LARGE'

    @SIZE : null

    @setSize : (w, h) =>

        size = switch true
            when w > 1300 or h > 1300 then Device.SIZES.LARGE
            when w <= 700 or h <= 700 then Device.SIZES.SMALL
            else Device.SIZES.MEDIUM

        Device.SIZE = size

        null

module.exports = Device
window.Device = Device