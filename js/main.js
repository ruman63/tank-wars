(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const Tank = require('./models/Tank');
const Wall = require('./models/Wall');
const {polygonsDoIntersect} = require('./utilities')
let canvas = document.getElementById('canvas');

let stopBtn = document.getElementById('stop');
let timer = null;

canvas.width = window.innerWidth * 0.8
canvas.height = window.innerWidth * 0.8 * (9/16)
let ctx = canvas.getContext("2d");
start(ctx);   
canvas.focus();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth * 0.8
    canvas.height = window.innerWidth * 0.8 * (9/16)
    ctx = canvas.getContext("2d");
    unit = canvas.width * 0.001;
    start(ctx);
});

stopBtn.addEventListener('click', () => {
    clearInterval(timer);
});


let keysHeld = new Set();
window.tank = new Tank(300, 200, 0);
window.bullets = [];
window.walls = [
    new Wall(0, 0, canvas.height),
    new Wall(canvas.width-Wall.width, 0, canvas.height),
    new Wall(0, 0, canvas.width, false),
    new Wall(0, canvas.height-Wall.width, canvas.width, false),
    new Wall(200, 100, 200, false),
    new Wall(100, 120, 200),
    new Wall(500, 120, 200),
    new Wall(200, 350, 200, false),
];

document.addEventListener('keydown', function(evt){
    if(evt.code.startsWith('Arrow')) {
        keysHeld.add(evt.code)
    }
    if(evt.code == 'Space' || evt.code.startsWith('Arrow')) {
        evt.preventDefault();
    }
});

document.addEventListener('keyup', function(evt) {
    if(evt.code.startsWith('Arrow')) {
        keysHeld.delete(evt.code);
        return false;
    }

    if ( evt.code == 'Space' ){
        window.bullets.push(window.tank.fire());
        return false;
    } 
})

function nextFrame() {
    
    if (keysHeld.has('ArrowUp')) {
        window.tank.move(window.walls);
    } else if (keysHeld.has('ArrowDown')) {
        window.tank.move(window.walls, true);
    }

    if ( keysHeld.has('ArrowLeft')) {
        window.tank.rotate(window.walls);
    } else if (keysHeld.has('ArrowRight')) {
        window.tank.rotate(window.walls, true);
    } 

    window.bullets.forEach(bullet => bullet.move() );
    window.bullets.forEach(bullet => bullet.reflectFrom(walls));
    window.bullets = window.bullets.filter(bullet => bullet.isLive );
}
function strokePolygon(ctx, poly, color = `#f00`) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(poly[0].x, poly[0].y);
    for( let i = 1; i < poly.length; i++) {
        ctx.lineTo(poly[i].x, poly[i].y);
    }
    ctx.lineTo(poly[0].x, poly[0].y);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = `#000`;
}

function isGameOver() {
    return window.bullets.some(bullet => polygonsDoIntersect(bullet.polygon(), tank.polygon()));
}
/**
 * renders within canvas
 * @param {CanvasRenderingContext2D} context 2D graphics context
 * @param {Number} x
 * @param {Number} y
 */
function render(context, debug = false) {
    context.clearRect(0,0, canvas.width, canvas.height);
    // Draw tank
    tank.draw(context)

    window.bullets.forEach(bullet => bullet.draw(context));
    walls.forEach(wall => wall.draw(context));
    
    if(debug) {
        debugBoxes();
    }

    if(isGameOver()) {
        clearInterval(timer);
    }
    nextFrame();
}

function debugBoxes() {
    strokePolygon(context, tank.polygon());
    window.bullets.forEach(bullet => strokePolygon(context, bullet.polygon()));
    window.bullets.forEach(wall => strokePolygon(context, wall.polygon()));
}

/**
 * renders within canvas
 * @param {CanvasRenderingContext2D} ctx 2D graphics context
 */
