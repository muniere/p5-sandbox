// https://www.youtube.com/watch?v=FWSR_7kZuYg
import * as p5 from 'p5';
import { Point, Size } from '../../lib/graphics2d';
import { CellState, WorldState } from './model';
import { WorldWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  ALIVE_COLOR: '#000000',
  DEAD_COLOR: '#FFFFFF',
  BORDER_COLOR: '#888888',
  WORLD_SPEED: 2,
  WORLD_SIZE: 20,
  SEED_RATE: 0.2,
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
    context.frameRate(Params.WORLD_SPEED);
    context.noLoop();

    state = WorldState.create({
      width: Params.WORLD_SIZE,
      height: Params.WORLD_SIZE,
      factory: _ => Math.random() < Params.SEED_RATE ? CellState.alive : CellState.dead,
    });

    widget = WorldWidget.create({
      context: context,
      origin: Point.zero(),
      size: Size.square(
        Math.min(context.width, context.height)
      ),
    });

    widget.aliveColor = Params.ALIVE_COLOR;
    widget.deadColor = Params.DEAD_COLOR;
    widget.borderColor = Params.BORDER_COLOR;
    widget.state = state;
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    state.update();
  }

  context.mouseClicked = function () {
    if (context.isLooping()) {
      context.noLoop();
    } else {
      context.loop();
    }
  }

  context.mouseClicked = function () {
    if (context.isLooping()) {
      context.noLoop();
    } else {
      context.loop();
    }
  }
}
