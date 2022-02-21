import { Generators } from '../../../lib/stdlib';
import { Point } from '../../../lib/graphics2d';
import { PathModel, ProgressModel } from '../shared/model';

export class PathGenerator {
  private readonly _points: Point[];
  private readonly _size: number;
  private readonly _permutation: Generator<number[]>;

  constructor(nargs: {
    points: Point[],
  }) {
    this._points = nargs.points.sortedAsc(it => Point.dist(it, Point.zero()));
    this._size = nargs.points.map((_, i) => i + 1).reduce((acc, n) => acc * n, 1);
    this._permutation = Generators.permutation(nargs.points.map((_, i) => i));
  }

  get size(): number {
    return this._size;
  }

  also(mutate: (obj: PathGenerator) => void): PathGenerator {
    mutate(this);
    return this;
  }

  next(): PathModel | undefined {
    const result = this._permutation.next();
    if (result.done) {
      return undefined;
    }
    return new PathModel({
      points: result.value.map(i => this._points[i])
    });
  }
}

export class LexicographicSolver {
  private _path: PathModel | undefined;
  private _answer: PathModel | undefined;
  private _count: number = 0;
  private readonly _generator: PathGenerator;

  constructor(nargs: {
    points: Point[],
  }) {
    this._generator = new PathGenerator({
      points: [...nargs.points],
    });
  }

  static create({points}: {
    points: Point[],
  }): LexicographicSolver {
    return new LexicographicSolver({points});
  }

  get hasNext(): boolean {
    return this._count < this._generator.size;
  }

  get path(): PathModel | undefined {
    return this._path;
  }

  get progress(): ProgressModel {
    return new ProgressModel({
      total: this._generator.size,
      current: this._count,
    });
  }

  get answer(): PathModel | undefined {
    return this._answer;
  }

  next() {
    const path = this._generator.next();

    this._path = path;

    if (!path) {
      return;
    }

    this._count += 1;

    if (!this._answer) {
      this._answer = path;
      return;
    }

    if (this._answer.measure() > path.measure()) {
      this._answer = path;
    }
  }
}
