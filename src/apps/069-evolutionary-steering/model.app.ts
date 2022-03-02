import { Point, Rect } from '../../lib/graphics2d';
import { ItemFeeder, ItemModel, ItemType } from './model.item';
import { VehicleModel } from './model.vehicle';
import { Flags } from './debug';

export class ApplicationModel {
  private readonly _frame: Rect;
  private readonly _items: ItemModel[];
  private readonly _vehicles: VehicleModel[];
  private readonly _feeder?: ItemFeeder;
  private readonly _stress: number;

  constructor(nargs: {
    frame: Rect,
    items: ItemModel[],
    vehicles: VehicleModel[],
    feeder?: ItemFeeder,
    stress?: number,
  }) {
    this._frame = nargs.frame;
    this._items = [...nargs.items];
    this._vehicles = [...nargs.vehicles];
    this._feeder = nargs.feeder?.also(it => it.outlet = this._items);
    this._stress = nargs.stress ?? 0;
  }

  get bounds(): Rect {
    return this._frame.with({
      origin: Point.zero(),
    });
  }

  get items(): ItemModel[] {
    return this._items;
  }

  get vehicles(): VehicleModel[] {
    return this._vehicles;
  }

  get stress(): number {
    return this._stress;
  }

  get hasNext(): boolean {
    return this._items.filter(it => it.type != ItemType.poison).length > 0 && this._vehicles.length > 0;
  }

  update() {
    this._feeder?.perform();

    this._vehicles.forEach(vehicle => {
      const coerced = vehicle.steerIn({
        rect: this.bounds,
        padding: vehicle.radius / 2,
      });
      if (coerced) {
        vehicle.penalty(this._stress);
        vehicle.update();
        return;
      }

      const evaluate = (it: ItemModel) => vehicle.evaluate(it);
      const predicate = (it: ItemModel) => vehicle.sensible(it);

      const item = this._items.filter(predicate).maxBy(evaluate);

      if (item) {
        vehicle.steerTo(item);
      } else {
        vehicle.steerRandomly();
      }

      vehicle.update();
    });

    this._vehicles.forEach(vehicle => {
      this._items
        .removeWhere(it => vehicle.collides(it))
        .forEach(it => vehicle.consume(it));
    });

    this._vehicles.forEach(vehicle => {
      vehicle.penalty(this._stress);
    })

    const zombies = this._vehicles.removeWhere(it => !it.alive);

    if (zombies.length > 0) {
      const genome = this._vehicles.maxBy(it => it.grade).genome;

      const clones = zombies.map(parent => {
        const child = parent.clone({
          genome: genome.blurred({error: 0.05})
        });
        if (Flags.debug) {
          console.log({
            before: parent.genome,
            after: child.genome,
            generation: child.generation,
          });
        }
        return child;
      });

      this._vehicles.push(...clones);
    }
  }
}
