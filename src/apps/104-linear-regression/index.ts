import p5 from 'p5';
import { Point } from '../../lib/graphics2d';
import { ApplicationModel } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  POINT_COLOR: '#FFFFFF',
  LINE_COLOR: '#FFFFFF',
  LEARNING_RATE: 0.2,
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
      learningRate: Params.LEARNING_RATE,
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
      it.pointColor = Params.POINT_COLOR;
      it.lineColor = Params.LINE_COLOR;
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    model.update();
  }

  context.mouseClicked = function () {
    model.push(
      new Point({
        x: context.mouseX / context.width,
        y: context.mouseY / context.height,
      })
    );
  }
}