function start(ctx) {
    timer = setInterval(render, 1000/60, ctx);
}
},{"./models/Tank":3,"./models/Wall":4,"./utilities":5}],2:[function(require,module,exports){
const { findPoint, polygonsDoIntersect } = require('../utilities');

module.exports = class Bullet {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.isLive = true;
        setTimeout(this.die.bind(this), Bullet.ttl);
    }

    static get imageSource() {
        return '/img/bullet.png';
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
},{"../utilities":5}],3:[function(require,module,exports){
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
        return './img/tank.png';
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
},{"../utilities":5,"./Bullet":2}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
/**
 * @typedef Bounds
 * @type {object}
 * @property {Number} x
 * @property {Number} y
 * @property {Number} width
 * @property {Number} height
 */
/**
 * @typedef Point
 * @type {object}
 * @property {Number} x
 * @property {Number} y
 */


 /**
  * returns {deltaX, deltaY} based on the direction & distance
  * @param {Number} direction direction in degrees
  * @param {Number} distance size of the delta
  */
function findPoint(direction, distance) {
    return {
        deltaX: distance * Math.cos(direction * Math.PI / 180), 
        deltaY: distance * Math.sin(direction * Math.PI / 180), 
    };
}
/**
 * returns true if point lies inside bounds.
 * @param {Bounds} bounds Bounds
 * @param {Point} point point
 */
function liesIn(bounds, point) {
    return point.x > bounds.x && point.x < bounds.width
    && point.y > bounds.y && point.y < bounds.height;
}

function rotatePoint(point, degrees, axisPoint = undefined) {
    if(axisPoint == undefined) {
        axisPoint = {x: 0, y: 0}
    } 
    const rad = degrees * Math.PI / 180;
    point.x -= axisPoint.x;
    point.y -= axisPoint.y;

    let newx = point.x * Math.cos(rad) - point.y * Math.sin(rad);
    let newy = point.x * Math.sin(rad) + point.y * Math.cos(rad);

    return {x: newx + axisPoint.x, y: newy + axisPoint.y};
}

/**
 * Helper function to determine whether there is an intersection between the two polygons described
 * by the lists of vertices. Uses the Separating Axis Theorem
 *
 * @param a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @param b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @return true if there is any intersection between the 2 polygons, false otherwise
 */
function polygonsDoIntersect (p1, p2) {
    let polygons = [p1, p2];
    let minA, maxA, projected, i, i1, j, minB, maxB;

    for (i = 0; i < polygons.length; i++) {

        // for each polygon, look at each edge of the polygon, and determine if it separates
        // the two shapes
        let polygon = polygons[i];
        for (i1 = 0; i1 < polygon.length; i1++) {

            // grab 2 vertices to create an edge
            let i2 = (i1 + 1) % polygon.length;
            let point1 = polygon[i1];
            let point2 = polygon[i2];

            // find the line perpendicular to this edge
            let normal = { x: point2.y - point1.y, y: point1.x - point2.x };

            minA = maxA = undefined;
            // for each vertex in the first shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            for (j = 0; j < p1.length; j++) {
                projected = normal.x * p1[j].x + normal.y * p1[j].y;
                if (minA === undefined || projected < minA) {
                    minA = projected;
                }
                if (maxA === undefined || projected > maxA) {
                    maxA = projected;
                }
            }

            // for each vertex in the second shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            minB = maxB = undefined;
            for (j = 0; j < p2.length; j++) {
                projected = normal.x * p2[j].x + normal.y * p2[j].y;
                if (minB === undefined || projected < minB) {
                    minB = projected;
                }
                if (maxB === undefined || projected > maxB) {
                    maxB = projected;
                }
            }

            // if there is no overlap between the projects, the edge we are looking at separates the two
            // polygons, and we know there is no overlap
            if (maxA < minB || maxB < minA) {
                return false;
            }
        }
    }
    return true;
};

module.exports = {
    findPoint,
    liesIn,
    rotatePoint,
    polygonsDoIntersect
}
},{}]},{},[1])