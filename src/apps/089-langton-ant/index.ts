import p5 from 'p5';
import { DebugManager } from '../../lib/process';
import { Spot } from '../../lib/dmath';
import { Arrays, IntegerRange } from '../../lib/stdlib';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { AntModel, ApplicationModel, Direction, GridModel } from './model';
import { ApplicationWidget } from './view';

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
  let model: ApplicationModel;
  let widget: ApplicationWidget;

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

    model = new ApplicationModel({
      ants: Arrays.generate(Params.ANT_COUNT, () => {
        return new AntModel({
          spot: Spot.of({
            row: range.sample(),
            column: range.sample(),
          }),
          direction: directions.sample(),
        })
      }),
      grid: new GridModel({
        size: Params.GRID_SIZE,
      })
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
      it.frame = new Rect({
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

    DebugManager.attach(context).also(it => {
      it.widget?.also(it => it.textColor = '#000000');
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    for (let i = 0; i < Params.STEP_SIZE; i++) {
      model.update();
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
