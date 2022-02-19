// https://www.youtube.com/watch?v=AaGK-fj-BAM
import * as p5 from 'p5';
import { Size } from '../../lib/graphics2d';
import { GameModel } from './model';
import { GameWidget, GameMaster } from './view';

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

    model = GameModel.create({
      bounds: Size.of(context),
      scale: Params.GAME_SCALE,
    });

    model.snake.color = Params.SNAKE_COLOR;
    model.food.color = Params.FOOD_COLOR;

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
