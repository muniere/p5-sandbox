import { Point } from '../../lib/graphics2d';
import { FrameClock } from '../../lib/process';

export enum ItemType {
  medicine,
  poison,
  nothing,
}

export class ItemModel {
  private readonly _radius: number;
  private readonly _center: Point;
  private readonly _score: number;

  constructor(nargs: {
    radius: number,
    center: Point,
    score: number,
  }) {
    this._radius = nargs.radius;
    this._center = nargs.center;
    this._score = nargs.score;
  }

  get radius(): number {
    return this._radius;
  }

  get center(): Point {
    return this._center;
  }

  get score(): number {
    return this._score;
  }

  get type(): ItemType {
    if (this._score == 0) {
      return ItemType.nothing;
    }
    if (this._score > 0) {
      return ItemType.medicine;
    } else {
      return ItemType.poison;
    }
  }
}

export class ItemFeeder {
  public outlet: ItemModel[] | undefined;

  private readonly _clock: FrameClock;
  private readonly _interval: number;
  private readonly _factory: () => ItemModel[];

  constructor(nargs: {
    clock: FrameClock,
    interval: number,
    factory: () => ItemModel[],
  }) {
    this._clock = nargs.clock;
    this._interval = nargs.interval;
    this._factory = nargs.factory;
  }

  also(mutate: (feeder: ItemFeeder) => void): ItemFeeder {
    mutate(this);
    return this;
  }

  perform() {
    const outlet = this.outlet;
    if (!outlet) {
      return;
    }

    if (this._clock.time() % this._interval != 0) {
      return;
    }

    outlet.push(...this._factory())
  }
}
