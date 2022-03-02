// https://www.youtube.com/watch?v=KkyIDI6rQJI
import * as p5 from 'p5';
import { Arrays, Numeric } from '../../lib/stdlib';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { Point as Point3D } from '../../lib/graphics3d';
import { ApplicationModel, DropModel } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#E6E6FA',
  DROP_COLOR: '#8A2BE2',
  DROP_COUNT: 500,
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
      frame: new Rect({
        origin: Point.zero(),
        size: new Size(context),
      }),
      drops: Arrays.generate(Params.DROP_COUNT, () => {
        const origin = new Point3D({
          x: context.width * Math.random(),
          y: -500 * Math.random(),
          z: 20 * Math.random(),
        });
        const length = Numeric.map({
          value: origin.z,
          domain: Numeric.range(0, 20),
          target: Numeric.range(10, 20),
        });
        return new DropModel({origin, length});
      }),
    });
    model.color = Params.DROP_COLOR;

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
    });
  };

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    model.update();
  }
}
