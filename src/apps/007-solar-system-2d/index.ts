// https://www.youtube.com/watch?v=l8SiJ-RmeHU
import p5 from 'p5';
import { ApplicationModel, SolarSystemModel } from './model';
import { ApplicationWidget, SolarSystemWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#000000',
});

export function sketch(context: p5) {
  let model: ApplicationModel;
  let widget: ApplicationWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    model = new ApplicationModel({
      solarSystem: SolarSystemModel.assemble(),
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
    });
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
