// https://www.youtube.com/watch?v=enNfb6p3j_g
import p5, { Vector } from 'p5';
import { Arrays, NumberRange } from '../../lib/stdlib';
import { Point, Size } from '../../lib/graphics2d';
import { Velocity } from '../../lib/physics2d';
import { BallState, BezierCurve, WorldState } from './model';
import { PathMode, WorldWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  BEZIER_MARGIN: 10,
  BEZIER_RESOLUTION: 50,
  CONTROL_COUNT: 2,
  CONTROL_RADIUS: 5,
  CONTROL_SPEED_MAX: 10,
  CONTROL_SPEED_MIN: 1,
});

export function sketch(context: p5) {
  let state: WorldState;
  let widget: WorldWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    const speedRange = new NumberRange(Params.CONTROL_SPEED_MIN, Params.CONTROL_SPEED_MAX);

    state = WorldState.create({
      bounds: Size.of(context),
      balls: Arrays.generate(Params.CONTROL_COUNT, () => {
        return BallState.create({
          radius: Params.CONTROL_RADIUS,
          center: Point.of({
            x: Math.random() * context.width,
            y: Math.random() * context.height,
          }),
          velocity: Velocity.of(Vector.random2D()).withMagnitude(speedRange.sample()),
        })
      }),
      bezier: BezierCurve.create({
        start: Point.of({
          x: Params.BEZIER_MARGIN,
          y: context.height / 2,
        }),
        stop: Point.of({
          x: context.width - Params.BEZIER_MARGIN,
          y: context.height / 2,
        }),
        controls: [],
        resolution: Params.BEZIER_RESOLUTION,
      })
    });

    widget = new WorldWidget(context).also(it => {
      it.state = state;
      it.mode = PathMode.continuous;
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    state.update();
  }
}
