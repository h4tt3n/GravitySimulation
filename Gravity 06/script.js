

// Gravitational constant
const G = 1000; 

// Timestep, delta-time
const dt = 1 / 60;

//
const objects = [];
const bullets = [];
const vessels = [];
const images = [];

// Canvas
const canvas = document.getElementById("myCanvas");

canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', window.innerHeight);

// Context
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = true;


document.getElementById("myCanvas").focus();

const camera = {
    position : { x : 0, y : 0 },
    restPosition : { x : 0, y : 0 },
    deltaPosition: 0.1,
    zoom: 0.0,
    maxZoom : 10,
    minZoom : 0.1,
    deltaZoom: 0.1,
    zoomSpeed: 0.02,
    restZoom: 1.0,
    input : function(){

        if(gameKeyState.ArrowUp)    {this.restPosition.y -= (screen.height/4) / this.zoom}
        if(gameKeyState.ArrowDown)  {this.restPosition.y += (screen.height/4) / this.zoom}
        if(gameKeyState.ArrowLeft)  {this.restPosition.x -= (screen.height/4) / this.zoom}
        if(gameKeyState.ArrowRight) {this.restPosition.x += (screen.height/4) / this.zoom}
        if(gameKeyState.q) { this.restZoom /= (1.0 + this.zoomSpeed); if(this.restZoom < this.minZoom) {this.restZoom = this.minZoom} };
        if(gameKeyState.e) { this.restZoom *= (1.0 + this.zoomSpeed); if(this.restZoom > this.maxZoom) {this.restZoom = this.maxZoom} }; 
    },
    update: function(){  
        
        let zoomDiff = this.restZoom - this.zoom;
        this.zoom += zoomDiff * this.deltaZoom;

        let positionDiffX = this.restPosition.x - this.position.x;
        let positionDiffY = this.restPosition.y - this.position.y;
        this.position.x += positionDiffX * this.deltaPosition;
        this.position.y += positionDiffY * this.deltaPosition;
    }
};

const gameKeyState = {
    ArrowUp : false,
    ArrowDown : false,
    ArrowLeft : false,
    ArrowRight : false,
    q : false,
    w : false,
    e : false,
    a : false,
    s : false,
    d : false,
    z : false,
    x : false,
    c : false
}

function keyDown(e){
    
    switch(e.key) {
        case 'q': gameKeyState.q = true; break;
        case 'w': gameKeyState.w = true; break;
        case 'e': gameKeyState.e = true; break;
        case 'a': gameKeyState.a = true; break;
        case 's': gameKeyState.s = true; break;
        case 'd': gameKeyState.d = true; break;
        case 'z': gameKeyState.z = true; break;
        case 'x': gameKeyState.x = true; break;
        case 'c': gameKeyState.c = true; break;
        case 'ArrowUp': gameKeyState.ArrowUp = true; break;
        case 'ArrowDown': gameKeyState.ArrowDown = true; break;
        case 'ArrowLeft': gameKeyState.ArrowLeft = true; break;
        case 'ArrowRight': gameKeyState.ArrowRight = true; break;
    }
};

function keyUp(e){
    
    switch(e.key) {
        case 'q': gameKeyState.q = false; break;
        case 'w': gameKeyState.w = false; break;
        case 'e': gameKeyState.e = false; break;
        case 'a': gameKeyState.a = false; break;
        case 's': gameKeyState.s = false; break;
        case 'd': gameKeyState.d = false; break;
        case 'z': gameKeyState.z = false; break;
        case 'x': gameKeyState.x = false; break;
        case 'c': gameKeyState.c = false; break;
        case 'ArrowUp': gameKeyState.ArrowUp = false; break;
        case 'ArrowDown': gameKeyState.ArrowDown = false; break;
        case 'ArrowLeft': gameKeyState.ArrowLeft = false; break;
        case 'ArrowRight': gameKeyState.ArrowRight = false; break;
    }
};

function rnd(min,max) {
    return Math.random() * (max ? (max-min) : min) + (max ? min : 0) 
}

