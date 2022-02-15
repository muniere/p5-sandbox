import p5 from 'p5';
import { Spot } from '../../lib/dmath';
import { Arrays, IntegerRange } from '../../lib/stdlib';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { AntState, Direction, GridState, WorldState } from './model';
import { WorldWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#FFFFFF',
  COLOR_BLACK: '#000000',
  COLOR_WHITE: '#FFFFFF',
  COLOR_LINE: '#CCCCCC',
  COLOR_ANT: '#FF00FF',
  ANT_COUNT: 5,
  GRID_SIZE: 500,
  STEP_SIZE: 100,
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

    const range = new IntegerRange(0, Params.GRID_SIZE - 1);
    const directions = [
      Direction.north,
      Direction.south,
      Direction.west,
      Direction.east,
    ]

    state = WorldState.create({
      ants: Arrays.generate(Params.ANT_COUNT, () => {
        return AntState.create({
          spot: Spot.of({
            row: range.sample(),
            column: range.sample(),
          }),
          direction: directions.sample(),
        })
      }),
      grid: GridState.create({
        size: Params.GRID_SIZE,
      })
    });

    widget = new WorldWidget(context).also(it => {
      it.state = state;
      it.frame = Rect.of({
        origin: Point.zero(),
        size: Size.of(context),
      });
      it.grid.also(it => {
        it.fillColor = Params.COLOR_BLACK;
        it.lineColor = Params.COLOR_LINE;
      });
      it.ant.also(it => {
        it.color = Params.COLOR_ANT;
      })
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    for (let i = 0; i < Params.STEP_SIZE; i++) {
      state.update();
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
