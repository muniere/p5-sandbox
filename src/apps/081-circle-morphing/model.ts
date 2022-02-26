import { Arrays } from '../../lib/stdlib';
import { Point, PointRange } from '../../lib/graphics2d';

export module PathModels {

  export function circle({radius, resolution}: {
    radius: number,
    resolution: number,
  }): PathModel {
    const step = (2 * Math.PI) / resolution;

    const points = [] as Point[];

    for (let angle = 0; angle < 2 * Math.PI; angle += step) {
      const point = Point.polar({
        radius: radius,
        angle: angle,
      })

      points.push(point);
    }

    return new PathModel({points});
  }

  export function polygon({n, radius, resolution}: {
    n: number,
    radius: number,
    resolution: number,
  }): PathModel {
    const division = (2 * Math.PI) / n;
    const step = (2 * Math.PI) / resolution;

    const points = [] as Point[];

    for (let i = 0; i < n; i++) {
      const startAngle = i * division;
      const endAngle = (i + 1) * division;
      const pointRange = new PointRange({
        start: Point.polar({radius: radius, angle: startAngle}),
        stop: Point.polar({radius: radius, angle: endAngle})
      });

      for (let angle = startAngle; angle < endAngle; angle += step) {
        const amount = (angle % division) / (endAngle - startAngle);
        const point = pointRange.lerp(amount);
        points.push(point);
      }
    }

    return new PathModel({points});
  }
}

export class PathModel {
  private readonly _points: Point[];

  constructor(nargs: {
    points: Point[],
  }) {
    this._points = [...nargs.points];
  }

  get points(): Point[] {
    return [...this._points];
  }

  get length(): number {
    return this._points.length;
  }
}

export interface Interpolator {
  compute(fraction: number): number
}

export class AnyInterpolator implements Interpolator {
  private readonly _compute: (fraction: number) => number;

  constructor(
    compute: (fraction: number) => number
  ) {
    this._compute = compute;
  }

  compute(fraction: number): number {
    return this._compute(fraction);
  }
}

export interface Morphing {
  progress: number

  forward(): void

  backward(): void

  path(): PathModel
}

export class InterpolationMorphing implements Morphing {
  private readonly _src: PathModel;
  private readonly _dst: PathModel;
  private readonly _interpolator: Interpolator;
  private _progress: number = 0;

  constructor(nargs: {
    src: PathModel,
    dst: PathModel,
    interpolator?: Interpolator,
  }) {
    this._src = nargs.src;
    this._dst = nargs.dst;
    this._interpolator = nargs.interpolator ?? new AnyInterpolator((fraction: number) => {
      if (fraction < 0.5) {
        return Math.pow(fraction, 2) * 2;
      } else {
        return 1 - Math.pow((1 - fraction), 2) * 2;
      }
    });
  }

  get progress(): number {
    return this._progress;
  }

  forward(delta: number = 0.005) {
    this._progress = Math.min(this._progress + delta, 1);
  }

  backward(delta: number = 0.005) {
    this._progress = Math.max(this._progress - delta, 0);
  }

  path(): PathModel {
    const progress = this._interpolator.compute(this._progress);

    const points = Arrays.zip(this._src.points, this._dst.points).map(([src, dst]) => {
      return new PointRange({start: src, stop: dst}).lerp(progress);
    });

    return new PathModel({points});
  }
}

export class RandomSwapMorphing implements Morphing {
  private readonly _src: PathModel;
  private readonly _dst: PathModel;
  private _indices: number[] = [];

  constructor(nargs: {
    src: PathModel,
    dst: PathModel,
  }) {
    this._src = nargs.src;
    this._dst = nargs.dst;
  }

  get progress(): number {
    return this._indices.length / this._src.length;
  }

  forward() {
    const table = this._indices.reduce((acc, i) => acc.set(i, true), new Map<number, boolean>());
    const candidates = this._src.points.map((_, i) => i).filter(i => !table.has(i));
    this._indices.push(candidates.sample());
  }

  backward() {
    this._indices.remove(this._indices.sampleIndex());
  }

  path() {
    const table = this._indices.reduce((acc, i) => acc.set(i, true), new Map<number, boolean>());
    const points = Arrays.zip(this._src.points, this._dst.points).map(([src, dst], i) => {
      return table.has(i) ? dst : src;
    });

    return new PathModel({points})
  }
}

export class ApplicationModel {
  private readonly _morphing: Morphing;

  private sign: number = 1;

  constructor(nargs: {
    morphing: Morphing
  }) {
    this._morphing = nargs.morphing;
  }

  path(): PathModel {
    return this._morphing.path();
  }

  update() {
    switch (this.sign) {
      case 1:
        if (this._morphing.progress == 1) {
          this.sign = -1;
        }
        break;
      case -1:
        if (this._morphing.progress == 0) {
          this.sign = 1;
        }
        break;
    }

    if (this.sign > 0) {
      this._morphing.forward();
    } else {
      this._morphing.backward();
    }
  }
}
