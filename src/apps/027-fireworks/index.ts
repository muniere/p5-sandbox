import p5 from 'p5';
import { Arrays, Numeric } from '../../lib/stdlib';
import { Size } from '../../lib/graphics2d';
import { Acceleration } from '../../lib/physics2d';
import { ApplicationModel, FireworkModel, RandomExplosionModel, RandomIgnitionModel } from './model';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#22222255',
  PARTICLE_COLOR: '#FFFFFF',
  FIREWORKS_COUNT: 20,
  FIREWORKS_RADIUS_RANGE: Numeric.range(4, 8),
  FIREWORKS_SPEED_RANGE: Numeric.range(-6, -14),
  FIREWORKS_LIFESPAN_RANGE: Numeric.range(200, 500),
  EXPLOSION_SCALE: 1 / 3,
  EXPLOSION_COUNT: 50,
  EXPLOSION_SPEED_RANGE: Numeric.range(-2, 2),
  GRAVITY_VALUE: 0.1,
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
      bounds: Size.of(context),
      gravity: Acceleration.of({
        x: 0,
        y: Params.GRAVITY_VALUE,
      }),
      ignition: RandomIgnitionModel.create().also(it => {
        it.radiusRange = Params.FIREWORKS_RADIUS_RANGE;
        it.speedRange = Params.FIREWORKS_SPEED_RANGE;
        it.lifespanRange = Params.FIREWORKS_LIFESPAN_RANGE;
      }),
      fireworks: Arrays.generate(Params.FIREWORKS_COUNT, () => {
        return new FireworkModel({
          explosion: RandomExplosionModel.create().also(it => {
            it.count = Params.EXPLOSION_COUNT;
            it.scale = Params.EXPLOSION_SCALE;
            it.range = Params.EXPLOSION_SPEED_RANGE;
          }),
        });
      }),
    });

    widget = new ApplicationWidget(context).also(it => {
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
}
