// https://www.youtube.com/watch?v=l8SiJ-RmeHU
import * as p5 from 'p5';
import { SolarSystemModel } from './model';
import { SolarSystemWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#000000',
});

export function sketch(context: p5) {
  let model: SolarSystemModel;
  let widget: SolarSystemWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    model = SolarSystemModel.assemble();
    widget = new SolarSystemWidget(context, model);
  };

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);
    context.translate(context.width / 2, context.height / 2);

    // widget
    widget.draw();

    // update
    model.update();
  }

  context.mousePressed = function () {
    if (context.isLooping()) {
      context.noLoop();
    } else {
      context.loop();
    }
  }
}
