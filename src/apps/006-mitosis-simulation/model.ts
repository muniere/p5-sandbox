import { Vector } from 'p5';
import { Arrays, Numeric } from '../../lib/stdlib';
import { Point, Size } from '../../lib/graphics2d';
import { Colors } from '../../lib/drawing';

export class CellState {
  public fillColor: string = '#FFFFFF';
  public strokeColor: string = '#FFFFFF';

  private _velocity: Vector;
  private _center: Point;
  private _radius: number

  constructor(
    center: Point,
    radius: number,
    public readonly growth: number,
    public readonly limit: number,
  ) {
    this._velocity = new Vector();
    this._center = center;
    this._radius = radius;
  }

  static create({center, radius, growth, limit}: {
    center: Point,
    radius: number,
    growth: number,
    limit: number,
  }): CellState {
    return new CellState(center, radius, growth, limit);
  }

  get center(): Point {
    return this._center;
  }

  get radius(): number {
    return this._radius;
  }

  update() {
    const accel = Vector.random2D().div(5);
    this._velocity = Vector.add(this._velocity, accel).normalize();
    this._center = this._center.plus(this._velocity);
    this._radius = Math.min(this._radius * this.growth, this.limit);
  }

  split(): CellState[] {
    const children = [
      CellState.create({
        center: this._center.minus({x: this._radius / 4}),
        radius: this._radius / 2,
        growth: this.growth,
        limit: this.limit,
      }),
      CellState.create({
        center: this._center.plus({x: this._radius / 4}),
        radius: this._radius / 2,
        growth: this.growth,
        limit: this.limit,
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

  constraint(bounds: Size) {
    const xs = Numeric.rangeOf({
      start: this.radius,
      stop: bounds.width - this.radius,
    });
    const ys = Numeric.rangeOf({
      start: this.radius,
      stop: bounds.height - this.radius,
    });
    this._center = this._center.with({
      x: xs.coerce(this._center.x),
      y: ys.coerce(this._center.y),
    });
  }
}

export class WorldState {
  constructor(
    private _bounds: Size,
    private _cells: CellState[]
  ) {
    // no-op
  }

  static random({bounds, radius, growth, count}: {
    bounds: Size,
    radius: number,
    growth: number,
    count: number,
  }): WorldState {
    const cells = Arrays.generate(count, () => {
      return CellState.create({
        center: Point.of({
          x: bounds.width * Math.random(),
          y: bounds.height * Math.random()
        }),
        radius: radius,
        growth: growth,
        limit: radius,
      });
    });

    cells.forEach(it => {
      it.fillColor = Colors.sample({alpha: 128});
    });

    return new WorldState(bounds, cells);
  }

  get cells(): CellState[] {
    return [...this._cells];
  }

  findIndex(point: Point): number {
    return this.cells.findIndex(it => it.testHit(point));
  }

  update() {
    this.cells.forEach(it => {
      it.update();
      it.constraint(this._bounds);
    });
  }

  split(index: number) {
    const cell = this._cells[index];
    const children = cell.split();
    this._cells.replace(index, ...children);
  }
}
