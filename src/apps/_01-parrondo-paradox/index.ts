// https://www.youtube.com/watch?v=b3g4sn5ZSnM
import * as p5 from 'p5';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { GameType, ProgressState, SimulationState, WalletState } from './model';
import { ProgressWidget, SimulationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  GAME_TYPE: GameType.C,
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
  let simulationState: SimulationState;
  let simulationWidget: SimulationWidget;
  let progressState: ProgressState;
  let progressWidget: ProgressWidget;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);

    simulationState = SimulationState.create({
      wallet: WalletState.create({amount: 0}),
      type: Params.GAME_TYPE,
    });

    simulationState.reset();

    simulationWidget = new SimulationWidget(context).also(it => {
      it.state = simulationState;
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

      it.scaleX = Params.CHART_SCALE_X;
      it.scaleY = Params.CHART_SCALE_Y;
      it.axisColor = Params.AXIS_COLOR;
      it.pointColor = Params.CHART_COLOR;
      it.strokeColor = Params.CHART_COLOR;
    });

    simulationState.maxLength = simulationWidget.map(it => it.frame.width / it.scaleX);

    progressState = ProgressState.create({
      type: simulationState.type,
    });

    progressWidget = new ProgressWidget(context).also(it => {
      it.state = progressState;
      it.frame = Rect.of({
        origin: Point.of({
          x: Params.ORIGIN_X + Params.LABEL_MARGIN,
          y: Params.ORIGIN_Y + Params.LABEL_MARGIN,
        }),
        size: Size.of({
          width: context.width - Params.LABEL_MARGIN * 2,
          height: context.height - Params.LABEL_MARGIN * 2,
        }),
      });
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    simulationWidget.draw();
    progressWidget.draw();

    // update
    simulationState.next();
    progressState.update(simulationState.wallet)
  }

  context.mouseClicked = function () {
    if (context.isLooping()) {
      context.noLoop();
    } else {
      context.loop();
    }
  }
}
