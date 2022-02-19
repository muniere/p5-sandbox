import { Vector } from 'p5';
import { Point, Size } from '../../lib/graphics2d';

export class SnakeModel {
  public color: string = '#FFFFFF';

  private _head: Point;
  private readonly _tail: Point[];
  private readonly _velocity: Vector;
  private readonly _scale: number;

  constructor(
    head: Point,
    velocity: Vector,
    scale: number,
  ) {
    this._head = head;
    this._tail = [];
    this._velocity = velocity;
    this._scale = scale;
    // no-op
  }

  static create({scale}: { scale: number }): SnakeModel {
    const head = Point.zero();
    const velocity = new Vector().set(1, 0);
    return new SnakeModel(head, velocity, scale);
  }

  get body(): Point[] {
    return [this._head, ...this._tail];
  }

  get left(): number {
    return this._head.x;
  }

  get right(): number {
    return this._head.x + this._scale;
  }

  get top(): number {
    return this._head.y;
  }

  get bottom(): number {
    return this._head.y + this._scale;
  }

  get scale(): number {
    return this._scale;
  }

  get velocity(): Vector {
    return this._velocity;
  }

  update() {
    // compute
    const delta = Vector.mult(this._velocity, this._scale);

    const next = Point.of({
      x: this._head.x + delta.x,
      y: this._head.y + delta.y,
    });

    // update
    if (this._tail.length > 0) {
      for (let i = this._tail.length - 1; i > 0; i--) {
        this._tail[i] = this._tail[i - 1];
      }
      this._tail[0] = this._head.copy();
    }

    this._head = next;
  }

  dir({x, y}: { x: number, y: number }) {
    this._velocity.x = x;
    this._velocity.y = y;
  }

  eat(food: FoodModel): boolean {
    if (!this.hitTest(food.point)) {
      return false;
    }

    this._tail.push(this._head.copy());
    return this.hitTest(food.point);
  }

  testOvershoot(bounds: Size): boolean {
    return (this._head.x < 0 || bounds.width <= this._head.x) ||
      (this._head.y < 0 || bounds.height <= this._head.y);
  }

  testUroboros(): boolean {
    return this._tail.some(
      it => Point.dist(it, this._head) < 0.01
    );
  }

  private hitTest(point: Point): boolean {
    return (this.left <= point.x && point.x < this.right) &&
      (this.top <= point.y && point.y < this.bottom);
  }
}

export class FoodModel {
  public color: string = '#FFFFFF';

  private readonly _point: Point;
  private readonly _scale: number;

  constructor(
    point: Point,
    scale: number,
  ) {
    this._point = point;
    this._scale = scale;
  }

  static create({point, scale}: {
    point: Point,
    scale: number,
  }): FoodModel {
    return new FoodModel(point, scale);
  }

  get point(): Point {
    return this._point;
  }

  get scale(): number {
    return this._scale;
  }
}

export class GameModel {
  private readonly _bounds: Size;
  private readonly _scale: number;
  private _snake: SnakeModel;
  private _food: FoodModel;

  constructor(
    bounds: Size,
    scale: number,
    snake: SnakeModel,
    food: FoodModel,
  ) {
    this._bounds = bounds;
    this._scale = scale;
    this._snake = snake;
    this._food = food;
  }

  static create({bounds, scale}: {
    bounds: Size,
    scale: number,
  }): GameModel {
    const random = Point.of({
      x: Math.floor(Math.random() * bounds.width / scale) * scale,
      y: Math.floor(Math.random() * bounds.height / scale) * scale,
    });

    const snake = SnakeModel.create({
      scale: scale,
    });

    const food = FoodModel.create({
      point: random,
      scale: scale,
    });

    return new GameModel(bounds, scale, snake, food);
  }

  get snake(): SnakeModel {
    return this._snake;
  }

  get food(): FoodModel {
    return this._food;
  }

  update() {
    this._snake.update();

    if (this._snake.testOvershoot(this._bounds) || this._snake.testUroboros()) {
      const oldState = this._snake;

      this._snake = SnakeModel.create({
        scale: this._scale,
      });
      this._snake.color = oldState.color;
    }

    if (this._snake.eat(this._food)) {
      const oldState = this._food;

      const random = Point.of({
        x: Math.floor(Math.random() * this._bounds.width / this._scale) * this._scale,
        y: Math.floor(Math.random() * this._bounds.height / this._scale) * this._scale,
      });

      this._food = FoodModel.create({
        point: random,
        scale: this._scale,
      });
      this._food.color = oldState.color
    }
  }
}
