import { Dimen, Matrix, Spot, SpotDelta } from '../../lib/dmath';

export enum Direction {
  north,
  south,
  west,
  east,
}

export class NavigatorModel {
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

  static INSTANCE = new NavigatorModel();

  private constructor() {
    // no-op
  }

  default(): NavigatorModel {
    return new NavigatorModel();
  }

  jump(direction: Direction): SpotDelta {
    return NavigatorModel.VELOCITIES.get(direction)!;
  }

  left(direction: Direction): Direction {
    return NavigatorModel.LEFTS.get(direction)!;
  }

  right(direction: Direction): Direction {
    return NavigatorModel.RIGHTS.get(direction)!;
  }
}

export class AntModel {
  private _spot: Spot;
  private _direction: Direction;
  private _compass = NavigatorModel.INSTANCE;

  constructor(nargs: {
    spot: Spot,
    direction: Direction,
  }) {
    this._spot = nargs.spot;
    this._direction = nargs.direction;
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

export enum CellModel {
  white,
  black,
}

export class GridModel {
  private _cells: Matrix<CellModel>

  constructor(nargs: {
    size: number,
  }) {
    this._cells = Matrix.fill({width: nargs.size, height: nargs.size}, CellModel.white);
  }

  get dimen(): Dimen {
    return this._cells.dimen;
  }

  getOrNull(spot: Spot): CellModel | undefined {
    return this._cells.getOrNull(spot);
  }

  forEach(callback: (cell: CellModel, spot: Spot) => void) {
    this._cells.forEach(callback);
  }

  flip(spot: Spot) {
    const cell = this._cells.getOrNull(spot);
    if (cell == undefined) {
      return;
    }

    switch (cell) {
      case CellModel.white:
        this._cells.set(spot, CellModel.black);
        return;

      case CellModel.black:
        this._cells.set(spot, CellModel.white);
        return;
    }
  }
}

export class ApplicationModel {
  private readonly _ants: AntModel[];
  private readonly _grid: GridModel;

  private _step: number = 0;

  constructor(nargs: {
    ants: AntModel[],
    grid: GridModel,
  }) {
    this._ants = nargs.ants;
    this._grid = nargs.grid;
  }

  get ants(): AntModel[] {
    return this._ants;
  }

  get grid(): GridModel {
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
        case CellModel.white:
          ant.turnRight();
          grid.flip(spot);
          ant.forward();
          ant.cycleIn(dimen)
          return;

        case CellModel.black:
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
