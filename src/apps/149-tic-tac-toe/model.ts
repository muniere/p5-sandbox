import { Arrays } from '../../lib/stdlib';
import { Dimen, Matrix, Spot } from '../../lib/dmath';

export enum PlayerModel {
  human = 1,
  robot,
}

export abstract class GameResultModel {

  static fixed(nargs: {
    winner: PlayerModel,
    looser: PlayerModel,
  }): GameResultModel {
    return new FixedResultModel(nargs);
  }

  static draw(): GameResultModel {
    return DrawResultModel.create();
  }
}

export class DrawResultModel extends GameResultModel {

  static create(): DrawResultModel {
    return new DrawResultModel();
  }
}

export class FixedResultModel extends GameResultModel {
  public readonly winner: PlayerModel;
  public readonly looser: PlayerModel;

  constructor(nargs: {
    winner: PlayerModel,
    looser: PlayerModel,
  }) {
    super();
    this.winner = nargs.winner;
    this.looser = nargs.looser;
  }
}

export enum PieceModel {
  circle = 1,
  cross,
  none,
}

export class BoardModel {
  private readonly _pieces: Matrix<PieceModel>;

  constructor(nargs: {
    scale?: number,
  }) {
    this._pieces = Matrix.fill(Dimen.square(nargs.scale ?? 3), PieceModel.none);
  }

  get dimen(): Dimen {
    return this._pieces.dimen;
  }

  get(spot: Spot): PieceModel | undefined {
    return this._pieces.get(spot);
  }

  set(spot: Spot, value: PieceModel) {
    this._pieces.set(spot, value);
  }

  forEach(callback: (piece: PieceModel, spot: Spot) => void) {
    this._pieces.forEach(callback);
  }

  map<T>(transform: (piece: PieceModel, spot: Spot) => T): Matrix<T> {
    return this._pieces.map(transform);
  }

  flatMap<T>(transform: (piece: PieceModel, spot: Spot) => T): Array<T> {
    return this._pieces.map(transform).flatten();
  }

  availableSpots(): Array<Spot> {
    const result = [] as Spot[];

    this._pieces.forEach((value, spot) => {
      if (value == PieceModel.none) {
        result.push(spot);
      }
    })

    return result;
  }

  lineScanners(): LineScanner[] {
    const horizons = Arrays.generate(this._pieces.dimen.height, (row) => {
      return new LineScanner(this._pieces.filter((_, spot) => spot.row == row));
    });
    const verticals = Arrays.generate(this._pieces.dimen.width, (column) => {
      return new LineScanner(this._pieces.filter((_, spot) => spot.column == column));
    });
    const diagonals = [
      new LineScanner(this._pieces.filter((_, spot) => spot.row == spot.column)),
      new LineScanner(this._pieces.filter((_, spot) => spot.row + spot.column == this._pieces.dimen.width - 1)),
    ];

    return [...horizons, ...verticals, ...diagonals];
  }
}

export class LineScanner {
  private readonly _pieces: PieceModel[];

  constructor(pieces: PieceModel[]) {
    this._pieces = pieces;
  }

  get pieces(): PieceModel[] {
    return [...this._pieces];
  }

  test(): boolean {
    const state = this._pieces[0];
    if (state == PieceModel.none) {
      return false;
    }
    return this._pieces.every(it => it == state);
  }
}

export class GameModel {
  private readonly _board: BoardModel;

  private _player: PlayerModel;
  private _result?: GameResultModel;

  constructor() {
    this._board = new BoardModel({scale: 3});
    this._player = PlayerModel.human;
    this._result = undefined;
  }

  get board(): BoardModel {
    return this._board;
  }

  get player(): PlayerModel {
    return this._player;
  }

  get result(): GameResultModel | undefined {
    return this._result;
  }

  get hasNext(): boolean {
    return !this._result;
  }

  availableSpots(): Array<Spot> {
    return this._board.availableSpots();
  }

  mark(spot: Spot): boolean {
    const piece = this._board.get(spot);
    if (piece == PieceModel.circle || piece == PieceModel.cross) {
      return false;
    }

    this.doMark(spot);
    this.doJudge();
    return true;
  }

  private doMark(spot: Spot) {
    switch (this._player) {
      case PlayerModel.human:
        this._board.set(spot, PieceModel.circle);
        this._player = PlayerModel.robot;
        break;
      case PlayerModel.robot:
        this._board.set(spot, PieceModel.cross);
        this._player = PlayerModel.human;
        break;
    }
  }

  private doJudge() {
    const scanner = this._board.lineScanners().find(it => it.test());
    if (!scanner) {
      if (this._board.availableSpots().length == 0) {
        this._result = GameResultModel.draw();
      } else {
        // not fixed yet
      }
      return;
    }

    switch (scanner.pieces[0]) {
      case PieceModel.circle:
        this._result = GameResultModel.fixed({
          winner: PlayerModel.human,
          looser: PlayerModel.robot,
        });
        break;
      case PieceModel.cross:
        this._result = GameResultModel.fixed({
          winner: PlayerModel.robot,
          looser: PlayerModel.human,
        });
        break;
      case PieceModel.none:
        break;
    }
  }
}

export class HumanAgent {
  private _game: GameModel

  constructor(nargs: {
    game: GameModel
  }) {
    this._game = nargs.game;
  }

  mark(spot: Spot): boolean {
    if (this._game.result) {
      return false;
    }
    if (this._game.player != PlayerModel.human) {
      return false;
    }

    return this._game.mark(spot);
  }
}

export class RobotAgent {
  private _game: GameModel

  constructor(nargs: {
    game: GameModel
  }) {
    this._game = nargs.game;
  }

  mark(): boolean {
    if (this._game.result) {
      return false;
    }
    if (this._game.player != PlayerModel.robot) {
      return false;
    }

    const spots = this._game.availableSpots();
    if (spots.length == 0) {
      return false;
    }

    const nextSpot = spots.sample();
    return this._game.mark(nextSpot);
  }
}
