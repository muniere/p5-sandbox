// https://www.youtube.com/watch?v=67k3I2GxTH8
import * as p5 from 'p5';
import { Arrays } from '../../lib/stdlib';
import { ProcessMode, ProcessState, SortMachine, SortMachines, SortStrategy } from './model';
import { SortMachineWidget, SortMachineWidgets } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  DATA_COUNT: 50,
  STRATEGY: SortStrategy.quick,
  PROCESS_MODE: ProcessMode.auto,
});

export function sketch(context: p5) {
  let machine: SortMachine;
  let widget: SortMachineWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    const sequence = Arrays.sequence(Params.DATA_COUNT, {start: 1});

    machine = SortMachines.create({
      strategy: Params.STRATEGY,
      values: sequence.shuffled(),
    });

    widget = SortMachineWidgets.create({
      context: context,
      machine: machine,
    });

    switch (Params.PROCESS_MODE) {
      case ProcessMode.auto:
        break;

      case ProcessMode.manual:
        context.noLoop();
        break;
    }
  }

  context.draw = function () {
    if (machine.processState == ProcessState.done) {
      context.noLoop();
    }

    switch (Params.PROCESS_MODE) {
      case ProcessMode.auto:
        // canvas
        context.background(Params.CANVAS_COLOR);

        // widget
        widget.draw();

        // update
        machine.cycle();
        break;

      case ProcessMode.manual:
        // canvas
        context.background(Params.CANVAS_COLOR);

        // widget
        widget.draw();
        break;
    }
  }

  context.mouseClicked = function () {
    switch (Params.PROCESS_MODE) {
      case ProcessMode.auto:
        if (context.isLooping()) {
          context.noLoop();
        } else {
          context.loop();
        }
        break;

      case ProcessMode.manual:
        machine.cycle();
        context.redraw();
        break;
    }
  }
}
