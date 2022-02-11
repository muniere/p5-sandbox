import { Arrays } from '../../lib/stdlib';
import { Dimen, Matrix, Spot } from '../../lib/dmath';

export enum Player {
  human,
  robot,
}

export abstract class Result {

  static fixed({winner, looser}: {
    winner: Player,
    looser: Player,
  }): Result {
    return FixedResult.create({winner, looser});
  }

  static draw(): Result {
    return DrawResult.create();
  }
}

export class DrawResult extends Result {

  static create(): DrawResult {
    return new DrawResult();
  }
}

export class FixedResult extends Result {

  constructor(
    public winner: Player,
    public looser: Player,
  ) {
    super();
    // no-op
  }

  static create({winner, looser}: {
    winner: Player,
    looser: Player,
  }): FixedResult {
    return new FixedResult(winner, looser);
  }
}

export enum CellState {
  circle,
  cross,
  empty,
}

export class BoardState {
  private cells: Matrix<CellState>;

  constructor(
    scale: number = 3,
  ) {
    this.cells = Matrix.fill(Dimen.square(scale), CellState.empty);
  }

  static create({scale}: {
    scale: number
  }): BoardState {
    return new BoardState(scale);
  }

  get dimen(): Dimen {
    return this.cells.dimen;
  }

  get(spot: Spot): CellState | undefined {
    return this.cells.get(spot);
  }

  set(spot: Spot, value: CellState) {
    this.cells.set(spot, value);
  }

  map<T>(transform: (state: CellState, spot: Spot) => T): Matrix<T> {
    return this.cells.map(transform);
  }

  flatMap<T>(transform: (state: CellState, spot: Spot) => T): Array<T> {
    return this.cells.map(transform).flatten();
  }

  availableSpots(): Array<Spot> {
    const result = [] as Spot[];

    this.cells.forEach((value, spot) => {
      if (value == CellState.empty) {
        result.push(spot);
      }
    })

    return result;
  }

  lineScanners(): LineScanner[] {
    const horizons = Arrays.generate(this.cells.dimen.height, (row) => {
      return LineScanner.of(this.cells.filter((_, spot) => spot.row == row));
    });
    const verticals = Arrays.generate(this.cells.dimen.width, (column) => {
      return LineScanner.of(this.cells.filter((_, spot) => spot.column == column));
    });
    const diagonals = [
      LineScanner.of(this.cells.filter((_, spot) => spot.row == spot.column)),
      LineScanner.of(this.cells.filter((_, spot) => spot.row + spot.column == this.cells.dimen.width - 1))
    ];

    return [...horizons, ...verticals, ...diagonals];
  }
}

export class LineScanner {
  constructor(
    public readonly states: CellState[],
  ) {
    // no-op
  }

  static of(cells: CellState[]): LineScanner {
    return new LineScanner(cells);
  }

  test(): boolean {
    const state = this.states[0];
    if (state == CellState.empty) {
      return false;
    }
    return this.states.every(it => it == state);
  }
}

export class GameState {
  constructor(
    private _board: BoardState,
    private _player: Player = Player.human,
    private _result?: Result,
  ) {
    // no-op
  }

  static create(option?: {
    scale?: number,
    player?: Player,
  }): GameState {
    const board = BoardState.create({scale: option?.scale ?? 3});
    return new GameState(board, option?.player ?? Player.human);
  }

  get board(): BoardState {
    return this._board;
  }

  get player(): Player {
    return this._player;
  }

  get result(): Result | undefined {
    return this._result;
  }

  get hasNext(): boolean {
    return !this._result;
  }

  availableSpots(): Array<Spot> {
    return this._board.availableSpots();
  }

  mark(spot: Spot): boolean {
    const cell = this._board.get(spot);
    if (cell == CellState.circle || cell == CellState.cross) {
      return false;
    }

    this.doMark(spot);
    this.doJudge();
    return true;
  }

  private doMark(spot: Spot) {
    switch (this._player) {
      case Player.human:
        this._board.set(spot, CellState.circle);
        this._player = Player.robot;
        break;
      case Player.robot:
        this._board.set(spot, CellState.cross);
        this._player = Player.human;
        break;
    }
  }

  private doJudge() {
    const scanner = this._board.lineScanners().find(it => it.test());
    if (!scanner) {
      if (this._board.availableSpots().length == 0) {
        this._result = Result.draw();
      } else {
        // not fixed yet
      }
      return;
    }

    switch (scanner.states[0]) {
      case CellState.circle:
        this._result = Result.fixed({
          winner: Player.human,
          looser: Player.robot,
        });
        break;
      case CellState.cross:
        this._result = Result.fixed({
          winner: Player.robot,
          looser: Player.human,
        });
        break;
      case CellState.empty:
        break;
    }
  }
}

export class HumanAgent {
  constructor(
    private game: GameState
  ) {
    // no-op
  }

  static create({game}: {
    game: GameState,
  }): HumanAgent {
    return new HumanAgent(game);
  }

  mark(spot: Spot): boolean {
    if (this.game.result) {
      return false;
    }
    if (this.game.player != Player.human) {
      return false;
    }

    return this.game.mark(spot);
  }
}

export class RobotAgent {
  constructor(
    private game: GameState
  ) {
    // no-op
  }

  static create({game}: {
    game: GameState,
  }): RobotAgent {
    return new RobotAgent(game);
  }

  mark(): boolean {
    if (this.game.result) {
      return false;
    }
    if (this.game.player != Player.robot) {
      return false;
    }

    const spots = this.game.availableSpots();
    if (spots.length == 0) {
      return false;
    }

    const nextSpot = spots.sample();
    return this.game.mark(nextSpot);
  }
}
