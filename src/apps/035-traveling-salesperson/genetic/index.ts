import p5 from 'p5';
import { Arrays } from '../../../lib/stdlib';
import { Point, Rect, Size } from '../../../lib/graphics2d';
import { PathWidget, ProgressWidget } from '../shared/view';
import { GeneticSolver, JointCrossModel, NoiseMutationModel } from './model';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SHAPE_COLOR: '#FFFFFF',
  CANDIDATE_COLOR: '#FFFF22',
  CANDIDATE_WEIGHT: 5,
  ANSWER_COLOR: '#FF22FF',
  ANSWER_WEIGHT: 5,
  LABEL_MARGIN: 10,
  POINT_COUNT: 5,
  CONCURRENCY: 10,
  MUTATION_RATE: 0.8,
  MUTATION_DEPTH: 5,
  GENERATION_LIMIT: 100,
});

export function sketch(context: p5) {
  let solver: GeneticSolver;
  let pathWidget: PathWidget;
  let progressWidget: ProgressWidget;

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);

    solver = GeneticSolver.create({
      points: Arrays.generate(Params.POINT_COUNT, () => {
        return Point.of({
          x: Math.random() * context.width,
          y: Math.random() * context.height,
        });
      }),
      concurrency: Params.CONCURRENCY,
      cross: JointCrossModel.create(),
      mutation: new NoiseMutationModel({
        rate: Params.MUTATION_RATE,
        depth: Params.MUTATION_DEPTH,
      }),
      limit: Params.GENERATION_LIMIT,
    });

    pathWidget = new PathWidget(context);

    progressWidget = new ProgressWidget(context).also(it => {
      it.frame = Rect.of({
        origin: Point.of({
          x: Params.LABEL_MARGIN,
          y: Params.LABEL_MARGIN,
        }),
        size: Size.of({
          width: context.width - Params.LABEL_MARGIN * 2,
          height: context.height - Params.LABEL_MARGIN * 2,
        }),
      });
    });
  }

  context.draw = function () {
    // draw
    context.background(Params.CANVAS_COLOR);

    if (solver.paths && solver.hasNext) {
      solver.paths.forEach(path => {
        pathWidget.model = path;
        pathWidget.color = Params.SHAPE_COLOR;
        pathWidget.weight = 1;
        pathWidget.draw();
      });
    }

    if (solver.answer) {
      pathWidget.model = solver.answer;

      if (solver.hasNext) {
        pathWidget.color = Params.CANDIDATE_COLOR;
        pathWidget.weight = Params.CANDIDATE_WEIGHT;
      } else {
        pathWidget.color = Params.ANSWER_COLOR;
        pathWidget.weight = Params.ANSWER_WEIGHT;
      }

      pathWidget.draw();
    }

    progressWidget.model = solver.progress;
    progressWidget.draw();

    // update
    if (solver.hasNext) {
      solver.next();
    } else {
      context.noLoop();
    }
  }
}
