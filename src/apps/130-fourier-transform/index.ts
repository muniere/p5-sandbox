// https://www.youtube.com/watch?v=MY4luNgGfms
import * as p5 from 'p5';
import * as data from './data';
import { Complex } from '../../lib/cmath';
import { Point } from '../../lib/graphics2d';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SHAPE_COLOR: '#FFFFFF',
  ORIGIN_X: 50,
  ORIGIN_Y: 50,
  MARGIN_X: 300,
  MARGIN_Y: 300,
  AMPLITUDE: 200,
});

class Formula {

  static fourier(xs: Complex[]): Complex[] {
    const N = xs.length;
    const t = -(2 * Math.PI) / N;

    return [...Array(N)].map(
      (_, k) => xs.reduce(
        (acc, x, n) => acc.plus(
          x.times(Complex.unit(k * n * t))
        )
      )
    );
  }
}

class Clock {
  constructor(
    public context: p5,
    public speed: number,
  ) {
    // no-op
  }

  static create({context, speed}: {
    context: p5,
    speed: number,
  }): Clock {
    return new Clock(context, speed);
  }

  time(): number {
    return this.context.frameCount * this.speed;
  }
}

class Genome {

  constructor(
    public readonly frequency: number,
    public readonly amplitude: number,
    public readonly phase: number,
  ) {
    // no-op
  }


  static of({frequency, amplitude, phase}: {
    frequency: number,
    amplitude: number,
    phase: number,
  }): Genome {
    return new Genome(frequency, amplitude, phase);
  }

  static from({k, X}: { k: number, X: Complex }): Genome {
    return Genome.of({
      frequency: k,
      amplitude: X.norm,
      phase: Math.atan2(X.im, X.re),
    });
  }
}


class Graph {
  public color: string = Params.SHAPE_COLOR;
  public maxLength: number = -1;

  constructor(
    public context: p5,
    public plots: Point[],
  ) {
    // no-op
  }

  static create({context, plots}: {
    context: p5,
    plots: Point[],
  }): Graph {
    return new Graph(context, plots);
  }

  get first(): Point {
    return this.plots[0];
  }

  get last(): Point {
    return this.plots[this.plots.length - 1];
  }

  also(mutate: (wave: Graph) => void): Graph {
    mutate(this);
    return this;
  }

  push(plot: Point) {
    this.plots.unshift(plot);

    if (this.maxLength > 0 && this.plots.length > this.maxLength) {
      this.plots.pop();
    }
  }

  draw() {
    this.context.push();

    this.context.noFill();
    this.context.stroke(this.color);

    this.context.beginShape();

    this.plots.forEach((value) => {
      this.context.vertex(value.x, value.y);
    });

    this.context.endShape();
    this.context.pop();
  }
}

class Circle {
  public color: string = Params.SHAPE_COLOR;
  public angle: number = 0;
  public trackWeight: number = 0;
  public handWeight: number = 0;
  public pointRadius: number = 0;

  constructor(
    public context: p5,
    public center: Point,
    public genome: Genome,
  ) {
    // no-op
  }

  static create({context, center, genome}: {
    context: p5,
    center: Point,
    genome: Genome,
  }): Circle {
    return new Circle(context, center, genome);
  }

  get radius(): number {
    return this.genome.amplitude;
  }

  get epicycleCenter(): Point {
    return Point.of({
      x: this.center.x + this.radius * Math.cos(this.angle),
      y: this.center.y + this.radius * Math.sin(this.angle),
    });
  }

  also(mutate: (circle: Circle) => void): Circle {
    mutate(this);
    return this;
  }

  point(radian: number): Point {
    return this.center.plus({
      x: this.radius * Math.cos(radian),
      y: this.radius * Math.sin(radian),
    });
  }

  draw() {
    this.context.push()

    const pointCenter = this.epicycleCenter;

    if (this.trackWeight > 0) {
      this.context.stroke(this.color);
      this.context.strokeWeight(this.trackWeight);
      this.context.noFill();

      this.context.circle(
        this.center.x,
        this.center.y,
        this.radius * 2
      );
    }

    if (this.handWeight > 0) {
      this.context.stroke(this.color);
      this.context.strokeWeight(this.handWeight)
      this.context.noFill();

      this.context.line(
        this.center.x, this.center.y,
        pointCenter.x, pointCenter.y
      );
    }

    if (this.pointRadius) {
      this.context.noStroke();
      this.context.fill(this.color);

      this.context.circle(pointCenter.x, pointCenter.y, this.pointRadius);
    }

    this.context.pop();
  }
}

class Series {

  public constructor(
    public context: p5,
    public circles: Circle[],
  ) {
    // no-op
  }

  static create({context, center, values, decorate}: {
    context: p5,
    center: Point,
    values: Complex[],
    decorate?: (circle: Circle, i: number) => void
  }): Series {
    const N = Complex.re(values.length);
    const genomes = Formula.fourier(values).map(
      (X, k) => Genome.from({
        k: k,
        X: X.div(N),
      })
    );

    const circles = genomes.map((genome, i) =>
      Circle.create({
        context: context,
        center: center,
        genome: genome,
      }).also(it => {
        if (decorate) {
          decorate(it, i);
        }
      })
    ).sort((a, b) => b.genome.amplitude - a.genome.amplitude);

    return new Series(context, circles);
  }

  get first(): Circle {
    return this.circles[0];
  }

  get last(): Circle {
    return this.circles[this.circles.length - 1];
  }

