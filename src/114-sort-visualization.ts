// https://www.youtube.com/watch?v=67k3I2GxTH8
import * as p5 from 'p5';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  DATA_COLOR_DEFAULT: '#FFFFFF',
  DATA_COLOR_CURSOR: '#FFFF88',
  DATA_COLOR_FIXED: '#AAFFAA',
  DATA_COUNT: 100,
});

enum MachineState {
  done,
  wait,
}

enum ValueState {
  fixed,
  unfixed,
}

interface SortMachine {
  values: number[]
  cursor: number
  state: MachineState

  valueState(index: number): ValueState

  cycle(): void
}

class BubbleSortMachine implements SortMachine {
  private _cursor: number = 0;
  private _stop: number = -1;

  private constructor(
    private _values: number[]
  ) {
    this._stop = _values.length - 1;
  }

  static create({count}: { count: number }): BubbleSortMachine {
    return new BubbleSortMachine(
      Sequence.shuffled(
        Sequence.generate(count, {start: 1})
      )
    );
  }

  get values(): number[] {
    return [...this._values];
  }

  get cursor(): number {
    return this._cursor;
  }

  get state(): MachineState {
    return this._stop <= 0 ? MachineState.done : MachineState.wait;
  }

  valueState(i: number): ValueState {
    return i > this._stop ? ValueState.fixed : ValueState.unfixed;
  }

  cycle(): void {
    if (this.state == MachineState.done) {
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

class InsertionSortMachine implements SortMachine {
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
    return new InsertionSortMachine(
      Sequence.shuffled(
        Sequence.generate(count, {start: 1})
      )
    );
  }

  get values(): number[] {
    return [...this._values];
  }

  get cursor(): number {
    return this._cursor;
  }

  get state(): MachineState {
    return this._pivotIndex >= this._values.length ? MachineState.done : MachineState.wait;
  }

  valueState(i: number): ValueState {
    return this.state == MachineState.done ? ValueState.fixed : ValueState.unfixed;
  }

  cycle(): void {
    if (this.state == MachineState.done) {
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

class SelectionSortMachine implements SortMachine {
  private _cursor: number = 0;
  private _target: number = 0;
  private _stop: number = -1;

  private constructor(
    private _values: number[]
  ) {
    this._stop = _values.length - 1;
  }

  static create({count}: { count: number }): SelectionSortMachine {
    return new SelectionSortMachine(
      Sequence.shuffled(
        Sequence.generate(count, {start: 1})
      )
    );
  }

  get values(): number[] {
    return [...this._values];
  }

  get cursor(): number {
    return this._cursor;
  }

  get state(): MachineState {
    return this._stop <= 0 ? MachineState.done : MachineState.wait;
  }

  valueState(i: number): ValueState {
    return i > this._stop ? ValueState.fixed : ValueState.unfixed;
  }

  cycle(): void {
    if (this.state == MachineState.done) {
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

class Painter {

  constructor(
    private delegate: p5,
  ) {
    // no-op
  }

  static create(delegate: p5): Painter {
    return new Painter(delegate);
  }

  draw(machine: SortMachine) {
    const block = {
      width: this.delegate.width / Params.DATA_COUNT,
      height: this.delegate.height / Params.DATA_COUNT,
    };

    this.delegate.background(Params.CANVAS_COLOR);

    machine.values.forEach((val, i) => {
      const w = block.width;
      const h = val * block.height;
      const x = i * block.width;
      const y = this.delegate.height - h;
      const color = Painter.chooseColor(machine, i);
      this.delegate.fill(color);
      this.delegate.rect(x, y, w, h);
    });
  }

  private static chooseColor(machine: SortMachine, i: number): string {
    if (machine.state == MachineState.done) {
      return Params.DATA_COLOR_FIXED;
    }
    if (machine.valueState(i) == ValueState.fixed) {
      return Params.DATA_COLOR_FIXED;
    }

    return i == machine.cursor
      ? Params.DATA_COLOR_CURSOR
      : Params.DATA_COLOR_DEFAULT;
  }
}

class Sequence {

  static generate(count: number, {start}: { start?: number }): number[] {
    const offset = start || 0;
    return [...Array(count)].map((_, i) => i + offset);
  }

  static shuffled<T>(array: T[]): T[] {
    const source = [...array];
    const result = [] as T[];

    while (source.length > 0) {
      const index = Math.floor(Math.random() * source.length);
      const [value] = source.splice(index, 1);
      result.push(value);
    }

    return result;
  }
}

function sketch(self: p5) {
  let machine: SortMachine;
  let painter: Painter;
  let needsDraw: boolean = true;

  self.setup = function () {
    self.createCanvas(self.windowWidth, self.windowHeight);
    machine = InsertionSortMachine.create({count: Params.DATA_COUNT});
    painter = Painter.create(self);
  }

  self.draw = function () {
    if (!needsDraw) {
      return;
    }

    needsDraw = machine.state != MachineState.done;

    painter.draw(machine);
    machine.cycle();
  }
}

export { sketch };
