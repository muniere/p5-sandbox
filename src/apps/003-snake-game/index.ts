// https://www.youtube.com/watch?v=AaGK-fj-BAM
import * as p5 from 'p5';
import { IntegerRange } from '../../lib/stdlib';
import { Point, Size } from '../../lib/graphics2d';
import { FoodModel, GameModel, SnakeModel } from './model';
import { GameMaster, GameWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SNAKE_COLOR: '#FFFFFF',
  FOOD_COLOR: '#FF22FF',
  GAME_SCALE: 20,
});

export function sketch(context: p5) {
  let model: GameModel;
  let widget: GameWidget;
  let master: GameMaster;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    context.frameRate(10);
    context.noLoop();

    const xrange = new IntegerRange(0, Math.floor(context.width));
    const yrange = new IntegerRange(0, Math.floor(context.height));

    model = new GameModel({
      bounds: new Size(context),
      snake: new SnakeModel({
        scale: Params.GAME_SCALE,
      }).also(it => {
        it.color = Params.SNAKE_COLOR;
      }),
      food: new FoodModel({
        scale: Params.GAME_SCALE,
        point: new Point({
          x: xrange.sample(),
          y: yrange.sample(),
        }),
      }).also(it => {
        it.color = Params.FOOD_COLOR;
      }),
    });

    widget = new GameWidget(context).also(it => {
      it.model = model;
    });
    master = new GameMaster(context).also(it => {
      it.model = model;
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

  context.mousePressed = function () {
    if (context.isLooping()) {
      context.noLoop();
    } else {
      context.loop();
    }
  }

  context.keyPressed = function () {
    master.consumeKeyCode(context.keyCode);
  }
}
