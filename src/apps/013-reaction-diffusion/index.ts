// https://www.youtube.com/watch?v=BV9ny785UNc
// see http://www.karlsims.com/rd.html for details
import * as p5 from 'p5';
import { Dimen } from '../../lib/dmath';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { ApplicationModel, DefaultGridFactory, DiffusionModel, GridModel } from './model';
import { ApplicationWidget } from './view';

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
  let model: ApplicationModel;
  let widget: ApplicationWidget;

  context.setup = function () {
    const size = Math.min(context.windowWidth, context.windowHeight);

    context.createCanvas(size, size, context.P2D);
    context.pixelDensity(1);

    model = new ApplicationModel({
      grid: new GridModel({
        dimen: Dimen.of(context),
        factory: new DefaultGridFactory({
          drop: Rect.of({
            origin: Point.of({
              x: Math.floor(context.width / 2) - Params.SEED_RADIUS,
              y: Math.floor(context.height / 2) - Params.SEED_RADIUS,
            }),
            size: Size.square(Params.SEED_RADIUS),
          })
        })
      }),
      diffusion: new DiffusionModel({
        a: Params.DIFFUSION_A,
        b: Params.DIFFUSION_B,
        feed: Params.FEED_RATE,
        kill: Params.KILL_RATE,
      })
    });

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
    model.update(Params.GENERATION_SPEED);
  };
}
