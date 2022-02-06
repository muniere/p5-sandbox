class Point {
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

class Size {
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

class Rect {
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

export { Point, Size, Rect };
