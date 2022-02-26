import { FrameClock } from '../../../lib/process';
import { Arrays } from '../../../lib/stdlib';
import { Complex } from '../../../lib/cmath';
import { Point } from '../../../lib/graphics2d';

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

export class CircleGenome {
  public readonly frequency: number;
  public readonly amplitude: number;
  public readonly phase: number;

  constructor(nargs: {
    frequency: number,
    amplitude: number,
    phase: number,
  }) {
    this.frequency = nargs.frequency;
    this.amplitude = nargs.amplitude;
    this.phase = nargs.phase;
  }

  static from({k, X}: { k: number, X: Complex }): CircleGenome {
    return new CircleGenome({
      frequency: k,
      amplitude: X.norm,
      phase: Math.atan2(X.im, X.re),
    });
  }
}

export class CircleModel {
  public color: string = '#FFFFFF';
  public angle: number = 0;
  public center: Point;
  public genome: CircleGenome;

  constructor(nargs: {
    center: Point,
    genome: CircleGenome,
  }) {
    this.center = nargs.center;
    this.genome = nargs.genome;
    // no-op
  }

  get radius(): number {
    return this.genome.amplitude;
  }

  get epicycleCenter(): Point {
    return new Point({
      x: this.center.x + this.radius * Math.cos(this.angle),
      y: this.center.y + this.radius * Math.sin(this.angle),
    });
  }

  also(mutate: (circle: CircleModel) => void): CircleModel {
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

export class ChainModel {
  private readonly _circles: CircleModel[];

  public constructor(nargs: {
    circles: CircleModel[]
  }) {
    this._circles = nargs.circles;
  }

  static create({center, values, decorate}: {
    center: Point,
    values: Complex[],
    decorate?: (circle: CircleModel, i: number) => void
  }): ChainModel {
    const N = Complex.re(values.length);
    const genomes = Formula.fourier(values).map(
      (X, k) => CircleGenome.from({
        k: k,
        X: X.div(N),
      })
    );

    const circles = genomes.map((genome, i) =>
      new CircleModel({
        center: center,
        genome: genome,
      }).also(it => {
        if (decorate) {
          decorate(it, i);
        }
      })
    );

    return new ChainModel({
      circles: circles.sortedDesc(it => it.genome.amplitude),
    });
  }

  get circles(): CircleModel[] {
    return [...this._circles];
  }

  first(): CircleModel {
    return this._circles.first();
  }

  last(): CircleModel {
    return this._circles.last();
  }

  also(mutate: (machine: ChainModel) => void): ChainModel {
    mutate(this);
    return this;
  }

  update({clock, offset}: { clock: FrameClock, offset: number }) {
    const t = clock.time();

    let center = this._circles[0].center;

    this._circles.forEach((circle) => {
      const freq = circle.genome.frequency;
      const phase = circle.genome.phase;
      circle.center = center;
      circle.angle = freq * t + phase + offset;
      center = circle.epicycleCenter;
    });
  }
}

export class PathModel {
  public color: string = '#FFFFFF';
  public maxLength: number = -1;

  private readonly _plots: Point[];

  constructor(nargs: {
    plots: Point[],
  }) {
    this._plots = nargs.plots;
  }

  get plots(): Point[] {
    return [...this._plots];
  }

  get length(): number {
    return this._plots.length;
  }

  first(): Point {
    return this._plots.first();
  }

  last(): Point {
    return this._plots.last();
  }

  also(mutate: (wave: PathModel) => void): PathModel {
    mutate(this);
    return this;
  }

  push(plot: Point) {
    this._plots.push(plot);

    if (this.maxLength > 0 && this._plots.length > this.maxLength) {
      this._plots.shift();
    }
  }
}

