// https://www.youtube.com/watch?v=17WoOqgXsRM
import * as p5 from 'p5';
import { Numeric } from '../../lib/stdlib';
import { Point as Point2D, Size as Size2D } from '../../lib/graphics2d';
import { StarFieldState } from './model';
import { StarFieldWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#111111',
  STAR_RADIUS: 5,
  STAR_COUNT: 1000,
  STAR_SPEED_MIN: 10,
  STAR_SPEED_MAX: 100,
});

export function sketch(context: p5) {
  let state: StarFieldState;
  let widget: StarFieldWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    state = StarFieldState.random({
      bounds: Size2D.of(context),
      radius: Params.STAR_RADIUS,
      count: Params.STAR_COUNT,
    });

    widget = new StarFieldWidget(context, state);
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    state.forward();
  }

  context.mouseClicked = function () {
    if (context.isLooping()) {
      context.noLoop();
    } else {
      context.loop();
    }
  }

  context.mouseMoved = function () {
    const canvasOrigin = Point2D.zero();

    const canvasCenter = Point2D.of({
      x: context.width / 2,
      y: context.height / 2,
    });

    const mousePoint = Point2D.of({
      x: context.mouseX,
      y: context.mouseY,
    });

    state.speed = Numeric.map({
      value: Point2D.dist(mousePoint, canvasCenter),
      domain: Numeric.range(0, Point2D.dist(canvasOrigin, canvasCenter)),
      target: Numeric.range(Params.STAR_SPEED_MIN, Params.STAR_SPEED_MAX),
    });
  }
}
