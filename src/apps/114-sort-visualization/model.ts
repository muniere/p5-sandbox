import { Arrays } from '../../lib/stdlib';

export enum ProcessMode {
  auto,
  manual,
}

export enum ProcessState {
  done,
  wait,
}

export enum ValueState {
  fixed,
  unfixed,
}

export interface SortMachine {
  readonly values: number[]
  readonly cursor: number
  readonly processState: ProcessState

  valueState(index: number): ValueState

  cycle(): void
}

export enum SortStrategy {
  bubble,
  selection,
  insertion,
}

export namespace SortMachines {

  export function create({strategy, values}: {
    strategy: SortStrategy,
    values: number[],
  }): SortMachine {
    switch (strategy) {
      case SortStrategy.bubble:
        return new BubbleSortMachine(values);
      case SortStrategy.selection:
        return new SelectionSortMachine(values);
      case SortStrategy.insertion:
        return new InsertionSortMachine(values);
    }
  }
}

export class BubbleSortMachine implements SortMachine {
  private readonly _values: number[];
  private _cursor: number = 0;
  private _stop: number = -1;

  constructor(
    values: number[]
  ) {
    this._values = [...values];
    this._stop = values.length - 1;
  }

  get values(): number[] {
    return [...this._values];
  }

  get cursor(): number {
    return this._cursor;
  }

  get processState(): ProcessState {
    return this._stop <= 0 ? ProcessState.done : ProcessState.wait;
  }

  valueState(i: number): ValueState {
    return i > this._stop ? ValueState.fixed : ValueState.unfixed;
  }

  cycle(): void {
    if (this.processState == ProcessState.done) {
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

export class SelectionSortMachine implements SortMachine {
  private readonly _values: number[];
  private _cursor: number = 0;
  private _target: number = 0;
  private _stop: number = -1;

  constructor(
    values: number[]
  ) {
    this._values = [...values];
    this._stop = values.length - 1;
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

  get processState(): ProcessState {
    return this._stop <= 0 ? ProcessState.done : ProcessState.wait;
  }

  valueState(i: number): ValueState {
    return i > this._stop ? ValueState.fixed : ValueState.unfixed;
  }

  cycle(): void {
    if (this.processState == ProcessState.done) {
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

export class InsertionSortMachine implements SortMachine {
  private readonly _values: number[];
  private _pivotIndex: number = -1;
  private _pivotValue: number = -1;
  private _cursor: number = -1;

  constructor(
    values: number[]
  ) {
    this._values = [...values];
    this._pivotIndex = 1;
    this._cursor = 1;
  }

  get values(): number[] {
    return [...this._values];
  }

  get cursor(): number {
    return this._cursor;
  }

  get processState(): ProcessState {
    return this._pivotIndex >= this._values.length ? ProcessState.done : ProcessState.wait;
  }

  valueState(i: number): ValueState {
    return this.processState == ProcessState.done ? ValueState.fixed : ValueState.unfixed;
  }

  cycle(): void {
    if (this.processState == ProcessState.done) {
      return;
    }
    if (this._cursor <= 0) {
      this._values[this._cursor] = this._pivotValue;
      this._pivotIndex += 1;
      this._cursor = this._pivotIndex;
      return;
    }

    if (this._cursor == this._pivotIndex) {
      this._pivotValue = this._values[this._pivotIndex];
    }

    if (this._cursor == this._pivotIndex && this._values[this._pivotIndex - 1] <= this._values[this._pivotIndex]) {
      this._pivotIndex += 1;
      this._cursor = this._pivotIndex;
      return;
    }

    if (this._values[this._cursor - 1] <= this._pivotValue) {
      this._values[this._cursor] = this._pivotValue;
      this._pivotIndex += 1;
      this._cursor = this._pivotIndex;
      return;
    }

    this._values[this._cursor] = this._values[this._cursor - 1];
    this._cursor -= 1;
  }

  get pivot(): number {
    return this._pivotIndex;
  }
}
