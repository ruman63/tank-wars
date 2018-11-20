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