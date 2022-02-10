// https://www.youtube.com/watch?v=u2D4sxh3MTs
import * as p5 from 'p5';
import { InterpolationMorphing, Path, WorldState } from './model';
import { WorldWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#CCCCCC',
  STROKE_COLOR: '#000000',
  RESOLUTION: 360 / 2,
  SRC_RADIUS: 150,
  SRC_VERTEX_N: 0,
  DST_RADIUS: 40,
  DST_VERTEX_N: 5,
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

    state = WorldState.create({
      morphing: InterpolationMorphing.create({
        src: Params.SRC_VERTEX_N >= 3
          ? Path.polygon({
            n: Params.SRC_VERTEX_N,
            radius: Params.SRC_RADIUS,
            resolution: Params.RESOLUTION,
          })
          : Path.circle({
            radius: Params.SRC_RADIUS,
            resolution: Params.RESOLUTION,
          }),
        dst: Params.DST_VERTEX_N >= 3
          ? Path.polygon({
            n: Params.DST_VERTEX_N,
            radius: Params.DST_RADIUS,
            resolution: Params.RESOLUTION,
          })
          : Path.circle({
            radius: Params.DST_RADIUS,
            resolution: Params.RESOLUTION,
          })
      })
    });

    widget = new WorldWidget(context, state);
    widget.color = Params.STROKE_COLOR;
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);
    context.translate(context.width / 2, context.height / 2);

    // widget
    widget.draw();

    // update
    state.update();
  }
}
