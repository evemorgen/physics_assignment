var numOfCircles;
var lastValue;
var veloMult;
var sizeRange;
var sizeMin;
var radio;
var input;
var stopTheTrain;
var cardsDiv;

var circles = [];
var velos = [];
var msdData = [];

var lastFrame = 0;
var nFrames = 0;

var massRange = range(4, 5);

const defaultCollFrames = 2;
const massMulti = 2;
const visibilityMultiplier = 10;
const chartLimit = 500;

let mult = p5.Vector.mult
let sub = p5.Vector.sub
let dot = p5.Vector.dot

function range(from, to) {
  return [...Array(to - from).keys()].map(n => n + from)
}

function findLineByLeastSquares(xs, ys) {
  var sum_x = xs.reduce((sum,x) => sum+x);
  var sum_y = ys.reduce((sum,y) => sum+y);
  var sum_xy = xs.reduce((sum,x,i) => sum + x * ys[i]);
  var sum_xx = xs.reduce((sum,x) => sum + x*x);
  var count = xs.length;

  var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
  var b = (sum_y/count) - (m*sum_x)/count;

  let x0 = xs[0];
  let xn = xs[count-1];

  return [[x0, x0 * m + b], [xn, xn * m + b]];
}

function pTemplate(circle) {
  return `- position - (${circle.position.x.toFixed(2)}, ${circle.position.y.toFixed(2)}), <br>
         - velocity - (${circle.velocity.x.toFixed(2)}, ${circle.velocity.y.toFixed(2)}), <br>
         - acceleration - (${circle.acceleration.x}, ${circle.acceleration.y}), <br>
         - size - ${circle.size}, <br>
         - mass - ${circle.mass}`
}

function makeCard(circle) {
  card = createDiv();
  card.parent(cardsDiv);
  card.addClass('card');
  cardHeader = createDiv(`${circle.name} particle`);
  cardHeader.addClass('card-header');
  cardHeader.parent(card);
  cardBody = createDiv();
  cardBody.addClass('card-body');
  cardBody.parent(card);
  p = createP(pTemplate(circle));
  p.addClass('card-text');
  p.parent(cardBody);
  return [card, p]
}

function Particle(kwargs) {
  if (kwargs.x === undefined || kwargs.y === undefined) {
    kwargs.x = random(width); 
    kwargs.y = random(height);
  }
  if (kwargs.vx === undefined || kwargs.vy === undefined) {
    kwargs.vx = random(-1, 1);
    kwargs.vy = random(-1, 1);
  }
  if (kwargs.ax === undefined || kwargs.ay === undefined) {
    kwargs.ax = random(-1, 1);
    kwargs.ay = random(-1, 1);
  }
  this.position = createVector(kwargs.x, kwargs.y);
  this.initPosition = createVector(kwargs.x, kwargs.y);
  this.velocity = createVector(kwargs.vx, kwargs.vy);
  this.acceleration = createVector(kwargs.ax, kwargs.ay);

  this.mass = kwargs.m || random(massRange);
  this.size = kwargs.s || this.mass * massMulti;
  this.collisionFrames = 0;
  
  this.defaultColor = (kwargs.dc === undefined ? true : false);
  if (kwargs.c !== undefined) {
    this.trackColour = color(kwargs.c);
    [_, this.name, _] = ntc.name(kwargs.c);
  } else {
    let [r, g, b] = [random(100, 255) | 0, random(100, 255) | 0, random(100, 255) | 0];
    this.trackColour = color(r, g, b);
    [_, this.name, _] = ntc.name(`#${r.toString(16)}${g.toString(16)}${b.toString(16)}`);
  }

  this.trackMe = kwargs.t || false;
  if (this.trackMe) {
    [this.card, this.p] = makeCard(this);
  }
  this.route = [];
}

Particle.prototype.track = function () {
  this.trackMe = !this.trackMe
  this.trackMe ? [this.card, this.p] = makeCard(this) : this.card.hide();
  
  if (this.trackMe) {
    this.route = [createVector(this.position.x, this.position.y)];
  } else {
    this.route = [];
  }
}

