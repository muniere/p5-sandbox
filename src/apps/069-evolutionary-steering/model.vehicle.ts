import { Vector } from 'p5';
import { NumberRange } from '../../lib/stdlib';
import { Point, Rect } from '../../lib/graphics2d';
import { Acceleration, Force, Velocity } from '../../lib/physics2d';
import { ItemModel, ItemType } from './model.item';

const VehicleRule = Object.freeze({
  MAX_SPEED: 5,
  MAX_FORCE: 0.5,
});

export class BalanceGenome {
  public readonly reward: number;
  public readonly penalty: number;

  constructor(nargs: {
    reward: number,
    penalty: number,
  }) {
    this.reward = nargs.reward;
    this.penalty = nargs.penalty;
  }

  static random(): BalanceGenome {
    return new BalanceGenome({
      reward: Math.random(),
      penalty: -Math.random(),
    });
  }

  blurred(options?: { error?: number }): BalanceGenome {
    const error = options?.error ?? 0.01;
    return new BalanceGenome({
      reward: this.reward * (1.0 + (Math.random() - 0.5) * error),
      penalty: this.penalty * (1.0 + (Math.random() - 0.5) * error),
    });
  }
}

export class SensorGenome {
  public readonly rewardSight: number;
  public readonly penaltySight: number;

  constructor(nargs: {
    rewardSight: number,
    penaltySight: number,
  }) {
    this.rewardSight = nargs.rewardSight;
    this.penaltySight = nargs.penaltySight;
  }

  static random(): SensorGenome {
    return new SensorGenome({
      rewardSight: Math.random(),
      penaltySight: -Math.random(),
    });
  }

  blurred(options?: { error?: number }): SensorGenome {
    const error = options?.error ?? 0.01;
    return new SensorGenome({
      rewardSight: this.rewardSight * (1.0 + (Math.random() - 0.5) * error),
      penaltySight: this.penaltySight * (1.0 + (Math.random() - 0.5) * error),
    });
  }
}

export class VehicleGenome {
  public readonly balance: BalanceGenome;
  public readonly sensor: SensorGenome;

  constructor(nargs: {
    balance: BalanceGenome,
    sensor: SensorGenome,
  }) {
    this.balance = nargs.balance;
    this.sensor = nargs.sensor;
  }

  static random(): VehicleGenome {
    return new VehicleGenome({
      balance: BalanceGenome.random(),
      sensor: SensorGenome.random(),
    });
  }

  blurred(options?: { error?: number }): VehicleGenome {
    const error = options?.error ?? 0.01;
    return new VehicleGenome({
      balance: this.balance.blurred({error: error}),
      sensor: this.sensor.blurred({error: error}),
    });
  }
}

export class VehicleModel {
  private readonly _radius: number;
  private readonly _center: Point;
  private readonly _velocity: Velocity;
  private readonly _acceleration: Acceleration;
  private readonly _genome: VehicleGenome;
  private _scoreRange: NumberRange;
  private _score: number;
  private _generation: number = 1;
  private _age: number = 0;

  constructor(nargs: {
    radius: number,
    center: Point,
    velocity?: Velocity,
    acceleration?: Acceleration,
    genome?: VehicleGenome,
    score?: number,
  }) {
    this._radius = nargs.radius ?? 20;
    this._center = nargs.center ?? Point.zero();
    this._velocity = nargs.velocity ?? Velocity.zero();
    this._acceleration = nargs.acceleration ?? Acceleration.zero();
    this._genome = nargs.genome ?? VehicleGenome.random();
    this._scoreRange = new NumberRange(0, nargs.score ?? 0);
    this._score = this._scoreRange.stop;
  }

  get radius(): number {
    return this._radius;
  }

  get center(): Point {
    return this._center;
  }

  get velocity(): Velocity {
    return this._velocity.copy();
  }

  get acceleration(): Acceleration {
    return this._acceleration.copy();
  }

  get genome(): VehicleGenome {
    return this._genome;
  }

  get balance(): BalanceGenome {
    return this._genome.balance;
  }

  get sensor(): SensorGenome {
    return this._genome.sensor;
  }

  get alive(): boolean {
    return this._score > 0;
  }

  get score(): number {
    return this._score;
  }

