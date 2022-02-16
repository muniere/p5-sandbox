import { Numeric } from './stdlib';

export type PointCompat = {
  x: number,
  y: number,
}

export type PointDelta = {
  x?: number,
  y?: number,
}

export type PointMaybe = {
  x?: number,
  y?: number,
}

export class Point {
  public constructor(
    private _x: number,
    private _y: number,
  ) {
    // no-op
  }

  public static zero(): Point {
    return new Point(0, 0);
  }

  public static of({x, y}: PointCompat): Point {
    return new Point(x, y);
  };

  public static rect({x, y}: PointCompat): Point {
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

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  public plus(delta: PointDelta): Point {
    return new Point(this.x + (delta.x ?? 0), this.y + (delta.y ?? 0));
  }

  public plusAssign(delta: PointDelta) {
    this._x += (delta.x ?? 0);
    this._y += (delta.y ?? 0);
  }

  public minus(delta: PointDelta): Point {
    return new Point(this.x - (delta.x ?? 0), this.y - (delta.y ?? 0));
  }

  public minusAssign(delta: PointDelta) {
    this._x -= (delta.x ?? 0);
    this._y -= (delta.y ?? 0);
  }

  public with(delta: PointMaybe): Point {
    return new Point(delta.x ?? this.x, delta.y ?? this.y);
  }

  public assign(delta: PointMaybe) {
    this._x = (delta.x ?? this.x);
    this._y = (delta.y ?? this.y);
  }

  public copy(): Point {
    return new Point(this.x, this.y);
  }

  public equals(other: Point): boolean {
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

  public static of({start, stop}: {
    start: Point,
    stop: Point,
  }): PointRange {
    return new PointRange(start, stop);
  }

  public lerp(amount: number): Point {
    return Point.of({
      x: Numeric.range(this.start.x, this.stop.x).lerp(amount),
      y: Numeric.range(this.start.y, this.stop.y).lerp(amount),
    });
  }

  public sample(): Point {
    return this.lerp(Math.random());
  }
}

export type SizeCompat = {
  width: number,
  height: number,
}

export type SizeDelta = {
  width?: number,
  height?: number,
}

export type SizeMaybe = {
  width?: number,
  height?: number,
}

export class Size {
  public constructor(
    private _width: number,
    private _height: number,
  ) {
    // no-op
  }

  public static zero(): Size {
    return new Size(0, 0);
  }

  public static square(size: number): Size {
    return new Size(size, size);
  }

  public static of({width, height}: SizeCompat): Size {
    return new Size(width, height);
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public plus(delta: SizeDelta): Size {
    return new Size(
      this.width + (delta.width ?? 0),
      this.height + (delta.height ?? 0),
    );
  }

  public plusAssign(delta: SizeDelta): void {
    this._width += (delta.width ?? 0);
    this._height += (delta.height ?? 0);
  }

  public minus(other: SizeDelta): Size {
    return new Size(
      this.width - (other.width ?? 0),
      this.height - (other.height ?? 0),
    );
  }

  public minusAssign(delta: SizeDelta): void {
    this._width -= (delta.width ?? 0);
    this._height -= (delta.height ?? 0);
  }

  public times(value: number): Size {
    return new Size(this.width * value, this.height * value);
  }

  public timesAssign(value: number): void {
    this._width *= value;
    this._height *= value;
  }

  public copy(): Size {
    return new Size(this.width, this.height);
  }

  public equals(other: SizeCompat): boolean {
    return this.width == other.width && this.height == other.height;
  }
}

export type RectCompat = {
  origin: Point,
  size: Size,
}

export type RectMaybe = {
  origin?: Point,
  size?: Size,
}

export class Rect {
  public constructor(
    private _origin: Point,
    private _size: Size,
  ) {
    // no-op
  }

  public static zero(): Rect {
    return Rect.of({
      origin: Point.zero(),
      size: Size.zero(),
    });
  }

  public static of({origin, size}: RectCompat): Rect {
    return new Rect(origin, size);
  }

  public get origin(): Point {
    return this._origin.copy();
  }

  public get size(): Size {
    return this._size.copy();
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

  public get center(): Point {
    return Point.of({
      x: this.origin.x + this.size.width / 2,
      y: this.origin.y + this.size.height / 2
    });
  }

  public with(delta: RectMaybe): Rect {
    return new Rect(
      delta.origin ?? this.origin,
      delta.size ?? this.size,
    );
  }

  public assign(delta: RectMaybe): void {
    this._origin = (delta.origin ?? this._origin);
    this._size = (delta.size ?? this._size);
  }

  public includes(point: Point): boolean {
    return this.left <= point.x && point.x < this.right && this.top <= point.y && point.y < this.bottom;
  }

  public intersects(other: Rect): boolean {
    if (other.left > this.right) {
      return false;
    }
    if (other.right < this.left) {
      return false;
    }
    if (other.top > this.bottom) {
      return false;
    }
    if (other.bottom < this.top) {
      return false;
    }
    return true;
  }

  public copy(): Rect {
    return new Rect(this.origin.copy(), this.size.copy());
  }

  public equals(other: RectCompat): boolean {
    return this.origin.equals(other.origin) && this.size.equals(other.size);
  }
}
