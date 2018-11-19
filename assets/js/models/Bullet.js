const { findPoint, liesIn } = require('../utilities');

module.exports = class Bullet {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
    }

    static get imageSource() {
        return '/img/bullet.png';
    }

    static get width() {
        return 7;
    }
    static get height() {
        return 4;
    }
    static get linearSpeed() {
        return 3.7; //pixels per frame
    }

    get X() {
        return this.x;
    }

    get Y() {
        return this.y;
    }
    
    /**
     * Draws Bullet image on canvas.
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        let image = new Image();
        image.src = Bullet.imageSource;
        context.save();

        context.translate(this.x, this.y);
        context.rotate(this.direction * Math.PI / 180);

        context.drawImage(image, -Bullet.width/2, -Bullet.height/2, Bullet.width, Bullet.height);

        context.restore();
    }

    /**
     * Moves bullet in the linear direction.
     */
    move() {
        const {deltaX, deltaY} = findPoint(this.direction, Bullet.linearSpeed);
        this.x += deltaX;
        this.y += deltaY;
    }

    isIn(x, y, width, height) {
        return liesIn({x,y,width,height}, { x:this.x, y:this.y })
    }

}