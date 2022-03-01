import p5 from 'p5';
import { DebugManager } from '../../lib/process';
import { Point, Size } from '../../lib/graphics2d';
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
      bounds: new Size(context),
      walls: [
        // new WallModel({
        //   p1: new Point({x: 0, y: 0}),
        //   p2: new Point({x: context.width / 2, y: 0}),
        // }),
        // new WallModel({
        //   p1: new Point({x: context.width / 2, y: 0}),
        //   p2: new Point({x: context.width / 2, y: context.height}),
        // }),
        // new WallModel({
        //   p1: new Point({x: context.width / 2, y: context.height}),
        //   p2: new Point({x: 0, y: context.height}),
        // }),
        // new WallModel({
        //   p1: new Point({x: 0, y: context.height}),
        //   p2: new Point({x: 0, y: 0}),
        // }),
        new WallModel({
          p1: new Point({x: 500, y: 300}),
          p2: new Point({x: 200, y: 800}),
        }),
        new WallModel({
          p1: new Point({x: 100, y: 100}),
          p2: new Point({x: 400, y: 1200}),
        }),
        new WallModel({
          p1: new Point({x: 50, y: 100}),
          p2: new Point({x: 600, y: 300}),
        }),
        new WallModel({
          p1: new Point({x: 600, y: 200}),
          p2: new Point({x: 100, y: 400}),
        }),
      ],
      particle: new ParticleModel({
        size: Size.square(20),
        center: new Point({
          x: context.width / 4,
          y: context.height / 2,
        }),
        heading: -Math.PI / 2,
        outlook: Math.PI / 2,
        resolution: 360,
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

    if (context.keyIsDown(context.UP_ARROW)) {
      model.particle.forward(10);
    }
    if (context.keyIsDown(context.DOWN_ARROW)) {
      model.particle.backward(10);
    }
    if (context.keyIsDown(context.LEFT_ARROW)) {
      model.particle.rotate(-Math.PI / 32);
    }
    if (context.keyIsDown(context.RIGHT_ARROW)) {
      model.particle.rotate(Math.PI / 32);
    }
  }
}
