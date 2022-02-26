// https://www.youtube.com/watch?v=enNfb6p3j_g
import p5, { Vector } from 'p5';
import { Arrays, NumberRange } from '../../lib/stdlib';
import { Point, Size } from '../../lib/graphics2d';
import { Velocity } from '../../lib/physics2d';
import { ApplicationModel, CalculationModel, VehicleModel } from './model';
import { ApplicationWidget, PathMode } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  PATH_MARGIN: 10,
  PATH_RESOLUTION: 50,
  CONTROL_COUNT: 2,
  CONTROL_RADIUS: 5,
  CONTROL_SPEED_MAX: 10,
  CONTROL_SPEED_MIN: 1,
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

    const speedRange = new NumberRange(Params.CONTROL_SPEED_MIN, Params.CONTROL_SPEED_MAX);

    model = new ApplicationModel({
      bounds: new Size(context),
      vehicles: Arrays.generate(Params.CONTROL_COUNT, () => {
        return new VehicleModel({
          radius: Params.CONTROL_RADIUS,
          center: new Point({
            x: Math.random() * context.width,
            y: Math.random() * context.height,
          }),
          velocity: new Velocity(Vector.random2D()).withMagnitude(speedRange.sample()),
        })
      }),
      calculator: new CalculationModel({
        start: new Point({
          x: Params.PATH_MARGIN,
          y: context.height / 2,
        }),
        stop: new Point({
          x: context.width - Params.PATH_MARGIN,
          y: context.height / 2,
        }),
        controls: [],
        resolution: Params.PATH_RESOLUTION,
      }),
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
      it.mode = PathMode.continuous;
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
    if (context.isLooping()) {
      context.noLoop();
    } else {
      context.loop();
    }
  }
}
