import p5 from 'p5';
import { Arrays } from '../../lib/stdlib';
import { FrameClock } from '../../lib/process';
import { Point, Size } from '../../lib/graphics2d';
import { ItemFeeder, ItemModel } from './model.item';
import { BalanceGenome, SensorGenome, VehicleGenome, VehicleModel } from './model.vehicle';
import { ApplicationModel } from './model.app';
import { ApplicationWidget } from './view';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',

  ITEM_RADIUS: 5,
  MEDICINE_COUNT: 50,
  MEDICINE_SCORE: 20,
  POISON_COUNT: 10,
  POISON_SCORE: -20,

  VEHICLE_COUNT: 5,
  VEHICLE_RADIUS: 20,
  VEHICLE_SCORE: 100,
  VEHICLE_REWARD_WEIGHT: 1.0,
  VEHICLE_PENALTY_WEIGHT: -0.5,
  VEHICLE_REWARD_RADIUS: 100,
  VEHICLE_PENALTY_RADIUS: 75,

  FEED_CLOCK: 1,
  FEED_INTERVAL: 60,
  FEED_MEDICINE_COUNT: 5,
  FEED_POISON_COUNT: 5,
  STRESS_VALUE: 0.2,
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

    const medicines = Arrays.generate(Params.MEDICINE_COUNT, () => {
      return new ItemModel({
        radius: Params.ITEM_RADIUS,
        center: new Point({
          x: context.width * Math.random(),
          y: context.height * Math.random(),
        }),
        score: Params.MEDICINE_SCORE,
      });
    });

    const poisons = Arrays.generate(Params.POISON_COUNT, () => {
      return new ItemModel({
        radius: Params.ITEM_RADIUS,
        center: new Point({
          x: context.width * Math.random(),
          y: context.height * Math.random(),
        }),
        score: Params.POISON_SCORE,
      });
    });

    const vehicles = Arrays.generate(Params.VEHICLE_COUNT, () => {
      return new VehicleModel({
        radius: Params.VEHICLE_RADIUS,
        center: new Point({
          x: context.width * Math.random(),
          y: context.height * Math.random(),
        }),
        genome: new VehicleGenome({
          balance: new BalanceGenome({
            reward: Params.VEHICLE_REWARD_WEIGHT,
            penalty: Params.VEHICLE_PENALTY_WEIGHT,
          }),
          sensor: new SensorGenome({
            rewardSight: Params.VEHICLE_REWARD_RADIUS,
            penaltySight: Params.VEHICLE_PENALTY_RADIUS,
          })
        }),
        score: Params.VEHICLE_SCORE,
      });
    });

    const clock = new FrameClock({
      context: context,
      speed: Params.FEED_CLOCK,
    });

    const feeder = new ItemFeeder({
      clock: clock,
      interval: Params.FEED_INTERVAL,
      factory: () => {
        const medicines = Arrays.generate(Params.FEED_MEDICINE_COUNT, () => {
          return new ItemModel({
            radius: Params.ITEM_RADIUS,
            center: new Point({
              x: context.width * Math.random(),
              y: context.height * Math.random(),
            }),
            score: Params.MEDICINE_SCORE,
          });
        });

        const poisons = Arrays.generate(Params.FEED_POISON_COUNT, () => {
          return new ItemModel({
            radius: Params.ITEM_RADIUS,
            center: new Point({
              x: context.width * Math.random(),
              y: context.height * Math.random(),
            }),
            score: Params.POISON_SCORE,
          });
        });

        return Arrays.concat(medicines, poisons);
      }
    });

    model = new ApplicationModel({
      bounds: new Size(context),
      items: Arrays.concat(medicines, poisons),
      vehicles: vehicles,
      feeder: feeder,
      stress: Params.STRESS_VALUE,
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
    if (model.hasNext) {
      model.update();
    } else {
      context.noLoop();
    }
  }

  context.mouseClicked = function () {
    if (context.isLooping()) {
      context.noLoop();
    } else {
      context.loop();
    }
  }
}
