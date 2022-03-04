import p5 from 'p5';
import { Dimen } from '../../lib/dmath';
import { DebugManager } from '../../lib/process';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { ApplicationModel } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: 0,
  RIPPLE_COLOR: 255,
  DUMPING_RATE: 0.995,
  SCALE_FACTOR: 5,
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
      dimen: new Dimen({
        width: Math.floor(context.windowWidth / Params.SCALE_FACTOR),
        height: Math.floor(context.windowHeight / Params.SCALE_FACTOR),
      }),
      dumping: Params.DUMPING_RATE,
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
      it.frame = new Rect({
        origin: Point.zero(),
        size: new Size(context)
      });
    });

    DebugManager.attach(context);
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // draw
    widget.draw();

    // update
    model.update();
  }

  context.mouseDragged = function () {
    model.drop({
      spot: {
        column: Math.floor(context.mouseX / Params.SCALE_FACTOR),
        row: Math.floor(context.mouseY / Params.SCALE_FACTOR),
      },
      value: Params.RIPPLE_COLOR,
    });
  }
}
