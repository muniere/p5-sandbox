import { Arrays } from '../../lib/stdlib';

export enum ProcessState {
  done,
  wait,
}

export enum ValueState {
  fixed,
  unfixed,
}

export interface SortMachine {
  values: number[]
  cursor: number
  state: ProcessState

  valueState(index: number): ValueState

  cycle(): void
}

export class BubbleSortMachine implements SortMachine {
  private _cursor: number = 0;
  private _stop: number = -1;

  private constructor(
    private _values: number[]
  ) {
    this._stop = _values.length - 1;
  }

  static create({count}: { count: number }): BubbleSortMachine {
    const sequence = Arrays.sequence(count, {start: 1});
    return new BubbleSortMachine(sequence.shuffled());
  }

  get values(): number[] {
    return [...this._values];
  }

  get cursor(): number {
    return this._cursor;
  }

  get state(): ProcessState {
    return this._stop <= 0 ? ProcessState.done : ProcessState.wait;
  }

  valueState(i: number): ValueState {
    return i > this._stop ? ValueState.fixed : ValueState.unfixed;
  }

  cycle(): void {
    if (this.state == ProcessState.done) {
      return;
    }

    const i = this._cursor;

    if (this._values[i] > this._values[i + 1]) {
      const temp = this._values[i];
      this._values[i] = this._values[i + 1];
      this._values[i + 1] = temp;
    }

    this._cursor += 1;

    if (this._cursor >= this._stop) {
      this._cursor = 0;
      this._stop -= 1;
    }
  }
}

export class InsertionSortMachine implements SortMachine {
  private _pivotIndex: number = -1;
  private _pivotValue: number = -1;
  private _cursor: number = 0;

  private constructor(
    private _values: number[]
  ) {
    this._pivotIndex = 1;
    this._cursor = -1;
  }

  static create({count}: { count: number }): InsertionSortMachine {
    const sequence = Arrays.sequence(count, {start: 1});
    return new InsertionSortMachine(sequence.shuffled());
  }

  get values(): number[] {
    return [...this._values];
  }

  get cursor(): number {
    return this._cursor;
  }

  get state(): ProcessState {
    return this._pivotIndex >= this._values.length ? ProcessState.done : ProcessState.wait;
  }

  valueState(i: number): ValueState {
    return this.state == ProcessState.done ? ValueState.fixed : ValueState.unfixed;
  }

  cycle(): void {
    if (this.state == ProcessState.done) {
      return;
    }
    if (this._cursor < 0 && this._values[this._pivotIndex - 1] <= this._values[this._pivotIndex]) {
      this._pivotIndex += 1;
      this._cursor = -1;
      return;
    }

    if (this._cursor < 0) {
      this._pivotValue = this._values[this._pivotIndex];
      this._cursor = this._pivotIndex;
    }

    this._values[this._cursor] = this._values[this._cursor - 1];
    this._cursor -= 1;

    if (this._cursor <= 0 || this._values[this._cursor - 1] <= this._pivotValue) {
      this._values[this._cursor] = this._pivotValue;

      this._pivotIndex += 1;
      this._cursor = -1;
      return;
    }
  }
}

export class SelectionSortMachine implements SortMachine {
  private _cursor: number = 0;
  private _target: number = 0;
  private _stop: number = -1;

  private constructor(
    private _values: number[]
  ) {
    this._stop = _values.length - 1;
  }

  static create({count}: { count: number }): SelectionSortMachine {
    const sequence = Arrays.sequence(count, {start: 1});
    return new SelectionSortMachine(sequence.shuffled());
  }

  get values(): number[] {
    return [...this._values];
  }

  get cursor(): number {
    return this._cursor;
  }

  get state(): ProcessState {
    return this._stop <= 0 ? ProcessState.done : ProcessState.wait;
  }

  valueState(i: number): ValueState {
    return i > this._stop ? ValueState.fixed : ValueState.unfixed;
  }

  cycle(): void {
    if (this.state == ProcessState.done) {
      return;
    }

    if (this._values[this._cursor] > this._values[this._target]) {
      this._target = this._cursor;
    }

    if (this._cursor >= this._stop) {
      const temp = this._values[this._stop];
      this._values[this._stop] = this.values[this._target];
      this._values[this._target] = temp;

      this._cursor = 0;
      this._target = 0;
      this._stop -= 1;
    } else {
      this._cursor += 1;
    }
  }
}
