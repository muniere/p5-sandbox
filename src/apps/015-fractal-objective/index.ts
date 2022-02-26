import p5, { Element } from 'p5';
import { Point } from '../../lib/graphics2d';
import { BranchModel, TreeModel } from './model';
import { TreeWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  STROKE_COLOR: '#FFFFFF',
  STEM_LENGTH: 400,
  BRANCH_SCALE: 2 / 3,
  SLIDER_HEIGHT: 50,
});

export function sketch(context: p5) {
  let model: TreeModel;
  let widget: TreeWidget;
  let slider: Element;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight - Params.SLIDER_HEIGHT,
      context.P2D,
    );
    context.noLoop();

    model = new TreeModel({
      root: new BranchModel({
        begin: new Point({
          x: context.width / 2,
          y: context.height,
        }),
        end: new Point({
          x: context.width / 2,
          y: context.height - Params.STEM_LENGTH,
        }),
      })
    });

    widget = new TreeWidget(context).also(it => {
      it.model = model;
    });

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
    model.branch({
      angle: Number(slider.value()),
      scale: Params.BRANCH_SCALE,
    });
    context.redraw();
  }
}
