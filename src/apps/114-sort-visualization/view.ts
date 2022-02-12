import * as p5 from 'p5';
import { Size } from '../../lib/graphics2d';
import {
  BubbleSortMachine,
  InsertionSortMachine,
  ProcessState,
  SelectionSortMachine,
  SortMachine,
  ValueState
} from './model';

export namespace SortMachineWidgets {

  export const ColorPalette = {
    default: '#FFFFFF',
    cursor: '#FFEA86',
    pivot: '#FFCC93',
    answer: '#AAFFAA',
  };

  export function create({context, machine}: {
    context: p5,
    machine: SortMachine,
  }): SortMachineWidget {
    if (machine instanceof BubbleSortMachine) {
      return new BubbleSortMachineWidget(context, machine).also(it => {
        it.defaultColor = ColorPalette.default;
        it.cursorColor = ColorPalette.cursor;
        it.answerColor = ColorPalette.answer;
      });
    }

    if (machine instanceof SelectionSortMachine) {
      return new SelectionSortMachineWidget(context, machine).also(it => {
        it.defaultColor = ColorPalette.default;
        it.cursorColor = ColorPalette.cursor;
        it.answerColor = ColorPalette.answer;
      });
    }

    if (machine instanceof InsertionSortMachine) {
      return new InsertionSortMachineWidget(context, machine).also(it => {
        it.defaultColor = ColorPalette.default;
        it.pivotColor = ColorPalette.pivot;
        it.cursorColor = ColorPalette.cursor;
        it.answerColor = ColorPalette.answer;
      });
    }

    return new SortMachineWidget(context, machine).also(it => {
      it.defaultColor = ColorPalette.default;
      it.cursorColor = ColorPalette.cursor;
      it.answerColor = ColorPalette.answer;
    });
  }
}

export class SortMachineWidget {
  public defaultColor: string = '#FFFFFF';
  public cursorColor: string = '#FFFFFF';
  public answerColor: string = '#FFFFFF';

  constructor(
    public readonly context: p5,
    public readonly machine: SortMachine,
  ) {
    // no-op
  }

  also(mutate: (widget: SortMachineWidget) => void): SortMachineWidget {
    mutate(this);
    return this;
  }

  draw() {
    const blockSize = Size.of({
      width: this.context.width / this.machine.values.length,
      height: this.context.height / this.machine.values.length,
    });

    this.machine.values.forEach((val, i) => {
      const w = blockSize.width;
      const h = val * blockSize.height;
      const x = i * blockSize.width;
      const y = this.context.height - h;
      const color = this.color(i);
      this.context.fill(color);
      this.context.rect(x, y, w, h);
    });
  }

  protected color(i: number): string {
    if (this.machine.processState == ProcessState.done) {
      return this.answerColor;
    }
    if (this.machine.valueState(i) == ValueState.fixed) {
      return this.answerColor;
    }
    if (i == this.machine.cursor) {
      return this.cursorColor;
    }
    return this.defaultColor;
  }
}

export class BubbleSortMachineWidget extends SortMachineWidget {
  constructor(
    public readonly context: p5,
    public readonly machine: BubbleSortMachine,
  ) {
    super(context, machine);
  }

  also(mutate: (widget: BubbleSortMachineWidget) => void): BubbleSortMachineWidget {
    mutate(this);
    return this;
  }

  protected color(i: number): string {
    if (this.machine.processState == ProcessState.done) {
      return this.answerColor;
    }
    if (this.machine.valueState(i) == ValueState.fixed) {
      return this.answerColor;
    }
    if (i == this.machine.cursor) {
      return this.cursorColor;
    }
    return this.defaultColor;
  }
}

export class SelectionSortMachineWidget extends SortMachineWidget {
  constructor(
    public readonly context: p5,
    public readonly machine: SelectionSortMachine,
  ) {
    super(context, machine);
  }

  also(mutate: (widget: SelectionSortMachineWidget) => void): SelectionSortMachineWidget {
    mutate(this);
    return this;
  }

  protected color(i: number): string {
    if (this.machine.processState == ProcessState.done) {
      return this.answerColor;
    }
    if (this.machine.valueState(i) == ValueState.fixed) {
      return this.answerColor;
    }
    if (i == this.machine.cursor) {
      return this.cursorColor;
    }
    return this.defaultColor;
  }
}

export class InsertionSortMachineWidget extends SortMachineWidget {
  public pivotColor: string = '#FFFFFF';

  constructor(
    public readonly context: p5,
    public readonly machine: InsertionSortMachine,
  ) {
    super(context, machine);
  }

  also(mutate: (widget: InsertionSortMachineWidget) => void): InsertionSortMachineWidget {
    mutate(this);
    return this;
  }

  protected color(i: number): string {
    if (this.machine.processState == ProcessState.done) {
      return this.answerColor;
    }
    if (this.machine.valueState(i) == ValueState.fixed) {
      return this.answerColor;
    }
    if (i == this.machine.cursor) {
      return this.cursorColor;
    }
    if (i == this.machine.pivot) {
      return this.pivotColor;
    }
    return this.defaultColor;
  }
}
