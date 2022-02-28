import { Vector } from 'p5';
import { Vectors } from './process';
import { Point, Size } from './graphics2d';

export type ForceCompat = {
  x: number,
  y: number,
}

export class Force {
  private _vector: Vector;

  public constructor(nargs: ForceCompat) {
    this._vector = Vectors.create(nargs);
  }

  public static zero(): Force {
    return new Force({x: 0, y: 0});
  }

  public get x(): number {
    return this._vector.x;
  }

  public get y(): number {
    return this._vector.y;
  }

  public get vector(): Vector {
    return this._vector.copy();
  }

  public acceleration({mass}: { mass: number }): Acceleration {
    return new Acceleration(this._vector.copy().div(mass));
  }

  public plus(delta: Force): Force {
    return new Force(this._vector.copy().add(delta.vector));
  }

  public plusAssign(delta: Force) {
    this._vector.add(delta.vector);
  }

  public minus(delta: Force): Force {
    return new Force(this._vector.copy().sub(delta.vector));
  }

  public minusAssign(delta: Force) {
    this._vector.sub(delta.vector);
  }

  public times(value: number): Force {
    return new Force(this._vector.copy().mult(value));
  }

  public timesAssign(value: number): void {
    this._vector.mult(value);
  }

  public with(delta: Force): Force {
    return new Force(delta.vector);
  }

  public assign(delta: Force) {
    this._vector = delta.vector;
  }

  public rotate(angle: number): Force {
    return new Force(this._vector.copy().rotate(angle))
  }

  public rotateAssign(angle: number): void {
    this._vector.rotate(angle);
  }

  public limit(magnitude: number): Force {
    return new Force(this._vector.copy().limit(magnitude));
  }

  public limitAssign(magnitude: number): void {
    this._vector.limit(magnitude);
  }

  public normalize(): Force {
    return new Force(this._vector.copy().normalize());
  }

  public normalizeAssign(): void {
    this._vector.normalize();
  }

  public magnitude(): number {
    return this._vector.mag();
  }

  public withMagnitude(magnitude: number): Force {
    return new Force(this._vector.copy().setMag(magnitude))
  }

  public setMagnitude(magnitude: number): void {
    this._vector.setMag(magnitude);
  }

  public heading(): number {
    return this._vector.heading();
  }

  public copy(): Force {
    return new Force({
      x: this._vector.x,
      y: this._vector.y,
    });
  }

  public equals(other: Force): boolean {
    return this.x == other.x && this.y == other.y;
  }
}

export type AccelerationCompat = {
  x: number,
  y: number,
}

export class Acceleration {
  private _vector: Vector;

  public constructor(nargs: AccelerationCompat) {
    this._vector = Vectors.create(nargs);
  }

  public static zero(): Acceleration {
    return new Acceleration({x: 0, y: 0});
  }

  public get x(): number {
    return this._vector.x;
  }

  public get y(): number {
    return this._vector.y;
  }

  public get vector(): Vector {
    return this._vector.copy();
  }

  public plus(delta: Acceleration): Acceleration {
    return new Acceleration(this._vector.copy().add(delta.vector));
  }

  public plusAssign(delta: Acceleration) {
    this._vector.add(delta.vector);
  }

  public minus(delta: Acceleration): Acceleration {
    return new Acceleration(this._vector.copy().sub(delta.vector));
  }

  public minusAssign(delta: Acceleration) {
    this._vector.sub(delta.vector);
  }

  public with(other: Acceleration): Acceleration {
    return new Acceleration(other.vector);
  }

  public assign(other: Acceleration) {
    this._vector = other.vector;
  }

  public rotate(angle: number): Acceleration {
    return new Acceleration(this._vector.copy().rotate(angle))
  }

  public rotateAssign(angle: number): void {
    this._vector.rotate(angle);
  }

  public limit(magnitude: number): Acceleration {
    return new Acceleration(this._vector.copy().limit(magnitude));
  }

  public limitAssign(magnitude: number): void {
    this._vector.limit(magnitude);
  }

  public normalize(): Acceleration {
    return new Acceleration(this._vector.copy().normalize());
  }

