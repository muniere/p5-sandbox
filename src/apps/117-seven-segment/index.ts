// https://www.youtube.com/watch?v=MlRlgbrAVOs
import * as p5 from 'p5';
import { Point, Size } from '../../lib/graphics2d';
import { DisplayModel, Patterns } from './model';
import { DisplayWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#CCCCCC',
  SEGMENT_COLOR: '#000000',
  DISPLAY_ORIGIN: 10,
  SEGMENT_WEIGHT: 20,
});

export function sketch(context: p5) {
  let model: DisplayModel;
  let widget: DisplayWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    model = new DisplayModel({
      origin: new Point({
        x: Params.DISPLAY_ORIGIN,
        y: Params.DISPLAY_ORIGIN,
      }),
      size: new Size({
        width: (context.height - Params.DISPLAY_ORIGIN * 2) / 2,
        height: context.height - Params.DISPLAY_ORIGIN * 2,
      }),
      weight: Params.SEGMENT_WEIGHT,
      color: Params.SEGMENT_COLOR,
    });

    widget = new DisplayWidget(context).also(it => {
      it.model = model;
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();
  }

  context.keyTyped = function () {
    const pattern = Patterns.get(context.key.toLowerCase());
    if (!pattern) {
      return;
    }

    model.update(pattern);
    context.redraw();
  }
}
