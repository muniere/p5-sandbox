// https://www.youtube.com/watch?v=LG8ZK-rRkXo
import * as p5 from 'p5';
import { SpongeState } from './model';
import { SpongeWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SPONGE_SIZE: 200,
  FILL_COLOR: '#FFFFFF',
  STROKE_COLOR: '#666666',
  ROTATION_SPEED: 0.01,
});

export function sketch(context: p5) {
  let state: SpongeState;
  let widget: SpongeWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.WEBGL,
    );

    state = SpongeState.create({
      size: Params.SPONGE_SIZE,
    }).also(it => {
      it.fillColor = Params.FILL_COLOR;
      it.strokeColor = Params.STROKE_COLOR;
    });

    widget = new SpongeWidget(context, state);
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);
    context.lights();

    // widget
    widget.draw();

    // update
    state.rotate(Params.ROTATION_SPEED);
  }

  context.mousePressed = function () {
    state.cycle();
  }
}
