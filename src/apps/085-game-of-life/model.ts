import { Dimen, Matrix, Spot } from '../../lib/dmath';

export enum CellState {
  alive,
  dead,
}

export class GridState {
  constructor(
    public readonly matrix: Matrix<CellState>,
  ) {
    // no-op
  }

  static create({dimen, factory}: {
    dimen: Dimen,
    factory?: (coord: Spot) => CellState,
  }): GridState {
    const matrix = Matrix.generate(dimen, (spot) => {
      return factory ? factory(spot) : CellState.dead;
    });

    return new GridState(matrix);
  }

  get width(): number {
    return this.matrix.width;
  }

  get height(): number {
    return this.matrix.height;
  }

  walk(callback: (state: CellState, spot: Spot) => void) {
    this.matrix.forEach(callback)
  }

  next(): GridState {
    return GridState.create({
      dimen: this.matrix.dimen,
      factory: (spot: Spot) => this._next(spot),
    });
  }

  private _next({row, column}: {
    row: number,
    column: number,
  }): CellState {
    const current = this.getOrNull({row, column});

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
    ].filter(it => it != undefined) as CellState[];

    const density = neighbors.filter(it => it == CellState.alive).length;

    switch (current) {
      case CellState.alive:
        if (2 <= density && density <= 3) {
          return CellState.alive;
        } else {
          return CellState.dead;
        }
      case CellState.dead:
        if (density == 3) {
          return CellState.alive;
        } else {
          return CellState.dead;
        }
      default:
        throw new Error();
    }
  }

  private getOrNull({row, column}: {
    row: number,
    column: number,
  }): CellState | undefined {
    return this.matrix.getOrNull(Spot.of({row, column}))
  }
}

export class WorldState {
  private _grid: GridState;

  constructor(
    seed: GridState,
  ) {
    this._grid = seed;
  }

  static create({dimen, factory}: {
    dimen: Dimen,
    factory?: (coord: Spot) => CellState,
  }): WorldState {
    return new WorldState(
      GridState.create({dimen, factory})
    );
  }

  get grid(): GridState {
    return this._grid;
  }

  update() {
    this._grid = this._grid.next();
  }
}
