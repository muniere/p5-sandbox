import * as p5 from 'p5';
import { Arrays } from '../../lib/stdlib';
import { Point } from '../../lib/graphics2d';

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

export class CircleState {
  public color: string = '#FFFFFF';
  public angle: number = 0;

  constructor(
    public center: Point,
    public radius: number,
  ) {
    // no-op
  }

  static create({center, radius}: {
    center: Point,
    radius: number,
  }): CircleState {
    return new CircleState(center, radius);
  }

  get epicycleCenter(): Point {
    return Point.of({
      x: this.center.x + this.radius * Math.cos(this.angle),
      y: this.center.y + this.radius * Math.sin(this.angle),
    });
  }

  also(mutate: (circle: CircleState) => void): CircleState {
    mutate(this);
    return this;
  }
}

export class ChainState {
  public constructor(
    public circles: CircleState[],
  ) {
    // no-op
  }

  static create({amplitude, depth}: {
    amplitude: number,
    depth: number,
  }): ChainState {
    const circles = Arrays.generate(depth, (i) => {
      const n = i * 2 + 1;
      return CircleState.create({
        center: Point.zero(),
        radius: amplitude / n,
      });
    });

    return new ChainState(circles);
  }

  also(mutate: (wave: ChainState) => void): ChainState {
    mutate(this);
    return this;
  }

  set color(value: string) {
    this.circles.forEach(it => it.color = value);
  }

  first(): CircleState {
    return this.circles.first();
  }

  last(): CircleState {
    return this.circles.last();
  }

  update(clock: Clock) {
    const time = clock.time();

    let center = Point.zero();

    this.circles.forEach((circle, i) => {
      const n = i * 2 + 1;
      circle.center = center;
      circle.angle = n * time;
      center = circle.epicycleCenter;
    });
  }
}

export class PathState {
  public color: string = '#FFFFFF';
  public maxLength: number = -1;

  constructor(
    public readonly values: number[],
  ) {
    // no-op
  }

  static empty(): PathState {
    return new PathState([]);
  }

  static create({values}: {
    values: number[],
  }): PathState {
    return new PathState(values);
  }

  first(): number {
    return this.values.first();
  }

  last(): number {
    return this.values.last();
  }

  also(mutate: (wave: PathState) => void): PathState {
    mutate(this);
    return this;
  }

  push(value: number) {
    this.values.unshift(value);

    if (this.maxLength > 0 && this.values.length > this.maxLength) {
      this.values.pop();
    }
  }
}

export class WorldState {

  constructor(
    public readonly clock: Clock,
    public readonly chain: ChainState,
    public readonly path: PathState,
  ) {
    // no-op
  }

  static create({clock, chain, path}: {
    clock: Clock,
    chain: ChainState,
    path: PathState,
  }): WorldState {
    return new WorldState(clock, chain, path);
  }

  update() {
    this.chain.update(this.clock);
    this.path.push(this.chain.last().epicycleCenter.y);
  }
}
