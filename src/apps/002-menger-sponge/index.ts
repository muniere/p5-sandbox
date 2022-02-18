// https://www.youtube.com/watch?v=LG8ZK-rRkXo
import p5 from 'p5';
import { ApplicationModel } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SPONGE_SIZE: 200,
  FILL_COLOR: '#FFFFFF',
  STROKE_COLOR: '#666666',
  ROTATION_SPEED: 0.01,
});

export function sketch(context: p5) {
  let model: ApplicationModel;
  let widget: ApplicationWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.WEBGL,
    );

    model = ApplicationModel.create({
      size: Params.SPONGE_SIZE,
    }).also(it => {
      it.sponge.fillColor = Params.FILL_COLOR;
      it.sponge.strokeColor = Params.STROKE_COLOR;
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);
    context.lights();

    // widget
    widget.draw();

    // update
    model.rotate(Params.ROTATION_SPEED);
  }

  context.mouseClicked = function () {
    model.update();
  }
}
