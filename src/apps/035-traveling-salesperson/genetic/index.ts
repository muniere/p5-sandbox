import * as p5 from 'p5';
import { Arrays } from '../../../lib/stdlib';
import { Point, Size } from '../../../lib/graphics2d';
import { ProgressState } from '../shared/model';
import { PathWidget, ProgressWidget } from '../shared/view';
import { GeneticSolver, JointCross, NoiseMutation } from './model';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SHAPE_COLOR: '#FFFFFF',
  CANDIDATE_COLOR: '#FFFF22',
  CANDIDATE_WEIGHT: 5,
  ANSWER_COLOR: '#FF22FF',
  ANSWER_WEIGHT: 5,
  LABEL_MARGIN: 10,
  POINT_COUNT: 5,
  CROWD_BREADTH: 10,
  MUTATION_RATE: 0.8,
  MUTATION_DEPTH: 5,
  GENERATION_LIMIT: 100,
});

export function sketch(context: p5) {
  let solver: GeneticSolver;
  let progress: ProgressWidget;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);

    solver = GeneticSolver.create({
      breadth: Params.CROWD_BREADTH,
      points: Arrays.generate(Params.POINT_COUNT, () => {
        return Point.of({
          x: Math.random() * context.width,
          y: Math.random() * context.height,
        });
      }),
      cross: JointCross.create(),
      mutation: NoiseMutation.create({
        rate: Params.MUTATION_RATE,
        depth: Params.MUTATION_DEPTH,
      }),
      limit: Params.GENERATION_LIMIT,
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
    // draw
    context.background(Params.CANVAS_COLOR);

    if (solver.state && solver.hasNext) {
      solver.state.forEach(path => {
        const widget = new PathWidget(context, path);
        widget.color = Params.SHAPE_COLOR;
        widget.weight = 1;
        widget.draw();
      });
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
      total: solver.limit,
      current: solver.generation,
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
