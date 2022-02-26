// https://www.youtube.com/watch?v=Mm2eYfj0SgA
import p5 from 'p5';
import { DebugManager, FrameClock } from '../../lib/process';
import { Point } from '../../lib/graphics2d';
import { ApplicationModel, ChainModel, PathModel } from './model';
import { ApplicationWidget } from './view';

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
  let model: ApplicationModel;
  let widget: ApplicationWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    model = new ApplicationModel({
      clock: new FrameClock({
        context: context,
        speed: Params.CLOCK_SPEED,
      }),
      chain: ChainModel.create({
        amplitude: Params.SERIES_RADIUS,
        depth: Params.SERIES_DEPTH,
      }).also(it => {
        it.color = Params.SHAPE_COLOR;
      }),
      path: new PathModel({
        values: []
      }).also(it => {
        it.color = Params.SHAPE_COLOR;
      }),
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;

      it.origin = new Point({
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
    });

    DebugManager.attach(context);
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // update
    model.update();

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
