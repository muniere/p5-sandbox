import { Vector } from 'p5';
import { Point, Size } from '../../lib/graphics2d';

export class SnakeState {
  public color: string = '#FFFFFF';
  private tail: Point[] = [];

  constructor(
    public head: Point,
    public velocity: Vector,
    public scale: number,
  ) {
    // no-op
  }

  static create({scale}: { scale: number }): SnakeState {
    const head = Point.zero();
    const velocity = new Vector().set(1, 0);
    return new SnakeState(head, velocity, scale);
  }

  get body(): Point[] {
    return [this.head, ...this.tail];
  }

  get left(): number {
    return this.head.x;
  }

  get right(): number {
    return this.head.x + this.scale;
  }

  get top(): number {
    return this.head.y;
  }

  get bottom(): number {
    return this.head.y + this.scale;
  }

  update() {
    // compute
    const delta = Vector.mult(this.velocity, this.scale);

    const next = Point.of({
      x: this.head.x + delta.x,
      y: this.head.y + delta.y,
    });

    // update
    if (this.tail.length > 0) {
      for (let i = this.tail.length - 1; i > 0; i--) {
        this.tail[i] = this.tail[i - 1];
      }
      this.tail[0] = this.head.copy();
    }

    this.head = next;
  }

  dir({x, y}: { x: number, y: number }) {
    this.velocity.x = x;
    this.velocity.y = y;
  }

  eat(food: FoodState): boolean {
    if (!this.hitTest(food.point)) {
      return false;
    }

    this.tail.push(this.head.copy());
    return this.hitTest(food.point);
  }

  testOvershoot(bounds: Size): boolean {
    return (this.head.x < 0 || bounds.width <= this.head.x) ||
      (this.head.y < 0 || bounds.height <= this.head.y);
  }

  testUroboros(): boolean {
    return this.tail.some(
      it => Point.dist(it, this.head) < 0.01
    );
  }

  private hitTest(point: Point): boolean {
    return (this.left <= point.x && point.x < this.right) &&
      (this.top <= point.y && point.y < this.bottom);
  }
}

export class FoodState {
  public color: string = '#FFFFFF';

  constructor(
    public point: Point,
    public scale: number,
  ) {
    // no-op
  }

  static create({point, scale}: {
    point: Point,
    scale: number,
  }): FoodState {
    return new FoodState(point, scale);
  }
}

export class GameState {
  constructor(
    public bounds: Size,
    public scale: number,
    public snake: SnakeState,
    public food: FoodState,
  ) {
    // no-op
  }

  static create({bounds, scale}: {
    bounds: Size,
    scale: number,
  }): GameState {
    const random = Point.of({
      x: Math.floor(Math.random() * bounds.width / scale) * scale,
      y: Math.floor(Math.random() * bounds.height / scale) * scale,
    });

    const snake = SnakeState.create({
      scale: scale,
    });

    const food = FoodState.create({
      point: random,
      scale: scale,
    });

    return new GameState(bounds, scale, snake, food);
  }

  update() {
    this.snake.update();

    if (this.snake.testOvershoot(this.bounds) || this.snake.testUroboros()) {
      const oldState = this.snake;

      this.snake = SnakeState.create({
        scale: this.scale,
      });
      this.snake.color = oldState.color;
    }

    if (this.snake.eat(this.food)) {
      const oldState = this.food;

      const random = Point.of({
        x: Math.floor(Math.random() * this.bounds.width / this.scale) * this.scale,
        y: Math.floor(Math.random() * this.bounds.height / this.scale) * this.scale,
      });

      this.food = FoodState.create({
        point: random,
        scale: this.scale,
      });
      this.food.color = oldState.color
    }
  }
}
