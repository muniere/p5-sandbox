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
  private _x: number;
  private _y: number;

  public constructor(nargs: PointCompat) {
    this._x = nargs.x;
    this._y = nargs.y;
  }

  public static zero(): Point {
    return new Point({
      x: 0,
      y: 0,
    });
  }

  public static polar({radius, angle}: {
    radius: number,
    angle: number,
  }): Point {
    return new Point({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    });
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
    return new Point({
      x: this._x + (delta.x ?? 0),
      y: this._y + (delta.y ?? 0),
    });
  }

  public plusAssign(delta: PointDelta) {
    this._x += (delta.x ?? 0);
    this._y += (delta.y ?? 0);
  }

  public minus(delta: PointDelta): Point {
    return new Point({
      x: this._x - (delta.x ?? 0),
      y: this._y - (delta.y ?? 0),
    });
  }

  public minusAssign(delta: PointDelta) {
    this._x -= (delta.x ?? 0);
    this._y -= (delta.y ?? 0);
  }

  public with(delta: PointMaybe): Point {
    return new Point({
      x: delta.x ?? this._x,
      y: delta.y ?? this._y,
    });
  }

  public assign(delta: PointMaybe) {
    this._x = (delta.x ?? this.x);
    this._y = (delta.y ?? this.y);
  }

  public copy(): Point {
    return new Point({
      x: this._x,
      y: this._y,
    });
  }

  public equals(other: Point): boolean {
    return this._x == other.x && this._y == other.y;
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
    return new Point({
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
  private _width: number;
  private _height: number;

  public constructor(nargs: SizeCompat) {
    this._width = nargs.width;
    this._height = nargs.height;
  }

  public static zero(): Size {
    return new Size({
      width: 0,
      height: 0,
    });
  }

  public static square(size: number): Size {
    return new Size({
      width: size,
      height: size,
    });
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public plus(delta: SizeDelta): Size {
    return new Size({
      width: this._width + (delta.width ?? 0),
      height: this._height + (delta.height ?? 0),
    });
  }

  public plusAssign(delta: SizeDelta): void {
    this._width += (delta.width ?? 0);
    this._height += (delta.height ?? 0);
  }

  public minus(other: SizeDelta): Size {
    return new Size({
      width: this._width - (other.width ?? 0),
      height: this._height - (other.height ?? 0),
    });
  }

  public minusAssign(delta: SizeDelta): void {
    this._width -= (delta.width ?? 0);
    this._height -= (delta.height ?? 0);
  }

  public times(value: number): Size {
    return new Size({
      width: this._width * value,
      height: this._height * value,
    });
  }

  public timesAssign(value: number): void {
    this._width *= value;
    this._height *= value;
  }

  public with(delta: SizeMaybe): Size {
    return new Size({
      width: delta.width ?? this._width,
      height: delta.height ?? this._height,
    });
  }

  public assign(delta: SizeMaybe): void {
    this._width = delta.width ?? this._width;
    this._height = delta.height ?? this._height;
  }

  public copy(): Size {
    return new Size({
      width: this._width,
      height: this._height,
    });
  }

  public equals(other: SizeCompat): boolean {
    return this._width == other.width && this._height == other.height;
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
  private _origin: Point;
  private _size: Size;

  public constructor(nargs: RectCompat) {
    this._origin = nargs.origin;
    this._size = nargs.size;
  }

  public static zero(): Rect {
    return new Rect({
      origin: Point.zero(),
      size: Size.zero(),
    });
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
    return new Point({
      x: this.origin.x + this.size.width / 2,
      y: this.origin.y + this.size.height / 2
    });
  }

  public with(delta: RectMaybe): Rect {
    return new Rect({
      origin: delta.origin ?? this._origin.copy(),
      size: delta.size ?? this._size.copy(),
    });
  }

  public assign(delta: RectMaybe): void {
    this._origin = (delta.origin ?? this._origin);
    this._size = (delta.size ?? this._size);
  }

  public includes(point: Point): boolean {
    return this.left <= point.x && point.x < this.right && this.top <= point.y && point.y < this.bottom;
  }

  public intersects(other: Rect): boolean {
    return (this.left <= other.right && other.left <= this.right) && (this.top <= other.bottom && other.top <= this.bottom);
  }

  public copy(): Rect {
    return new Rect({
      origin: this._origin.copy(),
      size: this._size.copy(),
    });
  }

  public equals(other: RectCompat): boolean {
    return this._origin.equals(other.origin) && this._size.equals(other.size);
  }
}

export class Line {
  public readonly start: Point;
  public readonly stop: Point;

  constructor(nargs: {
    start: Point,
    stop: Point,
  }) {
    this.start = nargs.start;
    this.stop = nargs.stop;
  }
}
