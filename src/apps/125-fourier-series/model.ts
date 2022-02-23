import { Arrays } from '../../lib/stdlib';
import { Point } from '../../lib/graphics2d';
import { FrameClock } from '../../lib/process';

export class CircleModel {
  public color: string = '#FFFFFF';
  public angle: number = 0;
  public center: Point;
  public radius: number;

  constructor(nargs: {
    center: Point,
    radius: number,
  }) {
    this.center = nargs.center;
    this.radius = nargs.radius;
  }

  get epicycleCenter(): Point {
    return Point.of({
      x: this.center.x + this.radius * Math.cos(this.angle),
      y: this.center.y + this.radius * Math.sin(this.angle),
    });
  }

  also(mutate: (circle: CircleModel) => void): CircleModel {
    mutate(this);
    return this;
  }
}

export class ChainModel {
  public circles: CircleModel[];

  public constructor(nargs: {
    circles: CircleModel[],
  }) {
    this.circles = nargs.circles;
  }

  static create({amplitude, depth}: {
    amplitude: number,
    depth: number,
  }): ChainModel {
    const circles = Arrays.generate(depth, (i) => {
      const n = i * 2 + 1;
      return new CircleModel({
        center: Point.zero(),
        radius: amplitude / n,
      });
    });

    return new ChainModel({circles});
  }

  also(mutate: (wave: ChainModel) => void): ChainModel {
    mutate(this);
    return this;
  }

  set color(value: string) {
    this.circles.forEach(it => it.color = value);
  }

  first(): CircleModel {
    return this.circles.first();
  }

  last(): CircleModel {
    return this.circles.last();
  }

  update(clock: FrameClock) {
    const t = clock.time();

    let center = Point.zero();

    this.circles.forEach((circle, i) => {
      const n = i * 2 + 1;
      circle.center = center;
      circle.angle = n * t;
      center = circle.epicycleCenter;
    });
  }
}

export class PathModel {
  public color: string = '#FFFFFF';
  public maxLength: number = -1;

  private readonly _values: number[];

  constructor(nargs: {
    values: number[]
  }) {
    this._values = [...nargs.values];
  }

  first(): number {
    return this._values.first();
  }

  last(): number {
    return this._values.last();
  }

  get values(): number[] {
    return [...this._values];
  }

  also(mutate: (wave: PathModel) => void): PathModel {
    mutate(this);
    return this;
  }

  push(value: number) {
    this._values.unshift(value);

    if (this.maxLength > 0 && this._values.length > this.maxLength) {
      this._values.pop();
    }
  }
}

export class ApplicationModel {
  public readonly clock: FrameClock;
  public readonly chain: ChainModel;
  public readonly path: PathModel;

  constructor(nargs: {
    clock: FrameClock,
    chain: ChainModel,
    path: PathModel,
  }) {
    this.clock = nargs.clock;
    this.chain = nargs.chain;
    this.path = nargs.path;
  }

  update() {
    this.chain.update(this.clock);
    this.path.push(this.chain.last().epicycleCenter.y);
  }
}
