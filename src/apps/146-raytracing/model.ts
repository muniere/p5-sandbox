import { Vector } from 'p5';
import { Arrays } from '../../lib/stdlib';
import { Point, Rect, Size } from '../../lib/graphics2d';
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

  setAngle(angle: number) {
    this._direction.set(Math.cos(angle), Math.sin(angle)).normalize();
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

export class FragmentModel {
  private readonly _position: Point | undefined;
  private readonly _distance: number;

  constructor(nargs: {
    position: Point | undefined,
    distance: number,
  }) {
    this._position = nargs.position;
    this._distance = nargs.distance;
  }

  get position(): Point | undefined {
    return this._position;
  }

  get distance(): number {
    return this._distance;
  }

  also(mutate: (model: this) => void): this {
    mutate(this);
    return this;
  }
}

export class SceneModel {

  private readonly _fragments: FragmentModel[];

  constructor(nargs: {
    fragments: FragmentModel[],
  }) {
    this._fragments = nargs.fragments;
  }

  get fragments(): FragmentModel[] {
    return this._fragments;
  }
}

export class ParticleModel extends RectangularMaterial {
  public color: string = '#FFFFFFFF';
  public rayColor: string = '#FFFFFF22';

  private readonly _rays: RayModel[];
  private readonly _outlook: number;
  private readonly _resolution: number;
  private _heading: number;

  private _scene: SceneModel | undefined;

  constructor(nargs: {
    size?: Size,
    mass?: number,
    center?: Point,
    velocity?: Velocity,
    acceleration?: Acceleration,
    heading?: number,
    outlook?: number,
    resolution?: number,
  }) {
    super(nargs);

    this._heading = nargs.heading ?? 0;
    this._outlook = nargs.outlook ?? Math.PI / 4;
    this._resolution = nargs.resolution ?? 8;

    this._rays = Arrays.generate(this._resolution, () => {
      return new RayModel({
        direction: new Vector(),
        position: this.center,
      });
    });

    this.layout();
  }

  get heading(): number {
    return this._heading;
  }

  get scene(): SceneModel | undefined {
    return this._scene;
  }

  forward(distance: number) {
    const vector = Vector.fromAngle(this._heading).setMag(distance);
    this.moveTo(this.center.plus(vector));
  }

  backward(distance: number) {
    const vector = Vector.fromAngle(this._heading).setMag(distance);
    this.moveTo(this.center.minus(vector));
  }

  rotate(angle: number) {
    this._heading += angle;
    this.layout();
  }

  cast(walls: WallModel[]) {
    const fragments = this._rays.map(ray => {
      const points = walls.compactMap(wall => ray.cast(wall));
      if (!points.length) {
        return new FragmentModel({
          position: undefined,
          distance: Infinity,
        });
      }

      const nearest = points.minBy(it => Point.dist(this.center, it));
      const theta = ray.direction.heading() - this._heading ;
      const distance = Point.dist(this.center, nearest) * Math.cos(theta);
      return new FragmentModel({
        position: nearest,
        distance: distance
      });
    });

    this._scene = new SceneModel({
      fragments: fragments,
    });
  }

  update() {
    super.update();

    this._rays.forEach(it => it.position = this.center);
  }

  private layout() {
    const step = this._outlook / this._resolution;

    this._rays.forEach((it, i) => {
      it.setAngle(this._heading + (-this._outlook / 2) + step * i);
    });
  }
}

export class ObjectivePerspectiveModel {

  private readonly _frame: Rect;
  private readonly _walls: WallModel[];
  private readonly _particle: ParticleModel;

  constructor(nargs: {
    frame: Rect,
    walls: WallModel[],
    particle: ParticleModel,
  }) {
    this._frame = nargs.frame;
    this._walls = [...nargs.walls];
    this._particle = nargs.particle;
  }

  get frame(): Rect {
    return this._frame;
  }

  get walls(): WallModel[] {
    return this._walls;
  }

  get particle(): ParticleModel {
    return this._particle;
  }

  update() {
    this._particle.update();
    this._particle.coerceIn(this._frame.size);
    this._particle.cast(this._walls);
  }
}

export class SubjectivePerspectiveModel {

  private readonly _frame: Rect;
  private readonly _particle: ParticleModel;

  constructor(nargs: {
    frame: Rect,
    particle: ParticleModel,
  }) {
    this._frame = nargs.frame;
    this._particle = nargs.particle;
  }

  get frame(): Rect {
    return this._frame;
  }

  get particle(): ParticleModel {
    return this._particle;
  }

  update() {
    // no-op
  }
}

export class ApplicationModel {

  private readonly _objective: ObjectivePerspectiveModel;
  private readonly _subjective: SubjectivePerspectiveModel;

  constructor(nargs: {
    bounds: Size,
    walls: WallModel[],
    particle: ParticleModel,
  }) {
    const viewSize = new Size({
      width: nargs.bounds.width / 2,
      height: nargs.bounds.height,
    });

    const primaryFrame = new Rect({
      origin: Point.zero(),
      size: viewSize.copy(),
    });
    const secondaryFrame = new Rect({
      origin: new Point({x: viewSize.width, y: 0}),
      size: viewSize.copy(),
    });

    this._objective = new ObjectivePerspectiveModel({
      frame: primaryFrame,
      walls: nargs.walls,
      particle: nargs.particle,
    });

    this._subjective = new SubjectivePerspectiveModel({
      frame: secondaryFrame,
      particle: nargs.particle,
    });
  }

  get particle(): ParticleModel {
    return this._objective.particle;
  }

  get objective(): ObjectivePerspectiveModel {
    return this._objective;
  }

  get subjective(): SubjectivePerspectiveModel {
    return this._subjective;
  }

  update() {
    this._objective.update();
    this._subjective.update();
  }
}
