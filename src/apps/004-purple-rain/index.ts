// https://www.youtube.com/watch?v=KkyIDI6rQJI
import * as p5 from 'p5';
import { Size } from '../../lib/graphics2d';
import { RainState } from './model';
import { RainWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#E6E6FA',
  DROP_COLOR: '#8A2BE2',
  DROP_COUNT: 500,
});

export function sketch(context: p5) {
  let state: RainState;
  let widget: RainWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    state = RainState.random({
      bounds: Size.of(context),
      count: Params.DROP_COUNT,
    });
    state.color = Params.DROP_COLOR;

    widget = new RainWidget(context, state);
  };

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    state.forward();
  }
}
