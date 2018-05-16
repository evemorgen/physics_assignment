var numOfCircles;
var lastValue;
var veloMult;

var circles = [];
var velos = [];

function Particle(x, y, vx, vy, ax, ay) {
  if(x === undefined || y === undefined) {
    let [x, y] = [random(width), random(height)];
  }
  if(vx === undefined || vy === undefined) {
    let [vx, vy] = [random(), random()];
  }
  if(ax === undefined || ay === undefined) {
    let [ax, ay] = [random(), random()];
  }

  this.position = createVector(x, y);
  this.velocity = createVector(vx, vy);
  this.acceleration = createVector(ax, ay);
}

Particle.prototype.draw = function() {
  stroke(50);
  fill(100);
  ellipse(this.position.x, this.position.y, 24, 24);
}

Particle.prototype.collision = function(particles) {
  checkedParticle = this;
  console.log(particles);
  particles.forEach(function(particle) {
    
    let distance = checkedParticle.position.dist(particle.position)

    if(distance <= 24) {
      checkedParticle.velocity.x *= -1;
      checkedParticle.velocity.y *= -1;
    }   
  });
  
}

Particle.prototype.updateState = function() {
  this.position.add(this.velocity);
  this.velocity.add(this.acceleration);

  if(this.position.x < 0 || this.position.x > width) {
    this.velocity.x *= -1;
  }
  if(this.position.y < 0 || this.position.y > width) {
    this.velocity.y *= -1;
  }
}

function initCircles() {
  for(var i = 0; i < numOfCircles.value(); i++) {
    circles[i] = new Particle(
      random(width), random(height),
      random(-1*veloMult.value(), veloMult.value()), random(-1*veloMult.value(), veloMult.value()),
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
  numOfCircles = createSlider(0, 2000, 30);
  numOfCircles.changed(initCircles);
  veloMult = createSlider(1, 10, 1);
  veloMult.changed(initCircles);
  initCircles();
  textSize(32);
}

function draw() {
  background(200);

  fill(0, 102, 153, 51);
  noStroke();
  text(`simple ${lastValue} particles test`, 10, height - 10);

  for(var i = 0; i < lastValue; i++) {
    //stroke(50);
    //fill(100);
    //ellipse(circles[i].position.x, circles[i].position.y, 24, 24);
    circles[i].draw();
    circles[i].updateState()
    circles.forEach(function(circle) {
      //console.log(circle)
      circle.collision(circles);
    });
    //circles[i].add(velos[i]);
    // circles[i].updateState()
    // if(circles[i].x < 0 || circles[i].x > width) {
    //   velos[i].x = velos[i].x * -1;
    // }

    // if(circles[i].y < 0 || circles[i].y > height) {
    //   velos[i].y = velos[i].y * -1;
    // }
  }
}