function getRandomInt(min, max) {
     //max and min inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

const spaceship = {
    position : { x : -4000, y : 0 },
    velocity : { x : 0, y : 0 },
    force : { x : 0, y : 0 },
    angle : 0,
    angleVec : { x : 1, y : 0 },
    angularVelocity : 0,
    torque : 0,
    mass : 10,
    radius : 0,
    momentOfInertia : 100.0,
    image : 3
};

const planet = {
    position : { x : 0, y : 0 },
    velocity : { x : 0, y : 0 },
    force : { x : 0, y : 0 },
    angle : 0,
    angleVec : { x : 1, y : 0 },
    angularVelocity : 0.05,
    torque : 0,
    mass : 100000,
    radius : 0,
    momentOfInertia : 100.0,
    image : 2
};

spaceship.radius = ((3 * spaceship.mass / 0.0001)/(4 * Math.PI)) ** (1/3);

planet.radius = ((3 * planet.mass / 0.00001)/(4 * Math.PI)) ** (1/3);

objects.push(planet);

// create asteroids
for(let i = 0 ; i < 300 ; i++) {

    const asteroid = {
        position : { x : 0, y : 0 },
        velocity : { x : 0, y : 0 },
        force : { x : 0, y : 0 },
        angle : rnd(0, 2 * Math.PI),
        angleVec : { x : 1, y : 0 },
        angularVelocity : rnd(-0.2, 0.2),
        torque : 0,
        mass : rnd(1, 20),
        radius : 0,
        momentOfInertia : 100.0,
        image : getRandomInt(0, 2)
    };

    let dist = rnd(6000, 12000);
    let angle = rnd(0, 2 * Math.PI);
    let px = dist * Math.cos(angle);
    let py = dist * Math.sin(angle);
    let v = Math.sqrt( (G * (asteroid.mass + planet.mass) ) / dist );
    let vx = -Math.sin(angle) * v;
    let vy =  Math.cos(angle) * v;

    asteroid.position.x = px;
    asteroid.position.y = py;

    asteroid.velocity.x = vx;
    asteroid.velocity.y = vy;

    asteroid.radius = ((3 * asteroid.mass / 0.00001)/(4 * Math.PI)) ** (1/3);

    objects.push(asteroid);
};

objects.push(spaceship);

// create bullets
for(let i = 0 ; i < 10 ; i++) {

    var bullet = {
        position : { x : 0, y : 0 },
        velocity : { x : 0, y : 0 },
        force : { x : 0, y : 0 },
        mass : 1,
        radius : 5
    };

    bullets.push(bullet);
};


var img1 = new Image();
img1.src = 'img/asteroid01.png';

var img2 = new Image();
img2.src = 'img/asteroid02.png';

var img3 = new Image();
img3.src = 'img/asteroid03.png';

var img4 = new Image();
img4.src = 'img/cartoon-rocket.png';

images.push(img1);
images.push(img2);
images.push(img3);
images.push(img4);

function loadImages() {

}

function renderObjects() {

    // clear screen
    ctx.resetTransform();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // object hitbox
    for(let i = 0 ; i < objects.length ; i++) {
        
        var img = images[objects[i].image];
        var x = (objects[i].position.x - camera.position.x) * camera.zoom + canvas.width/2;
        var y = (objects[i].position.y - camera.position.y) * camera.zoom + canvas.height/2;
        ctx.setTransform(1, 0, 0, 1, x, y);
        ctx.setTransform(1, 0, 0, 1, (objects[i].position.x - camera.position.x) * camera.zoom + canvas.width/2, (objects[i].position.y - camera.position.y) * camera.zoom + canvas.height/2);
        ctx.beginPath();
        ctx.arc(0, 0, objects[i].radius * camera.zoom, 0, Math.PI*2);
        ctx.fillStyle = "#0095DD22";
        ctx.fill();
        ctx.closePath();
    }

    // object sprite
    for(let i = 0 ; i < objects.length-1 ; i++) {
        
        var img = images[objects[i].image];
        var x = (objects[i].position.x - camera.position.x) * camera.zoom + canvas.width/2;
        var y = (objects[i].position.y - camera.position.y) * camera.zoom + canvas.height/2;
        ctx.setTransform(1, 0, 0, 1, x, y);
        ctx.rotate(objects[i].angle + 0.25 * 2 * Math.PI);
        ctx.drawImage(img, -objects[i].radius * camera.zoom, -objects[i].radius * camera.zoom, objects[i].radius*2 * camera.zoom, objects[i].radius*2 * camera.zoom);
    }

    // ship
    var img = images[spaceship.image];
    var x = (spaceship.position.x - camera.position.x) * camera.zoom + canvas.width/2;
    var y = (spaceship.position.y - camera.position.y) * camera.zoom + canvas.height/2;
    ctx.setTransform(1, 0, 0, 1, x, y);
    ctx.rotate(spaceship.angle + 0.25 * 2 * Math.PI);
    ctx.drawImage(img, -spaceship.radius * camera.zoom, -spaceship.radius*2 * camera.zoom, spaceship.radius*2 * camera.zoom, spaceship.radius*4 * camera.zoom);

    // text
    ctx.resetTransform();
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(camera.zoom.toFixed(2), 50, 50);
}

//
function mainLoop() {

    if (gameKeyState.a == true) {spaceship.angle -= 0.05; spaceship.angleVec.x = Math.cos(spaceship.angle ); spaceship.angleVec.y = Math.sin(spaceship.angle );}
    if (gameKeyState.d == true) {spaceship.angle += 0.05; spaceship.angleVec.x = Math.cos(spaceship.angle ); spaceship.angleVec.y = Math.sin(spaceship.angle ); }
    if (gameKeyState.w == true) {spaceship.force.x += 1200 * spaceship.angleVec.x; spaceship.force.y += 1200 * spaceship.angleVec.y;}
    if (gameKeyState.s == true) { }

    calculateGravity();
    updateState(objects);

    camera.restPosition.x = spaceship.position.x
    camera.restPosition.y = spaceship.position.y
    
    camera.input();
    camera.update();

    //cx = spaceship.position.x + (mx - screen.width/2) / zoom;
    //cy = spaceship.position.y + (my - screen.height/2) / zoom;

    requestAnimationFrame(renderObjects);
}

function calculateGravity()
{
    for(let i = 0 ; i < objects.length-1 ; i++) {

        for(let j = i+1 ; j < objects.length ; j++ ) {

            // distance vector
            let rx = objects[j].position.x - objects[i].position.x;
            let ry = objects[j].position.y - objects[i].position.y;

            let rSum = objects[i].radius + objects[j].radius;

            //if ((Math.abs(rx) < rSum) || (Math.abs(ry) < rSum) ) { continue; }

            // distance squared
            let r2 = rx*rx+ry*ry;

            if (r2 < rSum*rSum) { continue; }

            // distance scalar
            let r = Math.sqrt(r2);

            // force scalar
            let f = G * (objects[i].mass * objects[j].mass) / r2;

            // force  vector
            let fx = f * rx / r;
            let fy = f * ry / r;

            // apply force
            objects[i].force.x += fx;
            objects[i].force.y += fy;

            objects[j].force.x -= fx;
            objects[j].force.y -= fy;
        };
    };
}

function calculateGravityAmong(array)
{
    for(let i = 0 ; i < array.length-1 ; i++) {

        for(let j = i+1 ; j < array.length ; j++ ) {

            // distance vector
            let rx = array[j].position.x - array[i].position.x;
            let ry = array[j].position.y - array[i].position.y;

            let rSum = array[i].radius + array[j].radius;

            //if ((Math.abs(rx) < rSum) || (Math.abs(ry) < rSum) ) { continue; }

            // distance squared
            let r2 = rx*rx+ry*ry;

            if (r2 < rSum*rSum) { continue; }

            // distance scalar
            let r = Math.sqrt(r2);

            // force scalar
            let f = G * (array[i].mass * array[j].mass) / r2;

            // force vector
            let fx = f * rx / r;
            let fy = f * ry / r;

            // apply force
            array[i].force.x += fx;
            array[i].force.y += fy;

            array[j].force.x -= fx;
            array[j].force.y -= fy;
        };
    };
}

function calculateGravityBetween(arrayA, arrayB)
{
    for(let i = 0 ; i < arrayA.length ; i++) {

        for(let j = 0 ; j < arrayB.length ; j++ ) {

            // distance vector
            let rx = arrayA[j].position.x - arrayB[i].position.x;
            let ry = arrayA[j].position.y - arrayB[i].position.y;

            let rSum = arrayA[i].radius + arrayB[j].radius;

            //if ((Math.abs(rx) < rSum) || (Math.abs(ry) < rSum) ) { continue; }

            // distance squared
            let r2 = rx*rx+ry*ry;

            if (r2 < rSum*rSum) { continue; }

            // distance scalar
            let r = Math.sqrt(r2);

            // force scalar
            let f = G * (arrayA[i].mass * arrayB[j].mass) / r2;

            // force  vector
            let fx = f * rx / r;
            let fy = f * ry / r;

            // apply force
            arrayA[i].force.x += fx;
            arrayA[i].force.y += fy;

            arrayB[j].force.x -= fx;
            arrayB[j].force.y -= fy;
        };
    };
}

function updateState(array) {

    for(let i = 0 ; i < array.length ; i++) {

        //
        array[i].velocity.x += array[i].force.x / array[i].mass * dt;
        array[i].velocity.y += array[i].force.y / array[i].mass * dt;

        array[i].position.x += array[i].velocity.x * dt;
        array[i].position.y += array[i].velocity.y * dt;

        array[i].force.x = 0;
        array[i].force.y = 0;

        //
        array[i].angularVelocity += array[i].torque / array[i].momentOfInertia * dt;

        array[i].angle += array[i].angularVelocity * dt;

        //objects[i].angleVec.x = Math.cos(objects[i].angle ); 
        //objects[i].angleVec.y = Math.sin(objects[i].angle );

        array[i].torque = 0;
    };
}

// run loop
setInterval(mainLoop, 10);