import { Vector } from 'p5';
import { Point, Size } from './graphics2d';

export type ForceCompat = {
  x: number,
  y: number,
}

export class Force {
  private _vector: Vector;

  public constructor(
    x: number,
    y: number,
  ) {
    this._vector = new Vector().set(x, y);
  }

  public static zero(): Force {
    return new Force(0, 0);
  }

  public static of({x, y}: ForceCompat): Force {
    return new Force(x, y);
  };

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
    return Acceleration.of(this.vector.div(mass));
  }

  public plus(delta: Force): Force {
    return Force.of(this.vector.add(delta.vector));
  }

  public plusAssign(delta: Force) {
    this._vector.add(delta.vector);
  }

  public minus(delta: Force): Force {
    return Force.of(this.vector.sub(delta.vector));
  }

  public minusAssign(delta: Force) {
    this._vector.sub(delta.vector);
  }

  public times(value: number): Force {
    return Force.of(this.vector.mult(value));
  }

  public timesAssign(value: number): void {
    this.vector.mult(value);
  }

  public with(delta: Force): Force {
    return Force.of(delta.vector);
  }

  public assign(delta: Force) {
    this._vector = delta.vector;
  }

  public rotate(angle: number): Force {
    return Force.of(this.vector.rotate(angle))
  }

  public rotateAssign(angle: number): void {
    this._vector.rotate(angle);
  }

  public limit(magnitude: number): Force {
    return Force.of(this.vector.limit(magnitude));
  }

  public limitAssign(magnitude: number): void {
    this._vector.limit(magnitude);
  }

  public normalize(): Force {
    return Force.of(this.vector.normalize());
  }

  public normalizeAssign(): void {
    this._vector.normalize();
  }

  public magnitude(): number {
    return this._vector.mag();
  }

  public withMagnitude(magnitude: number): Force {
    return Force.of(this.vector.setMag(magnitude))
  }

  public setMagnitude(magnitude: number): void {
    this._vector.setMag(magnitude);
  }

  public heading(): number {
    return this._vector.heading();
  }

  public copy(): Force {
    return new Force(this.x, this.y);
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

  public constructor(
    x: number,
    y: number,
  ) {
    this._vector = new Vector().set(x, y);
  }

  public static zero(): Acceleration {
    return new Acceleration(0, 0);
  }

  public static of({x, y}: AccelerationCompat): Acceleration {
    return new Acceleration(x, y);
  };

  public get x(): number {
    return this._vector.x;
  }

  public get y(): number {
    return this._vector.y;
  }

  public get vector(): Vector {
    return this._vector.copy();
  }

  public with(other: Acceleration): Acceleration {
    return Acceleration.of(other.vector);
  }

  public assign(other: Acceleration) {
    this._vector = other.vector;
  }

  public rotate(angle: number): Acceleration {
    return Acceleration.of(this.vector.rotate(angle))
  }

  public rotateAssign(angle: number): void {
    this._vector.rotate(angle);
  }

  public limit(magnitude: number): Acceleration {
    return Acceleration.of(this.vector.limit(magnitude));
  }

  public limitAssign(magnitude: number): void {
    this._vector.limit(magnitude);
  }

  public normalize(): Acceleration {
    return Acceleration.of(this.vector.normalize());
  }

  public normalizeAssign(): void {
    this._vector.normalize();
  }

  public magnitude(): number {
    return this._vector.mag();
  }

  public withMagnitude(magnitude: number): Acceleration {
    return Acceleration.of(this.vector.setMag(magnitude))
  }

  public setMagnitude(magnitude: number): void {
    this._vector.setMag(magnitude);
  }

  public heading(): number {
    return this._vector.heading();
  }

  public copy(): Acceleration {
    return new Acceleration(this.x, this.y);
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

  public constructor(
    x: number,
    y: number,
  ) {
    this._vector = new Vector().set(x, y);
    // no-op
  }

  public static zero(): Velocity {
    return new Velocity(0, 0);
  }

  public static of({x, y}: VelocityCompat): Velocity {
    return new Velocity(x, y);
  };

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
    return Velocity.of(this.vector.add(delta.vector));
  }

  public plusAssign(delta: Acceleration) {
    this._vector.add(delta.vector);
  }

  public minus(delta: Acceleration): Velocity {
    return Velocity.of(this.vector.sub(delta.vector));
  }

  public minusAssign(delta: Acceleration) {
    this._vector.sub(delta.vector);
  }

  public rotate(angle: number): Velocity {
    return Velocity.of(this.vector.rotate(angle))
  }

  public rotateAssign(angle: number): void {
    this._vector.rotate(angle);
  }

  public limit(magnitude: number): Velocity {
    return Velocity.of(this.vector.limit(magnitude));
  }

  public limitAssign(magnitude: number): void {
    this._vector.limit(magnitude);
  }

  public normalize(): Velocity {
    return Velocity.of(this.vector.normalize());
  }

  public normalizeAssign(): void {
    this._vector.normalize();
  }

  public magnitude(): number {
    return this._vector.mag();
  }

  public withMagnitude(magnitude: number): Velocity {
    return Velocity.of(this.vector.setMag(magnitude))
  }

  public setMagnitude(magnitude: number): void {
    this._vector.setMag(magnitude);
  }

  public heading(): number {
    return this._vector.heading();
  }

  public copy(): Velocity {
    return new Velocity(this.x, this.y);
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

  public abstract coerceIn(bounds: Size): void;
}

export class RectangularMaterial extends Material {
  public fillColor: string | undefined;
  public strokeColor: string | undefined;

  private readonly _size: Size;
  private readonly _mass: number;
  private readonly _center: Point;
  private readonly _velocity: Velocity;
  private readonly _acceleration: Acceleration;

  public constructor(
    size?: Size,
    mass?: number,
    center?: Point,
    velocity?: Velocity,
    acceleration?: Acceleration,
  ) {
    super();
    this._size = size ?? Size.zero();
    this._mass = mass ?? 1;
    this._center = center ?? Point.zero();
    this._velocity = velocity ?? Velocity.zero();
    this._acceleration = acceleration ?? Acceleration.zero();
  }

  public static create({size, mass, center, velocity, acceleration}: {
    size?: Size,
    mass?: number,
    center?: Point,
    velocity?: Velocity,
    acceleration?: Acceleration,
  }): RectangularMaterial {
    return new RectangularMaterial(size, mass, center, velocity, acceleration);
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

  public also(mutate: (model: RectangularMaterial) => void): RectangularMaterial {
    mutate(this);
    return this;
  }

  public apply(force: Force): void {
    this._center.plusAssign(Vector.div(force.vector, this._mass));
  }

  public update() {
    this._velocity.plusAssign(this._acceleration);
    this._center.plusAssign(this._velocity);
  }

  public coerceIn(bounds: Size) {
    if (this.left <= 0 || bounds.width <= this.right) {
      this._velocity.plusAssign(
        Acceleration.of({x: -this._velocity.x * 2, y: 0})
      );
    }
    if (this.top <= 0 || bounds.height <= this.bottom) {
      this._velocity.plusAssign(
        Acceleration.of({x: 0, y: -this._velocity.y * 2})
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

  public constructor(
    radius?: number,
    mass?: number,
    center?: Point,
    velocity?: Velocity,
    acceleration?: Acceleration,
  ) {
    super();
    this._radius = radius ?? 0;
    this._mass = mass ?? 1;
    this._center = center ?? Point.zero();
    this._velocity = velocity ?? Velocity.zero();
    this._acceleration = acceleration ?? Acceleration.zero();
  }

  public static create({radius, mass, center, velocity, acceleration}: {
    radius?: number,
    mass?: number,
    center?: Point,
    velocity?: Velocity,
    acceleration?: Acceleration,
  }): CircularMaterial {
    return new CircularMaterial(radius, mass, center, velocity, acceleration);
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

  public also(mutate: (model: CircularMaterial) => void): CircularMaterial {
    mutate(this);
    return this;
  }

  public apply(force: Force): void {
    const newValue = force.acceleration({mass: this._mass});
    this._acceleration.assign(newValue);
  }

  public update() {
    this._velocity.plusAssign(this._acceleration);
    this._center.plusAssign(this._velocity);
    this._acceleration.setMagnitude(0);
  }

  public coerceIn(bounds: Size) {
    if (this.left <= 0 || bounds.width <= this.right) {
      this._velocity.plusAssign(
        Acceleration.of({x: -this._velocity.x * 2, y: 0})
      );
    }
    if (this.top <= 0 || bounds.height <= this.bottom) {
      this._velocity.plusAssign(
        Acceleration.of({x: 0, y: -this._velocity.y * 2})
      )
    }
  }

  public intersects(other: CircularMaterial): boolean {
    return Point.dist(this._center, other._center) < this._radius + other._radius;
  }
}
