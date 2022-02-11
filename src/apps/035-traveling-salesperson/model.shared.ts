import { Numeric } from '../../lib/stdlib';
import { Point } from '../../lib/graphics2d';

export class PathState {
  private _length: number = -1;

  constructor(
    public readonly points: Point[],
  ) {
    // no-op
  }

  static create({points}: {
    points: Point[]
  }): PathState {
    return new PathState(points);
  }

  also(mutate: (path: PathState) => void): PathState {
    mutate(this);
    return this;
  }

  measure(): number {
    if (this._length >= 0) {
      return this._length;
    }

    let length = 0
    for (let i = 1; i < this.points.length; i++) {
      length += Point.dist(this.points[i], this.points[i - 1]);
    }
    this._length = length;
    return length;
  }

  noise() {
    const range = Numeric.range(0, this.points.length);
    const i = Math.floor(range.sample());
    const j = Math.floor(range.sample());
    const tmp = this.points[i];
    this.points[i] = this.points[j];
    this.points[j] = tmp;
  }
}

export class ProgressState {
  constructor(
    public readonly total: number,
    public readonly current: number,
  ) {
    // no-op
  }

  static of({total, current}: {
    total: number,
    current: number,
  }): ProgressState {
    return new ProgressState(total, current);
  }
}
