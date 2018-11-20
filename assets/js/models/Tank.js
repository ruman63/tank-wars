const { findPoint, polygonsDoIntersect, rotatePoint } = require('../utilities');
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
    move(walls, backward = false) {

        const {deltaX, deltaY} = findPoint(this.direction, backward ? -Tank.linearSpeed : Tank.linearSpeed);
        this.x += deltaX;
        this.y += deltaY;
        if( walls.some(wall => polygonsDoIntersect(this.polygon(), wall.polygon())) ) {
            this.move([], !backward);
            return false;
        }
        return true;
    }

    /**
     * Rotates tank in clockwise/anticlockwise direction.
     * @param {bool} anticlockwise if rotating anticlockwise
     */
    rotate(walls, clockwise = false) {
        this.direction += clockwise ? Tank.rotationalSpeed : -Tank.rotationalSpeed;
        this.direction = this.direction < 0 ? 360 + this.direction : this.direction % 360;     
        if( walls.some(wall => polygonsDoIntersect(this.polygon(), wall.polygon())) ) {
            this.rotate([], !clockwise);
            return false;
        }
        return false;
    }

    /**
     * Fires a bullet.
     */
    fire() {
        const { deltaX, deltaY } = findPoint(this.direction, (Tank.width/2) + (Bullet.width/2) + 1);
        return new Bullet(this.x + deltaX, this.y + deltaY, this.direction);
    }

    polygon() {
        const points = [
            {x: this.x - Tank.width/2, y: this.y - Tank.height/2},
            {x: this.x + Tank.width/2, y: this.y - Tank.height/2},
            {x: this.x + Tank.width/2, y: this.y + Tank.height/2},
            {x: this.x - Tank.width/2, y: this.y + Tank.height/2},
        ];
        return points.map(point => rotatePoint(point, this.direction, {x: this.x, y: this.y}));
    }

}