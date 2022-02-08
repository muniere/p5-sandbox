import * as p5 from 'p5';
import { Element } from 'p5';
import { Point } from '../../lib/graphics2d';
import { TreeState } from './model';
import { TreeWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  STROKE_COLOR: '#FFFFFF',
  STEM_LENGTH: 400,
  BRANCH_SCALE: 2 / 3,
  SLIDER_HEIGHT: 50,
});

export function sketch(context: p5) {
  let state: TreeState;
  let widget: TreeWidget;
  let slider: Element;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight - Params.SLIDER_HEIGHT,
      context.P2D,
    );
    context.noLoop();

    state = TreeState.create({
      begin: Point.of({
        x: context.width / 2,
        y: context.height,
      }),
      end: Point.of({
        x: context.width / 2,
        y: context.height - Params.STEM_LENGTH,
      }),
    });

    widget = new TreeWidget(context, state);

    slider = context.createSlider(0, Math.PI, Math.PI / 4, 0.01);
    slider.size(context.windowWidth);
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();
  }

  context.mouseClicked = function () {
    state.branch({
      angle: Number(slider.value()),
      scale: Params.BRANCH_SCALE,
    });
    context.redraw();
  }
}