  public normalizeAssign(): void {
    this._vector.normalize();
  }

  public magnitude(): number {
    return this._vector.mag();
  }

  public withMagnitude(magnitude: number): Acceleration {
    return new Acceleration(this._vector.copy().setMag(magnitude))
  }

  public setMagnitude(magnitude: number): void {
    this._vector.setMag(magnitude);
  }

  public heading(): number {
    return this._vector.heading();
  }

  public copy(): Acceleration {
    return new Acceleration({
      x: this._vector.x,
      y: this._vector.y,
    });
  }

  public equals(other: Acceleration): boolean {
    return this.x == other.x && this.y == other.y;
  }
}

export type VelocityCompat = {
  x: number,
  y: number,
}

export class Velocity {
  private _vector: Vector;

  public constructor(nargs: VelocityCompat) {
    this._vector = Vectors.create(nargs);
  }

  public static zero(): Velocity {
    return new Velocity({x: 0, y: 0});
  }

  public get x(): number {
    return this._vector.x;
  }

  public get y(): number {
    return this._vector.y;
  }

  public get vector(): Vector {
    return this._vector.copy();
  }

  public plus(delta: Acceleration): Velocity {
    return new Velocity(this._vector.copy().add(delta.vector));
  }

  public plusAssign(delta: Acceleration) {
    this._vector.add(delta.vector);
  }

  public minus(delta: Acceleration): Velocity {
    return new Velocity(this._vector.copy().sub(delta.vector));
  }

  public minusAssign(delta: Acceleration) {
    this._vector.sub(delta.vector);
  }

  public rotate(angle: number): Velocity {
    return new Velocity(this._vector.copy().rotate(angle))
  }

  public rotateAssign(angle: number): void {
    this._vector.rotate(angle);
  }

  public limit(magnitude: number): Velocity {
    return new Velocity(this._vector.copy().limit(magnitude));
  }

  public limitAssign(magnitude: number): void {
    this._vector.limit(magnitude);
  }

  public normalize(): Velocity {
    return new Velocity(this._vector.copy().normalize());
  }

  public normalizeAssign(): void {
    this._vector.normalize();
  }

  public magnitude(): number {
    return this._vector.mag();
  }

  public withMagnitude(magnitude: number): Velocity {
    return new Velocity(this._vector.copy().setMag(magnitude))
  }

  public setMagnitude(magnitude: number): void {
    this._vector.setMag(magnitude);
  }

  public heading(): number {
    return this._vector.heading();
  }

  public copy(): Velocity {
    return new Velocity({
      x: this._vector.x,
      y: this._vector.y,
    });
  }

  public equals(other: Velocity): boolean {
    return this.x == other.x && this.y == other.y;
  }
}

export abstract class Material {
  public abstract fillColor: string | undefined;
  public abstract strokeColor: string | undefined;

  public abstract readonly top: number;
  public abstract readonly left: number;
  public abstract readonly right: number;
  public abstract readonly bottom: number;

  public abstract readonly mass: number;
  public abstract readonly center: Point;
  public abstract readonly velocity: Velocity;
  public abstract readonly acceleration: Acceleration;

  public abstract apply(force: Force): void;

  public abstract update(): void;

  public abstract moveTo(point: Point): void;

  public abstract coerceIn(bounds: Size): void;

  public also(mutate: (model: this) => void): this {
    mutate(this);
    return this;
  }
}

export class RectangularMaterial extends Material {
  public fillColor: string | undefined;
  public strokeColor: string | undefined;

  private readonly _size: Size;
  private readonly _mass: number;
  private readonly _center: Point;
  private readonly _velocity: Velocity;
  private readonly _acceleration: Acceleration;

  public constructor(nargs: {
    size?: Size,
    mass?: number,
    center?: Point,
    velocity?: Velocity,
    acceleration?: Acceleration,
  }) {
    super();
    this._size = nargs.size ?? Size.zero();
    this._mass = nargs.mass ?? 1;
    this._center = nargs.center ?? Point.zero();
    this._velocity = nargs.velocity ?? Velocity.zero();
    this._acceleration = nargs.acceleration ?? Acceleration.zero();
  }

