// https://www.youtube.com/watch?v=Mm2eYfj0SgA
import * as p5 from 'p5';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SHAPE_COLOR: '#FFFFFF',
  ORIGIN_X: 50,
  ORIGIN_Y: 50,
  MARGIN_X: 50,
  CLOCK_SPEED: -1 * (Math.PI / 120),
  SERIES_RADIUS: 100,
  SERIES_DEPTH: 20,
});

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

class Coordinate {
  constructor(
    public x: number,
    public y: number,
  ) {
    // no-op
  }

  static zero(): Coordinate {
    return new Coordinate(0, 0);
  }

  static of({x, y}: {
    x: number,
    y: number,
  }): Coordinate {
    return new Coordinate(x, y);
  }

  plus({x, y}: {
    x?: number,
    y?: number,
  }): Coordinate {
    return Coordinate.of({
      x: this.x + (x ?? 0),
      y: this.y + (y ?? 0),
    });
  }

  minus({x, y}: {
    x?: number,
    y?: number,
  }): Coordinate {
    return Coordinate.of({
      x: this.x - (x ?? 0),
      y: this.y - (y ?? 0),
    });
  }

  with({x, y}: {
    x?: number,
    y?: number,
  }): Coordinate {
    return Coordinate.of({
      x: x ?? this.x,
      y: y ?? this.y,
    });
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
    public center: Coordinate,
    public radius: number,
  ) {
    // no-op
  }

  static create({context, center, radius}: {
    context: p5,
    center: Coordinate,
    radius: number,
  }): Circle {
    return new Circle(context, center, radius);
  }

  get pointCenter(): Coordinate {
    return Coordinate.of({
      x: this.center.x + this.radius * Math.cos(this.angle),
      y: this.center.y + this.radius * Math.sin(this.angle),
    });
  }

  also(mutate: (circle: Circle) => void): Circle {
    mutate(this);
    return this;
  }

  draw() {
    this.context.push()

    const pointCenter = this.pointCenter;

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

  static create({context, amplitude, color, depth}: {
    context: p5,
    amplitude: number,
    color: string,
    depth: number,
  }): Series {
    const circles = [...Array(depth)].map((_, i) => {
      const n = i * 2 + 1;
      return Circle.create({
        context: context,
        center: Coordinate.zero(),
        radius: amplitude / n,
      }).also(it => {
        it.trackWeight = i == 0 ? 1 : 0;
        it.handWeight = 1;
        it.pointRadius = 1;
        it.color = color;
      });
    });

    return new Series(context, circles);
  }

  get first(): Circle {
    return this.circles[0];
  }

  get last(): Circle {
    return this.circles[this.circles.length - 1];
  }

  update(clock: Clock) {
    const time = clock.time();

    let center = Coordinate.zero();

    this.circles.forEach((circle, i) => {
      const n = i * 2 + 1;
      circle.center = center;
      circle.angle = n * time;
      center = circle.pointCenter;
    });
  }

  draw() {
    this.circles.forEach(it => it.draw());
  }
}

class Graph {
  public color: string = Params.SHAPE_COLOR;
  public maxLength: number = -1;
  public scaleX: number = 1;
  public scaleY: number = 1;

  constructor(
    public context: p5,
    public origin: Coordinate,
    public values: number[],
  ) {
    // no-op
  }

  static create({context, origin, values}: {
    context: p5,
    origin: Coordinate,
    values: number[],
  }): Graph {
    return new Graph(context, origin, values);
  }

  get first(): Coordinate {
    return this.origin.with({
      y: this.values[0]
    });
  }

  get last(): Coordinate {
    return this.origin.with({
      y: this.values[this.values.length - 1]
    });
  }

  also(mutate: (wave: Graph) => void): Graph {
    mutate(this);
    return this;
  }

  coordinate(index: number): Coordinate {
    return this.origin.with({
      x: this.origin.x + index * this.scaleX,
      y: this.origin.y + this.values[index] * this.scaleY
    });
  }

  push(value: number) {
    this.values.unshift(value);

    if (this.maxLength > 0 && this.values.length > this.maxLength) {
      this.values.pop();
    }
  }

  draw() {
    this.context.push();

    this.context.noFill();
    this.context.stroke(this.color);

    this.context.beginShape();

    this.values.forEach((value, i) => {
      const x = this.origin.x + i * this.scaleX;
      const y = this.origin.y + value * this.scaleY;

      this.context.vertex(x, y);
    });

    this.context.endShape();
    this.context.pop();
  }
}

class Line {
  public color: string = Params.SHAPE_COLOR;

  constructor(
    public context: p5,
    public start: Coordinate,
    public end: Coordinate,
  ) {
    // no-op
  }

  static create({context, start, end}: {
    context: p5,
    start?: Coordinate,
    end?: Coordinate,
  }): Line {
    return new Line(context, start ?? Coordinate.zero(), end ?? Coordinate.zero());
  }

  also(mutate: (line: Line) => void): Line {
    mutate(this);
    return this;
  }

  draw() {
    this.context.push();
    this.context.stroke(this.color);
    this.context.line(this.start.x, this.start.y, this.end.x, this.end.y);
    this.context.pop();
  }
}

function sketch(context: p5) {
  let origin: Coordinate;
  let clock: Clock;
  let series: Series;
  let graph: Graph;
  let line: Line;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);

    origin = Coordinate.of({
      x: Params.ORIGIN_X + Params.SERIES_RADIUS,
      y: Params.ORIGIN_Y + Params.SERIES_RADIUS,
    });

    clock = Clock.create({
      context: context,
      speed: Params.CLOCK_SPEED,
    });

    series = Series.create({
      context: context,
      amplitude: Params.SERIES_RADIUS,
      color: Params.SHAPE_COLOR,
      depth: Params.SERIES_DEPTH,
    });

    graph = Graph.create({
      context: context,
      origin: Coordinate.zero().plus({x: Params.SERIES_RADIUS + Params.MARGIN_X}),
      values: [],
    }).also(it => {
      it.color = Params.SHAPE_COLOR;
      it.maxLength = context.width - it.origin.x;
      it.scaleX = 1;
      it.scaleY = 1;
    });

    line = Line.create({
      context: context,
    }).also(it => {
      it.color = Params.SHAPE_COLOR;
    });
  }

  context.draw = function () {
    // update
    series.update(clock);
    graph.push(series.last.pointCenter.y);
    line.start = series.last.pointCenter;
    line.end = graph.first;

    // draw
    context.translate(origin.x, origin.y);
    context.background(Params.CANVAS_COLOR);

    series.draw();
    graph.draw();
    line.draw();
  }
}

export { sketch };
