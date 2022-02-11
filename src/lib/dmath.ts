export class Spot {
  constructor(
    public row: number,
    public column: number,
  ) {
    // no-op
  }

  static of({row, column}: {
    row: number,
    column: number,
  }): Spot {
    return new Spot(row, column);
  }

  static dist(a: Spot, b: Spot): number {
    return Math.abs(a.row - b.row) + Math.abs(a.column - b.column);
  }

  shift({row, column}: { row?: number, column?: number }): Spot {
    return new Spot(this.row + (row ?? 0), this.column + (column ?? 0));
  }
}

export class Dimen {
  public constructor(
    public readonly width: number,
    public readonly height: number,
  ) {
    // no-op
  }

  public static zero(): Dimen {
    return new Dimen(0, 0);
  }

  public static square(size: number): Dimen {
    return new Dimen(size, size);
  }

  public static of({width, height}: {
    width: number,
    height: number,
  }): Dimen {
    return new Dimen(width, height);
  }

  plus(other: Dimen): Dimen {
    return new Dimen(this.width + other.width, this.height + other.height);
  }

  minus(other: Dimen): Dimen {
    return new Dimen(this.width - other.width, this.height - other.height);
  }

  times(value: number): Dimen {
    return new Dimen(this.width * value, this.height * value);
  }

  copy(): Dimen {
    return new Dimen(this.width, this.height);
  }

  equals(other: Dimen): boolean {
    return this.width == other.width && this.height == other.height;
  }
}

export class Matrix<T> {
  private constructor(
    public readonly dimen: Dimen,
    public readonly values: T[][],
  ) {
    // no-op
  }

  static create<T>(dimen: { width: number, height: number }): Matrix<Spot> {
    const spots = [...Array(dimen.height)].map(
      (_, row) => [...Array(dimen.width)].map(
        (_, column) => Spot.of({row, column})
      )
    );

    return new Matrix<Spot>(Dimen.of(dimen), spots);
  }

  static fill<T>(dimen: { width: number, height: number }, value: T): Matrix<T> {
    const values = [...Array(dimen.height)].map(
      (_, row) => [...Array(dimen.width)].map(
        (_, column) => value
      )
    );

    return new Matrix<T>(Dimen.of(dimen), values);
  }

  static generate<T>(dimen: { width: number, height: number }, factory: (spot: Spot) => T): Matrix<T> {
    const values = [...Array(dimen.height)].map(
      (_, row) => [...Array(dimen.width)].map(
        (_, column) => factory(Spot.of({row, column}))
      )
    );

    return new Matrix<T>(Dimen.of(dimen), values);
  }

  get width(): number {
    return this.dimen.width;
  }

  get height(): number {
    return this.dimen.height;
  }

  first(): T {
    return this.values[0][0];
  }

  last(): T {
    const values = this.values[this.values.length - 1];
    return values[values.length - 1];
  }

  get(spot: Spot): T {
    return this.values[spot.row][spot.column];
  }

  getOrNull(spot: Spot): T | undefined {
    if (spot.row < 0 || this.values.length - 1 < spot.row) {
      return undefined;
    }

    const values = this.values[spot.row];
    if (spot.column < 0 || values.length - 1 < spot.column) {
      return undefined;
    }

    return values[spot.column];
  }

  set(spot: Spot, value: T) {
    this.values[spot.row][spot.column] = value;
  }

  forEach(callback: (value: T, spot: Spot) => void) {
    this.values.forEach((values, row) => {
      values.forEach((value, column) => {
        callback(value, Spot.of({row, column}));
      })
    });
  }

  filter(predicate: (value: T, spot: Spot) => boolean): Array<T> {
    const result = [] as T[];

    this.forEach((value, spot) => {
      if (predicate(value, spot)) {
        result.push(value);
      }
    })

    return result;
  }

  map<U>(transform: (value: T, spot: Spot) => U): Matrix<U> {
    const values = this.values.map((values, row) => {
      return values.map((value, column) => {
        return transform(value, Spot.of({row, column}));
      })
    });

    return new Matrix<U>(this.dimen, values);
  }

  flatten(): Array<T> {
    return this.values.reduce((acc, v) => acc.concat(v));
  }
}
