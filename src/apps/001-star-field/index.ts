// https://www.youtube.com/watch?v=17WoOqgXsRM
import p5 from 'p5';
import { Arrays, Numeric } from '../../lib/stdlib';
import { Point as Point2D } from '../../lib/graphics2d';
import { Point as Point3D } from '../../lib/graphics3d';
import { StarFieldModel, StarModel } from './model';
import { StarFieldWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#111111',
  STAR_RADIUS: 5,
  STAR_COUNT: 1000,
  STAR_SPEED_MIN: 10,
  STAR_SPEED_MAX: 100,
});

export function sketch(context: p5) {
  let model: StarFieldModel;
  let widget: StarFieldWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    model = StarFieldModel.create({
      stars: Arrays.generate(Params.STAR_COUNT, () => {
        return StarModel.create({
          radius: Params.STAR_RADIUS,
          center: Point3D.of({
            x: Math.floor(context.width * (Math.random() - 0.5)),
            y: Math.floor(context.height * (Math.random() - 0.5)),
            z: Math.random() * context.width,
          }),
        });
      })
    });

    widget = new StarFieldWidget(context).also(it => {
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

    model.speed = Numeric.map({
      value: Point2D.dist(mousePoint, canvasCenter),
      domain: Numeric.range(0, Point2D.dist(canvasOrigin, canvasCenter)),
      target: Numeric.range(Params.STAR_SPEED_MIN, Params.STAR_SPEED_MAX),
    });
  }
}
