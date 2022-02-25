import * as p5 from 'p5';
import { Widget } from '../../lib/process';
import { Point, Rect, Size } from '../../lib/graphics2d';
import {
  BoardModel,
  DrawResultModel,
  FixedResultModel,
  GameModel,
  GameResultModel,
  PieceModel,
  PlayerModel
} from './model';

export class PieceWidget extends Widget<PieceModel> {
  public frame = Rect.zero();

  protected doDraw(model: PieceModel) {
    const diameter = Math.min(this.frame.width, this.frame.height) * 0.4;
    const center = this.frame.center;

    this.scope($ => {
      switch (model) {
        case PieceModel.circle:
          $.circle(center.x, center.y, diameter);
          break;

        case PieceModel.cross:
          $.line(
            center.x - diameter / 2,
            center.y - diameter / 2,
            center.x + diameter / 2,
            center.y + diameter / 2,
          )
          $.line(
            center.x - diameter / 2,
            center.y + diameter / 2,
            center.x + diameter / 2,
            center.y - diameter / 2,
          )
          break;

        case PieceModel.none:
          break;
      }
    });
  }
}

export class BoardWidget extends Widget<BoardModel> {
  public frame = Rect.zero();

  private readonly _piece: PieceWidget;

  constructor(context: p5) {
    super(context);
    this._piece = new PieceWidget(context);
  }

  protected doDraw(model: BoardModel) {
    for (let i = 1; i < model.dimen.width; i++) {
      const x = Math.floor(this.frame.width / model.dimen.width) * i;
      this.context.line(x, this.frame.top, x, this.frame.bottom);
    }

    for (let i = 1; i < model.dimen.height; i++) {
      const y = Math.floor(this.frame.height / model.dimen.height) * i;
      this.context.line(this.frame.left, y, this.frame.right, y);
    }

    const itemSize = Size.of({
      width: this.frame.width / model.dimen.width,
      height: this.frame.height / model.dimen.height,
    });

    model.forEach((piece, spot) => {
      const origin = Point.of({
        x: this.frame.origin.x + itemSize.width * spot.column,
        y: this.frame.origin.y + itemSize.height * spot.row,
      });

      this._piece.frame = Rect.of({
        origin: origin,
        size: itemSize,
      });

      this._piece.model = piece;
      this._piece.draw();
    });
  }
}

export class ResultWidget extends Widget<GameResultModel> {
  public frame = Rect.zero();
  public textColor: string = '#000000';
  public fillColor: string = '#FFFFFF80';

  protected doDraw(model: GameResultModel) {
    this.scope($ => {
      $.fill(this.fillColor)
      $.noStroke();
      $.rect(this.frame.left, this.frame.top, this.frame.width, this.frame.height);
    });

    const center = this.frame.center;
    const label = ResultWidget.label(model);

    this.scope($ => {
      $.textSize(32);
      $.textAlign(this.context.CENTER, this.context.CENTER);
      $.text(label, center.x, center.y);
    });
  }

  private static label(result: GameResultModel): string {
    if (result instanceof FixedResultModel) {
      switch (result.winner) {
        case PlayerModel.human:
          return 'You WON !!';
        case PlayerModel.robot:
          return 'CPU Won !!';
      }
    }
    if (result instanceof DrawResultModel) {
      return 'DRAW !!';
    }
    return '';
  }
}

export class GameWidget extends Widget<GameModel> {
  private readonly _board: BoardWidget;
  private readonly _surface: ResultWidget;

  constructor(context: p5) {
    super(context);
    this._board = new BoardWidget(context);
    this._surface = new ResultWidget(context);
  }

  get frame(): Rect {
    return this._board.frame;
  }

  set frame(frame: Rect) {
    this._board.frame = frame;
    this._surface.frame = frame;
  }

  protected doDraw(model: GameModel) {
    this._board.model = model.board;
    this._board.draw();

    this._surface.model = model.result;
    this._surface.draw();
  }
}

