import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { FoodModel, GameModel, SnakeModel } from './model';

export class SnakeWidget {
  public model: SnakeModel | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    Context.scope(this.context, $ => {
      $.fill(model.color);

      model.body.forEach(
        it => $.square(it.x, it.y, model.scale)
      );
    })
  }
}

export class FoodWidget {
  public model: FoodModel | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    Context.scope(this.context, $ => {
      $.fill(model.color);
      $.square(model.point.x, model.point.y, model.scale);
    });
  }
}

export class GameWidget {
  public model: GameModel | undefined;

  private readonly _snake: SnakeWidget;
  private readonly _food: FoodWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._snake = new SnakeWidget(context);
    this._food = new FoodWidget(context);
  }

  also(mutate: (widget: GameWidget) => void) : GameWidget {
    mutate(this);
    return this;
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    this._snake.model = model.snake;
    this._snake.draw();

    this._food.model = model.food;
    this._food.draw();
  }
}

export class GameMaster {
  public model: GameModel | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (master: GameMaster) => void) : GameMaster {
    mutate(this);
    return this;
  }

  consumeKeyCode(keyCode: number) {
    const model = this.model;
    if (!model) {
      return;
    }

    const snake = model.snake;

    switch (keyCode) {
      case this.context.UP_ARROW:
        if (snake.velocity.y == 0) {
          snake.dir({x: 0, y: -1});
        }
        break;
      case this.context.DOWN_ARROW:
        if (snake.velocity.y == 0) {
          snake.dir({x: 0, y: 1});
        }
        break;
      case this.context.LEFT_ARROW:
        if (snake.velocity.x == 0) {
          snake.dir({x: -1, y: 0});
        }
        break;
      case this.context.RIGHT_ARROW:
        if (snake.velocity.x == 0) {
          snake.dir({x: 1, y: 0});
        }
        break;
    }
  }
}
