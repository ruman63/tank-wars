const { findPoint, liesIn } = require('../utilities');
const throttle = require('lodash.throttle')
const Bullet = require('./Bullet');
/**
 * @typedef Bounds
 * @type {object}
 * @property {Number} x
 * @property {Number} y
 * @property {Number} width
 * @property {Number} height
 */

module.exports = class Tank {
    constructor(x, y, direction = 0) {
        this.x = x;
        this.y = y;
        this.direction = direction;
    }
    static get imageSource() {
        return '/img/tank.png';
    }
    static get width() {
        return 26;
    }
    static get height() {
        return 16;
    }
    static get linearSpeed() {
        return 3; //pixels per frame
    }
    static get rotationalSpeed() {
        return 3; //degrees per frame
    }

    get X() {
        return this.x;
    }

    get Y() {
        return this.y;
    }

    /**
     * Draws tank image on canvas.
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        let image = new Image();
        image.src = Tank.imageSource;
        context.save();

        context.translate(this.x, this.y);
        context.rotate(this.direction * Math.PI / 180);

        context.drawImage(image, -Tank.width/2, -Tank.height/2, Tank.width, Tank.height);

        context.restore();
    }

    /**
     * Moves tank in the current facing direction.
     * @param {Bounds} within stay Within Bounds
     * @param {?bool} backward if moving backward
     */
    move(within, backward = false) {

        const {deltaX, deltaY} = findPoint(this.direction, backward ? -Tank.linearSpeed : Tank.linearSpeed);
        const nextPoint = {x: this.x + deltaX, y: this.y + deltaY }

        let bounds = {
            x:within.x + Tank.width/2, 
            y: within.y + Tank.height/2,
            width: within.width - Tank.width/2,
            height: within.height - Tank.height/2,
        }
        
        if(liesIn(bounds, nextPoint)) {
            this.x = nextPoint.x;
            this.y = nextPoint.y;
            return true;
        }
        return false;
    }

    /**
     * Rotates tank in clockwise/anticlockwise direction.
     * @param {bool} anticlockwise if rotating anticlockwise
     */
    rotate(anticlockwise = false) {
        this.direction += anticlockwise ? -Tank.rotationalSpeed : Tank.rotationalSpeed;
        this.direction = this.direction < 0 ? 360 + this.direction : this.direction % 360;     
    }

    /**
     * Fires a bullet, (throttled to 10 bullets per second)
     */
    fire() {
        return throttle(function(){
            const { deltaX, deltaY } = findPoint(this.direction, Tank.width/2);
            return new Bullet(this.x + deltaX, this.y + deltaY, this.direction);
        }.bind(this), 100)()
    }

}