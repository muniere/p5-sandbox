import * as easing from 'bezier-easing';
import { EasingFunction } from 'bezier-easing';
import { Arrays } from '../../lib/stdlib';
import { Point, PointRange } from '../../lib/graphics2d';

export class Path {
  constructor(
    public readonly points: Point[]
  ) {
    // no-op
  }

  static of(points: Point[]): Path {
    return new Path(points);
  }

  static empty(): Path {
    return new Path([]);
  }

  static circle({radius, resolution}: {
    radius: number,
    resolution: number,
  }): Path {
    const step = (2 * Math.PI) / resolution;

    const points = [] as Point[];

    for (let angle = 0; angle < 2 * Math.PI; angle += step) {
      const point = Point.polar({
        radius: radius,
        angle: angle,
      })

      points.push(point);
    }

    return Path.of(points);
  }

  static polygon({n, radius, resolution}: {
    n: number,
    radius: number,
    resolution: number,
  }): Path {
    const division = (2 * Math.PI) / n;
    const step = (2 * Math.PI) / resolution;

    const points = [] as Point[];

    for (let i = 0; i < n; i++) {
      const startAngle = i * division;
      const endAngle = (i + 1) * division;
      const pointRange = PointRange.of({
        start: Point.polar({radius: radius, angle: startAngle}),
        stop: Point.polar({radius: radius, angle: endAngle})
      });

      for (let angle = startAngle; angle < endAngle; angle += step) {
        const amount = (angle % division) / (endAngle - startAngle);
        const point = pointRange.lerp(amount);
        points.push(point);
      }
    }

    return Path.of(points);
  }

  get length(): number {
    return this.points.length;
  }
}

export interface Morphing {
  progress: number

  forward(): void

  backward(): void

  path(): Path
}

export class InterpolationMorphing implements Morphing {
  private readonly _interpolator: EasingFunction;
  private _progress: number = 0;

  constructor(
    private src: Path,
    private dst: Path,
    interpolator?: EasingFunction,
  ) {
    this._interpolator = interpolator || easing.default(0.65, 0, 0.35, 1);
  }

  static create({src, dst, interpolator}: {
    src: Path,
    dst: Path,
    interpolator?: EasingFunction,
  }): InterpolationMorphing {
    return new InterpolationMorphing(src, dst, interpolator);
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

  path(): Path {
    const progress = this._interpolator(this._progress);

    const points = Arrays.zip(this.src.points, this.dst.points).map(([src, dst]) => {
      const range = new PointRange(src, dst);
      return range.lerp(progress);
    });

    return Path.of(points);
  }
}

export class RandomSwapMorphing implements Morphing {
  private _indices: number[] = [];

  constructor(
    private src: Path,
    private dst: Path,
  ) {
    // no-op
  }

  static create({src, dst}: {
    src: Path,
    dst: Path,
  }): RandomSwapMorphing {
    return new RandomSwapMorphing(src, dst);
  }

  get progress(): number {
    return this._indices.length / this.src.length;
  }

  forward() {
    const table = this._indices.reduce((acc, i) => acc.set(i, true), new Map<number, boolean>());
    const candidates = this.src.points.map((_, i) => i).filter(i => !table.has(i));
    this._indices.push(Arrays.sample(candidates));
  }

  backward() {
    this._indices.splice(Arrays.sampleIndex(this._indices), 1);
  }

  path() {
    const table = this._indices.reduce((acc, i) => acc.set(i, true), new Map<number, boolean>());
    const points = Arrays.zip(this.src.points, this.dst.points).map(([src, dst], i) => {
      return table.has(i) ? dst : src;
    });

    return Path.of(points)
  }
}

export class WorldState {
  private sign: number = 1;

  constructor(
    public readonly morphing: Morphing,
  ) {
    // no-op
  }

  static create({morphing}: {
    morphing: Morphing,
  }): WorldState {
    return new WorldState(morphing);
  }

  path(): Path {
    return this.morphing.path();
  }

  update() {
    switch (this.sign) {
      case 1:
        if (this.morphing.progress == 1) {
          this.sign = -1;
        }
        break;
      case -1:
        if (this.morphing.progress == 0) {
          this.sign = 1;
        }
        break;
    }

    if (this.sign > 0) {
      this.morphing.forward();
    } else {
      this.morphing.backward();
    }
  }
}
