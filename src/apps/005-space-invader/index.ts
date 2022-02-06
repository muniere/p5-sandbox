// https://www.youtube.com/watch?v=biN3v3ef-Y0
import * as p5 from 'p5';
import { GameContext, GameState } from "./model";
import { Point, Size } from "../../lib/graphics2d";
import { GameWidget } from "./view";

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',

  // ship
  SHIP_COLOR: '#FFFFFF',
  SHIP_RADIUS: 20,
  SHIP_SPEED: 5,

  // enemy
  ENEMY_COLOR: '#FF22FF',
  ENEMY_ORIGIN: Point.of({x: 50, y: 0}),
  ENEMY_COLUMNS: 12,
  ENEMY_ROWS: 3,
  ENEMY_SPACE: 30,
  ENEMY_RADIUS: 30,
  ENEMY_SPEED: 10,
  ENEMY_TICK: 60,

  // missile
  MISSILE_COLOR: '#00FFFF',
  MISSILE_SIZE: 20,
  MISSILE_SPEED: 5,
  MISSILE_LIMIT: 1,
});

export function sketch(context: p5) {
  let state: GameState;
  let widget: GameWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    state = GameState.create(it => {
      it.bounds = Size.of(context);

      it.shipColor = Params.SHIP_COLOR;
      it.shipRadius = Params.SHIP_RADIUS;
      it.shipSpeed = Params.SHIP_SPEED;

      it.enemyColor = Params.ENEMY_COLOR;
      it.enemyOrigin = Point.of({x: Params.ENEMY_ORIGIN.x, y: Params.ENEMY_ORIGIN.y});
      it.enemyMargin = Size.of({width: Params.ENEMY_SPACE, height: Params.ENEMY_SPACE});
      it.enemyGrid = Size.of({width: Params.ENEMY_COLUMNS, height: Params.ENEMY_ROWS});
      it.enemyRadius = Params.ENEMY_RADIUS;
      it.enemySpeed = Params.ENEMY_SPEED;

      it.enemyTick = Params.ENEMY_TICK;
      it.enemyStep = Params.ENEMY_SPEED;

      it.missileColor = Params.MISSILE_COLOR;
      it.missileRadius = Params.MISSILE_SIZE;
      it.missileSpeed = Params.MISSILE_SPEED;
      it.missileLimit = Params.MISSILE_LIMIT;
    });

    widget = new GameWidget(context, state);
  };

  context.draw = function () {
    const ctx = GameContext.create({
      frameCount: context.frameCount,
      canvasSize: Size.of(context),
      direction: (() => {
        if (!context.keyIsPressed) {
          return 0;
        }
        switch (context.keyCode) {
          case context.LEFT_ARROW:
            return -1;
          case context.RIGHT_ARROW:
            return 1;
          default:
            return 0;
        }
      })()
    });

    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    state.update(ctx);
  }

  context.keyPressed = function () {
    if (context.key == ' ') {
      state.fire();
    }
  }
}