  also(mutate: (machine: Series) => void): Series {
    mutate(this);
    return this;
  }

  update({clock, offset}: { clock: Clock, offset: number }) {
    const time = clock.time();

    let center = this.circles[0].center;

    this.circles.forEach((circle) => {
      const freq = circle.genome.frequency;
      const phase = circle.genome.phase;
      circle.center = center;
      circle.angle = freq * time + phase + offset;
      center = circle.epicycleCenter;
    });
  }

  draw() {
    this.circles.forEach(it => it.draw());
  }
}


class Line {
  public color: string = Params.SHAPE_COLOR;
  public weight: number = 1

  constructor(
    public context: p5,
    public start: Point,
    public end: Point,
  ) {
    // no-op
  }

  static create({context, start, end}: {
    context: p5,
    start?: Point,
    end?: Point,
  }): Line {
    return new Line(context, start ?? Point.zero(), end ?? Point.zero());
  }

  also(mutate: (line: Line) => void): Line {
    mutate(this);
    return this;
  }

  draw() {
    this.context.push();
    this.context.stroke(this.color);
    this.context.strokeWeight(this.weight);
    this.context.line(
      this.start.x, this.start.y,
      this.end.x, this.end.y,
    );
    this.context.pop();
  }
}

// complex plane edition; with single complex numbers
// noinspection JSUnusedLocalSymbols
function sketchComplex(context: p5) {
  let origin: Point;
  let clock: Clock;
  let series: Series;
  let graph: Graph;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);

    const zs = data.path
      .filter((it, i) => i % 10 == 0)
      .map((it) => Complex.of(it.x, it.y));

    origin = Point.of({
      x: Params.ORIGIN_X,
      y: Params.ORIGIN_Y + Params.MARGIN_Y / 2,
    });

    clock = Clock.create({
      context: context,
      speed: (2 * Math.PI) / zs.length,
    });

    series = Series.create({
      context: context,
      center: origin.plus({x: Params.MARGIN_X}),
      values: zs,
      decorate: (circle: Circle) => {
        circle.color = Params.SHAPE_COLOR;
        circle.trackWeight = .5;
        circle.handWeight = .5;
        circle.pointRadius = 0;
      }
    });

    graph = Graph.create({
      context: context,
      plots: [],
    }).also(it => {
      it.color = Params.SHAPE_COLOR;
      it.maxLength = Math.floor(zs.length * 0.8);
    });
  }

  context.draw = function () {
    // update
    series.update({clock: clock, offset: 0});
    graph.push(
      Point.of({
        x: series.last.epicycleCenter.x,
        y: series.last.epicycleCenter.y,
      })
    );

    // draw
    context.translate(origin.x, origin.y);
    context.background(Params.CANVAS_COLOR);

    series.draw();
    graph.draw();
  }
}

// x-y plan edition; with combinations of real numbers
// noinspection JSUnusedLocalSymbols
function sketchReal(context: p5) {
  let origin: Point;
  let clock: Clock;
  let seriesX: Series;
  let seriesY: Series;
  let graph: Graph;
  let lineX: Line;
  let lineY: Line;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);

    const coords = data.path
      .filter((it, i) => i % 10 == 0)
      .map((it) => Point.of(it));

    origin = Point.of({
      x: Params.ORIGIN_X,
      y: Params.ORIGIN_Y,
    });

    clock = Clock.create({
      context: context,
      speed: (2 * Math.PI) / coords.length,
    });

    seriesX = Series.create({
      context: context,
      center: origin.plus({x: Params.MARGIN_X}),
      values: coords.map(it => Complex.re(it.x)),
      decorate: (circle: Circle) => {
        circle.color = Params.SHAPE_COLOR;
        circle.trackWeight = .5;
        circle.handWeight = .5;
        circle.pointRadius = 0;
      }
    });

    seriesY = Series.create({
      context: context,
      center: origin.plus({y: Params.MARGIN_Y}),
      values: coords.map(it => Complex.re(it.y)),
      decorate: (circle: Circle) => {
        circle.color = Params.SHAPE_COLOR;
        circle.trackWeight = .5;
        circle.handWeight = .5;
        circle.pointRadius = 0;
      }
    });

    graph = Graph.create({
      context: context,
      plots: [],
    }).also(it => {
      it.color = Params.SHAPE_COLOR;
      it.maxLength = Math.floor(coords.length * 0.8);
    });

    lineX = Line.create({
      context: context,
    }).also(it => {
      it.weight = .5;
      it.color = Params.SHAPE_COLOR;
    });

    lineY = Line.create({
      context: context,
    }).also(it => {
      it.weight = .5;
      it.color = Params.SHAPE_COLOR;
    });
  }

  context.draw = function () {
    // update
    seriesX.update({clock: clock, offset: 0});
    seriesY.update({clock: clock, offset: Math.PI / 2});
    graph.push(
      Point.of({
        x: seriesX.last.epicycleCenter.x,
        y: seriesY.last.epicycleCenter.y,
      })
    );
    lineX.start = seriesX.last.epicycleCenter;
    lineX.end = graph.first;
    lineY.start = seriesY.last.epicycleCenter;
    lineY.end = graph.first;

    // draw
    context.translate(origin.x, origin.y);
    context.background(Params.CANVAS_COLOR);

    seriesX.draw();
    lineX.draw();

    seriesY.draw();
    lineY.draw();

    graph.draw();
  }
}

export { sketchComplex as sketch };
