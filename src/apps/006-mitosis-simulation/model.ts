import { Vector } from 'p5';
import { Vectors } from '../../lib/process';
import { NumberRange } from '../../lib/stdlib';
import { Point, Rect } from '../../lib/graphics2d';

export class CellModel {
  public fillColor: string = '#FFFFFF';
  public strokeColor: string = '#FFFFFF';

  private _velocity: Vector;
  private _center: Point;
  private _radius: number

  private readonly _growth: number;
  private readonly _limit: number;

  constructor(nargs: {
    center: Point,
    radius: number,
    growth: number,
    limit: number,
  }) {
    this._velocity = Vectors.zero();
    this._center = nargs.center;
    this._radius = nargs.radius;
    this._growth = nargs.growth;
    this._limit = nargs.limit;
  }

  get center(): Point {
    return this._center;
  }

  get radius(): number {
    return this._radius;
  }

  also(mutate: (model: CellModel) => void): CellModel {
    mutate(this);
    return this;
  }

  update() {
    const accel = Vector.random2D().div(5);
    this._velocity = Vector.add(this._velocity, accel).normalize();
    this._center = this._center.plus(this._velocity);
    this._radius = Math.min(this._radius * this._growth, this._limit);
  }

  split(): CellModel[] {
    const children = [
      new CellModel({
        center: this._center.minus({x: this._radius / 4}),
        radius: this._radius / 2,
        growth: this._growth,
        limit: this._limit,
      }),
      new CellModel({
        center: this._center.plus({x: this._radius / 4}),
        radius: this._radius / 2,
        growth: this._growth,
        limit: this._limit,
      }),
    ];

    children.forEach(it => {
      it.fillColor = this.fillColor;
    });

    return children
  }

  testHit(point: Point): boolean {
    return Point.dist(this._center, point) < this._radius;
  }

  constraint(rect: Rect) {
    const xs = new NumberRange(rect.left + this.radius, rect.right - this.radius);
    const ys = new NumberRange(rect.bottom + this.radius, rect.bottom - this.radius);

    this._center = this._center.with({
      x: xs.coerce(this._center.x),
      y: ys.coerce(this._center.y),
    });
  }
}

export class ApplicationModel {
  private readonly _frame: Rect;
  private readonly _cells: CellModel[];

  constructor(nargs: {
    frame: Rect,
    cells: CellModel[]
  }) {
    this._frame = nargs.frame;
    this._cells = [...nargs.cells];
    // no-op
  }

  get bounds(): Rect {
    return this._frame.with({
      origin: Point.zero(),
    });
  }

  get cells(): CellModel[] {
    return [...this._cells];
  }

  findIndex(point: Point): number {
    return this.cells.findIndex(it => it.testHit(point));
  }

  update() {
    this.cells.forEach(it => {
      it.update();
      it.constraint(this.bounds);
    });
  }

  split(index: number) {
    const cell = this._cells[index];
    const children = cell.split();
    this._cells.replace(index, ...children);
  }
}
