// https://www.youtube.com/watch?v=AaGK-fj-BAM
import * as p5 from 'p5';
import { Size } from '../../lib/graphics2d';
import { GameState } from './model';
import { GameWidget, GameMaster } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  SNAKE_COLOR: '#FFFFFF',
  FOOD_COLOR: '#FF22FF',
  GAME_SCALE: 20,
});

export function sketch(context: p5) {
  let state: GameState;
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

    state = GameState.create({
      bounds: Size.of(context),
      scale: Params.GAME_SCALE,
    });

    state.snake.color = Params.SNAKE_COLOR;
    state.food.color = Params.FOOD_COLOR;

    widget = new GameWidget(context, state);
    master = new GameMaster(context, state);
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    state.update();
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
