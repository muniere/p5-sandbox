import * as p5 from 'p5';
import { FrameClock } from '../../../lib/process';
import { Complex } from '../../../lib/cmath';
import { Point } from '../../../lib/graphics2d';
import * as data from '../shared/data';
import { ChainModel, CircleModel, PathModel } from '../shared/model';
import { ApplicationModel } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SHAPE_COLOR: '#FFFFFF',
  ORIGIN_X: 50,
  ORIGIN_Y: 50,
  MARGIN_X: 300,
  MARGIN_Y: 300,
  AMPLITUDE: 200,
});

// complex plane edition; with single complex numbers
// noinspection JSUnusedLocalSymbols
export function sketch(context: p5) {
  let model: ApplicationModel;
  let widget: ApplicationWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    const values = data.path
      .filter((it, i) => i % 10 == 0)
      .map((it) => new Complex({re: it.x, im: it.y}));

    const origin = new Point({
      x: Params.ORIGIN_X,
      y: Params.ORIGIN_Y + Params.MARGIN_Y / 2,
    });

    model = new ApplicationModel({
      clock: new FrameClock({
        context: context,
        speed: (2 * Math.PI) / values.length,
      }),
      chain: ChainModel.create({
        center: origin.plus({x: Params.MARGIN_X}),
        values: values,
        decorate: (circle: CircleModel) => {
          circle.color = Params.SHAPE_COLOR;
        }
      }),
      path: new PathModel({
        plots: [],
      }).also(it => {
        it.color = Params.SHAPE_COLOR;
        it.maxLength = Math.floor(values.length * 0.8);
      })
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
      it.origin = origin;
      it.chain.also(it => {
        it.trackWeight = .5;
        it.handWeight = .5;
        it.pointRadius = 0;
      });
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
