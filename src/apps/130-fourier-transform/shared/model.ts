import { Arrays } from '../../../lib/stdlib';
import { Complex } from '../../../lib/cmath';
import { Point } from '../../../lib/graphics2d';
import { FrameClock } from '../../../lib/process';

export namespace Formula {

  export function fourier(xs: Complex[]): Complex[] {
    const N = xs.length;
    const t = -(2 * Math.PI) / N;

    return Arrays.generate(N, (k) => {
      return xs.reduce(
        (acc, x, n) => acc.plus(
          x.times(Complex.unit(k * n * t))
        )
      );
    });
  }
}

export class CircleSeed {
  constructor(
    public readonly frequency: number,
    public readonly amplitude: number,
    public readonly phase: number,
  ) {
    // no-op
  }

  static of({frequency, amplitude, phase}: {
    frequency: number,
    amplitude: number,
    phase: number,
  }): CircleSeed {
    return new CircleSeed(frequency, amplitude, phase);
  }

  static from({k, X}: { k: number, X: Complex }): CircleSeed {
    return CircleSeed.of({
      frequency: k,
      amplitude: X.norm,
      phase: Math.atan2(X.im, X.re),
    });
  }
}

export class CircleState {
  public color: string = '#FFFFFF';
  public angle: number = 0;

  constructor(
    public center: Point,
    public seed: CircleSeed,
  ) {
    // no-op
  }

  static create({center, genome}: {
    center: Point,
    genome: CircleSeed,
  }): CircleState {
    return new CircleState(center, genome);
  }

  get radius(): number {
    return this.seed.amplitude;
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

  point(radian: number): Point {
    return this.center.plus({
      x: this.radius * Math.cos(radian),
      y: this.radius * Math.sin(radian),
    });
  }
}

export class ChainState {
  public constructor(
    public readonly circles: CircleState[],
  ) {
    // no-op
  }

  static create({center, values, decorate}: {
    center: Point,
    values: Complex[],
    decorate?: (circle: CircleState, i: number) => void
  }): ChainState {
    const N = Complex.re(values.length);
    const genomes = Formula.fourier(values).map(
      (X, k) => CircleSeed.from({
        k: k,
        X: X.div(N),
      })
    );

    const circles = genomes.map((genome, i) =>
      CircleState.create({
        center: center,
        genome: genome,
      }).also(it => {
        if (decorate) {
          decorate(it, i);
        }
      })
    );

    return new ChainState(circles.sortedDesc(it => it.seed.amplitude));
  }

  first(): CircleState {
    return this.circles.first();
  }

  last(): CircleState {
    return this.circles.last();
  }

  also(mutate: (machine: ChainState) => void): ChainState {
    mutate(this);
    return this;
  }

  update({clock, offset}: { clock: FrameClock, offset: number }) {
    const t = clock.time();

    let center = this.circles[0].center;

    this.circles.forEach((circle) => {
      const freq = circle.seed.frequency;
      const phase = circle.seed.phase;
      circle.center = center;
      circle.angle = freq * t + phase + offset;
      center = circle.epicycleCenter;
    });
  }
}

export class PathState {
  public color: string = '#FFFFFF';
  public maxLength: number = -1;

  constructor(
    public plots: Point[],
  ) {
    // no-op
  }

  static create({plots}: {
    plots: Point[],
  }): PathState {
    return new PathState(plots);
  }

  get length(): number {
    return this.plots.length;
  }

  first(): Point {
    return this.plots.first();
  }

  last(): Point {
    return this.plots.last();
  }

  also(mutate: (wave: PathState) => void): PathState {
    mutate(this);
    return this;
  }

  push(plot: Point) {
    this.plots.push(plot);

    if (this.maxLength > 0 && this.plots.length > this.maxLength) {
      this.plots.shift();
    }
  }
}

