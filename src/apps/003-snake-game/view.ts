import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { FoodState, GameState, SnakeState } from './model';

class SnakeWidget {
  constructor(
    public readonly context: p5,
    public readonly state: SnakeState,
  ) {
    // no-op
  }

  private get color(): string {
    return this.state.color;
  }

  private get scale(): number {
    return this.state.scale;
  }

  draw() {
    Context.scope(this.context, $ => {
      $.fill(this.color);

      this.state.body.forEach(
        it => $.square(it.x, it.y, this.scale)
      );
    })
  }
}

class FoodWidget {
  constructor(
    public readonly context: p5,
    public readonly state: FoodState,
  ) {
    // no-op
  }

  private get x(): number {
    return this.state.point.x;
  }

  private get y(): number {
    return this.state.point.y;
  }

  private get color(): string {
    return this.state.color;
  }

  private get scale(): number {
    return this.state.scale;
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
    public readonly state: GameState,
  ) {
    // no-op
  }

  draw() {
    const snakeWidget = new SnakeWidget(this.context, this.state.snake);
    const foodWidget = new FoodWidget(this.context, this.state.food);

    snakeWidget.draw();
    foodWidget.draw();
  }
}

export class GameMaster {
  constructor(
    public readonly context: p5,
    public readonly state: GameState,
  ) {
    // no-op
  }

  consumeKeyCode(keyCode: number) {
    const snake = this.state.snake;

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
