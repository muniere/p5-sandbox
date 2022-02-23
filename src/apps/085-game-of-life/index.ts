// https://www.youtube.com/watch?v=FWSR_7kZuYg
import * as p5 from 'p5';
import { DebugManager } from '../../lib/process';
import { Dimen } from '../../lib/dmath';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { ApplicationModel, State } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  ALIVE_COLOR: '#000000',
  DEAD_COLOR: '#FFFFFF',
  BORDER_COLOR: '#888888',
  WORLD_SPEED: 30,
  WORLD_SIZE: 50,
  SEED_RATE: 0.2,
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
    context.frameRate(Params.WORLD_SPEED);

    model = new ApplicationModel({
      dimen: Dimen.square(Params.WORLD_SIZE),
      factory: () => Math.random() < Params.SEED_RATE ? State.alive : State.dead,
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
      it.frame = Rect.of({
        origin: Point.zero(),
        size: Size.square(
          Math.min(context.width, context.height)
        ),
      });
      it.aliveColor = Params.ALIVE_COLOR;
      it.deadColor = Params.DEAD_COLOR;
      it.borderColor = Params.BORDER_COLOR;
    });

    DebugManager.attach(context).also(it => {
      it.widget?.also(it => {
        it.textColor = '#3b3b3b';
        it.textSize = 16;
      });
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    model.update();
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
