// https://www.youtube.com/watch?v=u2D4sxh3MTs
import * as p5 from 'p5';
import * as easing from 'bezier-easing';
import { EasingFunction } from 'bezier-easing';

const Const = Object.freeze({
  DEGREE_0: 0,
  DEGREE_360: 360,
});

const Params = Object.freeze({
  CANVAS_COLOR: '#CCCCCC',
  STROKE_COLOR: '#000000',
  RESOLUTION: 360 / 2,
  SRC_RADIUS: 150,
  SRC_VERTEX_N: 0,
  DST_RADIUS: 40,
  DST_VERTEX_N: 3,
  ROTATION_SPEED: 5,
});

class Collections {

  static zip<T, U>(a: T[], b: U[]): Array<[T, U]> {
    return a.map((it, i) => [it, b[i]]);
  }
}

class CartesianCoords {
  constructor(
    private delegate: p5,
  ) {
    // no-op
  }

  static of(p: p5): CartesianCoords {
    return new CartesianCoords(p);
  }

  createVector({x, y}: {
    x: number,
    y: number,
  }): p5.Vector {
    return this.delegate.createVector(x, y);
  }
}

class PolarCoords {
  constructor(
    private delegate: p5,
  ) {
    // no-op
  }

  static of(p: p5): PolarCoords {
    return new PolarCoords(p);
  }

  createVector({radius, degree}: {
    radius: number,
    degree: number,
  }): p5.Vector {
    return this.delegate.createVector(
      radius * this.delegate.cos(degree),
      radius * this.delegate.sin(degree),
    );
  }
}

class PathFactory {
  constructor(
    private delegate: p5,
  ) {
    // no-op
  }

  static of(p: p5): PathFactory {
    return new PathFactory(p);
  }

  createCircle({radius, resolution}: { radius: number, resolution: number }): p5.Vector[] {
    const coords = new PolarCoords(this.delegate);
    const stepAngle = Const.DEGREE_360 / resolution;

    const result = [] as p5.Vector[];
    for (let degree = Const.DEGREE_0; degree < Const.DEGREE_360; degree += stepAngle) {
      result.push(coords.createVector({radius: radius, degree: degree}));
    }
    return result;
  }

  createPolygon({n, radius, resolution}: { n: number, radius: number, resolution: number }): p5.Vector[] {
    const coords = new PolarCoords(this.delegate);

    const divisionAngle = Const.DEGREE_360 / n;
    const stepAngle = Const.DEGREE_360 / resolution;
    const result = [] as p5.Vector[];

    for (let i = 0; i < n; i++) {
      const startAngle = i * divisionAngle;
      const endAngle = (i + 1) * divisionAngle;
      const startPoint = coords.createVector({radius: radius, degree: startAngle});
      const endPoint = coords.createVector({radius: radius, degree: endAngle});

      for (let angle = startAngle; angle < endAngle; angle += stepAngle) {
        const amount = (angle % divisionAngle) / (endAngle - startAngle);
        const vertex = p5.Vector.lerp(startPoint, endPoint, amount);
        result.push(vertex);
      }
    }

    return result;
  }
}

class LinearInterpolateMorphing {
  private readonly _interpolator: EasingFunction;
  private _progress: number = 0;

  constructor(
    private context: p5,
    private src: p5.Vector[],
    private dst: p5.Vector[],
    interpolator?: EasingFunction,
  ) {
    this._interpolator = interpolator || easing.default(0.65, 0, 0.35, 1);
  }

  static create({context, src, dst, interpolator}: {
    context: p5,
    src: p5.Vector[],
    dst: p5.Vector[],
    interpolator?: EasingFunction,
  }): LinearInterpolateMorphing {
    return new LinearInterpolateMorphing(context, src, dst, interpolator);
  }

  get progress(): number {
    return this._progress;
  }

  forward() {
    this._progress = Math.min(this._progress + 0.005, 1);
  }

  backward() {
    this._progress = Math.max(this._progress - 0.005, 0);
  }

  draw() {
    const progress = this._interpolator(this._progress);
    const path = Collections.zip(this.src, this.dst).map(
      ([src, dst]) => p5.Vector.lerp(src, dst, progress)
    );

    this.context.beginShape();
    path.forEach(it => this.context.vertex(it.x, it.y));
    this.context.endShape(this.context.CLOSE);
  }
}

class RandomSwapMorphing {
  private _indices: number[] = [];

  constructor(
    private context: p5,
    private src: p5.Vector[],
    private dst: p5.Vector[],
  ) {
    // no-op
  }

  static create({context, src, dst}: {
    context: p5,
    src: p5.Vector[],
    dst: p5.Vector[],
  }): RandomSwapMorphing {
    return new RandomSwapMorphing(context, src, dst);
  }

  get progress(): number {
    return this._indices.length / this.src.length;
  }

  forward() {
    const table = this._indices.reduce((acc, i) => acc.set(i, true), new Map<number, boolean>());
    const candidates = this.src.map((_, i) => i).filter(i => !table.has(i));
    const selected = candidates[Math.floor(candidates.length * Math.random())];
    this._indices.push(selected);
  }

  backward() {
    this._indices.splice(Math.floor(this._indices.length * Math.random()), 1);
  }

  draw() {
    const table = this._indices.reduce((acc, i) => acc.set(i, true), new Map<number, boolean>());
    const path = Collections.zip(this.src, this.dst).map(
      ([src, dst], i) => table.has(i) ? dst : src
    );

    this.context.beginShape();
    path.forEach(it => this.context.vertex(it.x, it.y));
    this.context.endShape(this.context.CLOSE);
  }
}

function sketch(context: p5) {
  let morph: LinearInterpolateMorphing;
  let sign: number = 1;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);
    context.angleMode(context.DEGREES);

    morph = LinearInterpolateMorphing.create({
      context: context,
      src: Params.SRC_VERTEX_N >= 3
        ? PathFactory.of(context).createPolygon({
          n: Params.SRC_VERTEX_N,
          radius: Params.SRC_RADIUS,
          resolution: Params.RESOLUTION,
        })
        : PathFactory.of(context).createCircle({
          radius: Params.SRC_RADIUS,
          resolution: Params.RESOLUTION,
        }),
      dst: Params.DST_VERTEX_N >= 3
        ? PathFactory.of(context).createPolygon({
          n: Params.DST_VERTEX_N,
          radius: Params.DST_RADIUS,
          resolution: Params.RESOLUTION,
        })
        : PathFactory.of(context).createCircle({
          radius: Params.DST_RADIUS,
          resolution: Params.RESOLUTION,
        })
    });
  }

  context.draw = function () {
    context.background(Params.CANVAS_COLOR);
    context.translate(context.width / 2, context.height / 2);
    context.rotate(context.frameCount * Params.ROTATION_SPEED);

    context.stroke(Params.STROKE_COLOR);
    context.noFill();

    morph.draw();

    switch (sign) {
      case 1:
        if (morph.progress == 1) {
          sign = -1;
        }
        break;
      case -1:
        if (morph.progress == 0) {
          sign = 1;
        }
        break;
    }

    if (sign > 0) {
      morph.forward();
    } else {
      morph.backward();
    }
  }
}

export { sketch };
