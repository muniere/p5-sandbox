import { Spot, SpotDelta } from '../../lib/dmath';

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

export class PieceModel {
  private _spot: Spot;
  private _direction: Direction;
  private _compass = NavigatorModel.INSTANCE;
  private _stepCounter: number;
  private _stepRegister: number;
  private _stepInterval: number;

  constructor(nargs: {
    spot: Spot,
    direction: Direction,
  }) {
    this._spot = nargs.spot;
    this._direction = nargs.direction;
    this._stepCounter = 0;
    this._stepRegister = 0;
    this._stepInterval = 1;
  }

  get stepCounter(): number {
    return this._stepCounter;
  }

  get spot(): Spot {
    return this._spot;
  }

  get direction(): Direction {
    return this._direction;
  }

  forward() {
    this._spot = this._spot.shift(this._compass.jump(this._direction));
    this._stepCounter += 1;

    if (this._stepCounter - this._stepRegister == this._stepInterval) {
      this._turn();
    }
  }

  private _turn() {
    this._direction = this._compass.left(this._direction);
    this._stepRegister = this._stepCounter;

    switch (this._direction) {
      case Direction.north:
      case Direction.south:
        // keep interval
        break;
      case Direction.west:
      case Direction.east:
        this._stepInterval += 1;
        break;
    }
  }
}

export class ConnectionModel {
  private _start: Spot;
  private _stop: Spot;

  constructor(nargs: {
    start: Spot,
    stop: Spot,
  }) {
    this._start = nargs.start;
    this._stop = nargs.stop;
  }

  get start(): Spot {
    return this._start.copy();
  }

  get stop(): Spot {
    return this._stop.copy();
  }
}

export class ApplicationModel {

  private readonly _piece: PieceModel;
  private _ghost: Spot | undefined;

  constructor(nargs: {
    piece: PieceModel,
  }) {
    this._piece = nargs.piece;
  }

  get piece(): PieceModel {
    return this._piece;
  }

  get connection(): ConnectionModel | undefined {
    if (!this._ghost) {
      return undefined;
    }
    return new ConnectionModel({
      start: this._ghost,
      stop: this._piece.spot,
    });
  }

  get stepCounter(): number {
    return this._piece.stepCounter;
  }

  update() {
    this._ghost = this._piece.spot;
    this._piece.forward();
  }
}

export module Formula {

  export function isPrime(n: number): boolean {
    if (n == 1) {
      return false;
    }
    if (n == 2) {
      return true;
    }
    const m = Math.sqrt(n);
    for (let i = 2; i < m; i++) {
      if (n % i == 0) {
        return true;
      }
    }
    return false;
  }
}
