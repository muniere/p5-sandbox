// https://www.youtube.com/watch?v=MlRlgbrAVOs
import * as p5 from 'p5';
import { Point, Size } from '../../lib/graphics2d';
import { DisplayState, Patterns } from './model';
import { DisplayWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#CCCCCC',
  SEGMENT_COLOR: '#000000',
  DISPLAY_ORIGIN: 10,
  SEGMENT_WEIGHT: 20,
});

export function sketch(context: p5) {
  let state: DisplayState;
  let widget: DisplayWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    state = DisplayState.create({
      origin: Point.of({
        x: Params.DISPLAY_ORIGIN,
        y: Params.DISPLAY_ORIGIN,
      }),
      size: Size.of({
        width: (context.height - Params.DISPLAY_ORIGIN * 2) / 2,
        height: context.height - Params.DISPLAY_ORIGIN * 2,
      }),
      weight: Params.SEGMENT_WEIGHT,
      color: Params.SEGMENT_COLOR,
    });

    widget = new DisplayWidget(context, state);
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

    state.update(pattern);
    context.redraw();
  }
}
