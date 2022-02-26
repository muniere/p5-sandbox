import { Vectors } from '../../lib/process';
import { NumberRange, Numeric } from '../../lib/stdlib';
import { Point } from '../../lib/graphics2d';
import { CircularMaterial, Force } from '../../lib/physics2d';

export class VehicleModel extends CircularMaterial {
  public anchor: Point = Point.zero();
  public attractionControlDistance: number = 0;
  public attractionForceFactor: number = 1;
  public repulsionControlDistance: number = 0;
  public repulsionForceFactor: number = 1;
  public maxSpeed: number = 0;
  public maxForce: number = 0;

  attract() {
    const desired = Vectors.create({
      x: this.anchor.x - this.center.x,
      y: this.anchor.y - this.center.y,
    });

    const distance = desired.mag();

    const magnitude = distance > this.attractionControlDistance
      ? this.maxSpeed
      : Numeric.map({
        value: distance,
        domain: new NumberRange(0, this.attractionControlDistance),
        target: new NumberRange(0, this.maxSpeed)
      });

    desired.setMag(magnitude);

    const steer = desired.sub(this.velocity.vector).limit(this.maxForce).mult(this.mass);
    const force = Force.of(steer.mult(this.attractionForceFactor));

    this.apply(force);
  }

  repulse(point: Point) {
    const desired = Vectors.create({
      x: point.x - this.center.x,
      y: point.y - this.center.y,
    }).mult(-1);

    const distance = desired.mag();

    if (distance > this.repulsionControlDistance) {
      return;
    }

    desired.setMag(this.maxSpeed);

    const steer = desired.sub(this.velocity.vector).limit(this.maxForce).mult(this.mass);
    const force = Force.of(steer.mult(this.repulsionForceFactor));

    this.apply(force);
  }
}

export class ApplicationModel {
  private readonly _vehicles: VehicleModel[];

  constructor(nargs: {
    vehicles: VehicleModel[],
  }) {
    this._vehicles = [...nargs.vehicles];
  }

  get vehicles(): VehicleModel[] {
    return [...this._vehicles];
  }

  update(option?: { repulsion?: Point }) {
    this._vehicles.forEach(it => {
      it.update();
      it.attract();

      if (option && option.repulsion) {
        it.repulse(option.repulsion);
      }
    });
  }
}
