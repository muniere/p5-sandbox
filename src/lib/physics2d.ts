import { Vector } from 'p5';

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

export type PositionCompat = {
  x: number,
  y: number,
}

export class Position {
  private _vector: Vector;

  public constructor(
    x: number,
    y: number,
  ) {
    this._vector = new Vector().set(x, y);
  }

  public static zero(): Position {
    return new Position(0, 0);
  }

  public static of({x, y}: PositionCompat): Position {
    return new Position(x, y);
  };

  static dist(a: Position, b: Position): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2.0) + Math.pow(a.y - b.y, 2.0));
  }

  public get x(): number {
    return this._vector.x;
  }

  public get y(): number {
    return this._vector.y;
  }


  public plus(delta: Velocity): Position {
    return Position.of(this._vector.copy().add(delta.vector));
  }

  public plusAssign(delta: Velocity) {
    this._vector.add(delta.vector);
  }

  public minus(delta: Velocity): Position {
    return Position.of(this._vector.copy().add(delta.vector));
  }

  public minusAssign(delta: Velocity) {
    this._vector.sub(delta.vector);
  }

  public copy(): Position {
    return new Position(this.x, this.y);
  }

  public equals(other: Position): boolean {
    return this.x == other.x && this.y == other.y;
  }
}
