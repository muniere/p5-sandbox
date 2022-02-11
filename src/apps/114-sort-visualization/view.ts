import * as p5 from 'p5';
import { Size } from '../../lib/graphics2d';
import { ProcessState, SortMachine, ValueState } from './model';

export class MachineWidget {
  public valueColor: string = '#FFFFFF';
  public cursorColor: string = '#FFFFFF';
  public answerColor: string = '#FFFFFF';

  constructor(
    public readonly context: p5,
    public readonly machine: SortMachine,
  ) {
    // no-op
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

  private color(i: number): string {
    if (this.machine.state == ProcessState.done) {
      return this.answerColor;
    }
    if (this.machine.valueState(i) == ValueState.fixed) {
      return this.answerColor;
    }
    if (i == this.machine.cursor) {
      return this.cursorColor;
    }
    return this.valueColor;
  }
}
