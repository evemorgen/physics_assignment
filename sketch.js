var numOfCircles;
var lastValue;
var veloMult;

var circles = [];
var velos = [];

function initCircles() {
  for(var i = 0; i < numOfCircles.value(); i++) {
    circles[i] = createVector(random(width), random(height));
    velos[i] = p5.Vector.random2D().mult(veloMult.value());
  }
  lastValue = numOfCircles.value();
}

function setup() {
  createCanvas(1080, 720);
  createP('');
  numOfCircles = createSlider(0, 2000, 100);
  numOfCircles.changed(initCircles);
  veloMult = createSlider(1, 10, 1);
  veloMult.changed(initCircles);
  initCircles();
  textSize(32);
  console.log(velos)
}

function draw() {
  background(200);

  fill(0, 102, 153, 51);
  noStroke();
  text(`simple ${lastValue} particles test`, 10, height - 10);

  for(var i = 0; i < lastValue; i++) {
    stroke(50);
    fill(100);
    ellipse(circles[i].x, circles[i].y, 24, 24);
    circles[i].add(velos[i]);
    if(circles[i].x < 0 || circles[i].x > width) {
      velos[i].x = velos[i].x * -1;
    }

    if(circles[i].y < 0 || circles[i].y > height) {
      velos[i].y = velos[i].y * -1;
    }
  }
}
