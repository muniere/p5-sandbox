import * as p5 from 'p5';
import { Arrays } from '../../../lib/stdlib';
import { Point, Size } from '../../../lib/graphics2d';
import { ProgressState } from '../shared/model';
import { PathWidget, ProgressWidget } from '../shared/view';
import { LexicographicSolver } from './model';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SHAPE_COLOR: '#FFFFFF',
  CANDIDATE_COLOR: '#FFFF22',
  CANDIDATE_WEIGHT: 5,
  ANSWER_COLOR: '#FF22FF',
  ANSWER_WEIGHT: 5,
  LABEL_MARGIN: 10,
  POINT_COUNT: 5,
});

export function sketch(context: p5) {
  let solver: LexicographicSolver;
  let progress: ProgressWidget;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);

    solver = LexicographicSolver.create({
      points: Arrays.generate(Params.POINT_COUNT, () => {
        return Point.of({
          x: Math.random() * context.width,
          y: Math.random() * context.height,
        });
      })
    });

    progress = ProgressWidget.create({
      context: context,
      origin: Point.of({
        x: Params.LABEL_MARGIN,
        y: Params.LABEL_MARGIN,
      }),
      size: Size.of({
        width: context.width - Params.LABEL_MARGIN * 2,
        height: context.height - Params.LABEL_MARGIN * 2,
      }),
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    if (solver.state && solver.hasNext) {
      const widget = new PathWidget(context, solver.state);
      widget.color = Params.SHAPE_COLOR;
      widget.weight = 1;
      widget.draw();
    }

    if (solver.answer) {
      const widget = new PathWidget(context, solver.answer);

      if (solver.hasNext) {
        widget.color = Params.CANDIDATE_COLOR;
        widget.weight = Params.CANDIDATE_WEIGHT;
      } else {
        widget.color = Params.ANSWER_COLOR;
        widget.weight = Params.ANSWER_WEIGHT;
      }

      widget.draw();
    }

    progress.state = ProgressState.of({
      total: solver.size,
      current: solver.count,
    });
    progress.draw();

    // update
    if (solver.hasNext) {
      solver.next();
    } else {
      context.noLoop();
    }
  }
}
