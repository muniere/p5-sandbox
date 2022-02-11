// https://www.youtube.com/watch?v=GTWrWM1UsnA
import * as p5 from 'p5';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { GameState, HumanAgent, RobotAgent } from './model';
import { GameWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#FFFFFF',
  THINKING_TIME: 500,
});

export function sketch(context: p5) {
  let state: GameState;
  let widget: GameWidget;
  let human: HumanAgent;
  let robot: RobotAgent;

  context.setup = function () {
    const canvasSize = Math.min(context.windowWidth, context.windowHeight);
    context.createCanvas(canvasSize, canvasSize);
    context.noLoop();

    const frame = Rect.of({
      origin: Point.zero(),
      size: Size.of({
        width: canvasSize,
        height: canvasSize,
      }),
    });

    state = GameState.create();

    widget = new GameWidget(context).also(it => {
      it.state = state;
      it.board.frame = frame;
      it.surface.frame = frame;
    });

    human = HumanAgent.create({game: state});
    robot = RobotAgent.create({game: state});
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();
  }

  context.mousePressed = function () {
    const point = Point.of({
      x: context.mouseX,
      y: context.mouseY,
    });

    const spot = widget.getSpot(point);
    if (!spot) {
      return false;
    }

    const success = human.mark(spot);
    if (!success) {
      return;
    }

    context.redraw();

    if (!state.hasNext) {
      return;
    }

    setTimeout(() => {
      robot.mark();
      context.redraw();
    }, Params.THINKING_TIME);
  }
}