Particle.prototype.drawVector = function () {
    if (this.trackMe) {
        this.p.html(pTemplate(this));

        let vEnd = createVector(
            this.position.x + this.velocity.x*visibilityMultiplier, 
            this.position.y + this.velocity.y*visibilityMultiplier
        );
        stroke(50);
        line(this.position.x, this.position.y, vEnd.x, vEnd.y);
    }
}

Particle.prototype.drawTrail = function () {
  if (this.trackMe) {
    stroke(this.trackColour);
    strokeWeight(3);
    this.route.reduce((oldPoint, point) => {
      line(point.x, point.y, oldPoint.x, oldPoint.y);
      return point;
    }, this.position);
    strokeWeight(1);
    stroke(0);
  } 
}

Particle.prototype.draw = function () {
  if (this.collisionFrames > 0) {
    stroke('red');
    fill('pink');
    ellipse(this.position.x, this.position.y, this.size, this.size); //just testin
    this.collisionFrames -= 1;
  } else if (this.trackMe) {
    stroke(50);
    fill(this.trackColour);
    ellipse(this.position.x, this.position.y, this.size, this.size);
  } else {
    stroke(50);
    this.defaultColor ? fill(100) : fill(this.trackColour);
    ellipse(this.position.x, this.position.y, this.size, this.size);
  }
}

Particle.prototype.collision = function (other) {
  let distance = this.position.dist(other.position)
  if (distance <= ((this.size + other.size) / 2)) {
    this.trackPoint(this.position.x, this.position.y);
    other.trackPoint(other.position.x, other.position.y);
    
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
    // fix for particles stuck in each other
    let moveAmount = (this.size + other.size) / 2 - distance;
    let moveVector = sub(this.position, other.position).normalize().mult(moveAmount);
    this.position.add(moveVector);
  }
}

Particle.prototype.displacement = function () {
  return sub(this.position, this.initPosition).mag();
}

Particle.prototype.move = function () {
  this.position.add(this.velocity);
  this.velocity.add(this.acceleration);
}

Particle.prototype.wallCollision = function () {
  if (this.position.x < this.size / 2) {
    this.collisionFrames = defaultCollFrames;
    this.trackPoint(this.position.x, this.position.y);
    this.position.x = this.size / 2
    this.velocity.x *= -1;
  } else if (this.position.x > width - this.size / 2) {
    this.collisionFrames = defaultCollFrames;
    this.trackPoint(this.position.x, this.position.y);
    this.position.x = width - this.size / 2;
    this.velocity.x *= -1;
  }
  if (this.position.y < this.size / 2) {
    this.collisionFrames = defaultCollFrames;
    this.trackPoint(this.position.x, this.position.y);
    this.position.y = this.size / 2;
    this.velocity.y *= -1;
  } else if (this.position.y > height - this.size / 2) {
    this.collisionFrames = defaultCollFrames;
    this.trackPoint(this.position.x, this.position.y);
    this.position.y = height - this.size / 2;
    this.velocity.y *= -1;
  }
}

Particle.prototype.trackPoint = function (x, y) {
   this.trackMe && this.route.unshift(createVector(x, y));
}

function initCircles() {
  msdData = [];
  nFrames = 0;
  circles = [];
  let sizeMinVal = sizeMin.value();
  let sizeRangeVal = sizeRange.value();
  massRange = range(sizeMinVal, sizeMinVal + sizeRangeVal);
  if (chart) {
    chart.series[0].update({data: []});
    chart.series[1].update({data: []});
    chart.update({title: {text: `Mean square displacement of ${lastValue} particles`}})
  }
  if (radio.value() == 'random') {
    cardsDiv.html('');
    lastValue = numOfCircles.value();
    range(0, lastValue).forEach( _ => {
      circles.push(
        new Particle({
          x: random(width), 
          y: random(height),
          vx: random(-1 * veloMult.value(), veloMult.value()), 
          vy: random(-1 * veloMult.value(), veloMult.value()),
          ax: 0,
          ay: 0
        })
      );
    });
    circles[0] && circles[0].track();
  } else if (radio.value() == 'sandbox') {
    cardsDiv.html('');
    particles = JSON.parse(input.value());
    circles = particles.map(
      (props) => new Particle(props)
    );
    lastValue = circles.length;
  } else if (radio.value() == 'cradle') {
    circles = cradle.map(
      (props) => new Particle(props)
    );
    lastValue = circles.length;
  } else if (radio.value() == 'diffusion') {
    circles = diffuse.map(
      (props) => new Particle(props)
    );
    lastValue = circles.length;
  } else if (radio.value() == 'membrane') {
     circles = membrane.map(
      (props) => new Particle(props)
    );
    lastValue = circles.length;
  }
}

