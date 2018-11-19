const Tank = require('./models/Tank');
// const Bullet = require('./models/Bullet');
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
window.tank = new Tank(25, 25, 0);
window.bullets = []

document.addEventListener('keydown', function(evt){
    if(evt.code.startsWith('Arrow') || evt.code == 'Space') {
        keysHeld.add(evt.code)
        evt.preventDefault();
    }

    if ( keysHeld.has('Space') ){
        window.bullets.push(window.tank.fire());
    } 
});

document.addEventListener('keyup', function(evt) {
    keysHeld.delete(evt.code);
})

function nextFrame() {

    if (keysHeld.has('ArrowUp')) {
        window.tank.move({x: 0, y: 0, width: canvas.width, height: canvas.height});
    } else if (keysHeld.has('ArrowDown')) {
        window.tank.move({x: 0, y: 0, width: canvas.width, height: canvas.height}, true);
    }

    if ( keysHeld.has('ArrowLeft')) {
        window.tank.rotate(true);
    } else if (keysHeld.has('ArrowRight')) {
        window.tank.rotate();
    } 

    window.bullets.forEach(bullet => bullet.move());
    window.bullets = window.bullets.filter(bullet => bullet.isIn(0, 0, canvas.width, canvas.height ));
}
/**
 * renders within canvas
 * @param {CanvasRenderingContext2D} context 2D graphics context
 * @param {Number} x
 * @param {Number} y
 */
function render(context) {
    context.clearRect(0,0, canvas.width, canvas.height);
    context.fillRect(0,0, canvas.width, canvas.height);

    // Draw tank
    tank.draw(context)
    // context.stroke();
    window.bullets.forEach(bullet => bullet.draw(context));

    nextFrame();
}

/**
 * renders within canvas
 * @param {CanvasRenderingContext2D} ctx 2D graphics context
 */
function start(ctx) {
    timer = setInterval(render, 1000/60, ctx);
}