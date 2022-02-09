import * as p5 from 'p5';
import { Image } from 'p5';
import { Size } from '../../lib/graphics2d';
import { WorldState } from './model';
import { WorldWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  STROKE_COLOR: '#FFFFFF',
  SPAWN_SPEED: 10,
  SPAWN_RADIUS: 5,
  SHAPE_ALPHA: 0.05,
  CHANCE_LIMIT: 1000,
});

export function sketch(context: p5) {
  let image: Image;
  let state: WorldState;
  let widget: WorldWidget;

  context.preload = function () {
    image = context.loadImage('shape.png');
  }

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    image.loadPixels();

    state = WorldState.create({
      bounds: Size.of(context),
      image: image,
      predicate: (pixel: number[]) => context.brightness(pixel) > 1
    }).also(it => {
      it.spawnChance = Params.CHANCE_LIMIT;
      it.spawnSpeed = Params.SPAWN_SPEED;
      it.spawnRadius = Params.SPAWN_RADIUS;
    });

    widget = new WorldWidget(context, state);
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    const success = state.update();
    if (!success) {
      context.noLoop();
    }
  }
}
