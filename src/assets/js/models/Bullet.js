const { findPoint, polygonsDoIntersect } = require('../utilities');

module.exports = class Bullet {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.isLive = true;
        setTimeout(this.die.bind(this), Bullet.ttl);
    }

    static get ttl() {
        return 1000 * 2;
    }

    static get width() {
        return 5;
    }
    static get height() {
        return 5;
    }
    static get linearSpeed() {
        return 4.2; //pixels per frame
    }

    get X() {
        return this.x;
    }

    get Y() {
        return this.y;
    }

    bounds() {
        return {
            x: this.x - Bullet.width/2, 
            y: this.y - Bullet.height/2,
            width: Bullet.width,
            height: Bullet.height
        }
    }

    polygon() {
        const {x,y,width,height} = this.bounds();
        return [
            {x,y},
            {x: x + width, y},
            {x: x + width, y: y + height},
            {x, y: y + height},
        ];
    }
    
    /**
     * Draws Bullet image on canvas.
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        let image = new Image();
        image.src = Bullet.imageSource;
        context.fillStyle = '#111';
        context.beginPath();
        context.arc(this.x, this.y, Bullet.width/2, 0, 2*Math.PI);
        context.fill();
        context.fillStyle = '#000';
    }

    /**
     * Moves bullet in the linear direction.
     */
    move() {
        const {deltaX, deltaY} = findPoint(this.direction, Bullet.linearSpeed);
        this.x += deltaX;
        this.y += deltaY;

    }
    
    /**
     * Reflects the direction of ball from walls.
     * @param {Wall[]} walls array of walls
     */
    reflectFrom(walls) {
        const wall = walls.find(wall => polygonsDoIntersect(wall.polygon(), this.polygon()) );
        if(wall) {
            this.direction = wall.isVertical ? (180 - this.direction) : (360 - this.direction);
        }
        return !!wall;
    }

    die() {
        this.isLive = false;
    }

}