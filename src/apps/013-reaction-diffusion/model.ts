import { Dimen, Matrix, Spot } from '../../lib/dmath';
import { Point, Rect, Size } from '../../lib/graphics2d';

// This process uses mutable operations with primitive structures,
// to reduce memory allocation costs for too many small objects.

export type CellState = {
  a: number,
  b: number,
};

export class GridState {
  constructor(
    public readonly matrix: Matrix<CellState>
  ) {
    // no-op
  }

  static create({dimen, factory}: {
    dimen: Dimen,
    factory: (spot: Spot) => CellState,
  }): GridState {
    return new GridState(
      Matrix.generate(dimen, factory)
    );
  }

  get width(): number {
    return this.matrix.width;
  }

  get height(): number {
    return this.matrix.height;
  }

  get dimen(): Dimen {
    return this.matrix.dimen;
  }

  getValue(spot: Spot): CellState {
    return this.matrix.get(spot);
  }

  setValue(spot: Spot, cell: CellState) {
    this.matrix.set(spot, cell);
  }

  laplace(spot: Spot): CellState {
    let {a, b} = this.getValue(spot);
    {
      a *= -1;
      b *= -1;
    }
    {
      const s = spot.shift({column: +1})
      const v = this.getValue(s);
      a += v.a * 0.2;
      b += v.b * 0.2;
    }
    {
      const s = spot.shift({column: -1});
      const v = this.getValue(s);
      a += v.a * 0.2;
      b += v.b * 0.2;
    }
    {
      const s = spot.shift({row: -1});
      const v = this.getValue(s);
      a += v.a * 0.2;
      b += v.b * 0.2;
    }
    {
      const s = spot.shift({row: +1});
      const v = this.getValue(s);
      a += v.a * 0.2;
      b += v.b * 0.2;
    }
    {
      const s = spot.shift({column: -1, row: -1})
      const v = this.getValue(s);
      a += v.a * 0.05;
      b += v.b * 0.05;
    }
    {
      const s = spot.shift({column: -1, row: +1});
      const v = this.getValue(s);
      a += v.a * 0.05;
      b += v.b * 0.05;
    }
    {
      const s = spot.shift({column: +1, row: -1});
      const v = this.getValue(s);
      a += v.a * 0.05;
      b += v.b * 0.05;
    }
    {
      const s = spot.shift({column: +1, row: +1});
      const v = this.getValue(s);
      a += v.a * 0.05;
      b += v.b * 0.05;
    }
    return {a, b};
  }
}

export class Diffusion {
  constructor(
    public a: number,
    public b: number,
    public feed: number,
    public kill: number,
  ) {
    // no-op
  }

  static create({a, b, feed, kill}: {
    a: number,
    b: number,
    feed: number,
    kill: number,
  }): Diffusion {
    return new Diffusion(a, b, feed, kill);
  }

  next(grid: GridState, result: GridState) {
    for (let row = 0; row < grid.height; row++) {
      for (let column = 0; column < grid.width; column++) {
        const spot = Spot.of({row, column});
        const cell = grid.getValue(spot);
        const {a, b} = cell;

        if (column <= 0 || grid.width - 1 <= column) {
          result.setValue(spot, cell);
          continue;
        }

        if (row <= 0 || grid.height - 1 <= row) {
          result.setValue(spot, cell);
          continue;
        }

        const lap = grid.laplace(spot);

        const newA = a
          + (this.a * lap.a)
          - (a * b * b)
          + (this.feed * (1.0 - a));

        const newB = b
          + (this.b * lap.b)
          + (a * b * b)
          - (this.kill + this.feed) * b

        const newCell = {a: newA, b: newB};
        result.setValue(spot, newCell);
      }
    }
  }
}

export class WorldState {
  private _grid: GridState;
  private readonly _work: GridState;

  constructor(
    seed: GridState,
    private diffusion: Diffusion,
  ) {
    this._grid = seed;
    this._work = GridState.create({
      dimen: seed.dimen,
      factory: () => ({a: 0, b: 0})
    });
  }

  static create({bounds, drop, diffusion}: {
    bounds: Size,
    drop: Size,
    diffusion: Diffusion,
  }): WorldState {
    const frame = Rect.of({
      origin: Point.of({
        x: Math.floor(bounds.width / 2) - drop.width,
        y: Math.floor(bounds.height / 2) - drop.height,
      }),
      size: drop,
    });

    const grid = GridState.create({
      dimen: Dimen.of(bounds),
      factory: () => ({a: 1, b: 0}),
    });

    for (let row = frame.top; row < frame.bottom; row++) {
      for (let column = frame.left; column < frame.right; column++) {
        const spot = Spot.of({row, column});
        const cell = {a: 0, b: 1};
        grid.setValue(spot, cell);
      }
    }

    return new WorldState(grid, diffusion);
  }

  get grid(): GridState {
    return this._grid;
  }

  update(speed: number) {
    for (let i = 0; i < speed; i++) {
      this.diffusion.next(this._grid, this._work);
      this._grid = this._work;
    }
  }
}
