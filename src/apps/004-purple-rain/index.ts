// https://www.youtube.com/watch?v=KkyIDI6rQJI
import * as p5 from 'p5';
import { Size as Size2D, Size } from '../../lib/graphics2d';
import { ApplicationModel, DropModel } from './model';
import { RainWidget } from './view';
import { Arrays, Numeric } from '../../lib/stdlib';
import { Point as Point3D } from '../../lib/graphics3d';

const Params = Object.freeze({
  CANVAS_COLOR: '#E6E6FA',
  DROP_COLOR: '#8A2BE2',
  DROP_COUNT: 500,
});

export function sketch(context: p5) {
  let state: ApplicationModel;
  let widget: RainWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    state = ApplicationModel.create({
      bounds: Size.of(context),
      drops: Arrays.generate(Params.DROP_COUNT, () => {
        const origin = Point3D.of({
          x: context.width * Math.random(),
          y: -500 * Math.random(),
          z: 20 * Math.random(),
        });
        const length = Numeric.map({
          value: origin.z,
          domain: Numeric.range(0, 20),
          target: Numeric.range(10, 20),
        });
        return DropModel.create({origin, length});
      }),
    });
    state.color = Params.DROP_COLOR;

    widget = new RainWidget(context, state);
  };

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    state.update();
  }
}
