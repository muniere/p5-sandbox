import { Vector } from 'p5';
import { Vectors } from './process';

export type ForceCompat = {
  x: number,
  y: number,
  z: number,
}

export class Force {
  private _vector: Vector;

  public constructor(nargs: ForceCompat) {
    this._vector = Vectors.create(nargs);
  }

  public static zero(): Force {
    return new Force({x: 0, y: 0, z: 0});
  }

  public get x(): number {
    return this._vector.x;
  }

  public get y(): number {
    return this._vector.y;
  }

  public get z(): number {
    return this._vector.z;
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

  public with(value: Force): Force {
    return new Force(value.vector);
  }

  public assign(value: Force) {
    this._vector = value.vector;
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
      z: this._vector.z,
    });
  }

  public equals(other: Force): boolean {
    return this.x == other.x && this.y == other.y && this.z == other.z;
  }
}

export type AccelerationCompat = {
  x: number,
  y: number,
  z: number,
}

export class Acceleration {
  private _vector: Vector;

  public constructor(nargs: AccelerationCompat) {
    this._vector = Vectors.create(nargs);
  }

  public static zero(): Acceleration {
    return new Acceleration({x: 0, y: 0, z: 0});
  }

  public get x(): number {
    return this._vector.x;
  }

  public get y(): number {
    return this._vector.y;
  }

  public get z(): number {
    return this._vector.z;
  }

  public get vector(): Vector {
    return this._vector.copy();
  }

  public with(other: Acceleration): Acceleration {
    return new Acceleration(other._vector.copy());
  }

  public assign(other: Acceleration) {
    this._vector = other._vector.copy();
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
      z: this._vector.z,
    });
  }

  public equals(other: Acceleration): boolean {
    return this.x == other.x && this.y == other.y && this.z == other.z;
  }
}

export type VelocityCompat = {
  x: number,
  y: number,
  z: number,
}

export class Velocity {
  private _vector: Vector;

  public constructor(nargs: VelocityCompat) {
    this._vector = Vectors.create(nargs);
  }

  public static zero(): Velocity {
    return new Velocity({x: 0, y: 0, z: 0});
  }

  public get x(): number {
    return this._vector.x;
  }

  public get y(): number {
    return this._vector.y;
  }

  public get z(): number {
    return this._vector.z;
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
      z: this._vector.z,
    });
  }

  public equals(other: Velocity): boolean {
    return this.x == other.x && this.y == other.y && this.z == other.z;
  }
}
