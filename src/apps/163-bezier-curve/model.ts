import { Point, PointRange, Size } from '../../lib/graphics2d';
import { CircularMaterial } from '../../lib/physics2d';

export class BallState extends CircularMaterial {
  // no-op
}

export type BezierCallback = (p1: Point, p2: Point) => void;

module BezierHelper {

  export function reduce({points, amount, onCompute}: {
    points: Point[],
    amount: number,
    onCompute?: BezierCallback,
  }): Point {
    let result = [...points];

    while (result.length >= 2) {
      const buffer = [] as Point[];

      for (let i = 0; i < result.length - 1; i++) {
        const start = result[i];
        const stop = result[i + 1];
        const lerp = PointRange.of({start, stop}).lerp(amount);

        buffer.push(lerp);

        if (onCompute) {
          onCompute(start, stop);
        }
      }

      result = buffer;
    }

    return result[0];
  }
}

export class BezierCurve {

  constructor(
    public start: Point,
    public stop: Point,
    public controls: Point[],
    public resolution: number,
  ) {
    if (resolution < 0) {
      throw new Error();
    }
  }

  static create({start, stop, controls, resolution}: {
    start: Point,
    stop: Point,
    controls: Point[],
    resolution: number,
  }): BezierCurve {
    return new BezierCurve(start, stop, controls, resolution);
  }

  compute(option?: { onCompute?: BezierCallback }): Point[] {
    const points = [this.start, ...this.controls, this.stop];
    const step = 1.0 / (this.resolution + 1);

    const result = [this.start.copy()];

    for (let amount = step; amount < 1.0; amount += step) {
      const point = BezierHelper.reduce({
        points: points,
        amount: amount,
        onCompute: option?.onCompute,
      });

      result.push(point);
    }

    return result.concat(this.stop.copy());
  }
}


export class WorldState {
  private readonly _bounds: Size;
  private readonly _balls: BallState[];
  private readonly _bezier: BezierCurve;

  constructor(
    bounds: Size,
    balls: BallState[],
    bezier: BezierCurve,
  ) {
    this._bounds = bounds;
    this._balls = balls;
    this._bezier = bezier;
  }

  static create({bounds, balls, bezier}: {
    bounds: Size,
    balls: BallState[],
    bezier: BezierCurve,
  }): WorldState {
    return new WorldState(bounds, balls, bezier);
  }

  public get balls(): BallState[] {
    return [...this._balls];
  }

  public get bezier(): BezierCurve {
    return this._bezier;
  }

  update() {
    this._balls.forEach(it => {
      it.update();
      it.coerceIn(this._bounds);
    });

    this._bezier.controls = this._balls.map(it => it.center);
  }
}
