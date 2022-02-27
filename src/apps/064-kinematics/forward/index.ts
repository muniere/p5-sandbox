import p5 from 'p5';
import { NumberRange } from '../../../lib/stdlib';
import { Point } from '../../../lib/graphics2d';
import { FrameClock } from '../../../lib/process';
import { ApplicationModel, ChainModel } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SHAPE_COLOR: '#FFFFFF',
  CLOCK_SPEED: Math.PI / 120,
  ANCHOR_RADIUS: 10,
  ANCHOR_PHASE: -Math.PI / 2,
  LINK_COUNT: 10,
  LINK_LENGTH: 50,
  LINK_WEIGHT: 2,
  LINK_ANGLE_RANGE: new NumberRange(-Math.PI / 16, +Math.PI / 16),
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
      chain: new ChainModel({
        anchor: new Point({
          x: context.width / 2,
          y: context.height,
        })
      }).also(it => {
        it.anchor.color = Params.SHAPE_COLOR;
        it.anchor.radius = Params.ANCHOR_RADIUS;
        it.anchor.phase = Params.ANCHOR_PHASE;
      }),
      clock: new FrameClock({
        context: context,
        speed: Params.CLOCK_SPEED,
      }),
    });

    for (let i = 0; i < Params.LINK_COUNT; i++) {
      const link = model.connect({
        length: Params.LINK_LENGTH,
        angle: 0,
      });
      link.weight = Params.LINK_WEIGHT;
      link.angleRange = Params.LINK_ANGLE_RANGE;
    }

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
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
}
