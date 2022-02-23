import { Dimen, Matrix, Spot, SpotCompat } from '../../lib/dmath';

export enum State {
  alive,
  dead,
}

export class GridModel {
  private readonly _matrix: Matrix<State>;

  constructor(nargs: {
    dimen: Dimen,
    factory?: (coord: Spot) => State,
  }) {
    this._matrix = Matrix.generate(nargs.dimen, (spot) => {
      return nargs.factory ? nargs.factory(spot) : State.dead;
    });
  }

  get width(): number {
    return this._matrix.width;
  }

  get height(): number {
    return this._matrix.height;
  }

  walk(callback: (state: State, spot: Spot) => void) {
    this._matrix.forEach(callback)
  }

  next(): GridModel {
    return new GridModel({
      dimen: this._matrix.dimen,
      factory: (spot: Spot) => this._next(spot),
    });
  }

  private _next(spot: SpotCompat): State {
    const {row, column} = spot;
    const current = this.getOrNull(spot);

    // noinspection PointlessArithmeticExpressionJS
    const neighbors = [
      this.getOrNull({row: row - 1, column: column - 1}),
      this.getOrNull({row: row - 1, column: column + 0}),
      this.getOrNull({row: row - 1, column: column + 1}),
      this.getOrNull({row: row + 0, column: column - 1}),
      this.getOrNull({row: row + 0, column: column + 1}),
      this.getOrNull({row: row + 1, column: column - 1}),
      this.getOrNull({row: row + 1, column: column + 0}),
      this.getOrNull({row: row + 1, column: column + 1}),
    ].compactMap(it => it);

    const density = neighbors.filter(it => it == State.alive).length;

    switch (current) {
      case State.alive:
        if (2 <= density && density <= 3) {
          return State.alive;
        } else {
          return State.dead;
        }
      case State.dead:
        if (density == 3) {
          return State.alive;
        } else {
          return State.dead;
        }
      default:
        throw new Error();
    }
  }

  private getOrNull(spot: SpotCompat): State | undefined {
    return this._matrix.getOrNull(spot)
  }
}

export class ApplicationModel {
  private _grid: GridModel;

  constructor(nargs: {
    dimen: Dimen,
    factory?: (coord: Spot) => State,
  }) {
    this._grid = new GridModel(nargs);
  }

  get grid(): GridModel {
    return this._grid;
  }

  update() {
    this._grid = this._grid.next();
  }
}
