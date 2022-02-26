import * as p5 from 'p5';
import { Spot } from '../../lib/dmath';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { GameModel, HumanAgent, RobotAgent } from './model';

export interface GameLooper {
  redraw(): void;
}

export class DefaultLooper implements GameLooper {
  private _context: p5;

  constructor(context: p5) {
    this._context = context;
  }

  redraw() {
    this._context.redraw();
  }
}

export class NoopLooper implements GameLooper {
  redraw() {
    // do nothing
  }
}

export class GameMaster {
  public frame: Rect = Rect.zero();
  public looper: GameLooper = new NoopLooper();
  public thinkingTime: number = 500;

  private readonly model: GameModel;
  private readonly human: HumanAgent;
  private readonly robot: RobotAgent;

  constructor(model: GameModel) {
    this.model = model;
    this.human = new HumanAgent({game: model});
    this.robot = new RobotAgent({game: model});
  }

  also(mutate: (master: GameMaster) => void): GameMaster {
    mutate(this);
    return this;
  }

  consumeMouseClick(point: Point) {
    const spot = this.getSpot(point);
    if (!spot) {
      return false;
    }

    const success = this.human.mark(spot);
    if (!success) {
      return;
    }

    this.looper.redraw();

    if (!this.model.hasNext) {
      return;
    }

    setTimeout(() => {
      this.robot.mark();
      this.looper.redraw();
    }, this.thinkingTime);
  }

  private getSpot(point: Point): Spot | undefined {
    const model = this.model;
    if (!model) {
      return undefined;
    }

    const board = model.board;

    const itemSize = new Size({
      width: this.frame.width / board.dimen.width,
      height: this.frame.height / board.dimen.height,
    });

    const column = Math.floor(point.x / itemSize.width);
    if (column < 0 || board.dimen.width <= column) {
      return undefined;
    }

    const row = Math.floor(point.y / itemSize.height);
    if (row < 0 || board.dimen.height <= row) {
      return undefined;
    }

    return Spot.of({column, row});
  }
}