function findAndTrackCircle (x, y) {
  let clickedVector = createVector(x,y);
  circles.filter(c => c.position.dist(clickedVector) < c.size).forEach(c => c.track());
}

function mousePressed() {
  findAndTrackCircle(mouseX, mouseY);
}

var running = true;
function pause() {
    running = !running;
}

function createDomElements() {
  stopTheTrain = createButton('STOP THE TRAIN');
  stopTheTrain.mousePressed(pause);
  stopTheTrain.style('width', '100%');
  createP('');
  numOfCircles = createSlider(1, 500, 150);
  numOfCircles.changed(initCircles);
  veloMult = createSlider(1, 10, 4);
  veloMult.changed(initCircles);
  sizeMin = createSlider(5, 15, 5);
  sizeMin.changed(initCircles);
  sizeRange = createSlider(1, 10, 1);
  sizeRange.changed(initCircles);
  
  createDiv().style('width', '100%');
  radio = createRadio();
  radio.option('random');
  radio.option('cradle');
  radio.option('diffusion');
  radio.option('membrane');
  radio.option('sandbox');
  radio.value('random');
  radio.changed(initCircles);
  radioDiv = createDiv().addClass('radios').child(radio);
  input = createInput().attribute('placeholder', 'sandbox data json input');
  createDiv().id('chart').style('width', '100%');
  cardsDiv = createDiv().addClass('cards-container');
}

var chart = null;

function drawMeanSquareDisp() {
  chart.series[0].update({data: msdData});
}

function drawLinearRegression() {
    let data = chart.series[0].data;
    let x = data.map(d => d.x);
    let y = data.map(d => d.y);
    chart.series[1].update({data: findLineByLeastSquares(x,y)});
}

function generateChart(num) {
  return Highcharts.chart('chart', {
    title: {text: `Mean square displacement of ${lastValue} particles`},
    yAxis: {title: {text: 'Mean square displacement'}},
    xAxis: {title: {text: 'Time' }},  
    boost: {
        useGPUTranslations: true,
        usePreallocated: true,
        allowForce: true,
        
    },
    series: [{name: 'Total mean square displacement', data: []}, {name: 'Linear regression', data: [], color: 'Red'}],

    chart: {
      type: 'spline',
      events: {
        click: function(){
            drawLinearRegression();
        }
      }
    },
  });
} 

function setup() {
  createCanvas(1080, 640);
  createDomElements();
  initCircles();
  textSize(32);
  chart = generateChart();
  lastFrame = millis()|0;
}

function draw() {
  let currentFrame = (millis()|0);
  dt = currentFrame - lastFrame;
  lastFrame = currentFrame;
  let fps = 0;

  // -- update -- 
  if (running) {
    nFrames = nFrames + 1;
    fps = (1000 / dt)|0;
      
    range(0, lastValue).forEach(i => {
      circles[i].move();
      circles[i].wallCollision();
      range(i + 1, lastValue).forEach(j => circles[i].collision(circles[j]));
    });
    let meanSquareDisplacement = circles.map(c => Math.pow(c.displacement(), 2)).reduce((a, b) => a + b) / lastValue
    msdData.push([nFrames, meanSquareDisplacement]);
  }
    
  // -- draw --
  //layer 0
  background(200);
  fill(0, 102, 153, 51);
  noStroke();
  text(`simple ${lastValue} particles test`, 10, height - 10);
  text('Frames running: ' + nFrames, 10, 30);
  text('Fps: ' + fps, 10, 60);
  //layer 1
  circles.forEach(circle => circle.drawTrail()); 
  //layer 2
  circles.forEach(circle => circle.draw()); 
  //layer 3
  circles.forEach(circle => circle.drawVector()); 
  //chart
  chart && nFrames < chartLimit && drawMeanSquareDisp(); 
  nFrames == chartLimit && drawLinearRegression();
}

