export namespace Generators {

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
