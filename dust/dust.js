// options
let sf = 2; // scale factor
let fps = 144;

// canvas
let canvas = document.getElementById("canvas");
canvas.width = Math.floor(canvas.scrollWidth / sf);
canvas.height = Math.floor(canvas.scrollHeight / sf);
let ctx = canvas.getContext("2d");
let w,h,wh,hh;
let bordertop,borderleft,borderright,borderbottom;

// timer
let interval = Math.round(1000/fps);
let now, delta;
let then = Date.now();

const pi2 = Math.PI*2;

let mousedown = false;
let mouseX = 0;
let mouseY = 0;

let parallaxamt = 50 / sf;

const particles = [];
const numberOfParticles = 100;
const minSize = 2 / sf < 0 ? 1 : 2 / sf;
const maxSize = 20 / sf;
const maxSpeed = 1;
const friction = 0.05 / sf;

let windX = 0;
let windY = 0;

let lerpamt = 0.01 / sf;
let lerpamt_magnet = 0.001 * sf;

// alpha stuff
const minAlpha = 0;
const maxAlpha = 0.4;
const mapConst = (maxAlpha - minAlpha) / (maxSize - minSize);

function loop(){
    requestAnimationFrame(loop);
    now = Date.now();
    delta = now - then;
    if (delta < interval) return;
    then = now - (delta % interval);

    if (mousedown){
        for (const particle of particles){
            let lastx = particle.x;
            let lasty = particle.y;
            particle.x = lerp(particle.x, mouseX, (maxSize - particle.size) * lerpamt_magnet);
            particle.y = lerp(particle.y, mouseY, (maxSize - particle.size) * lerpamt_magnet);
            particle.xaccel = particle.x - lastx;
            particle.yaccel = particle.y - lasty;
            particle.size = lerp(particle.size, minSize, (maxSize - particle.size) * lerpamt_magnet);
        }
    }

    draw();
}

function draw(){
    ctx.clearRect(0,0,w,h);

    let pxoffsetX = (mouseX - wh) / parallaxamt;
    let pxoffsetY = (mouseY - hh) / parallaxamt;

    for (const particle of particles){
        // position
        particle.x = (particle.x + particle.xaccel + windX);
        particle.y = (particle.y + particle.yaccel + windY);

        // check bounds
        if (particle.x > borderright) particle.x = borderleft;
        else if (particle.x < borderleft) particle.x = borderright;
        if (particle.y > borderbottom) particle.y = bordertop;
        else if (particle.y < bordertop) particle.y = borderbottom;

        // go to target size
        particle.size = lerp(particle.size, particle.sizeTarget, lerpamt);
        if (Math.abs(particle.size - particle.sizeTarget) < 1) particle.sizeTarget = rng(minSize, maxSize);

        // go to target accel
        particle.xaccel = lerp(particle.xaccel, particle.xaccelTarget, lerpamt);
        if (Math.abs(particle.xaccel - particle.xaccelTarget) < 1) particle.xaccelTarget = rng(-maxSpeed, maxSpeed);
        particle.yaccel = lerp(particle.yaccel, particle.yaccelTarget, lerpamt);
        if (Math.abs(particle.xaccel - particle.yaccelTarget) < 1) particle.yaccelTarget = rng(-maxSpeed, maxSpeed);

        // apply friction
        if (particle.xaccel > maxSpeed) particle.xaccel -= friction;
        if (particle.yaccel > maxSpeed) particle.yaccel -= friction;
        if (particle.xaccel < -maxSpeed) particle.xaccel += friction;
        if (particle.yaccel < -maxSpeed) particle.yaccel += friction;

        ctx.beginPath();

        const alpha = maxAlpha - (minAlpha + mapConst * (particle.size - minSize));
        ctx.fillStyle = "rgba(255,255,255, "+alpha+")";

        ctx.ellipse(particle.x + (pxoffsetX * particle.size), particle.y + (pxoffsetY * particle.size), particle.size, particle.size, 0, 0, pi2);
        ctx.fill();
    }


}


function restart(){
    // init function
    canvas.width = Math.floor(canvas.scrollWidth / sf);
    canvas.height = Math.floor(canvas.scrollHeight / sf);
    w = canvas.width;
    h = canvas.height;
    wh = w/2;
    hh = h/2;

    bordertop = - hh/parallaxamt*maxSize;
    borderbottom = h + hh/parallaxamt*maxSize;
    borderleft = - wh/parallaxamt*maxSize;
    borderright = w + wh/parallaxamt*maxSize;

    console.log(w+","+h);

    if (particles.length === 0){
        for (let i = 0; i < numberOfParticles; i++){
            particles.push({
                x: rng(borderleft, borderright),
                y: rng(bordertop, borderbottom),
                xaccel: rng(-maxSpeed, maxSpeed),
                yaccel: rng(-maxSpeed, maxSpeed),
                xaccelTarget: rng(-maxSpeed, maxSpeed),
                yaccelTarget: rng(-maxSpeed, maxSpeed),
                size: rng(minSize, maxSize),
                sizeTarget: rng(minSize, maxSize)
            });
        }
    }

    loop();
}

function rng(min, max){
    return Math.random() * (max - min + 1) + min;
}

// begin
restart();

function lerp (start, end, amt){
    return (1-amt)*start+amt*end;
}

// mouse events
canvas.addEventListener('mousedown', (e)=>{
    mousedown = true;
});

canvas.addEventListener('mouseup', ()=>{
    mousedown = false;
    canvas.onmousemove = null;

    for (const particle of particles){
        particle.xaccel += rng(-maxSpeed*10, maxSpeed*10);
        particle.yaccel += rng(-maxSpeed*10, maxSpeed*10);
        particle.sizeTarget = rng(minSize, maxSize);
    }
});

canvas.addEventListener('mousemove', (e)=>{
    mouseX = e.x / sf;
    mouseY = e.y / sf;
});

// restart on resize
window.addEventListener('resize', ()=>{
    restart();
});