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

export class MutableList<T> {

  constructor(
    public values: T[],
  ) {
    // no-op
  }

  static of<T>(values: T[]): MutableList<T> {
    return new MutableList(values);
  }

  swap(i: number, j: number) {
    const tmp = this.values[i];
    this.values[i] = this.values[j];
    this.values[j] = tmp;
  }

  reverse(start?: number, end?: number) {
    start ??= 0;
    end ??= this.values.length;
    const head = this.values.slice(0, start);
    const body = this.values.slice(start, end).reverse();
    const tail = this.values.slice(end);
    this.values = head.concat(body).concat(tail);
  }
}
