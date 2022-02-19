import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { FoodModel, GameModel, SnakeModel } from './model';

class SnakeWidget {
  constructor(
    public readonly context: p5,
    public readonly model: SnakeModel,
  ) {
    // no-op
  }

  private get color(): string {
    return this.model.color;
  }

  private get scale(): number {
    return this.model.scale;
  }

  draw() {
    Context.scope(this.context, $ => {
      $.fill(this.color);

      this.model.body.forEach(
        it => $.square(it.x, it.y, this.scale)
      );
    })
  }
}

class FoodWidget {
  constructor(
    public readonly context: p5,
    public readonly model: FoodModel,
  ) {
    // no-op
  }

  private get x(): number {
    return this.model.point.x;
  }

  private get y(): number {
    return this.model.point.y;
  }

  private get color(): string {
    return this.model.color;
  }

  private get scale(): number {
    return this.model.scale;
  }

  draw() {
    Context.scope(this.context, $ => {
      $.fill(this.color);
      $.square(this.x, this.y, this.scale);
    });
  }
}

export class GameWidget {
  constructor(
    public readonly context: p5,
    public readonly model: GameModel,
  ) {
    // no-op
  }

  draw() {
    const snakeWidget = new SnakeWidget(this.context, this.model.snake);
    const foodWidget = new FoodWidget(this.context, this.model.food);

    snakeWidget.draw();
    foodWidget.draw();
  }
}

export class GameMaster {
  constructor(
    public readonly context: p5,
    public readonly model: GameModel,
  ) {
    // no-op
  }

  consumeKeyCode(keyCode: number) {
    const snake = this.model.snake;

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
