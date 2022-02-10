import { Spot } from '../../lib/dmath';

export enum CellState {
  alive,
  dead,
}

export class GridState {
  private readonly cells: CellState[][];

  constructor(
    public readonly width: number,
    public readonly height: number,
    factory?: (coord: Spot) => CellState
  ) {
    this.cells = [...Array(height)].map(
      (_, row) => [...Array(width)].map(
        (_, column) => factory ? factory(Spot.of({row, column})) : CellState.dead,
      )
    );
  }

  static create({width, height, factory}: {
    width: number,
    height: number,
    factory?: (coord: Spot) => CellState,
  }): GridState {
    return new GridState(width, height, factory);
  }

  walk(callback: (state: CellState, coord: Spot) => void) {
    for (let row = 0; row < this.height; row++) {
      for (let column = 0; column < this.width; column++) {
        callback(this.cells[row][column], Spot.of({row, column}));
      }
    }
  }

  next(): GridState {
    return GridState.create({
      width: this.width,
      height: this.height,
      factory: (coord: Spot) => this._next(coord),
    });
  }

  private _next({row, column}: {
    row: number,
    column: number,
  }): CellState {
    const current = this.get({row, column});

    // noinspection PointlessArithmeticExpressionJS
    const neighbors = [
      this.get({row: row - 1, column: column - 1}),
      this.get({row: row - 1, column: column + 0}),
      this.get({row: row - 1, column: column + 1}),
      this.get({row: row + 0, column: column - 1}),
      this.get({row: row + 0, column: column + 1}),
      this.get({row: row + 1, column: column - 1}),
      this.get({row: row + 1, column: column + 0}),
      this.get({row: row + 1, column: column + 1}),
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

  private get({row, column}: {
    row: number,
    column: number,
  }): CellState | undefined {
    if (row < 0 || this.height <= row) {
      return undefined;
    }
    if (column < 0 || this.width <= column) {
      return undefined;
    }
    return this.cells[row][column];
  }
}

export class WorldState {
  private _grid: GridState;

  constructor(
    seed: GridState,
  ) {
    this._grid = seed;
  }

  static create({width, height, factory}: {
    width: number,
    height: number,
    factory?: (coord: Spot) => CellState,
  }): WorldState {
    const grid = new GridState(width, height, factory);
    return new WorldState(grid);
  }

  get grid(): GridState {
    return this._grid;
  }

  update() {
    this._grid = this._grid.next();
  }
}
