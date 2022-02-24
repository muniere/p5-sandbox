export type SpotCompat = {
  row: number,
  column: number,
}

export type SpotDelta = {
  row?: number,
  column?: number,
}

export type SpotMaybe = {
  row?: number,
  column?: number,
}

export type SpotCallback<T> = (spot: Spot) => T;

export class Spot {
  public constructor(
    private _row: number,
    private _column: number,
  ) {
    // no-op
  }

  public static of({row, column}: SpotCompat): Spot {
    return new Spot(row, column);
  }

  static dist(a: Spot, b: Spot): number {
    return Math.abs(a.row - b.row) + Math.abs(a.column - b.column);
  }

  public get row(): number {
    return this._row;
  }

  public get column(): number {
    return this._column;
  }

  shift({row, column}: SpotDelta): Spot {
    return new Spot(
      this._row + (row ?? 0),
      this._column + (column ?? 0),
    );
  }

  shiftAssign({row, column}: SpotDelta): void {
    this._row += row ?? 0;
    this._column += column ?? 0;
  }

  with({row, column}: SpotMaybe): Spot {
    return new Spot(
      row ?? this._row,
      column ?? this._column,
    );
  }

  assign({row, column}: SpotMaybe): void {
    this._row += (row ?? 0);
    this._column += (column ?? 0);
  }

  copy(): Spot {
    return new Spot(this._row, this._column);
  }
}

export type DimenCompat = {
  width: number,
  height: number,
}

export type DimenMaybe = {
  width?: number,
  height?: number,
}

export class Dimen {
  public constructor(
    private _width: number,
    private _height: number,
  ) {
    // no-op
  }

  public static zero(): Dimen {
    return new Dimen(0, 0);
  }

  public static square(size: number): Dimen {
    return new Dimen(size, size);
  }

  public static of({width, height}: DimenCompat): Dimen {
    return new Dimen(width, height);
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public plus(delta: DimenMaybe): Dimen {
    return new Dimen(
      this.width + (delta.width ?? 0),
      this.height + (delta.height ?? 0),
    );
  }

  public plusAssign(delta: DimenMaybe): void {
    this._width += (delta.width ?? 0);
    this._height += (delta.height ?? 0);
  }

  public minus(other: DimenMaybe): Dimen {
    return new Dimen(
      this.width - (other.width ?? 0),
      this.height - (other.height ?? 0),
    );
  }

  public minusAssign(delta: DimenMaybe): void {
    this._width -= (delta.width ?? 0);
    this._height -= (delta.height ?? 0);
  }

  public times(value: number): Dimen {
    return new Dimen(this.width * value, this.height * value);
  }

  public timesAssign(value: number): void {
    this._width *= value;
    this._height *= value;
  }

  public cycle(spot: Spot): Spot {
    let {row, column} = spot;

    if (row < 0) {
      row += this._height;
    }
    if (row >= this._height) {
      row -= this._height;
    }
    if (column < 0) {
      column += this._width;
    }
    if (column >= this._width) {
      column -= this._width;
    }

    return Spot.of({row, column});
  }

  public copy(): Dimen {
    return new Dimen(this.width, this.height);
  }

  public equals(other: Dimen): boolean {
    return this.width == other.width && this.height == other.height;
  }
}

export interface MatrixFactory<T> {
  create(spot: Spot): T
}

export class Matrix<T> {
  private constructor(
    public readonly dimen: Dimen,
    public readonly values: T[][],
  ) {
    // no-op
  }

  public static create<T>(dimen: DimenCompat): Matrix<Spot> {
    const spots = [...Array(dimen.height)].map(
      (_, row) => [...Array(dimen.width)].map(
        (_, column) => Spot.of({row, column})
      )
    );

    return new Matrix<Spot>(Dimen.of(dimen), spots);
  }

  public static fill<T>(dimen: DimenCompat, value: T): Matrix<T> {
    const values = [...Array(dimen.height)].map(
      () => [...Array(dimen.width)].map(
        () => value
      )
    );

    return new Matrix<T>(Dimen.of(dimen), values);
  }

  public static generate<T>(dimen: DimenCompat, callback: SpotCallback<T>): Matrix<T> {
    const values = [...Array(dimen.height)].map(
      (_, row) => [...Array(dimen.width)].map(
        (_, column) => callback(Spot.of({row, column}))
      )
    );

    return new Matrix<T>(Dimen.of(dimen), values);
  }

  public get width(): number {
    return this.dimen.width;
  }

  public get height(): number {
    return this.dimen.height;
  }

  public first(): T {
    return this.values.first().first();
  }

  public last(): T {
    return this.values.last().last();
  }

  public get(spot: SpotCompat): T {
    return this.values[spot.row][spot.column];
  }

  public getOrNull(spot: SpotCompat): T | undefined {
    if (spot.row < 0 || this.values.length - 1 < spot.row) {
      return undefined;
    }

    const values = this.values[spot.row];
    if (spot.column < 0 || values.length - 1 < spot.column) {
      return undefined;
    }

    return values[spot.column];
  }

  public set(spot: SpotCompat, value: T) {
    this.values[spot.row][spot.column] = value;
  }

  public forEach(callback: (value: T, spot: Spot) => void) {
    this.values.forEach((values, row) => {
      values.forEach((value, column) => {
        callback(value, Spot.of({row, column}));
      })
    });
  }

  public filter(predicate: (value: T, spot: Spot) => boolean): Array<T> {
    const result = [] as T[];

    this.forEach((value, spot) => {
      if (predicate(value, spot)) {
        result.push(value);
      }
    })

    return result;
  }

  public map<U>(transform: (value: T, spot: Spot) => U): Matrix<U> {
    const values = this.values.map((values, row) => {
      return values.map((value, column) => {
        return transform(value, Spot.of({row, column}));
      })
    });

    return new Matrix<U>(this.dimen, values);
  }

  public flatten(): Array<T> {
    return this.values.reduce((acc, v) => acc.concat(v));
  }
}
