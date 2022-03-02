import { Vector } from 'p5';
import { Vectors } from '../../lib/process';
import { NumberRange } from '../../lib/stdlib';
import { Point, Rect } from '../../lib/graphics2d';

export class SnakeModel {
  public color: string = '#FFFFFF';

  private _head: Point;
  private readonly _tail: Point[];
  private readonly _velocity: Vector;
  private readonly _scale: number;

  constructor(nargs: {
    scale: number,
  }) {
    this._head = Point.zero();
    this._tail = [];
    this._velocity = Vectors.create({x: 1, y: 0});
    this._scale = nargs.scale;
    // no-op
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

  also(mutate: (model: SnakeModel) => void): SnakeModel {
    mutate(this);
    return this;
  }

  spawn(): SnakeModel {
    return new SnakeModel({
      scale: this.scale,
    }).also(it => {
      it.color = this.color;
    });
  }

  update() {
    // compute
    const delta = Vector.mult(this._velocity, this._scale);

    const next = new Point({
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

  testOvershoot(rect: Rect): boolean {
    return (this._head.x < rect.left || rect.right <= this._head.x) || (this._head.y < rect.top || rect.bottom <= this._head.y);
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

  private readonly _scale: number;
  private readonly _point: Point;

  constructor(nargs: {
    scale: number,
    point: Point,
  }) {
    this._scale = nargs.scale;
    this._point = nargs.point;
  }

  get scale(): number {
    return this._scale;
  }

  get point(): Point {
    return this._point;
  }

  also(mutate: (model: FoodModel) => void): FoodModel {
    mutate(this);
    return this;
  }

  spawn(nargs: { point: Point }): FoodModel {
    return new FoodModel({
      scale: this._scale,
      point: nargs.point,
    }).also(it => {
      it.color = this.color;
    });
  }
}

export class GameModel {
  private readonly _frame: Rect;
  private _snake: SnakeModel;
  private _food: FoodModel;

  private _xrange: NumberRange;
  private _yrange: NumberRange;

  constructor(nargs: {
    frame: Rect,
    snake: SnakeModel,
    food: FoodModel,
  }) {
    this._frame = nargs.frame;
    this._snake = nargs.snake;
    this._food = nargs.food;

    this._xrange = new NumberRange(0, nargs.frame.width);
    this._yrange = new NumberRange(0, nargs.frame.height);
  }

  get bounds(): Rect {
    return this._frame.with({
      origin: Point.zero(),
    });
  }

  get snake(): SnakeModel {
    return this._snake;
  }

  get food(): FoodModel {
    return this._food;
  }

  update() {
    this._snake.update();

    if (this._snake.testOvershoot(this.bounds) || this._snake.testUroboros()) {
      this._snake = this._snake.spawn();
    }

    if (this._snake.eat(this._food)) {
      this._food = this._food.spawn({
        point: new Point({
          x: this._xrange.sample(),
          y: this._yrange.sample(),
        })
      });
    }
  }
}