  get scoreFraction(): number {
    return this._score / this._scoreRange.stop;
  }

  get grade(): number {
    return this._age * this.scoreFraction;
  }

  get generation(): number {
    return this._generation;
  }

  get age(): number {
    return this._age;
  }

  also(mutate: (vehicle: VehicleModel) => void): VehicleModel {
    mutate(this);
    return this;
  }

  collides(item: ItemModel): boolean {
    return this.distanceTo(item) < this._radius;
  }

  distanceTo(item: ItemModel): number {
    return Point.dist(this.center, item.center);
  }

  steerTo(item: ItemModel): void {
    const currentVelocity = this._velocity;
    const x = item.center.x - this._center.x;
    const y = item.center.y - this._center.y;

    const desiredVelocity = new Velocity({x, y}).withMagnitude(VehicleRule.MAX_SPEED);

    const deltaVector = Vector.sub(
      desiredVelocity.vector,
      currentVelocity.vector,
    );

    const force = new Force(deltaVector).limit(VehicleRule.MAX_FORCE);

    this.applyForce(force);
  }

  steerIn({rect, padding}: { rect: Rect, padding?: number }): boolean {
    const inset = padding ?? 0;

    const currentVelocity = this._velocity;
    const desiredVelocity = (() => {
      let x: number | undefined;
      let y: number | undefined;

      if (this._center.x < inset && currentVelocity.x < 0) {
        x = -currentVelocity.x;
      }
      if (this._center.x > rect.width - inset && currentVelocity.x > 0) {
        x = -currentVelocity.x;
      }
      if (this._center.y < inset && currentVelocity.y < 0) {
        y = -currentVelocity.y;
      }
      if (this._center.y > rect.height - inset && currentVelocity.y > 0) {
        y = -currentVelocity.y;
      }

      return new Velocity({
        x: x ?? currentVelocity.x,
        y: y ?? currentVelocity.y,
      });
    })();

    if (currentVelocity.equals(desiredVelocity)) {
      return false;
    }

    desiredVelocity.setMagnitude(VehicleRule.MAX_SPEED);

    const deltaVector = Vector.sub(
      desiredVelocity.vector,
      currentVelocity.vector,
    );

    const force = new Force(deltaVector).limit(VehicleRule.MAX_FORCE);

    this.applyForce(force);
    return true;
  }

  steerRandomly() {
    const range = new NumberRange(-1.0, 1.0);

    const x = range.sample();
    const y = range.sample();

    const force = new Force({x, y})
      .normalize()
      .withMagnitude(VehicleRule.MAX_FORCE)

    this.applyForce(force);
  }

  applyForce(force: Force) {
    this._acceleration.assign(
      force.acceleration({mass: 1})
    );
  }

  sensible(item: ItemModel): boolean {
    const distance = Point.dist(this.center, item.center);

    switch (item.type) {
      case ItemType.medicine:
        return distance < this.sensor.rewardSight;

      case ItemType.poison:
        return distance < this.sensor.penaltySight;

      case ItemType.nothing:
        return false;
    }
  }

  evaluate(item: ItemModel): number {
    const distance = Point.dist(this.center, item.center);

    switch (item.type) {
      case ItemType.medicine:
        return this.balance.reward / (distance + 1);

      case ItemType.poison:
        return this.balance.penalty / (distance + 1);

      case ItemType.nothing:
        return (this.balance.reward + this.balance.penalty) / (distance + 1);
    }
  }

  consume(item: ItemModel) {
    this._score = this._scoreRange.coerce(this._score + item.score);
  }

  penalty(value: number) {
    this._score = this._scoreRange.coerce(this._score - value);
  }

  update() {
    this._velocity.plusAssign(this._acceleration);
    this._velocity.limitAssign(VehicleRule.MAX_SPEED);
    this._center.plusAssign(this._velocity);
    this._acceleration.setMagnitude(0);
    this._age += 1;
  }

  clone({genome}: { genome: VehicleGenome }): VehicleModel {
    return new VehicleModel({
      radius: this._radius,
      center: this._center.copy(),
      velocity: this._velocity.copy(),
      acceleration: this._acceleration.copy(),
      genome: genome,
      score: this._scoreRange.stop,
    }).also(it => {
      it._generation = this._generation + 1;
    });
  }
}
