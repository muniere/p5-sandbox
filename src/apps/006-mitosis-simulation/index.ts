// https://www.youtube.com/watch?v=jxGS3fKPKJA
import * as p5 from 'p5';
import { Point, Size } from '../../lib/graphics2d';
import { WorldState } from './model';
import { WorldWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  CELL_RADIUS: 50,
  CELL_GROWTH: 1.01,
  CELL_COUNT: 10,
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

    state = WorldState.random({
      bounds: Size.of(context),
      radius: Params.CELL_RADIUS,
      growth: Params.CELL_GROWTH,
      count: Params.CELL_COUNT,
    });

    widget = new WorldWidget(context, state);
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    state.update();
  }

  context.mouseClicked = function () {
    const point = Point.of({
      x: context.mouseX,
      y: context.mouseY,
    });

    const index = state.findIndex(point);
    if (index >= 0) {
      state.split(index);
    }
  }
}