  public get size(): Size {
    return this._size.copy();
  }

  public get width(): number {
    return this._size.width;
  }

  public get height(): number {
    return this._size.height;
  }

  public get top(): number {
    return this.center.y - this.height / 2;
  }

  public get bottom(): number {
    return this.center.y + this.height / 2;
  }

  public get left(): number {
    return this.center.x - this.width / 2;
  }

  public get right(): number {
    return this.center.x + this.width / 2;
  }

  public get mass(): number {
    return this._mass;
  }

  public get center(): Point {
    return this._center.copy();
  }

  public get velocity(): Velocity {
    return this._velocity.copy();
  }

  public get acceleration(): Acceleration {
    return this._acceleration.copy();
  }

  public apply(force: Force): void {
    const newValue = force.acceleration({mass: this._mass});
    this._acceleration.plusAssign(newValue);
  }

  public update() {
    this._velocity.plusAssign(this._acceleration);
    this._center.plusAssign(this._velocity);
    this._acceleration.setMagnitude(0);
  }

  public moveTo(point: Point) {
    this._center.assign(point);
  }

  public coerceIn(bounds: Size) {
    if (this.left <= 0 || bounds.width <= this.right) {
      this._velocity.plusAssign(
        new Acceleration({x: -this._velocity.x * 2, y: 0})
      );
    }
    if (this.top <= 0 || bounds.height <= this.bottom) {
      this._velocity.plusAssign(
        new Acceleration({x: 0, y: -this._velocity.y * 2})
      )
    }
  }

  public intersects(other: RectangularMaterial): boolean {
    if (other.left > this.right) {
      return false;
    }
    if (other.right < this.left) {
      return false;
    }
    if (other.top > this.bottom) {
      return false;
    }
    if (other.bottom < this.top) {
      return false;
    }
    return true;
  }
}

export class CircularMaterial extends Material {
  public fillColor: string | undefined;
  public strokeColor: string | undefined;

  private readonly _radius: number;
  private readonly _mass: number;
  private readonly _center: Point;
  private readonly _velocity: Velocity;
  private readonly _acceleration: Acceleration;

  public constructor(nargs: {
    radius?: number,
    mass?: number,
    center?: Point,
    velocity?: Velocity,
    acceleration?: Acceleration,
  }) {
    super();
    this._radius = nargs.radius ?? 0;
    this._mass = nargs.mass ?? 1;
    this._center = nargs.center ?? Point.zero();
    this._velocity = nargs.velocity ?? Velocity.zero();
    this._acceleration = nargs.acceleration ?? Acceleration.zero();
  }

  public get radius(): number {
    return this._radius;
  }

  public get top(): number {
    return this.center.y - this._radius;
  }

  public get bottom(): number {
    return this.center.y + this._radius;
  }

  public get left(): number {
    return this.center.x - this._radius;
  }

  public get right(): number {
    return this.center.x + this._radius;
  }

  public get mass(): number {
    return this._mass;
  }

  public get center(): Point {
    return this._center.copy();
  }

  public get velocity(): Velocity {
    return this._velocity.copy();
  }

  public get acceleration(): Acceleration {
    return this._acceleration.copy();
  }

  public apply(force: Force): void {
    const newValue = force.acceleration({mass: this._mass});
    this._acceleration.plusAssign(newValue);
  }

  public update() {
    this._velocity.plusAssign(this._acceleration);
    this._center.plusAssign(this._velocity);
    this._acceleration.setMagnitude(0);
  }

  public moveTo(point: Point) {
    this._center.assign(point);
  }

  public coerceIn(bounds: Size) {
    if (this.left <= 0 || bounds.width <= this.right) {
      this._velocity.plusAssign(
        new Acceleration({x: -this._velocity.x * 2, y: 0})
      );
    }
    if (this.top <= 0 || bounds.height <= this.bottom) {
      this._velocity.plusAssign(
        new Acceleration({x: 0, y: -this._velocity.y * 2})
      )
    }
  }

  public intersects(other: CircularMaterial): boolean {
    return Point.dist(this._center, other._center) < this._radius + other._radius;
  }
}
