import { Arrays, IntegerRange as IndexRange } from '../../lib/stdlib';

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
  quick,
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
      case SortStrategy.quick:
        return new QuickSortMachine(values);
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

export class QuickSortMachine implements SortMachine {
  private readonly _values: number[];
  private _pivotValue: number = -1;
  private _lowIndex: number = -1;
  private _highIndex: number = -1;

  private _cursor: number = -1;
  private _direction: number = 0;

  private readonly _sections: IndexRange[] = [];
  private _sectionIndex: number = 0;

  constructor(
    values: number[],
  ) {
    const section = new IndexRange(0, values.length - 1);

    this._values = [...values];
    this._sections = [section];
    this._sectionIndex = 0;
    this.prepareForSection();
  }

  private get currentSection(): IndexRange | undefined {
    return this._sections[this._sectionIndex];
  }

  get values(): number[] {
    return [...this._values];
  }

  get cursor(): number {
    return this._cursor;
  }

  get pivotIndex(): number {
    return this._values.indexOf(this._pivotValue);
  }

  get lowIndex(): number {
    return this._lowIndex;
  }

  get highIndex(): number {
    return this._highIndex;
  }

  get processState(): ProcessState {
    return this._sectionIndex >= this._sections.length ? ProcessState.done : ProcessState.wait;
  }

  valueState(index: number): ValueState {
    const section = this.currentSection;
    if (!section) {
      return ValueState.fixed;
    }

    return index < section.start ? ValueState.fixed : ValueState.unfixed;
  }

  cycle(): void {
    const section = this.currentSection;
    if (!section) {
      return;
    }

    if (section.length <= 1) {
      this._sectionIndex += 1;
      this.prepareForSection();
      return;
    }

    switch (this._direction) {
      case +1:
        if (this._cursor <= section.stop && this._values[this._cursor] < this._pivotValue) {
          this._cursor += 1;
          break;
        }

        if (this._cursor <= section.stop) {
          this._lowIndex = this._cursor;
        } else {
          // guard block for the worst pivot with the maximum value
          this._lowIndex = section.stop;
          this._values.swap(section.start, this.pivotIndex);
        }

        this._cursor = this._highIndex;
        this._direction = -1;
        break;

      case -1:
        if (this._cursor >= section.start && this._values[this._cursor] >= this._pivotValue) {
          this._cursor -= 1;
          break;
        }

        if (this._cursor >= section.start) {
          this._highIndex = this._cursor;
        } else {
          // guard block for the worst pivot with the minimum value
          this._highIndex = section.start;
          this._values.swap(section.start, this.pivotIndex);
        }

        this._cursor = this._lowIndex;
        this._direction = 1;

        if (this._lowIndex < this._highIndex) {
          this._values.swap(this._lowIndex, this._highIndex);
          this._lowIndex += 1;
          this._highIndex -= 1;
          this._cursor = this._lowIndex;
        } else {
          const newSections = this._lowIndex == section.start
            ? [
              new IndexRange(section.start, section.start),
              new IndexRange(section.start + 1, section.stop),
            ]
            : [
              new IndexRange(section.start, this._lowIndex - 1),
              new IndexRange(this._lowIndex, section.stop),
            ];
          this._sections.replace(this._sectionIndex, ...newSections);
          this.prepareForSection();
        }

        break;
    }
  }

  private prepareForSection() {
    const section = this.currentSection;
    if (!section) {
      return;
    }
    const pivotIndex = Math.floor((section.start + section.stop) / 2)
    this._pivotValue = this._values[pivotIndex];
    this._cursor = section.start;
    this._direction = 1;
    this._lowIndex = section.start;
    this._highIndex = section.stop;
  }
}
