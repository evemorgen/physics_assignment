var numOfCircles;
var lastValue;
var veloMult;

var circles = [];
var velos = [];

const pSize = 16;
const defaultCollFrames = 3;

let mult = p5.Vector.mult
let sub = p5.Vector.sub
let dot = p5.Vector.dot

function range(from, to) {
  return [...Array(to - from).keys()].map(n => n + from)
}

function Particle(x, y, vx, vy, ax, ay) {
  if (x === undefined || y === undefined) {
    let [x, y] = [random(width), random(height)];
  }
  if (vx === undefined || vy === undefined) {
    let [vx, vy] = [random(), random()];
  }
  if (ax === undefined || ay === undefined) {
    let [ax, ay] = [random(), random()];
  }

  this.position = createVector(x, y);
  this.velocity = createVector(vx, vy);
  this.acceleration = createVector(ax, ay);
  this.collisionFrames = 0;
}

Particle.prototype.draw = function () {
  if (this.collisionFrames > 0) {
    stroke('red');
    fill('pink');
    ellipse(this.position.x, this.position.y, pSize, pSize); //just testin
    this.collisionFrames -= 1;
  } else {
    stroke(50);
    fill(100);
    ellipse(this.position.x, this.position.y, pSize, pSize);
  }
}

Particle.prototype.collision = function (other) {
  let distance = this.position.dist(other.position)
  if (distance <= pSize) {
    let v1 = this.velocity;
    let v2 = other.velocity;
    let x1mx2 = sub(this.position, other.position);
    let x2mx1 = sub(other.position, this.position);

    this.velocity = sub(v1, mult(x1mx2, dot(sub(v1, v2), x1mx2) / dot(x1mx2, x1mx2)));
    other.velocity = sub(v2, mult(x2mx1, dot(sub(v2, v1), x2mx1) / dot(x2mx1, x2mx1)));

    this.collisionFrames = defaultCollFrames;
    other.collisionFrames = defaultCollFrames;
  }
}

Particle.prototype.updateState = function () {
  this.position.add(this.velocity);
  this.velocity.add(this.acceleration);

  if ((this.position.x - pSize / 2) < 0 || (this.position.x + pSize / 2) >= width) {
    this.velocity.x *= -1;
  }
  if ((this.position.y - pSize / 2) < 0 || (this.position.y + pSize / 2) > height) {
    this.velocity.y *= -1;
  }
}

function initCircles() {
  for (var i = 0; i < numOfCircles.value(); i++) {
    circles[i] = new Particle(
      random(width), random(height),
      random(-1 * veloMult.value(), veloMult.value()), random(-1 * veloMult.value(), veloMult.value()),
      0, 0
    )
    //circles[i] = createVector(random(width), random(height));
    //velos[i] = p5.Vector.random2D().mult(veloMult.value());
  }
  lastValue = numOfCircles.value();
  //console.log(circles);
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

