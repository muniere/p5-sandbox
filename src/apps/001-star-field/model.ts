import { Point as Point3D } from '../../lib/graphics3d';
import { Acceleration as Acceleration3D, Velocity as Velocity3D } from '../../lib/physics3d';

export class StarModel {
  private readonly _radius: number;
  private readonly _origin: Point3D;
  private readonly _center: Point3D;
  private readonly _velocity: Velocity3D;

  constructor(nargs: {
    radius: number,
    center: Point3D,
  }) {
    this._radius = nargs.radius;
    this._origin = nargs.center.copy();
    this._center = nargs.center.copy();
    this._velocity = Velocity3D.zero();
  }

  get radius(): number {
    return this._radius;
  }

  get origin(): Point3D {
    return this._origin;
  }

  get center(): Point3D {
    return this._center;
  }

  get speed(): number {
    return this._velocity.magnitude();
  }

  set speed(speed: number) {
    if (speed > 0 && this._velocity.magnitude() == 0) {
      const accel = new Acceleration3D({x: 0, y: 0, z: 1});
      this._velocity.plusAssign(accel);
      this._velocity.normalize();
    }

    this._velocity.setMagnitude(speed);
  }

  update(): void {
    this._center.minusAssign({z: this.speed});

    if (this._center.z < 0.01) {
      this.reset();
    }
  }

  reset(): void {
    this._center.assign({z: this._origin.z});
  }
}

export class StarFieldModel {
  private readonly _stars: StarModel[];

  constructor(nargs: {
    stars: StarModel[],
  }) {
    this._stars = [...nargs.stars];
  }

  get stars(): StarModel[] {
    return [...this._stars];
  }

  set speed(speed: number) {
    this._stars.forEach(
      it => it.speed = speed
    );
  }

  push(...stars: StarModel[]) {
    this._stars.push(...stars);
  }

  update(): void {
    this._stars.forEach(
      it => it.update()
    );
  }

  reset(): void {
    this._stars.forEach(
      it => it.reset()
    );
  }
}

export class ApplicationModel {
  private readonly _starField: StarFieldModel;

  constructor(args: {
    starField: StarFieldModel,
  }) {
    this._starField = args.starField;
  }

  static create(nargs: {
    stars: StarModel[]
  }): ApplicationModel {
    return new ApplicationModel({
      starField: new StarFieldModel(nargs),
    });
  }

  get starField(): StarFieldModel {
    return this._starField;
  }

  update(): void {
    this._starField.update();
  }
}
