// https://www.youtube.com/watch?v=BV9ny785UNc
// see http://www.karlsims.com/rd.html for details
import * as p5 from 'p5';
import { Size } from '../../lib/graphics2d';
import { Diffusion, WorldState } from './model';
import { WorldWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  CANVAS_LIMIT: 400,
  DIFFUSION_A: 1.0,
  DIFFUSION_B: 0.5,
  FEED_RATE: 0.055,
  KILL_RATE: 0.062,
  SEED_RADIUS: 4,
  GENERATION_SPEED: 10,
});

export function sketch(context: p5) {
  let state: WorldState;
  let widget: WorldWidget;

  context.setup = function () {
    const size = Math.min(context.windowWidth, context.windowHeight, Params.CANVAS_LIMIT);

    context.createCanvas(size, size, context.P2D);
    context.pixelDensity(1);

    state = WorldState.create({
      bounds: Size.of({
        width: context.width,
        height: context.height,
      }),
      drop: Size.of({
        width: Params.SEED_RADIUS,
        height: Params.SEED_RADIUS,
      }),
      diffusion: Diffusion.create({
        a: Params.DIFFUSION_A,
        b: Params.DIFFUSION_B,
        feed: Params.FEED_RATE,
        kill: Params.KILL_RATE,
      })
    });

    widget = new WorldWidget(context, state);
  };

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    state.update(Params.GENERATION_SPEED);
  };
}
