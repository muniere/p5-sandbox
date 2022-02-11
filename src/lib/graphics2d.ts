import { Numeric } from './stdlib';

export class Point {
  public constructor(
    public readonly x: number,
    public readonly y: number,
  ) {
    // no-op
  }

  public static zero(): Point {
    return new Point(0, 0);
  }

  public static of({x, y}: {
    x: number,
    y: number,
  }): Point {
    return new Point(x, y);
  };

  public static rect({x, y}: {
    x: number,
    y: number,
  }): Point {
    return new Point(x, y);
  }

  public static polar({radius, angle}: {
    radius: number,
    angle: number,
  }): Point {
    return new Point(
      radius * Math.cos(angle),
      radius * Math.sin(angle),
    );
  }

  static dist(a: Point, b: Point): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2.0) + Math.pow(a.y - b.y, 2.0));
  }

  plus({x, y}: { x?: number, y?: number }): Point {
    return new Point(this.x + (x ?? 0), this.y + (y ?? 0));
  }

  minus({x, y}: { x?: number, y?: number }): Point {
    return new Point(this.x - (x ?? 0), this.y - (y ?? 0));
  }

  with({x, y}: { x?: number, y?: number }): Point {
    return new Point(x ?? this.x, y ?? this.y);
  }

  copy(): Point {
    return new Point(this.x, this.y);
  }

  equals(other: Point): boolean {
    return this.x == other.x && this.y == other.y;
  }
}

export class PointRange {
  constructor(
    public readonly start: Point,
    public readonly stop: Point,
  ) {
    // no-op
  }

  static of({start, stop}: {
    start: Point,
    stop: Point,
  }): PointRange {
    return new PointRange(start, stop);
  }

  lerp(amount: number): Point {
    return Point.of({
      x: Numeric.range(this.start.x, this.stop.x).lerp(amount),
      y: Numeric.range(this.start.y, this.stop.y).lerp(amount),
    });
  }

  sample(): Point {
    return this.lerp(Math.random());
  }
}

export class Size {
  public constructor(
    public readonly width: number,
    public readonly height: number,
  ) {
    // no-op
  }

  public static zero(): Size {
    return new Size(0, 0);
  }

  public static square(size: number): Size {
    return new Size(size, size);
  }

  public static of({width, height}: {
    width: number,
    height: number,
  }): Size {
    return new Size(width, height);
  }

  plus(other: Size): Size {
    return new Size(this.width + other.width, this.height + other.height);
  }

  minus(other: Size): Size {
    return new Size(this.width - other.width, this.height - other.height);
  }

  times(value: number): Size {
    return new Size(this.width * value, this.height * value);
  }

  copy(): Size {
    return new Size(this.width, this.height);
  }

  equals(other: Size): boolean {
    return this.width == other.width && this.height == other.height;
  }
}

export class Rect {
  public constructor(
    public origin: Point,
    public size: Size,
  ) {
    // no-op
  }

  public static of({origin, size}: {
    origin: Point,
    size: Size,
  }): Rect {
    return new Rect(origin, size);
  }

  public get top(): number {
    return this.origin.y;
  }

  public get left(): number {
    return this.origin.x;
  }

  public get right(): number {
    return this.origin.x + this.size.width;
  }

  public get bottom(): number {
    return this.origin.y + this.size.height;
  }

  public get width(): number {
    return this.size.width;
  }

  public get height(): number {
    return this.size.height;
  }

  copy(): Rect {
    return new Rect(this.origin.copy(), this.size.copy());
  }

  equals(other: Rect): boolean {
    return this.origin.equals(other.origin) && this.size.equals(other.size);
  }
}
