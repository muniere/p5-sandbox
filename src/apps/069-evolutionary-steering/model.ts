import * as p5 from 'p5';
import { Vector } from 'p5';
import { NumberRange } from '../../lib/stdlib';
import { Point, Size } from '../../lib/graphics2d';
import { Acceleration, Force, Velocity } from '../../lib/physics2d';
import { Flags } from './debug';

const Rule = Object.freeze({
  MAX_SPEED: 5,
  MAX_FORCE: 0.5,
});

export class Clock {
  constructor(
    public context: p5,
    public speed: number,
  ) {
    // no-op
  }

  static create({context, speed}: {
    context: p5,
    speed: number,
  }): Clock {
    return new Clock(context, speed);
  }

  time(): number {
    return this.context.frameCount * this.speed;
  }
}

export enum ItemType {
  medicine,
  poison,
  nothing,
}

export class ItemState {
  constructor(
    public readonly radius: number,
    public readonly center: Point,
    public readonly score: number,
  ) {
    // no-op
  }

  static create({radius, center, score}: {
    radius: number,
    center: Point,
    score: number,
  }): ItemState {
    return new ItemState(radius, center, score);
  }

  get type(): ItemType {
    if (this.score == 0) {
      return ItemType.nothing;
    }
    if (this.score > 0) {
      return ItemType.medicine;
    } else {
      return ItemType.poison;
    }
  }
}

export class ScoreGenome {
  constructor(
    public readonly reward: number,
    public readonly penalty: number,
  ) {
    // no-op
  }

  static of({reward, penalty}: {
    reward: number,
    penalty: number,
  }): ScoreGenome {
    return new ScoreGenome(reward, penalty);
  }

  static random(): ScoreGenome {
    return new ScoreGenome(Math.random(), -Math.random());
  }

  blurred({error = 0.01}: { error?: number }): ScoreGenome {
    return ScoreGenome.of({
      reward: this.reward * (1.0 + (Math.random() - 0.5) * error),
      penalty: this.penalty * (1.0 + (Math.random() - 0.5) * error),
    });
  }
}

export class SenseGenome {
  constructor(
    public readonly reward: number,
    public readonly penalty: number,
  ) {
    // no-op
  }

  static of({reward, penalty}: {
    reward: number,
    penalty: number,
  }): SenseGenome {
    return new SenseGenome(reward, penalty);
  }

  static random(): SenseGenome {
    return new SenseGenome(Math.random(), -Math.random());
  }

  blurred({error = 0.01}: { error?: number }): SenseGenome {
    return SenseGenome.of({
      reward: this.reward * (1.0 + (Math.random() - 0.5) * error),
      penalty: this.penalty * (1.0 + (Math.random() - 0.5) * error),
    });
  }
}

export class VehicleGenome {
  constructor(
    public readonly score: ScoreGenome,
    public readonly sensor: SenseGenome,
  ) {
    // no-op
  }

  static of({score, sense}: {
    score: ScoreGenome,
    sense: SenseGenome,
  }): VehicleGenome {
    return new VehicleGenome(score, sense);
  }

  static random(): VehicleGenome {
    return new VehicleGenome(ScoreGenome.random(), SenseGenome.random());
  }

  blurred({error = 0.01}: { error?: number }): VehicleGenome {
    return VehicleGenome.of({
      score: this.score.blurred({error: error}),
      sense: this.sensor.blurred({error: error}),
    });
  }
}

export class VehicleState {
  private readonly _radius: number;
  private readonly _center: Point;
  private readonly _velocity: Velocity;
  private readonly _acceleration: Acceleration;
  private readonly _genome: VehicleGenome;
  private _scoreRange: NumberRange;
  private _score: number;
  private _generation: number = 1;
  private _age: number = 0;

  constructor(
    radius?: number,
    center?: Point,
    velocity?: Velocity,
    acceleration?: Acceleration,
    genome?: VehicleGenome,
    score?: number,
  ) {
    this._radius = radius ?? 20;
    this._center = center ?? Point.zero();
    this._velocity = velocity ?? Velocity.zero();
    this._acceleration = acceleration ?? Acceleration.zero();
    this._genome = genome ?? VehicleGenome.random();
    this._scoreRange = new NumberRange(0, score ?? 0);
    this._score = this._scoreRange.stop;
  }

