import { Point } from '../../../lib/graphics2d';

export class PathModel {
  private readonly _points: Point[];
  private _length: number = -1;

  constructor(nargs: {
    points: Point[]
  }) {
    this._points = [...nargs.points];
  }

  get points(): Point[] {
    return this._points;
  }

  also(mutate: (path: PathModel) => void): PathModel {
    mutate(this);
    return this;
  }

  measure(): number {
    if (this._length >= 0) {
      return this._length;
    }

    let length = 0
    for (let i = 1; i < this._points.length; i++) {
      length += Point.dist(this._points[i], this._points[i - 1]);
    }
    this._length = length;
    return length;
  }

  noise() {
    const i = this._points.sampleIndex();
    const j = this._points.sampleIndex();
    this._points.swap(i, j);
  }
}

export class ProgressModel {
  public readonly total: number;
  public readonly current: number;

  constructor(nargs: {
    total: number,
    current: number,
  }) {
    this.total = nargs.total;
    this.current = nargs.current;
  }
}
