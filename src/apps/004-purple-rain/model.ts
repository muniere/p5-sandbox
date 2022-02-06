import { Vector } from 'p5';
import { Numeric } from '../../lib/numeric';
import { Size as Size2D } from '../../lib/graphics2d';
import { Point as Point3D } from '../../lib/graphics3d';

export class DropState {
  public color: string = '#000000';

  private _point: Point3D;
  private _velocity: Vector;

  constructor(
    public readonly origin: Point3D,
    public readonly length: number,
  ) {
    this._point = origin;
    this._velocity = new Vector();
  }

  static create({origin, length}: {
    origin: Point3D,
    length: number,
  }): DropState {
    return new DropState(origin, length);
  }

  get point(): Point3D {
    return this._point.copy();
  }

  forward(duration?: number) {
    const grav = Numeric.map({
      value: this._point.z,
      domain: Numeric.range(0, 20),
      target: Numeric.range(0, 0.1),
    });

    this._point = this._point.plus({
      y: this._velocity.y * (duration ?? 1)
    });

    this._velocity = this._velocity.copy().add(0, grav * (duration ?? 1));
  }

  reset(): void {
    this._point = this.origin;
    this._velocity = new Vector();
  }
}

export class RainState {
  public constructor(
    public readonly bounds: Size2D,
    public readonly drops: DropState[],
  ) {
    // no-op
  }

  static random({bounds, count}: {
    bounds: Size2D,
    count: number,
  }) : RainState {
    const drops = [...Array(count)].map(_ => {
      const origin = Point3D.of({
        x: bounds.width * Math.random(),
        y: -500 * Math.random(),
        z: 20 * Math.random(),
      });
      const length = Numeric.map({
        value: origin.z,
        domain: Numeric.range(0, 20),
        target: Numeric.range(10, 20),
      });
      return DropState.create({origin, length});
    });

    return new RainState(bounds, drops);
  }

  get color(): string {
    return this.drops[0].color;
  }

  set color(value: string) {
    this.drops.forEach(
      it => it.color = value
    );
  }

  forward(duration?: number): void {
    this.drops.forEach(
      it => it.forward(duration)
    );

    this.drops
      .filter(it => it.point.y >= this.bounds.height)
      .forEach(it => it.reset());
  }

  reset(): void {
    this.drops.forEach(
      it => it.reset()
    );
  }
}
