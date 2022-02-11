import { Generators } from '../../../lib/stdlib';
import { Point } from '../../../lib/graphics2d';
import { PathState } from '../shared/model';

export class PathGenerator {
  public color: string = '#FFFFFF';
  public weight: number = 1;

  private readonly _size: number;
  private readonly _permutation: Generator<number[]>;

  constructor(
    public readonly points: Point[],
  ) {
    this.points = points.sort(
      (a, b) => Point.dist(a, Point.zero()) - Point.dist(b, Point.zero())
    );
    this._size = points.map((_, i) => i + 1).reduce((acc, n) => acc * n, 1);
    this._permutation = Generators.permutation(points.map((_, i) => i));
  }

  static create({points}: {
    points: Point[],
  }): PathGenerator {
    return new PathGenerator(points);
  }

  get size(): number {
    return this._size;
  }

  also(mutate: (obj: PathGenerator) => void): PathGenerator {
    mutate(this);
    return this;
  }

  next(): PathState | undefined {
    const result = this._permutation.next();
    if (result.done) {
      return undefined;
    }
    return PathState.create({
      points: result.value.map(i => this.points[i])
    });
  }
}

export class LexicographicSolver {
  private _state: PathState | undefined;
  private _answer: PathState | undefined;
  private _count: number = 0;

  constructor(
    private readonly _generator: PathGenerator,
  ) {
    // no-op
  }

  static create({points}: {
    points: Point[],
  }) : LexicographicSolver {
    const generator = PathGenerator.create({
      points: [...points],
    });

    return new LexicographicSolver(generator);
  }

  get hasNext(): boolean {
    return this._count < this._generator.size;
  }

  get count(): number {
    return this._count;
  }

  get size(): number {
    return this._generator.size;
  }

  get state(): PathState | undefined {
    return this._state;
  }

  get answer(): PathState | undefined {
    return this._answer;
  }

  next() {
    const path = this._generator.next();

    this._state = path;

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
