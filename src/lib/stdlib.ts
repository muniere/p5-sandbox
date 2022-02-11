export namespace Arrays {

  export function sequence(length: number, option?: { start?: number }): number[] {
    return [...Array(length)].map((_, i) => i + (option?.start ?? 0));
  }

  export function generate<T>(length: number, factory: (index: number) => T): T[] {
    return [...Array(length)].map((_, i) => factory(i));
  }

  export function zip<T, U>(a: T[], b: U[]): Array<[T, U]> {
    return a.map((it, i) => [it, b[i]]);
  }
}

export namespace Generators {

  export function* sequence(option?: {
    start?: number,
    end?: number,
    step?: number
  }): Generator<number> {
    const start = option?.start ?? 0;
    const end = option?.end;
    const step = option?.step ?? 1;

    if (end) {
      for (let i = start; i < end; i += step) {
        yield i;
      }
    } else {
      for (let i = start; ; i += step) {
        yield  i;
      }
    }
  }

  export function* permutation(values: number[]): Generator<number[]> {
    const seq = MutableList.of(values);

    yield [...seq.values];

    while (true) {
      let x = -1;
      for (let i = seq.values.length - 2; i >= 0; i--) {
        if (seq.values[i] < seq.values[i + 1]) {
          x = i;
          break;
        }
      }

      if (x < 0) {
        break;
      }

      let y = -1;
      for (let j = seq.values.length - 1; j > x; j--) {
        if (seq.values[x] < seq.values[j]) {
          y = j;
          break;
        }
      }
      if (y < 0) {
        break;
      }

      seq.swap(x, y);
      seq.reverse(x + 1);

      yield [...seq.values];
    }
  }
}

export class List<T> {

  constructor(
    private readonly _values: T[],
  ) {
    // no-op
  }

  static of<T>(values: T[]): List<T> {
    return new List(values);
  }

  get values(): T[] {
    return [...this._values];
  }

  swapping(i: number, j: number): List<T> {
    const values = [...this._values];
    const tmp = values[i];
    values[i] = values[j];
    values[j] = tmp;
    return List.of(values);
  }

  shuffled(): List<T> {
    const result = [...this._values];

    let cursor = result.length;

    while (cursor) {
      const i = Math.floor(Math.random() * cursor);

      cursor -= 1;

      const tmp = result[cursor];
      result[cursor] = result[i];
      result[i] = tmp;
    }

    return List.of(result);
  }

  reversed(start?: number, end?: number) {
    start ??= 0;
    end ??= this._values.length;
    const head = this._values.slice(0, start);
    const body = this._values.slice(start, end).reverse();
    const tail = this._values.slice(end);
    return List.of(head.concat(body).concat(tail));
  }

  copy(): List<T> {
    return new List([...this._values]);
  }
}

export class MutableList<T> {

  constructor(
    private _values: T[],
  ) {
    // no-op
  }

  static of<T>(values: T[]): MutableList<T> {
    return new MutableList(values);
  }

  get values(): T[] {
    return [...this._values];
  }

  swap(i: number, j: number) {
    const tmp = this._values[i];
    this._values[i] = this._values[j];
    this._values[j] = tmp;
  }

  shuffle() {
    let cursor = this._values.length;

    while (cursor) {
      const i = Math.floor(Math.random() * cursor);

      cursor -= 1;

      const tmp = this._values[cursor];
      this._values[cursor] = this._values[i];
      this._values[i] = tmp;
    }
  }

  reverse(start?: number, end?: number) {
    start ??= 0;
    end ??= this._values.length;
    const head = this._values.slice(0, start);
    const body = this._values.slice(start, end).reverse();
    const tail = this._values.slice(end);
    this._values = head.concat(body).concat(tail);
  }

  also(mutate: (list: MutableList<T>) => void): MutableList<T> {
    mutate(this);
    return this;
  }

  copy(): MutableList<T> {
    return new MutableList([...this._values]);
  }
}

export namespace Numeric {

  export function range(start: number, stop: number): NumberRange {
    return new NumberRange(start, stop);
  }

  export function rangeOf({start, stop}: {start: number, stop: number}): NumberRange {
    return new NumberRange(start, stop);
  }

  export function map({value, domain, target}: {
    value: number,
    domain: NumberRange,
    target: NumberRange,
  }): number {
    return NumberRangeMap.of({domain, target}).apply(value);
  }
}

export class NumberRange {
  constructor(
    public readonly start: number,
    public readonly stop: number,
  ) {
    // no-op
  }

  static of({start, stop}: {
    start: number,
    stop: number,
  }): NumberRange {
    return new NumberRange(start, stop);
  }

  coerce(n: number): number {
    return Math.max(this.start, Math.min(this.stop, n));
  }

  lerp(amount: number): number {
    return this.start + amount * (this.stop - this.start);
  }

  sample(): number {
    return this.lerp(Math.random());
  }
}

export class NumberRangeMap {
  constructor(
    public readonly domain: NumberRange,
    public readonly target: NumberRange,
  ) {
    // no-op
  }

  static of({domain, target}: {
    domain: NumberRange,
    target: NumberRange,
  }): NumberRangeMap {
    return new NumberRangeMap(domain, target);
  }

  apply(n: number): number {
    const percent = (n - this.domain.start) / Math.abs(this.domain.stop - this.domain.start);
    const scaled = percent * Math.abs(this.target.stop - this.target.start);
    return scaled + this.target.start;
  }
}
