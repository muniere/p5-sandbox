// https://www.youtube.com/watch?v=8Z9FRiW2Jlc
import * as p5 from 'p5';
import { Grammar, Machine, Rule } from './model';
import { MachineWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#FFFFFF',
});

export function sketch(context: p5) {
  let machine: Machine;
  let widget: MachineWidget;

  context.setup = function () {
    context.createCanvas(context.windowWidth, 200);
    context.noLoop();

    machine = Machine.create({
      grammar: Grammar.assemble([
        Rule.of("S", ["x"]),
        Rule.of("S", ["y"]),
        Rule.of("S", ["z"]),
        Rule.of("S", ["S", "+", "S"]),
        Rule.of("S", ["S", "-", "S"]),
        Rule.of("S", ["S", "/", "S"]),
        Rule.of("S", ["(", "S", ")"]),
      ]),
      seed: "S"
    })

    widget = new MachineWidget(context, machine);

    context.createButton("forward")
      .position(10, context.height + 10)
      .mousePressed(() => {
        machine.update();
        context.redraw();
      });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();
  }
}
