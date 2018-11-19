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
let tank = { x:25, y:25, w: 17, h:25, d:'e', src: '/assets/tank.png'}
let bullets = []

let directions = 'nesw';
/**
 * renders within canvas
 * @param {CanvasRenderingContext2D} ctx 2D graphics context
 */
function drawRotatedImage(ctx, img, x, y, w, h, dir) {
    ctx.save();
    ctx.translate(x,y);
    switch(dir) {
        case 'e':
            ctx.rotate(Math.PI/2);
            break;
        case 's':
            ctx.rotate(Math.PI);
            break;
        case 'w':
            ctx.rotate(3*Math.PI/2);
    }
    ctx.drawImage(img, -w/2, -h/2, w, h);
    ctx.restore();
}
 
function drawTank(ctx) {
    let img = new Image();
    img.src = tank.src;
    drawRotatedImage(ctx, img, tank.x, tank.y, tank.w, tank.h, tank.d);
}

function drawBullets(ctx) {
    let img = new Image();
    img.src = '/assets/bullet.png';
    bullets.forEach(bullet => drawRotatedImage(ctx, img, bullet.x, bullet.y, bullet.w, bullet.h, bullet.d));
}

function move(movable, speed) {
    switch(movable.d) {
        case 'n': movable.y-=speed; break;
        case 'w': movable.x-=speed; break;
        case 's': movable.y+=speed; break;
        case 'e': movable.x+=speed; break;
    }
}
function tankRotateLeft() {
    tank.d = directions[(directions.indexOf(tank.d) - 1)%4]
}
function tankRotateRight() {
    tank.d = directions[(directions.indexOf(tank.d) + 1)%4]
}
function fireBullet() {
    switch(tank.d) {
        case 'n': return {x: tank.x, y: tank.y - Math.ceil(tank.h/2), w:5, h:7, d:tank.d};
        case 'w': return {x: tank.x - Math.ceil(tank.w/2), y: tank.y, w:5, h:7, d:tank.d};
        case 's': return {x: tank.x, y: tank.y + Math.ceil(tank.h/2), w:5, h:7, d:tank.d};
        case 'e': return {x: tank.x + Math.ceil(tank.w/2), y: tank.y, w:5, h:7, d:tank.d};
    }
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

    if ( keysHeld.has('ArrowLeft')) {
        tankRotateLeft();
    } else if (keysHeld.has('ArrowRight')) {
        tankRotateRight();
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
    // return {
        object.x = Math.min(Math.max(x, bounds.x), bounds.w);
        object.y = Math.min(Math.max(y, bounds.y), bounds.h);
    // }
}
function nextFrame() {
    if (keysHeld.has('ArrowUp')) {
        move(tank, 5);
    } else if (keysHeld.has('ArrowDown')) {
        move(tank, -5);
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