import p5, { Element } from 'p5';
import { TreeWidget } from './view';
import { TreeModel } from './model';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  STROKE_COLOR: '#FFFFFF',
  STEM_SCALE: 1 / 3,
  BRANCH_SCALE: 2 / 3,
  LENGTH_LIMIT: 4,
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
      length: context.height * Params.STEM_SCALE,
      scale: Params.BRANCH_SCALE,
      limit: Params.LENGTH_LIMIT,
    });

    widget = new TreeWidget(context).also(it => {
      it.model = model;
    });

    slider = context.createSlider(0, Math.PI, Math.PI / 4, 0.01);
    slider.size(context.windowWidth);
    // @ts-ignore
    slider.elt.oninput = () => {
      widget.angle = Number(slider.value());
      context.redraw();
    };
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);
    context.stroke(Params.STROKE_COLOR);
    context.translate(context.width / 2, context.height);

    // widget
    widget.draw();
  }
}
