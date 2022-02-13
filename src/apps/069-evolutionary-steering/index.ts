import * as p5 from 'p5';
import { Arrays } from '../../lib/stdlib';
import { Point, Size } from '../../lib/graphics2d';
import {
  Clock,
  ItemFeeder,
  ItemState,
  ScoreGenome,
  SenseGenome,
  VehicleGenome,
  VehicleState,
  WorldState
} from './model';
import { WorldWidget } from './view';

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
  let state: WorldState;
  let widget: WorldWidget;

  context.setup = function () {
    context.createCanvas(
      context.windowWidth,
      context.windowHeight,
      context.P2D,
    );

    const medicines = Arrays.generate(Params.MEDICINE_COUNT, () => {
      return ItemState.create({
        radius: Params.ITEM_RADIUS,
        center: Point.of({
          x: context.width * Math.random(),
          y: context.height * Math.random(),
        }),
        score: Params.MEDICINE_SCORE,
      });
    });

    const poisons = Arrays.generate(Params.POISON_COUNT, () => {
      return ItemState.create({
        radius: Params.ITEM_RADIUS,
        center: Point.of({
          x: context.width * Math.random(),
          y: context.height * Math.random(),
        }),
        score: Params.POISON_SCORE,
      });
    });

    const vehicles = Arrays.generate(Params.VEHICLE_COUNT, () => {
      return VehicleState.create({
        radius: Params.VEHICLE_RADIUS,
        center: Point.of({
          x: context.width * Math.random(),
          y: context.height * Math.random(),
        }),
        genome: VehicleGenome.of({
          score: ScoreGenome.of({
            reward: Params.VEHICLE_REWARD_WEIGHT,
            penalty: Params.VEHICLE_PENALTY_WEIGHT,
          }),
          sense: SenseGenome.of({
            reward: Params.VEHICLE_REWARD_RADIUS,
            penalty: Params.VEHICLE_PENALTY_RADIUS,
          })
        }),
        score: Params.VEHICLE_SCORE,
      });
    });

    const clock = Clock.create({
      context: context,
      speed: Params.FEED_CLOCK,
    });

    const feeder = ItemFeeder.create({
      clock: clock,
      interval: Params.FEED_INTERVAL,
      factory: () => {
        const medicines = Arrays.generate(Params.FEED_MEDICINE_COUNT, () => {
          return ItemState.create({
            radius: Params.ITEM_RADIUS,
            center: Point.of({
              x: context.width * Math.random(),
              y: context.height * Math.random(),
            }),
            score: Params.MEDICINE_SCORE,
          });
        });

        const poisons = Arrays.generate(Params.FEED_POISON_COUNT, () => {
          return ItemState.create({
            radius: Params.ITEM_RADIUS,
            center: Point.of({
              x: context.width * Math.random(),
              y: context.height * Math.random(),
            }),
            score: Params.POISON_SCORE,
          });
        });

        return Arrays.concat(medicines, poisons);
      }
    });

    state = WorldState.create({
      bounds: Size.of(context),
      items: Arrays.concat(medicines, poisons),
      vehicles: vehicles,
      feeder: feeder,
      stress: Params.STRESS_VALUE,
    });

    widget = new WorldWidget(context).also(it => {
      it.state = state;
    });
  }

  context.draw = function () {
    // canvas
    context.background(Params.CANVAS_COLOR);

    // widget
    widget.draw();

    // update
    if (state.hasNext) {
      state.update();
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
