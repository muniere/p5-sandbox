import { Vector } from 'p5';
import { Point, Size } from '../../lib/graphics2d';
import { Acceleration, RectangularMaterial, Velocity } from '../../lib/physics2d';

export class WallModel {
  public color: string = '#FFFFFF';

  private readonly _p1: Point;
  private readonly _p2: Point;

  constructor(nargs: {
    p1: Point,
    p2: Point,
  }) {
    this._p1 = nargs.p1;
    this._p2 = nargs.p2;
  }

  get p1(): Point {
    return this._p1;
  }

  get p2(): Point {
    return this._p2;
  }
}

export class PointModel {
  public color: string = '#FFFFFF';

  private readonly _position: Point;

  constructor(nargs: {
    position: Point,
  }) {
    this._position = nargs.position;
  }

  get position(): Point {
    return this._position;
  }

  also(mutate: (model: this) => void): this {
    mutate(this);
    return this;
  }
}

export class RayModel {
  private readonly _direction: Vector;
  private _position: Point;

  constructor(nargs: {
    direction: Vector,
    position: Point,
  }) {
    this._direction = nargs.direction;
    this._position = nargs.position;
  }

  get position(): Point {
    return this._position;
  }

  set position(value: Point) {
    this._position = value;
  }

  get direction(): Vector {
    return this._direction;
  }

  also(mutate: (model: this) => void): this {
    mutate(this);
    return this;
  }

  look(point: Point) {
    this._direction.set(
      point.x - this._position.x,
      point.y - this._position.y,
    );
    this._direction.normalize();
  }

  cast(wall: WallModel): Point | undefined {
    const [x1, y1] = [wall.p1.x, wall.p1.y];
    const [x2, y2] = [wall.p2.x, wall.p2.y];
    const [x3, y3] = [this._position.x, this._position.y];
    const [x4, y4] = [x3 + this._direction.x, y3 + this._direction.y];

    const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (d == 0) {
      return undefined;
    }
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
    const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / d;

    if (t < 0 || 1 < t) {
      return undefined;
    }
    if (u < 0) {
      return undefined;
    }

    return new Point({
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
    });
  }
}

export class ParticleModel extends RectangularMaterial {
  public color: string = '#FFFFFFFF';
  public rayColor: string = '#FFFFFF22';

  private readonly _rays: RayModel[];

  private _points: PointModel[] = [];

  constructor(nargs: {
    size?: Size,
    mass?: number,
    center?: Point,
    velocity?: Velocity,
    acceleration?: Acceleration,
    rayResolution?: number,
  }) {
    super(nargs);

    const step = nargs.rayResolution ? 360 / nargs.rayResolution : 10;
    const rays = [] as RayModel[];

    for (let degree = 0; degree < 360; degree += step) {
      rays.push(
        new RayModel({
          direction: Vector.fromAngle(degree * Math.PI / 180),
          position: this.center,
        }),
      );
    }

    this._rays = rays;
  }

  get points(): PointModel[] {
    return [...this._points];
  }

  cast(walls: WallModel[]) {
    this._points = this._rays.compactMap(ray => {
      const points = walls.compactMap(wall => ray.cast(wall));
      if (!points.length) {
        return undefined;
      }
      const nearest = points.minBy(it => Point.dist(this.center, it));
      return new PointModel({position: nearest});
    });
  }

  update() {
    super.update();

    this._rays.forEach(it => it.position = this.center);
  }
}

export class ApplicationModel {

  private readonly _bounds: Size;
  private readonly _walls: WallModel[];
  private readonly _particle: ParticleModel;

  constructor(nargs: {
    bounds: Size,
    walls: WallModel[],
    particle: ParticleModel,
  }) {
    this._bounds = nargs.bounds;
    this._walls = [...nargs.walls];
    this._particle = nargs.particle;
  }

  get bounds(): Size {
    return this._bounds;
  }

  get walls(): WallModel[] {
    return this._walls;
  }

  get particle(): ParticleModel {
    return this._particle;
  }

  update() {
    this._particle.update();
    this._particle.coerceIn(this._bounds);
    this._particle.cast(this._walls);
  }

  warp(point: Point) {
    this._particle.moveTo(point);
  }
}
