export namespace Filters {

  export function notNull<T>(item: T | undefined): item is T {
    return item != undefined;
  }
}

declare global {
  interface Array<T> {
    first(): T

    last(): T

    sample(): T

    sampleIndex(): number

    shuffle(): void

    shuffled(): Array<T>

    droppingFirst(n?: number): Array<T>

    droppingLast(n?: number): Array<T>

    compactMap<U>(callback: (item: T) => U | null | undefined): U[];

    remove(i: number): T;

    removeWhere(predicate: (item: T) => boolean): T[];

    replace(i: number, ...items: T[]): T;

    swap(i: number, j: number): void

    swapped(i: number, j: number): Array<T>

    reversed(): Array<T>

    reverseBetween(option?: { start?: number, end?: number }): void

    reversedBetween(option?: { start?: number, end?: number }): Array<T>

    sorted(compare?: (a: T, b: T) => number): Array<T>

    sortedAsc(selector: (obj: T) => any): Array<T>

    sortedDesc(selector: (obj: T) => any): Array<T>

    minBy(selector: (obj: T) => any): T

    maxBy(selector: (obj: T) => any): T

    indexOfMin(): number

    indexOfMax(): number

    indexOfMinBy(selector: (obj: T) => any, options?: { predicate?: (obj: T) => boolean }): number

    indexOfMaxBy(selector: (obj: T) => any, options?: { predicate?: (obj: T) => boolean }): number
  }
}

Array.prototype.first = function () {
  return this[0];
}

Array.prototype.last = function () {
  return this[this.length - 1];
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

Array.prototype.droppingFirst = function (n?: number) {
  const drop = Math.max(n ?? 1, 1);
  return this.slice(drop);
}

Array.prototype.droppingLast = function (n?: number) {
  const drop = Math.max(n ?? 1, 1);
  return this.slice(0, this.length - drop);
}

Array.prototype.compactMap = function (callback: (item: any) => any | undefined | null) {
  return this.map(callback).filter(Filters.notNull);
}

Array.prototype.remove = function (i: number) {
  const removed = this.splice(i, 1);
  return removed[0];
}

Array.prototype.removeWhere = function (predicate: (item: any) => boolean) {
  const carried = [];
  const removed = [];
  for (let i = 0; i < this.length; i++) {
    const v = this[i];
    if (predicate(v)) {
      removed.push(v);
    } else {
      carried.push(v);
    }
  }
  this.splice(0, this.length, ...carried);
  return removed;
}

Array.prototype.replace = function (i: number, ...items: any[]) {
  this.splice(i, 1, ...items);
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

Array.prototype.reversed = function () {
  return [...this].reverse();
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

Array.prototype.sorted = function (compare?: (a: any, b: any) => number) {
  return [...this].sort(compare);
}

Array.prototype.sortedAsc = function (selector: (obj: any) => any) {
  return [...this].sort((a, b) => selector(a) < selector(b) ? -1 : 1);
}

Array.prototype.sortedDesc = function (selector: (obj: any) => any) {
  return [...this].sort((a, b) => selector(a) > selector(b) ? -1 : 1);
}

Array.prototype.minBy = function (selector: (obj: any) => any) {
  return this.sortedAsc(selector).first();
}

Array.prototype.maxBy = function (selector: (obj: any) => any) {
  return this.sortedDesc(selector).first();
}

Array.prototype.indexOfMin = function () {
  return this.indexOfMinBy(it => it);
}

Array.prototype.indexOfMinBy = function (
  selector: (obj: any) => any,
  options?: { predicate?: (obj: any) => boolean },
) {
  let index = -1;
  let value = Infinity;

  this.forEach((o, i) => {
    if (options && options.predicate && !options.predicate(o)) {
      return;
    }

    const v = selector(o);
    if (v < value) {
      index = i;
      value = v;
    }
  })

  return index;
}

Array.prototype.indexOfMax = function () {
  return this.indexOfMaxBy(it => it);
}

Array.prototype.indexOfMaxBy = function (
  selector: (obj: any) => any,
  options?: { predicate?: (obj: any) => boolean },
) {
  let index = -1;
  let value = -Infinity;

  this.forEach((o, i) => {
    if (options && options.predicate && !options.predicate(o)) {
      return;
    }

    const v = selector(o);
    if (v > value) {
      index = i;
      value = v;
    }
  })

  return index;
}

export namespace Arrays {

  export function sequence(length: number, option?: { start?: number }): number[] {
    return [...Array(length)].map((_, i) => i + (option?.start ?? 0));
  }

  export function generate<T>(length: number, factory: (index: number) => T): T[] {
    return [...Array(length)].map((_, i) => factory(i));
  }

  export function concat<T>(...arrays: Array<T>[]) {
    return arrays.reduce((acc, it) => acc.concat(it));
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
      for (let j = seq.length - 1; j > x; j--) {
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
  public constructor(
    public readonly start: number,
    public readonly stop: number,
  ) {
    // no-op
  }

  public static of({start, stop}: {
    start: number,
    stop: number,
  }): NumberRange {
    return new NumberRange(start, stop);
  }

  public get length(): number {
    return Math.abs(this.stop - this.start);
  }

  public coerce(n: number): number {
    const upper = Math.max(this.start, this.stop);
    const lower = Math.min(this.start, this.stop);
    return Math.max(lower, Math.min(upper, n));
  }

  public amount(n: number): number {
    return (n - this.start) / (this.stop - this.start);
  }

  public lerp(amount: number): number {
    return this.start + amount * (this.stop - this.start);
  }

  public sample(): number {
    return this.lerp(Math.random());
  }
}

export class NumberRangeMap {
  public constructor(
    public readonly domain: NumberRange,
    public readonly target: NumberRange,
  ) {
    // no-op
  }

  public static of({domain, target}: {
    domain: NumberRange,
    target: NumberRange,
  }): NumberRangeMap {
    return new NumberRangeMap(domain, target);
  }

  public apply(n: number): number {
    const amount = this.domain.amount(n);
    return this.target.lerp(amount);
  }
}

export class IntegerRange {
  public constructor(
    public readonly start: number,
    public readonly stop: number,
  ) {
    // no-op
  }

  public static of({start, stop}: {
    start: number,
    stop: number,
  }): NumberRange {
    return new NumberRange(start, stop);
  }

  public get length(): number {
    return this.stop - this.start + 1;
  }

  public sample(): number {
    return this.start + Math.floor(Math.random() * (this.stop - this.start))
  }
}

declare global {
  interface Math {
    average(...values: number[]): number
  }
}

Math.average = function (...values: number[]) {
  return values.reduce((acc, x) => acc + x) / values.length;
}
