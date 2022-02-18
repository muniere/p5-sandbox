import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { Spot } from '../../lib/dmath';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { BoardState, CellState, DrawResult, FixedResult, GameState, Player } from './model';

export class CellWidget {
  public frame = Rect.zero();
  public state = CellState.empty;

  constructor(
    public readonly context: p5,
    public readonly spot: Spot,
  ) {
    //
  }

  also(mutate: (widget: CellWidget) => void): CellWidget {
    mutate(this);
    return this;
  }

  draw() {
    const diameter = Math.min(this.frame.width, this.frame.height) * 0.4;
    const center = this.frame.center;

    Context.scope(this.context, $ => {
      switch (this.state) {
        case CellState.circle:
          $.circle(center.x, center.y, diameter);
          break;

        case CellState.cross:
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

        case CellState.empty:
          break;
      }
    });
  }
}

export class BoardWidget {
  public frame = Rect.zero();
  private _state: BoardState | undefined;
  private _children: CellWidget[] = [];

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  get state(): BoardState | undefined {
    return this._state;
  }

  set state(value: BoardState | undefined) {
    this._state = value;

    if (value) {
      this._children = value.flatMap((_, spot) => {
        return new CellWidget(this.context, spot);
      });
    } else {
      this._children = [];
    }
  }

  getSpot(point: Point): Spot | undefined {
    const state = this._state;
    if (!state) {
      return undefined;
    }

    const itemSize = Size.of({
      width: this.frame.width / state.dimen.width,
      height: this.frame.height / state.dimen.height,
    });

    const column = Math.floor(point.x / itemSize.width);
    if (column < 0 || state.dimen.width <= column) {
      return undefined;
    }

    const row = Math.floor(point.y / itemSize.height);
    if (row < 0 || state.dimen.height <= row) {
      return undefined;
    }

    return Spot.of({column, row});
  }

  draw() {
    const state = this._state;
    if (!state) {
      return;
    }

    for (let i = 1; i < state.dimen.width; i++) {
      const x = Math.floor(this.frame.width / state.dimen.width) * i;
      this.context.line(x, this.frame.top, x, this.frame.bottom);
    }

    for (let i = 1; i < state.dimen.height; i++) {
      const y = Math.floor(this.frame.height / state.dimen.height) * i;
      this.context.line(this.frame.left, y, this.frame.right, y);
    }

    const itemSize = Size.of({
      width: this.frame.width / state.dimen.width,
      height: this.frame.height / state.dimen.height,
    });

    this._children.forEach((widget) => {
      widget.frame = Rect.of({
        origin: Point.of({
          x: this.frame.origin.x + itemSize.width * widget.spot.column,
          y: this.frame.origin.y + itemSize.height * widget.spot.row,
        }),
        size: itemSize,
      });

      widget.state = state.get(widget.spot) ?? CellState.empty;

      widget.draw();
    });
  }
}

export class SurfaceWidget {
  public frame = Rect.zero();
  public text: string | undefined;
  public textColor: string = '#000000';
  public fillColor: string = '#FFFFFF80';

  constructor(
    public context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: SurfaceWidget) => void): SurfaceWidget {
    mutate(this);
    return this;
  }

  draw() {
    Context.scope(this.context, $ => {
      $.fill(this.fillColor)
      $.noStroke();
      $.rect(this.frame.left, this.frame.top, this.frame.width, this.frame.height);
    });

    const text = this.text;
    if (!text) {
      return;
    }

    const center = this.frame.center;

    Context.scope(this.context, $ => {
      $.textSize(32);
      $.textAlign(this.context.CENTER, this.context.CENTER);
      $.text(text, center.x, center.y);
    });
  }
}

export class GameWidget {
  private _state: GameState | undefined;
  public readonly board: BoardWidget;
  public readonly surface: SurfaceWidget;

  constructor(
    private context: p5,
  ) {
    this.board = new BoardWidget(context);
    this.surface = new SurfaceWidget(context);
  }

  get state(): GameState | undefined {
    return this._state;
  }

  set state(value: GameState | undefined) {
    this._state = value;
    this.board.state = value?.board
  }

  also(mutate: (manager: GameWidget) => void): GameWidget {
    mutate(this);
    return this;
  }

  getSpot(point: Point): Spot | undefined {
    return this.board.getSpot(point);
  }

  draw() {
    this.board.draw();

    const text = this.label();
    if (!text) {
      return;
    }

    this.surface.text = text
    this.surface.draw();
  }

  private label(): string | undefined {
    const state = this._state;
    if (!state) {
      return undefined;
    }
    if (state.result instanceof FixedResult) {
      switch (state.result.winner) {
        case Player.human:
          return 'You WON !!';
        case Player.robot:
          return 'CPU Won !!';
      }
    }
    if (state.result instanceof DrawResult) {
      return 'DRAW !!';
    }
    return undefined;
  }
}
