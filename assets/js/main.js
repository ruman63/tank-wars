const throttle = require('lodash.throttle');

let canvas1 = document.getElementById('canvas1');
let stopBtn = document.getElementById('stop');
let timer = null;

canvas1.width = window.innerWidth * 0.8
canvas1.height = window.innerWidth * 0.8 * (9/16)
let unit = canvas1.width * 0.001;

let ctx = canvas1.getContext("2d");
start(ctx);
canvas1.focus();

let keysHeld = new Set();
window.tank = { x:25, y:25, w: 25, h:17, d: 0, src: '/assets/tank.png'}
let bullets = []

let directions = 'nesw';
/**
 * renders within canvas
 * @param {CanvasRenderingContext2D} ctx 2D graphics context
 */
function drawRotatedImage(ctx, img, {x, y, w, h, d}) {
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(d * Math.PI / 180);
    ctx.drawImage(img, -w/2, -h/2, w, h);
    ctx.restore();
}
 
function drawTank(ctx) {
    let img = new Image();
    img.src = tank.src;
    drawRotatedImage(ctx, img, tank);
}

function drawBullets(ctx) {
    let img = new Image();
    img.src = '/assets/bullet.png';
    bullets.forEach(bullet => drawRotatedImage(ctx, img, bullet));
}
function findPoint(direction, distance) {
    let m = Math.tan(direction * Math.PI / 180);
    let deltaX = Math.sqrt(distance*distance / (1 + m*m));
    if( direction > 90 && direction <= 270 ) {
        deltaX *= -1;
    }
    if (distance < 0 ) {
        deltaX *= -1;
    }
    let deltaY = m * deltaX;
    return {deltaX, deltaY};
}
function move(movable, speed) {
    const {deltaX, deltaY} = findPoint(movable.d, speed);
    movable.x += deltaX;
    movable.y += deltaY;
}
function tankRotateLeft(deg = 3) {
    tank.d -= deg;
    tank.d = tank.d < 0 ? 360 + tank.d : tank.d;
}
function tankRotateRight(deg = 3) {
    tank.d += deg;
    tank.d = tank.d % 360;
}
function fireBullet() {
    const {deltaX, deltaY} = findPoint(tank.d, tank.w/2);
    return {
        x: tank.x + deltaX, 
        y: tank.y + deltaY, 
        w:5, h:7, 
        d:tank.d
    };
}

window.addEventListener('resize', () => {
    canvas1.width = window.innerWidth * 0.8
    canvas1.height = window.innerWidth * 0.8 * (9/16)
    ctx = canvas1.getContext("2d");
    unit = canvas1.width * 0.001;
    start(ctx);
});

stopBtn.addEventListener('click', () => {
    clearInterval(timer);
});


document.addEventListener('keydown', function(evt){
    if(evt.code.startsWith('Arrow') || evt.code == 'Space') {
        keysHeld.add(evt.code)
        evt.preventDefault();
    }

    if ( keysHeld.has('Space')){
        handleFire();
    }
});

document.addEventListener('keyup', function(evt) {
    keysHeld.delete(evt.code);
})

const handleFire = throttle(function() {
    bullets.push(fireBullet());
}, 100)

function isInCanvas({x,y,w,h}) {
    let bounds = {x:0, y:0, w: canvas1.width, h:canvas1.height};
    return x > bounds.x && x < bounds.w
        && y > bounds.y && y < bounds.h;    
}
function restrictInCanvas(object) {
    const {x, y, w, h} = object;
    let bounds = {x:w/2, y:h/2, w: canvas1.width - (w/2), h:canvas1.height - (h/2)};
    object.x = Math.min(Math.max(x, bounds.x), bounds.w);
    object.y = Math.min(Math.max(y, bounds.y), bounds.h);
}
function nextFrame() {

    if (keysHeld.has('ArrowUp')) {
        move(tank, 5);
    } else if (keysHeld.has('ArrowDown')) {
        move(tank, -5);
    }

    if ( keysHeld.has('ArrowLeft')) {
        tankRotateLeft();
    } else if (keysHeld.has('ArrowRight')) {
        tankRotateRight();
    } 

    restrictInCanvas(tank);
    bullets.forEach(bullet => move(bullet, 7));
    bullets = bullets.filter(bullet => isInCanvas(bullet));
}
/**
 * renders within canvas
 * @param {CanvasRenderingContext2D} context 2D graphics context
 * @param {Number} x
 * @param {Number} y
 */
function render(context) {
    context.clearRect(0,0, canvas1.width, canvas1.height);
    context.fillRect(0,0, canvas1.width, canvas1.height);


    // Draw tank
    drawTank(context);
    // context.stroke();
    drawBullets(context);
    nextFrame();
}
// function getRandom(unitx, unity) {
//     return {x: Math.ceil(Math.random() * 100) * unitx, y: Math.ceil(Math.random() * 100) * unity};
// }
/**
 * renders within canvas
 * @param {CanvasRenderingContext2D} ctx 2D graphics context
 */
function start(ctx) {
    timer = setInterval(render, 1000/60, ctx);
}