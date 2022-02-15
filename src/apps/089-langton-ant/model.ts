import { Dimen, Matrix, Spot, SpotDelta } from '../../lib/dmath';

export enum Direction {
  north,
  south,
  west,
  east,
}

class Compass {
  private static VELOCITIES = new Map<Direction, SpotDelta>([
    [Direction.north, Object.freeze({row: -1})],
    [Direction.south, Object.freeze({row: +1})],
    [Direction.west, Object.freeze({column: -1})],
    [Direction.east, Object.freeze({column: +1})]
  ]);

  private static LEFTS = new Map<Direction, Direction>([
    [Direction.north, Direction.west],
    [Direction.south, Direction.east],
    [Direction.west, Direction.south],
    [Direction.east, Direction.north],
  ]);

  private static RIGHTS = new Map<Direction, Direction>([
    [Direction.north, Direction.east],
    [Direction.south, Direction.west],
    [Direction.west, Direction.north],
    [Direction.east, Direction.south],
  ]);

  static INSTANCE = new Compass();

  private constructor() {
    // no-op
  }

  default(): Compass {
    return new Compass();
  }

  jump(direction: Direction): SpotDelta {
    return Compass.VELOCITIES.get(direction)!;
  }

  left(direction: Direction): Direction {
    return Compass.LEFTS.get(direction)!;
  }

  right(direction: Direction): Direction {
    return Compass.RIGHTS.get(direction)!;
  }
}

export class AntState {
  private _spot: Spot;
  private _direction: Direction;
  private _compass = Compass.INSTANCE;

  constructor(
    spot: Spot,
    direction: Direction,
  ) {
    this._spot = spot;
    this._direction = direction;
  }

  static create({spot, direction}: {
    spot: Spot,
    direction: Direction,
  }): AntState {
    return new AntState(spot, direction);
  }

  get spot(): Spot {
    return this._spot;
  }

  get direction(): Direction {
    return this._direction;
  }

  forward() {
    this._spot = this._spot.shift(this._compass.jump(this._direction));
  }

  cycleIn(dimen: Dimen) {
    this._spot = dimen.cycle(this._spot);
  }

  turnLeft() {
    this._direction = this._compass.left(this._direction);
  }

  turnRight() {
    this._direction = this._compass.right(this._direction);
  }
}

export enum CellState {
  white,
  black,
}

export class GridState {
  private _cells: Matrix<CellState>

  constructor(
    size: number,
  ) {
    this._cells = Matrix.fill({width: size, height: size}, CellState.white);
  }

  static create({size}: {
    size: number
  }): GridState {
    return new GridState(size);
  }

  get dimen(): Dimen {
    return this._cells.dimen;
  }

  getOrNull(spot: Spot): CellState | undefined {
    return this._cells.getOrNull(spot);
  }

  forEach(callback: (cell: CellState, spot: Spot) => void) {
    this._cells.forEach(callback);
  }

  flip(spot: Spot) {
    const cell = this._cells.getOrNull(spot);
    if (cell == undefined) {
      return;
    }

    switch (cell) {
      case CellState.white:
        this._cells.set(spot, CellState.black);
        return;

      case CellState.black:
        this._cells.set(spot, CellState.white);
        return;
    }
  }
}

export class WorldState {
  private readonly _ants: AntState[];
  private readonly _grid: GridState;

  private _step: number = 0;

  constructor(
    ants: AntState[],
    grid: GridState,
  ) {
    this._ants = ants;
    this._grid = grid;
  }

  static create({ants, grid}: {
    ants: AntState[],
    grid: GridState,
  }): WorldState {
    return new WorldState(ants, grid);
  }

  get ants(): AntState[] {
    return this._ants;
  }

  get grid(): GridState {
    return this._grid;
  }

  get step(): number {
    return this._step;
  }

  update() {
    const grid = this._grid;
    const dimen = grid.dimen;

    this._ants.forEach(ant => {
      const spot = ant.spot;
      const cell = grid.getOrNull(spot);
      if (cell == undefined) {
        return;
      }

      switch (cell) {
        case CellState.white:
          ant.turnRight();
          grid.flip(spot);
          ant.forward();
          ant.cycleIn(dimen)
          return;

        case CellState.black:
          ant.turnLeft();
          grid.flip(spot);
          ant.forward();
          ant.cycleIn(dimen)
          return;
      }
    });

    this._step += 1;
  }
}
