var circle;
var velo;

function setup() {
  createCanvas(720, 400);
  circle = createVector(width / 2, height / 2);
  velo = p5.Vector.random2D();
  velo.mult(5.0);
  textSize(32);
}

function draw() {
  background(200);

  fill(0, 102, 153, 51);
  noStroke();
  text('simple one particle test', 10, height - 10);

  stroke(50);
  fill(100);
  ellipse(circle.x, circle.y, 24, 24);
  circle.add(velo);

  if(circle.x < 0 || circle.x > width) {
    velo.x = velo.x * -1;
  }

  if(circle.y < 0 || circle.y > height) {
    velo.y = velo.y * -1;
  }
}
