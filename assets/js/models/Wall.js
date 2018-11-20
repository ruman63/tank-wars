module.exports = class Wall {
    /**
     * Constructs a Wall
     * @param {Nymber} x x-coordinate top-left-corner
     * @param {Number} y y-coordinate top-left corner
     * @param {Number} length length of Wall
     * @param {Boolean} [isVertical=true] Is it Vertical Wall 
     */
    constructor(x, y, length, isVertical = true) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.isVertical = isVertical;
    }

    static get width() {
        return 3;
    }

    get X() {
        return this.x;
    }

    get Y() {
        return this.y;
    }

    get direction() {
        return this.isVertical ? 90 : 180;
    }
    
    /**
     * Draws Bullet image on canvas.
     * @param {CanvasRenderingContext2D} context 
     */
    draw(context) {
        context.fillStyle = '#222';
        const {x, y, width, height} = this.bounds();
        context.fillRect(x, y, width, height);
        context.fillStyle = '#000';
    }

    bounds() {
        return {
            x: this.x, 
            y: this.y, 
            width: this.isVertical ? Wall.width : this.length, 
            height:this.isVertical ? this.length : Wall.width
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
}