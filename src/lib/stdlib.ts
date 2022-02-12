declare global {
  interface Array<T> {
    sample(): T

    sampleIndex(): number

    shuffle(): void

    shuffled(): Array<T>

    swap(i: number, j: number): void

    swapped(i: number, j: number): Array<T>

    reverseBetween(option?: { start?: number, end?: number }): void

    reversedBetween(option?: { start?: number, end?: number }): Array<T>
  }
}

Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.sampleIndex = function () {
  return Math.floor(Math.random() * this.length);
}

Array.prototype.shuffle = function () {
  let cursor = this.length;

  while (cursor) {
    const i = Math.floor(Math.random() * cursor);

    cursor -= 1;

    const tmp = this[cursor];
    this[cursor] = this[i];
    this[i] = tmp;
  }
}

Array.prototype.shuffled = function () {
  const result = [...this];

  let cursor = result.length;

  while (cursor) {
    const i = Math.floor(Math.random() * cursor);

    cursor -= 1;

    const tmp = result[cursor];
    result[cursor] = result[i];
    result[i] = tmp;
  }

  return result;
}

Array.prototype.swap = function (i: number, j: number) {
  const tmp = this[i];
  this[i] = this[j];
  this[j] = tmp;
}

Array.prototype.swapped = function (i: number, j: number) {
  const result = [...this];
  const tmp = result[i];
  result[i] = result[j];
  result[j] = tmp;
  return result;
}

Array.prototype.reverseBetween = function (option?: { start?: number, end?: number }) {
  const start = option?.start ?? 0;
  const end = option?.end ?? this.length;
  const body = this.slice(start, end).reverse();
  this.splice(start, body.length, ...body);
}

Array.prototype.reversedBetween = function (option?: { start?: number, end?: number }) {
  const start = option?.start ?? 0;
  const end = option?.end ?? this.length;
  const head = this.slice(0, start);
  const body = this.slice(start, end).reverse();
  const tail = this.slice(end);
  return head.concat(body).concat(tail);
}

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
    const seq = [...values];

    yield [...seq];

    while (true) {
      let x = -1;
      for (let i = seq.length - 2; i >= 0; i--) {
        if (seq[i] < seq[i + 1]) {
          x = i;
          break;
        }
      }

      if (x < 0) {
        break;
      }

      let y = -1;
      for (let j = seq.values.length - 1; j > x; j--) {
        if (seq[x] < seq[j]) {
          y = j;
          break;
        }
      }
      if (y < 0) {
        break;
      }

      seq.swap(x, y);
      seq.reverseBetween({start: x + 1});

      yield [...seq];
    }
  }
}

export namespace Numeric {

  export function range(start: number, stop: number): NumberRange {
    return new NumberRange(start, stop);
  }

  export function rangeOf({start, stop}: { start: number, stop: number }): NumberRange {
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

  get length(): number {
    return this.stop - this.start;
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

export class IntegerRange {
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

  get length(): number {
    return this.stop - this.start + 1;
  }

  sample(): number {
    return this.start + Math.floor(Math.random() * (this.stop - this.start))
  }
}
