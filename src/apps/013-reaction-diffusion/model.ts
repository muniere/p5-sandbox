import { Dimen, Matrix, MatrixFactory, Spot, SpotCompat } from '../../lib/dmath';
import { Point, Rect } from '../../lib/graphics2d';

// This process uses mutable operations with primitive structures,
// to reduce memory allocation costs for too many small objects.

export type CellModel = {
  a: number,
  b: number,
};

export type GridFactory = MatrixFactory<CellModel>;

export class DefaultGridFactory implements GridFactory {
  private _drop: Rect;

  constructor(nargs: {
    drop: Rect,
  }) {
    this._drop = nargs.drop;
  }

  create(spot: Spot): CellModel {
    const point = Point.of({
      x: spot.column,
      y: spot.row,
    });

    if (this._drop.includes(point)) {
      return {a: 0, b: 1};
    } else {
      return {a: 1, b: 0};
    }
  }
}

export class EmptyGridFactory implements GridFactory {
  create(_: Spot): CellModel {
    return {a: 0, b: 0};
  }
}

export class GridModel {
  private _matrix: Matrix<CellModel>;

  constructor(nargs: {
    dimen: Dimen,
    factory: GridFactory,
  }) {
    this._matrix = Matrix.generate(nargs.dimen, (spot: Spot) => {
      return nargs.factory.create(spot);
    });
  }

  get width(): number {
    return this._matrix.width;
  }

  get height(): number {
    return this._matrix.height;
  }

  get dimen(): Dimen {
    return this._matrix.dimen;
  }

  getValue(spot: SpotCompat): CellModel {
    return this._matrix.get(spot);
  }

  setValue(spot: SpotCompat, values: CellModel) {
    const cell = this._matrix.get(spot);
    cell.a = values.a;
    cell.b = values.b;
  }

  laplace(spot: SpotCompat): CellModel {
    const {row, column} = spot;

    let {a, b} = this.getValue(spot);
    {
      a *= -1;
      b *= -1;
    }
    {
      const v = this.getValue({row: row, column: column + 1});
      a += v.a * 0.2;
      b += v.b * 0.2;
    }
    {
      const v = this.getValue({row: row, column: column - 1});
      a += v.a * 0.2;
      b += v.b * 0.2;
    }
    {
      const v = this.getValue({row: row - 1, column: column});
      a += v.a * 0.2;
      b += v.b * 0.2;
    }
    {
      const v = this.getValue({row: row + 1, column: column});
      a += v.a * 0.2;
      b += v.b * 0.2;
    }
    {
      const v = this.getValue({row: row - 1, column: column - 1});
      a += v.a * 0.05;
      b += v.b * 0.05;
    }
    {
      const v = this.getValue({row: row + 1, column: column - 1});
      a += v.a * 0.05;
      b += v.b * 0.05;
    }
    {
      const v = this.getValue({row: row - 1, column: column + 1});
      a += v.a * 0.05;
      b += v.b * 0.05;
    }
    {
      const v = this.getValue({row: row + 1, column: column + 1});
      a += v.a * 0.05;
      b += v.b * 0.05;
    }
    return {a, b};
  }
}

export class DiffusionModel {
  private readonly _a: number;
  private readonly _b: number;
  private readonly _feed: number;
  private readonly _kill: number;

  constructor(nargs: {
    a: number,
    b: number,
    feed: number,
    kill: number,
  }) {
    this._a = nargs.a;
    this._b = nargs.b;
    this._feed = nargs.feed;
    this._kill = nargs.kill;
  }

  next(grid: GridModel, result: GridModel) {
    for (let row = 0; row < grid.height; row++) {
      for (let column = 0; column < grid.width; column++) {
        const spot = {row, column};
        const cell = grid.getValue(spot);

        if (column <= 0 || grid.width - 1 <= column) {
          result.setValue(spot, cell);
          continue;
        }

        if (row <= 0 || grid.height - 1 <= row) {
          result.setValue(spot, cell);
          continue;
        }

        const {a, b} = cell;
        const lap = grid.laplace(spot);

        const newA = a
          + (this._a * lap.a)
          - (a * b * b)
          + (this._feed * (1.0 - a));

        const newB = b
          + (this._b * lap.b)
          + (a * b * b)
          - (this._kill + this._feed) * b

        result.setValue(spot, {a: newA, b: newB});
      }
    }
  }
}

export class ApplicationModel {
  private _grid: GridModel;
  private _work: GridModel;
  private readonly _diffusion: DiffusionModel;

  constructor(nargs: {
    grid: GridModel,
    diffusion: DiffusionModel,
  }) {
    this._grid = nargs.grid;
    this._work = new GridModel({
      dimen: nargs.grid.dimen,
      factory: new EmptyGridFactory(),
    });
    this._diffusion = nargs.diffusion;
  }

  get grid(): GridModel {
    return this._grid;
  }

  update(speed: number) {
    for (let i = 0; i < speed; i++) {
      this._diffusion.next(this._grid, this._work);
      const temp = this._work;
      this._work = this._grid;
      this._grid = temp;
    }
  }
}
