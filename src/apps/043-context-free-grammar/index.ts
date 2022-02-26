// https://www.youtube.com/watch?v=8Z9FRiW2Jlc
import p5 from 'p5';
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

    machine = new Machine({
      grammar: Grammar.assemble([
        new Rule({token: "S", phrase: ["x"]}),
        new Rule({token: "S", phrase: ["y"]}),
        new Rule({token: "S", phrase: ["z"]}),
        new Rule({token: "S", phrase: ["S", "+", "S"]}),
        new Rule({token: "S", phrase: ["S", "-", "S"]}),
        new Rule({token: "S", phrase: ["S", "/", "S"]}),
        new Rule({token: "S", phrase: ["(", "S", ")"]}),
      ]),
      seed: "S"
    })

    widget = new MachineWidget(context).also(it => {
      it.model = machine;
    });

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
