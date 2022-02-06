import { Point as Point3D } from '../../lib/graphics3d';
import { Size as Size2D } from '../../lib/graphics2d';

export class StarState {
  public center: Point3D;
  public speed: number;

  constructor(
    public readonly origin: Point3D,
    public readonly radius: number,
  ) {
    this.center = origin.copy();
    this.speed = 0;
  }

  static create({center, radius}: {
    center: Point3D,
    radius: number,
  }): StarState {
    return new StarState(center, radius);
  }

  forward(duration?: number): void {
    this.center = this.center.minus({
      z: this.speed * (duration ?? 1),
    });

    if (this.center.z < 0.01) {
      this.reset();
    }
  }

  reset(): void {
    this.center = this.center.with({
      z: this.origin.z,
    });
  }
}

export class StarFieldState {
  constructor(
    public stars: StarState[],
  ) {
    // no-op
  }

  static random({bounds, radius, count}: {
    bounds: Size2D,
    radius: number,
    count: number,
  }): StarFieldState {
    const stars = [...Array(count)].map(
      _ => StarState.create({
        center: Point3D.of({
          x: Math.floor(bounds.width * (Math.random() - 0.5)),
          y: Math.floor(bounds.height * (Math.random() - 0.5)),
          z: Math.random() * bounds.width,
        }),
        radius: radius,
      })
    );
    return new StarFieldState(stars);
  }

  set speed(speed: number) {
    this.stars.forEach(
      it => it.speed = speed
    );
  }

  forward(duration?: number): void {
    this.stars.forEach(
      it => it.forward(duration)
    );
  }

  reset(): void {
    this.stars.forEach(
      it => it.reset()
    );
  }
}
