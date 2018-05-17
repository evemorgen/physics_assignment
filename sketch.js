var numOfCircles;
var lastValue;
var veloMult;

var circles = [];
var velos = [];

const defaultCollFrames = 3;
const massRange = range(5, 12);
const massMulti = 2;
const visibilityMultiplier = 10;

let mult = p5.Vector.mult
let sub = p5.Vector.sub
let dot = p5.Vector.dot

function range(from, to) {
  return [...Array(to - from).keys()].map(n => n + from)
}

function pTemplate(circle) {
  return `${circle.trackColour} particle <br>
         - position - (${circle.position.x.toFixed(2)}, ${circle.position.y.toFixed(2)}), <br>
         - velocity - (${circle.velocity.x.toFixed(2)}, ${circle.velocity.y.toFixed(2)}), <br>
         - acceleration - (${circle.acceleration.x}, ${circle.acceleration.y}), <br>
         - size - ${circle.size}, <br>
         - mass - ${circle.mass}`
}

function Particle(x, y, vx, vy, ax, ay, m) {
  if (x === undefined || y === undefined) {
    let [x, y] = [random(width), random(height)];
  }
  if (vx === undefined || vy === undefined) {
    let [vx, vy] = [random(), random()];
  }
  if (ax === undefined || ay === undefined) {
    let [ax, ay] = [random(), random()];
  }

  this.mass = m || random(massRange);
  this.size = this.mass * massMulti;
  this.position = createVector(x, y);
  this.velocity = createVector(vx, vy);
  this.acceleration = createVector(ax, ay);
  this.collisionFrames = 0;
  this.trackMe = false;
  this.trackColour = color(random(100, 255), random(100, 255), random(100, 255));
  this.route = [createVector(this.position.x, this.position.y)];
}

Particle.prototype.track = function () {
  this.trackMe = !this.trackMe
  if (this.trackMe) {
    this.p = createP(pTemplate(this));
  } else {
    this.p.html('');
  }
}

Particle.prototype.draw = function () {
  if (this.collisionFrames > 0) {
    stroke('red');
    fill('pink');
    ellipse(this.position.x, this.position.y, this.size, this.size); //just testin
    this.collisionFrames -= 1;
  } else {
    stroke(50);
    fill(100);
    ellipse(this.position.x, this.position.y, this.size, this.size);
  }

  if (this.trackMe) {
    stroke('black');
    fill(this.trackColour);
    ellipse(this.position.x, this.position.y, this.size, this.size);
    for(var i = 0; i < this.route.length; i++) {
      ellipse(this.route[i].x, this.route[i].y, this.size / 5);
    }
    this.p.html(pTemplate(this));

    let vEnd = createVector(
      this.position.x + this.velocity.x*visibilityMultiplier, 
      this.position.y + this.velocity.y*visibilityMultiplier
    );
    line(this.position.x, this.position.y, vEnd.x, vEnd.y);

    let aEnd = createVector(
      this.position.x + this.acceleration.x*visibilityMultiplier, 
      this.position.y + this.acceleration.y*visibilityMultiplier
    );
    line(this.position.x, this.position.y, aEnd.x, aEnd.y);

  } 
}

Particle.prototype.collision = function (other) {
  let distance = this.position.dist(other.position)
  if (distance <= ((this.size + other.size) / 2)) {
    let v1 = this.velocity;
    let v2 = other.velocity;
    let x1mx2 = sub(this.position, other.position);
    let x2mx1 = sub(other.position, this.position);
    let m1 = this.mass;
    let m2 = other.mass;

    this.velocity = sub(v1, mult(x1mx2, dot(sub(v1, v2), x1mx2) / dot(x1mx2, x1mx2) * (m2 * 2 / (m1 + m2))));
    other.velocity = sub(v2, mult(x2mx1, dot(sub(v2, v1), x2mx1) / dot(x2mx1, x2mx1) * (m1 * 2 / (m1 + m2))));
    this.collisionFrames = defaultCollFrames;
    other.collisionFrames = defaultCollFrames;
  }
}

Particle.prototype.updateState = function () {
  this.position.add(this.velocity);
  this.velocity.add(this.acceleration);

  if (this.position.x < this.size / 2) {
    this.position.x = this.size / 2
    this.collisionFrames = 1;
    this.velocity.x *= -1;
  } else if (this.position.x > width - this.size / 2) {
    this.collisionFrames = 1;
    this.position.x = width - this.size / 2;
    this.velocity.x *= -1;
  }
  if (this.position.y < this.size / 2) {
    this.collisionFrames = 1;
    this.position.y = this.size / 2;
    this.velocity.y *= -1;
  } else if (this.position.y > height - this.size / 2) {
    this.collisionFrames = 1;
    this.position.y = height - this.size / 2;
    this.velocity.y *= -1;
  }

  if (this.trackMe && this.position.dist(this.route.slice(-1).pop()) > 10) {
    this.route.push(createVector(this.position.x, this.position.y));
    //FIXME - make route array fixed size with slice or sth
  }
}

function initCircles() {
  for (var i = 0; i < numOfCircles.value(); i++) {
    circles[i] = new Particle(
      random(width), random(height),
      random(-1 * veloMult.value(), veloMult.value()), random(-1 * veloMult.value(), veloMult.value()),
      0, 0
    )
  }
  circles[0].track();
  lastValue = numOfCircles.value();
}

function findAndTrackCircle (x, y) {
  clicked = circles.map((circle) => {
    if (x >= circle.position.x - circle.size && 
        x <= circle.position.x + circle.size &&
        y >= circle.position.y - circle.size &&
        y <= circle.position.y + circle.size) {
      circle.track();
    }
  });
}

function mousePressed() {
  findAndTrackCircle(mouseX, mouseY);
}

function setup() {
  createCanvas(1080, 720);
  createP('');
  numOfCircles = createSlider(0, 500, 150);
  numOfCircles.changed(initCircles);
  veloMult = createSlider(1, 10, 4);
  veloMult.changed(initCircles);
  initCircles();
  textSize(32);
}

function draw() {
  background(200);

  fill(0, 102, 153, 51);
  noStroke();
  text(`simple ${lastValue} particles test`, 10, height - 10);

  range(0, lastValue).forEach(i => {
    circles[i].draw();
    circles[i].updateState();
    range(i + 1, lastValue).forEach(j => circles[i].collision(circles[j]));
  });
}

