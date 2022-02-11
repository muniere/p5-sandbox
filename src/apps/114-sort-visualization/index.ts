// https://www.youtube.com/watch?v=67k3I2GxTH8
import * as p5 from 'p5';
import { InsertionSortMachine, ProcessState, SortMachine } from './model';
import { MachineWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  DATA_COLOR_DEFAULT: '#FFFFFF',
  DATA_COLOR_CURSOR: '#FFFF88',
  DATA_COLOR_ANSWER: '#AAFFAA',
  DATA_COUNT: 100,
});

export function sketch(context: p5) {
  let machine: SortMachine;
  let widget: MachineWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    machine = InsertionSortMachine.create({
      count: Params.DATA_COUNT,
    });

    widget = new MachineWidget(context, machine);
    widget.valueColor = Params.DATA_COLOR_DEFAULT;
    widget.cursorColor = Params.DATA_COLOR_CURSOR;
    widget.answerColor = Params.DATA_COLOR_ANSWER;
  }

  context.draw = function () {
    if (machine.state == ProcessState.done) {
      context.noLoop();
    }

    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    machine.cycle();
  }
}
