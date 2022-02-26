// https://www.youtube.com/watch?v=aKYlikFAV4k
import * as p5 from 'p5';
import { Spot } from '../../lib/dmath';
import { Size } from '../../lib/graphics2d';
import { GraphModels, ManhattanHeuristicFunction, NodeKind, SolverModel, SolverState } from './model';
import { SolverWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  SPOT_BASE_COLOR: '#FFFFFF',
  SPOT_WALL_COLOR: '#000000',
  SPOT_OPEN_COLOR: '#FFAAAA',
  SPOT_CLOSED_COLOR: '#AAFFAA',
  SPOT_ANSWER_COLOR: '#AAAAFF',
  GRID_SCALE: 50,
  WALL_RATE: 0.4,
});

export function sketch(context: p5) {
  let model: SolverModel;
  let widget: SolverWidget;

  context.setup = function () {
    const size = Math.min(context.windowWidth, context.windowHeight);

    context.createCanvas(size, size);

    model = new SolverModel({
      graph: GraphModels.generate({
        bounds: new Size(context),
        scale: Params.GRID_SCALE,
        kind: (spot: Spot) => {
          if (spot.row == 0 && spot.column == 0) {
            return NodeKind.path;
          }
          if (spot.row == Params.GRID_SCALE - 1 && spot.column == Params.GRID_SCALE - 1) {
            return NodeKind.path;
          }
          return Math.random() > Params.WALL_RATE ? NodeKind.path : NodeKind.wall;
        }
      }),
      heuristic: new ManhattanHeuristicFunction(),
    });

    widget = new SolverWidget(context).also(it => {
      it.model = model;
      it.baseColor = Params.SPOT_BASE_COLOR;
      it.wallColor = Params.SPOT_WALL_COLOR;
      it.openColor = Params.SPOT_OPEN_COLOR;
      it.closedColor = Params.SPOT_CLOSED_COLOR;
      it.answerColor = Params.SPOT_ANSWER_COLOR;
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    const state = model.state;

    if (state == SolverState.noSolution) {
      console.log('noSolution');
      context.noLoop();
      return;
    }

    if (state == SolverState.solved) {
      console.log('solved');
      context.noLoop();
      return;
    }

    model.next();
  }
}
