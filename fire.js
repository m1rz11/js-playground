// cool fire effect =D

// options
let sf = 4; // scale factor
let decay = 10;
let shiftamt = 4;
let upamt = 4;
let fps = 30;
let intensity_min = 224;
let intensity_max = 255 - intensity_min;
let fireenable = true;

// canvas
let canvas = document.getElementById("canvas");
canvas.width = Math.floor(canvas.scrollWidth / sf);
canvas.height = Math.floor(canvas.scrollHeight / sf);
let ctx = canvas.getContext("2d");
let w,h,imageData;

// stuff
let shiftamt_h = Math.floor(shiftamt/2);
let x = 0;
let bitmap = [];
let delta = Math.round(1000/fps);




// color palette
let colors = [];
for (let i = 0; i <= 32; i++){
    colors[i] = [i,i,i];
    colors[i+32] = [(i+32),0,0];
    colors[i+64] = [(i+128),0,0];
    colors[i+96] = [(i+164),(i+64),0];
    colors[i+128] = [(i+192),(i+128),0];
    colors[i+160] = [(i+224),(i+192),0];
    colors[i+192] = [255,(i/4+224),0];
    colors[i+224] = [i+224,i+224,i+196];
}

function initBitmap(){
    // fill bitmap with zeros
    for (let i = 0; i < h; i++){
        bitmap[i] = [];
        for (let o = 0; o < w; o++){
            bitmap[i][o] = 0;
        }
    }
}

// x and y is flipped because i used shift() initially
function loop(){
    if (fireenable){
        makefire();
    }

    // affect pixels
    for (let i = 0; i < h; i++){
        for (let o = 0; o < w; o++){
            // ignore if blank
            if(bitmap[i][o] < 0) continue;

            // darken pixel randomly
            bitmap[i][o] -= Math.floor(Math.random()*decay);

            // ignore if pixel is now blank
            if(bitmap[i][o] < 0){
                bitmap[i][o] = 0;
                continue;
            }

            // shift up randomly
            let shift = -Math.ceil((Math.random() * upamt));
            let newpos = i + shift;
            if (newpos>=0 && newpos<h){
                bitmap[newpos][o] = bitmap[i][o];
            }

            // shift left and right randomly
            shift = Math.floor((Math.random() * shiftamt)) - shiftamt_h;
            newpos = shift + o;
            if (newpos>=0 && newpos<w){
                bitmap[i][newpos] = bitmap[i][o];
            }
        }
    }

    draw();
}

function makefire(){
    // add random fire to bottom
    for (let i = 0; i < w; i++){
        bitmap[h-1][i] = Math.ceil(intensity_min+Math.random()*intensity_max)
    }
}

function makefire2(){
    // smol test animation
    x+=10;
    if(x > 620) x = 0;
    for (let i = 0; i < 20; i++){
        bitmap[i+80][50+Math.floor(Math.sin(x/100)*50)] = 255;
    }
}

function draw(){
    // convert bitmap values to a color for imagedata
    for (let i = 0; i < h; i++){
        for (let o = 0; o < w; o++){
            let index = (i*w*4)+(o*4);
            let col = colors[bitmap[i][o]];
            imageData.data[index] = col[0];
            imageData.data[index+1] = col[1];
            imageData.data[index+2] = col[2];
            imageData.data[index+3] = 255;
        }
    }

    // draw imagedata
    ctx.putImageData(imageData, 0, 0);
}

function restart(){
    // init function
    canvas.width = Math.floor(canvas.scrollWidth / sf);
    canvas.height = Math.floor(canvas.scrollHeight / sf);
    w = canvas.width;
    h = canvas.height;
    imageData = ctx.getImageData(0, 0, w, h);
    initBitmap();
    loop();
}

// LET US COMMENCE
restart();
let interval = setInterval(loop, delta);

// mouse events
canvas.addEventListener('mousedown', ()=>{
    canvas.onmousemove = function (e) {
        bitmap[ Math.floor(e.offsetY / sf) ][ Math.floor(e.offsetX / sf) ] = 255;
    }
})

canvas.addEventListener('mouseup', ()=>{
    canvas.onmousemove = null
});

window.addEventListener('resize', ()=>{
    restart();
});

// touch events
canvas.addEventListener('touchmove', (e)=>{
    bitmap[ Math.floor(e.touches[0].clientY / sf) ][ Math.floor(e.touches[0].clientX / sf) ] = 255
})

// messy controls i'm so sorry
const decayselect = document.getElementById("decayselect");
decayselect.addEventListener('change', ()=>{
    decay = decayselect.value;
});

const shiftselect = document.getElementById("shiftselect");
shiftselect.addEventListener('change', ()=>{
    shiftamt = shiftselect.value;
    shiftamt_h = Math.floor(shiftamt/2);
});

const upselect = document.getElementById("upselect");
upselect.addEventListener('change', ()=>{
    upamt = upselect.value;
});

const fpsselect = document.getElementById("fpsselect");
fpsselect.addEventListener('change', ()=>{
    fps = fpsselect.value;
    delta = Math.round(1000/fps);
    clearInterval(interval);
    interval = setInterval(loop, delta);
});

const scaleselect = document.getElementById("scaleselect");
scaleselect.addEventListener('change', ()=>{
    sf = scaleselect.value;
    restart();
});

const fireselect = document.getElementById("fireselect");
fireselect.addEventListener('change', ()=>{
    fireenable = fireselect.checked;
});