// https://www.youtube.com/watch?v=Mm2eYfj0SgA
import * as p5 from 'p5';
import { Point } from '../../lib/graphics2d';
import { ChainState, PathState, WorldState } from './model';
import { WorldWidget } from './view';
import { FrameClock } from '../../lib/process';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SHAPE_COLOR: '#FFFFFF',
  ORIGIN_X: 50,
  ORIGIN_Y: 50,
  MARGIN_X: 50,
  CLOCK_SPEED: -1 * (Math.PI / 120),
  SERIES_RADIUS: 100,
  SERIES_DEPTH: 20,
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

    state = WorldState.create({
      clock: new FrameClock({
        context: context,
        speed: Params.CLOCK_SPEED,
      }),
      chain: ChainState.create({
        amplitude: Params.SERIES_RADIUS,
        depth: Params.SERIES_DEPTH,
      }).also(it => {
        it.color = Params.SHAPE_COLOR;
      }),
      path: PathState.create({
        values: []
      }).also(it => {
        it.color = Params.SHAPE_COLOR;
      }),
    });

    widget = new WorldWidget(context).also(it => {
      it.state = state;

      it.origin = Point.of({
        x: Params.ORIGIN_X + Params.SERIES_RADIUS,
        y: Params.ORIGIN_Y + Params.SERIES_RADIUS,
      });

      it.chain.also(it => {
        it.origin = Point.zero();
      });

      it.path.also(it => {
        it.origin = Point.zero().with({
          x: Params.SERIES_RADIUS + Params.MARGIN_X,
        });
        it.scaleX = 1;
        it.scaleY = 1;
      });

      it.line.also(it => {
        it.color = Params.SHAPE_COLOR;
      });
    })
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // update
    state.update();

    // draw
    widget.draw();
  }

  context.mouseClicked = function () {
    if (context.isLooping()) {
      context.noLoop();
    } else {
      context.loop();
    }
  }
}
