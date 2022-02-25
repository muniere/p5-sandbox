// https://www.youtube.com/watch?v=b3g4sn5ZSnM
import * as p5 from 'p5';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { RuleModels, RuleType, SimulationModel, StatisticModel } from './model';
import { SimulationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  GAME_TYPE: RuleType.C,
  ORIGIN_X: 50,
  ORIGIN_Y: 50,
  LABEL_COLOR: '#FFFFFF',
  LABEL_MARGIN: 10,
  AXIS_COLOR: '#FFFFFF',
  CHART_COLOR: '#22FF22',
  CHART_SCALE_X: 1,
  CHART_SCALE_Y: 1,
});

export function sketch(context: p5) {
  let model: SimulationModel;
  let widget: SimulationWidget;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);

    model = new SimulationModel({
      statistic: new StatisticModel({value: 0}),
      rule: RuleModels.choose(Params.GAME_TYPE),
    });

    widget = new SimulationWidget(context).also(it => {
      it.model = model;
      it.frame = Rect.of({
        origin: Point.of({
          x: Params.ORIGIN_X,
          y: Params.ORIGIN_Y,
        }),
        size: Size.of({
          width: context.width - (Params.ORIGIN_X * 2),
          height: context.height - (Params.ORIGIN_Y * 2),
        }),
      });

      it.padding = Size.of({
        width: Params.LABEL_MARGIN,
        height: Params.LABEL_MARGIN,
      });

      it.scaleX = Params.CHART_SCALE_X;
      it.scaleY = Params.CHART_SCALE_Y;
      it.axisColor = Params.AXIS_COLOR;
      it.pointColor = Params.CHART_COLOR;
      it.strokeColor = Params.CHART_COLOR;
    });

    model.maxLength = widget.frame.width / widget.scaleX;
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    model.next();
  }

  context.mouseClicked = function () {
    if (context.isLooping()) {
      context.noLoop();
    } else {
      context.loop();
    }
  }
}
