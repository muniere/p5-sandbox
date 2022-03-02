import p5 from 'p5';
import { DebugManager } from '../../lib/process';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { ApplicationModel, ParticleModel, WallModel } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
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

    model = new ApplicationModel({
      frame: new Rect({
        origin: Point.zero(),
        size: new Size(context)
      }),
      walls: [
        new WallModel({
          p1: new Point({x: 0, y: 0}),
          p2: new Point({x: context.width, y: 0}),
        }),
        new WallModel({
          p1: new Point({x: context.width, y: 0}),
          p2: new Point({x: context.width, y: context.height}),
        }),
        new WallModel({
          p1: new Point({x: context.width, y: context.height}),
          p2: new Point({x: 0, y: context.height}),
        }),
        new WallModel({
          p1: new Point({x: 0, y: context.height}),
          p2: new Point({x: 0, y: 0}),
        }),
        new WallModel({
          p1: new Point({x: 500, y: 300}),
          p2: new Point({x: 500, y: 800}),
        }),
        new WallModel({
          p1: new Point({x: 100, y: 100}),
          p2: new Point({x: 400, y: 1200}),
        }),
        new WallModel({
          p1: new Point({x: 200, y: 900}),
          p2: new Point({x: 700, y: 800}),
        }),
        new WallModel({
          p1: new Point({x: 800, y: 200}),
          p2: new Point({x: 100, y: 900}),
        }),
      ],
      particle: new ParticleModel({
        size: Size.square(20),
        center: new Point({
          x: context.width / 2,
          y: context.height / 2,
        }),
        rayResolution: 720,
      }),
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
    });

    DebugManager.attach(context);
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    model.update();
  }

  context.mouseMoved = function () {
    if (!model) {
      return;
    }
    model.warp(new Point({
      x: context.mouseX,
      y: context.mouseY,
    }));
  }
}
