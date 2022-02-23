// https://www.youtube.com/watch?v=u2D4sxh3MTs
import p5 from 'p5';
import { DebugManager } from '../../lib/process';
import { ApplicationModel, InterpolationMorphing, PathModels } from './model';
import { ApplicationWidget } from './view';

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
  let model: ApplicationModel;
  let widget: ApplicationWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    model = new ApplicationModel({
      morphing: new InterpolationMorphing({
        src: Params.SRC_VERTEX_N >= 3
          ? PathModels.polygon({
            n: Params.SRC_VERTEX_N,
            radius: Params.SRC_RADIUS,
            resolution: Params.RESOLUTION,
          })
          : PathModels.circle({
            radius: Params.SRC_RADIUS,
            resolution: Params.RESOLUTION,
          }),
        dst: Params.DST_VERTEX_N >= 3
          ? PathModels.polygon({
            n: Params.DST_VERTEX_N,
            radius: Params.DST_RADIUS,
            resolution: Params.RESOLUTION,
          })
          : PathModels.circle({
            radius: Params.DST_RADIUS,
            resolution: Params.RESOLUTION,
          })
      })
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
      it.color = Params.STROKE_COLOR;
    });

    DebugManager.attach(context).also(it => {
      it.widget?.also(it => it.textColor = '#000000')
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);
    context.translate(context.width / 2, context.height / 2);

    // widget
    widget.draw();

    // update
    model.update();
  }
}
