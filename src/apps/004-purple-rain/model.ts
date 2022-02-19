import { Numeric } from '../../lib/stdlib';
import { Size as Size2D } from '../../lib/graphics2d';
import { Point as Point3D } from '../../lib/graphics3d';
import { Acceleration, Velocity as Velocity3D } from '../../lib/physics3d';

export class DropModel {
  public color: string = '#000000';

  private readonly _length: number;
  private readonly _origin: Point3D;
  private readonly _point: Point3D;
  private readonly _velocity: Velocity3D;

  constructor(
    length: number,
    origin: Point3D,
  ) {
    this._length = length;
    this._origin = origin.copy();
    this._point = origin.copy();
    this._velocity = Velocity3D.zero();
  }

  static create({length, origin}: {
    length: number,
    origin: Point3D,
  }): DropModel {
    return new DropModel(length, origin);
  }

  get length(): number {
    return this._length;
  }

  get point(): Point3D {
    return this._point.copy();
  }

  update() {
    const gravity = Numeric.map({
      value: this._point.z,
      domain: Numeric.range(0, 20),
      target: Numeric.range(0, 0.1),
    });

    const accel = Acceleration.of({
      x: 0,
      y: gravity,
      z: 0,
    });

    this._point.plusAssign({
      y: this._velocity.y,
    })

    this._velocity.plusAssign(accel);
  }

  reset(): void {
    this._point.assign(this._origin);
    this._velocity.setMagnitude(0);
  }
}

export class ApplicationModel {
  private readonly _bounds: Size2D;
  private readonly _drops: DropModel[];

  public constructor(
    bounds: Size2D,
    drops: DropModel[],
  ) {
    this._bounds = bounds;
    this._drops = [...drops];
  }

  static create({bounds, drops}: {
    bounds: Size2D,
    drops: DropModel[],
  }): ApplicationModel {
    return new ApplicationModel(bounds, drops);
  }

  get drops(): DropModel[] {
    return [...this._drops];
  }

  get color(): string {
    return this._drops[0].color;
  }

  set color(value: string) {
    this._drops.forEach(
      it => it.color = value
    );
  }

  update(): void {
    this._drops.forEach(it => {
      it.update();

      if (it.point.y >= this._bounds.height) {
        it.reset();
      }
    });
  }

  reset(): void {
    this._drops.forEach(
      it => it.reset()
    );
  }
}