  static create(option?: {
    radius?: number,
    center?: Point,
    velocity?: Velocity,
    acceleration?: Acceleration,
    genome?: VehicleGenome,
    score?: number,
  }): VehicleState {
    return new VehicleState(
      option?.radius,
      option?.center,
      option?.velocity,
      option?.acceleration,
      option?.genome,
      option?.score,
    );
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

  get scoreGenome(): ScoreGenome {
    return this._genome.score;
  }

  get senseGenome(): SenseGenome {
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

  also(mutate: (vehicle: VehicleState) => void): VehicleState {
    mutate(this);
    return this;
  }

  collides(item: ItemState): boolean {
    return this.distanceTo(item) < this._radius;
  }

  distanceTo(item: ItemState): number {
    return Point.dist(this.center, item.center);
  }

  steerTo(item: ItemState): void {
    const currentVelocity = this._velocity;

    const desiredVelocity = Velocity
      .of({
        x: item.center.x - this._center.x,
        y: item.center.y - this._center.y,
      })
      .withMagnitude(Rule.MAX_SPEED);

    const deltaVector = Vector.sub(
      desiredVelocity.vector,
      currentVelocity.vector,
    );

    const force = Force.of(deltaVector).limit(Rule.MAX_FORCE);

    this.applyForce(force);
  }

  steerIn({bounds, padding}: { bounds: Size, padding?: number }): boolean {
    const inset = padding ?? 0;

    const currentVelocity = this._velocity;
    const desiredVelocity = (() => {
      let x: number | undefined;
      let y: number | undefined;

      if (this._center.x < inset && currentVelocity.x < 0) {
        x = -currentVelocity.x;
      }
      if (this._center.x > bounds.width - inset && currentVelocity.x > 0) {
        x = -currentVelocity.x;
      }
      if (this._center.y < inset && currentVelocity.y < 0) {
        y = -currentVelocity.y;
      }
      if (this._center.y > bounds.height - inset && currentVelocity.y > 0) {
        y = -currentVelocity.y;
      }

      return Velocity.of({
        x: x ?? currentVelocity.x,
        y: y ?? currentVelocity.y,
      });
    })();

    if (currentVelocity.equals(desiredVelocity)) {
      return false;
    }

    desiredVelocity.setMagnitude(Rule.MAX_SPEED);

    const deltaVector = Vector.sub(
      desiredVelocity.vector,
      currentVelocity.vector,
    );

    const force = Force.of(deltaVector).limit(Rule.MAX_FORCE);

    this.applyForce(force);
    return true;
  }

  steerRandomly() {
    const range = new NumberRange(-1.0, 1.0);

    const force = Force
      .of({
        x: range.sample(),
        y: range.sample(),
      })
      .normalize()
      .withMagnitude(Rule.MAX_FORCE)

    this.applyForce(force);
  }

  applyForce(force: Force) {
    this._acceleration.assign(
      force.acceleration({mass: 1})
    );
  }

  sensible(item: ItemState): boolean {
    const distance = Point.dist(this.center, item.center);

    switch (item.type) {
      case ItemType.medicine:
        return distance < this.senseGenome.reward;

      case ItemType.poison:
        return distance < this.senseGenome.penalty;

      case ItemType.nothing:
        return false;
    }
  }

  evaluate(item: ItemState): number {
    const distance = Point.dist(this.center, item.center);

    switch (item.type) {
      case ItemType.medicine:
        return this.scoreGenome.reward / (distance + 1);

      case ItemType.poison:
        return this.scoreGenome.penalty / (distance + 1);

      case ItemType.nothing:
        return (this.scoreGenome.reward + this.scoreGenome.penalty) / (distance + 1);
    }
  }

  consume(item: ItemState) {
    this._score = this._scoreRange.coerce(this._score + item.score);
  }

  penalty(value: number) {
    this._score = this._scoreRange.coerce(this._score - value);
  }

  update() {
    this._velocity.plusAssign(this._acceleration);
    this._velocity.limitAssign(Rule.MAX_SPEED);
    this._center.plusAssign(this._velocity);
    this._acceleration.setMagnitude(0);
    this._age += 1;
  }

  clone({genome}: { genome: VehicleGenome }): VehicleState {
    return VehicleState.create({
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

export class ItemFeeder {
  public target?: ItemState[];

  private readonly _clock: Clock;
  private readonly _interval: number;
  private readonly _factory: () => ItemState[];

  constructor(
    clock: Clock,
    interval: number,
    factory: () => ItemState[],
  ) {
    this._clock = clock;
    this._interval = interval;
    this._factory = factory;
  }

  static create({clock, interval, factory}: {
    clock: Clock,
    interval: number,
    factory: () => ItemState[],
  }): ItemFeeder {
    return new ItemFeeder(clock, interval, factory);
  }

  also(mutate: (feeder: ItemFeeder) => void): ItemFeeder {
    mutate(this);
    return this;
  }

  perform() {
    const target = this.target;
    if (!target) {
      return;
    }

    if (this._clock.time() % this._interval != 0) {
      return;
    }

    target.push(...this._factory())
  }
}

export class WorldState {
  private readonly _bounds: Size;
  private readonly _items: ItemState[];
  private readonly _vehicles: VehicleState[];
  private readonly _feeder?: ItemFeeder;
  private readonly _stress: number;

  constructor(
    bounds: Size,
    items: ItemState[],
    vehicles: VehicleState[],
    feeder?: ItemFeeder,
    stress?: number,
  ) {
    this._bounds = bounds;
    this._items = [...items];
    this._vehicles = [...vehicles];
    this._feeder = feeder?.also(it => it.target = this._items);
    this._stress = stress ?? 0;
  }

  static create({bounds, items, vehicles, feeder, stress}: {
    bounds: Size,
    items: ItemState[],
    vehicles: VehicleState[],
    feeder?: ItemFeeder,
    stress?: number,
  }): WorldState {
    return new WorldState(bounds, items, vehicles, feeder, stress);
  }

  get items(): ItemState[] {
    return this._items;
  }

  get vehicles(): VehicleState[] {
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
        bounds: this._bounds,
        padding: vehicle.radius / 2,
      });
      if (coerced) {
        vehicle.penalty(this._stress);
        vehicle.update();
        return;
      }

      const evaluate = (it: ItemState) => vehicle.evaluate(it);
      const predicate = (it: ItemState) => vehicle.sensible(it);

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
