// https://www.youtube.com/watch?v=GTWrWM1UsnA
import * as p5 from 'p5';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { GameModel } from './model';
import { GameWidget } from './view';
import { DefaultLooper, GameMaster } from './control';

const Params = Object.freeze({
  CANVAS_COLOR: '#FFFFFF',
  THINKING_TIME: 500,
});

export function sketch(context: p5) {
  let model: GameModel;
  let widget: GameWidget;
  let master: GameMaster;

  context.setup = function () {
    const size = Math.min(context.windowWidth, context.windowHeight);
    const frame = new Rect({
      origin: Point.zero(),
      size: Size.square(size),
    });

    context.createCanvas(size, size);
    context.noLoop();

    model = new GameModel();

    widget = new GameWidget(context).also(it => {
      it.frame = frame;
      it.model = model;
    });

    master = new GameMaster(model).also(it => {
      it.frame = frame;
      it.looper = new DefaultLooper(context);
      it.thinkingTime = Params.THINKING_TIME;
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();
  }

  context.mousePressed = function () {
    master.consumeMouseClick(
      new Point({
        x: context.mouseX,
        y: context.mouseY,
      })
    );
  }
}
