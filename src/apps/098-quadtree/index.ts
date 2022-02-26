import p5 from 'p5';
import { DebugManager } from '../../lib/process';
import { Arrays } from '../../lib/stdlib';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { Force } from '../../lib/physics2d';
import { ApplicationModel, VehicleModel } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#FFFFFF',
  DIVISION_CAPACITY: 2,
  MATERIAL_COUNT: 100,
  MATERIAL_RADIUS: 10,
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

    const size = Math.min(context.width, context.height);

    model = new ApplicationModel({
      boundary: new Rect({
        origin: Point.zero(),
        size: Size.square(size),
      }),
      capacity: Params.DIVISION_CAPACITY,
    });

    widget = new ApplicationWidget(context).also(it => {
      it.model = model;
      it.fillColor = undefined;
      it.strokeColor = '#888888';
    });

    Arrays.sequence(Params.MATERIAL_COUNT).forEach(() => {
      const center = new Point({
        x: Math.random() * size,
        y: Math.random() * size,
      });

      const force = new Force({
        x: Math.random(),
        y: Math.random(),
      });

      const vehicle = new VehicleModel({
        radius: Params.MATERIAL_RADIUS,
        center: center
      }).also(it => {
        it.fillColor = '#888888';
        it.strokeColor = undefined;
        it.apply(force);
      });

      model.push(vehicle);
    });

    DebugManager.attach(context).also(it => {
      it.widget?.also(it => it.textColor = '#222222');
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
}
