export type PointCompat = {
  x: number,
  y: number,
  z: number,
}

export type PointDelta = {
  x?: number,
  y?: number,
  z?: number,
}

export type PointMaybe = {
  x?: number,
  y?: number,
  z?: number,
}

export class Point {
  private _x: number;
  private _y: number;
  private _z: number;

  public constructor(nargs: PointCompat) {
    this._x = nargs.x;
    this._y = nargs.y;
    this._z = nargs.z;
  }

  public static zero(): Point {
    return new Point({
      x: 0,
      y: 0,
      z: 0,
    });
  }

  public static dist(a: Point, b: Point): number {
    return Math.sqrt(
      Math.pow(a.x - b.x, 2.0) +
      Math.pow(a.y - b.y, 2.0) +
      Math.pow(a.z - b.z, 2.0)
    );
  }

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  public get z(): number {
    return this._z;
  }

  public plus(delta: PointDelta): Point {
    return new Point({
      x: this._x + (delta.x ?? 0),
      y: this._y + (delta.y ?? 0),
      z: this._z + (delta.z ?? 0),
    });
  }

  public plusAssign(delta: PointDelta) {
    this._x += (delta.x ?? 0);
    this._y += (delta.y ?? 0);
    this._z += (delta.z ?? 0);
  }

  public minus(delta: PointDelta): Point {
    return new Point({
      x: this._x - (delta.x ?? 0),
      y: this._y - (delta.y ?? 0),
      z: this._z - (delta.z ?? 0),
    });
  }

  public minusAssign(delta: PointDelta) {
    this._x -= (delta.x ?? 0);
    this._y -= (delta.y ?? 0);
    this._z -= (delta.z ?? 0);
  }

  public with(params: PointMaybe): Point {
    return new Point({
      x: params.x ?? this._x,
      y: params.y ?? this._y,
      z: params.z ?? this._z,
    });
  }

  public assign(params: PointMaybe) {
    this._x = (params.x ?? this._x);
    this._y = (params.y ?? this._y);
    this._z = (params.z ?? this._z);
  }

  public copy(): Point {
    return new Point({
      x: this._x,
      y: this._y,
      z: this._z,
    });
  }

  public equals(other: PointCompat): boolean {
    return this._x == other.x && this._y == other.y && this._z == other.z;
  }
}

export type SizeCompat = {
  width: number,
  height: number,
  depth: number,
}

export type SizeDelta = {
  width?: number,
  height?: number,
  depth?: number,
}

export type SizeMaybe = {
  width?: number,
  height?: number,
  depth?: number,
}

export class Size {
  private _width: number;
  private _height: number;
  private _depth: number;

  public constructor(nargs: SizeCompat) {
    this._width = nargs.width;
    this._height = nargs.height;
    this._depth = nargs.depth;
  }

  public static zero(): Size {
    return new Size({
      width: 0,
      height: 0,
      depth: 0,
    });
  }

  public static cube(size: number): Size {
    return new Size({
      width: size,
      height: size,
      depth: size,
    });
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get depth(): number {
    return this._depth;
  }

  public plus(delta: SizeDelta): Size {
    return new Size({
      width: this._width + (delta.width ?? 0),
      height: this._height + (delta.height ?? 0),
      depth: this._depth + (delta.depth ?? 0),
    });
  }

  public plusAssign(delta: SizeDelta): void {
    this._width += (delta.width ?? 0);
    this._height += (delta.height ?? 0);
    this._depth += (delta.depth ?? 0);
  }

  public minus(delta: SizeDelta): Size {
    return new Size({
      width: this._width - (delta.width ?? 0),
      height: this._height - (delta.height ?? 0),
      depth: this._depth - (delta.depth ?? 0),
    });
  }

  public minusAssign(delta: SizeDelta): void {
    this._width -= (delta.width ?? 0);
    this._height -= (delta.height ?? 0);
    this._depth -= (delta.depth ?? 0);
  }

  public times(value: number): Size {
    return new Size({
      width: this._width * value,
      height: this._height * value,
      depth: this._depth * value,
    });
  }

  public timesAssign(value: number): void {
    this._width *= value;
    this._height *= value;
    this._depth *= value;
  }

  public with(delta: SizeMaybe): Size {
    return new Size({
      width: delta.width ?? this._width,
      height: delta.height ?? this._height,
      depth: delta.depth ?? this._depth,
    });
  }

  public assign(delta: SizeMaybe): void {
    this._width = delta.width ?? this._width;
    this._height = delta.height ?? this._height;
    this._depth = delta.depth ?? this._depth;
  }

  public copy(): Size {
    return new Size({
      width: this._width,
      height: this._height,
      depth: this._depth,
    });
  }

  public equals(other: SizeCompat): boolean {
    return this._width == other.width && this._height == other.height && this._depth == other.depth;
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
