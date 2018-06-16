var numOfCircles;
var lastValue;
var veloMult;
var radio;
var input;
var stopTheTrain;
var cardsDiv;

var circles = [];
var velos = [];

const defaultCollFrames = 2;
const massRange = range(5, 6);
const massMulti = 2;
const visibilityMultiplier = 10;

let mult = p5.Vector.mult
let sub = p5.Vector.sub
let dot = p5.Vector.dot

function range(from, to) {
  return [...Array(to - from).keys()].map(n => n + from)
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
    //this.p = createP(pTemplate(this));
    [this.card, this.p] = makeCard(this);
  }
  this.route = [createVector(this.position.x, this.position.y)];
}

Particle.prototype.track = function () {
  this.trackMe = !this.trackMe
  //this.trackMe ? this.p = createP(pTemplate(this)) : this.p.html('');
  this.trackMe ? [this.card, this.p] = makeCard(this) : this.card.hide();
}

Particle.prototype.draw = function () {
  if (this.collisionFrames > 0) {
    stroke('red');
    fill('pink');
    ellipse(this.position.x, this.position.y, this.size, this.size); //just testin
    this.collisionFrames -= 1;
  } else {
    stroke(50);
    this.defaultColor ? fill(100) : fill(this.trackColour);
    ellipse(this.position.x, this.position.y, this.size, this.size);
  }

  if (this.trackMe) {
    stroke('black');
    fill(this.trackColour);
    ellipse(this.position.x, this.position.y, this.size, this.size);

    // this.route.forEach((point) => ellipse(point.x, point.y, this.size / 5));
    stroke(this.trackColour);
    strokeWeight(3);
    this.route.reduce((oldPoint, point) => {
      line(point.x, point.y, oldPoint.x, oldPoint.y);
      return point;
    });
    strokeWeight(1);
    stroke(0);

    this.p.html(pTemplate(this));

    let vEnd = createVector(
      this.position.x + this.velocity.x*visibilityMultiplier, 
      this.position.y + this.velocity.y*visibilityMultiplier
    );
    line(this.position.x, this.position.y, vEnd.x, vEnd.y);

    // let aEnd = createVector(
    //   this.position.x + this.acceleration.x*visibilityMultiplier, 
    //   this.position.y + this.acceleration.y*visibilityMultiplier
    // );
    // line(this.position.x, this.position.y, aEnd.x, aEnd.y);

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
    // fix for particles stuck in each other
    let moveAmount = (this.size + other.size) / 2 - distance;
    let moveVector = sub(this.position, other.position).normalize().mult(moveAmount);
    this.position.add(moveVector);
  }
}

Particle.prototype.displacement = function () {
  return sub(this.position, this.initPosition).mag();
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
  chart && chart.series[0].update({data: []});
  chart && chart.series[1] && chart.series[1].update({data: []});
  circles = [];
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
    circles[0].track();
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
  chart && chart.update({title: {text: `Mean square displacement of ${lastValue} particles`}})
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

function createDomElements() {
  createP('');
  numOfCircles = createSlider(0, 500, 150);
  numOfCircles.changed(initCircles);
  stopTheTrain = createCheckbox('STOP THE TRAIN', false);
  veloMult = createSlider(1, 10, 4);
  veloMult.changed(initCircles);
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
  createDiv().id('chart');
  cardsDiv = createDiv().addClass('cards-container');
}

chart = null;

function setup() {
  createCanvas(1080, 640);
  createDomElements();
  initCircles();
  textSize(32);
  chart = generateChart();
}

function draw() {
  background(200);

  fill(0, 102, 153, 51);
  noStroke();
  text(`simple ${lastValue} particles test`, 10, height - 10);
  text('Milliseconds running: ' + (millis()|0), 10, 50);
  let checked = stopTheTrain.checked();
  range(0, lastValue).forEach(i => {
    circles[i].draw();
    if (!checked) {
      circles[i].updateState();
    }
    range(i + 1, lastValue).forEach(j => circles[i].collision(circles[j]));
  });
  let meanSquareDisplacement = circles.map(c => Math.pow(c.displacement(), 2)).reduce((a, b) => a + b) / lastValue;
  !checked && chart && updateChart(meanSquareDisplacement);
}

function updateChart(dataPoint) {
  chart.series[0].addPoint(dataPoint, false);
  chart.redraw(false);
}

function generateChart(num) {
  return Highcharts.chart('chart', {
    title: {text: `Mean square displacement of ${lastValue} particles`},
    yAxis: {title: { text: 'Mean square displacement'}},
    xAxis: {title: {text: 'Time' }},  

    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            pointStart: 0
        }
    },
    chart: {
      type: 'spline',
			events: {
				click: function(e){
          let x = chart.series[0].data.map(d => d.x);
          let y = chart.series[0].data.map(d => d.y);
          chart.series.length > 1 && chart.series[1].remove();
					chart.addSeries({
            name: 'Linear regression',
            data: findLineByLeastSquares(x,y),
            color: 'Red'
          });
				}
			}
		},
		boost: {useGPUTranslations: true},
    series: [{
        name: 'Total mean square displacement',
        data: []
    }],
  });
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
