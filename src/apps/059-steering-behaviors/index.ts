import p5, { Font } from 'p5';
import { DebugManager } from '../../lib/process';
import { Point } from '../../lib/graphics2d';
import { Velocity } from '../../lib/physics2d';
import { ApplicationModel, VehicleModel } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  TEXT_COLOR: '#FFFFFF',
  TEXT_WORD: 'Hello, World',
  FONT_SIZE: 128,
  VEHICLE_RADIUS: 4,
  VEHICLE_ATTRACTION_CONTROL_DISTANCE: 100,
  VEHICLE_ATTRACTION_FORCE_FACTOR: 1,
  VEHICLE_REPULSION_CONTROL_DISTANCE: 50,
  VEHICLE_REPULSION_FORCE_FACTOR: 2,
  VEHICLE_SPEED_MAX: 10,
  VEHICLE_FORCE_MAX: 1.0,
});

export function sketch(context: p5) {
  let model: ApplicationModel;
  let widget: ApplicationWidget;
  let font: Font;

  context.preload = function () {
    font = context.loadFont('Ubuntu-B.ttf')
  }

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    const points = font.textToPoints(Params.TEXT_WORD, 0, 0, Params.FONT_SIZE).map(it => new Point(it));

    const xs = points.sortedAsc(it => it.x).map(it => it.x);
    const ys = points.sortedAsc(it => it.y).map(it => it.y);

    const offset = new Point({
      x: (xs.last() - xs.first()) / 2 - context.width / 4,
      y: (ys.last() - ys.first()) / 2 + context.height / 2,
    });

    model = new ApplicationModel({
      vehicles: points.map(it => it.plus(offset)).map(anchor => {
        return new VehicleModel({
          radius: Params.VEHICLE_RADIUS,
          center: new Point({
            x: context.width / 2,
            y: context.height / 2,
          }),
          velocity: Velocity.of({
            x: Math.random(),
            y: Math.random(),
          }),
        }).also(it => {
          it.anchor = anchor.copy();
          it.attractionControlDistance = Params.VEHICLE_ATTRACTION_CONTROL_DISTANCE;
          it.attractionForceFactor = Params.VEHICLE_ATTRACTION_FORCE_FACTOR;
          it.repulsionControlDistance = Params.VEHICLE_REPULSION_CONTROL_DISTANCE;
          it.repulsionForceFactor = Params.VEHICLE_REPULSION_FORCE_FACTOR;
          it.maxSpeed = Params.VEHICLE_SPEED_MAX;
          it.maxForce = Params.VEHICLE_FORCE_MAX;
        });
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
    model.update({
      repulsion: new Point({
        x: context.mouseX,
        y: context.mouseY,
      }),
    });
  }
}
