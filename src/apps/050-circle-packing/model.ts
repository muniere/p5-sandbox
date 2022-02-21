import { Image } from 'p5';
import { Point, Rect, Size } from '../../lib/graphics2d';

export class CircleModel {
  public strokeWeight: number = 1;
  public strokeColor?: string = '#FFFFFF';
  public fillColor?: string;

  private readonly _center: Point;

  private _radius: number;
  private _growing: boolean = false;

  constructor(nargs: {
    radius: number,
    center: Point,
  }) {
    this._radius = nargs.radius;
    this._center = nargs.center;
  }

  static dist(a: CircleModel, b: CircleModel): number {
    return Point.dist(a._center, b._center);
  }

  get radius(): number {
    return this._radius;
  }

  get center(): Point {
    return this._center;
  }

  get top(): number {
    return this._center.y - this._radius;
  }

  get left(): number {
    return this._center.x - this._radius;
  }

  get right(): number {
    return this._center.x + this._radius;
  }

  get bottom(): number {
    return this._center.y + this._radius;
  }

  also(mutate: (circle: CircleModel) => void): CircleModel {
    mutate(this);
    return this;
  }

  update() {
    if (this._growing) {
      this._radius += 1;
    }
  }

  get growing(): boolean {
    return this._growing;
  }

  startGrow() {
    this._growing = true;
  }

  stopGrow() {
    this._growing = false;
  }

  includes(point: Point): boolean {
    return Point.dist(this._center, point) < this._radius;
  }

  intersects(circle: CircleModel) {
    return CircleModel.dist(this, circle) < this._radius + circle._radius;
  }

  overflows(rect: Rect): boolean {
    return this.top < rect.top || rect.bottom < this.bottom || this.left < rect.left || rect.right < this.right;
  }
}

export class CircleCrowdModel {
  private readonly _frame: Rect;
  private readonly _circles: CircleModel[];

  constructor(nargs: {
    frame: Rect,
    circles: CircleModel[],
  }) {
    this._frame = nargs.frame;
    this._circles = [...nargs.circles];
  }

  get circles(): CircleModel[] {
    return [...this._circles];
  }

  includes(point: Point): boolean {
    return this._circles.some(it => it.includes(point));
  }

  intersects(circle: CircleModel) {
    return this._circles.some(it => it.intersects(circle));
  }

  trySpawn({radius, center}: {
    radius: number,
    center: Point,
  }): boolean {
    const circle = new CircleModel({
      center: center,
      radius: radius,
    }).also(it => {
      it.startGrow();
    });

    if (this._circles.some(it => it.intersects(circle))) {
      return false;
    }

    this._circles.push(circle);
    return true;
  }

  update() {
    this._circles
      .filter(it => it.growing)
      .filter(it => it.overflows(this._frame))
      .forEach(it => it.stopGrow());

    this._circles
      .filter(it => it.growing)
      .filter(it => this._circles.some(other => it != other && it.intersects(other)))
      .forEach(it => it.stopGrow());

    this._circles.forEach(
      it => it.update()
    );
  }
}

export class PixelCrowdModel {
  private readonly _points: Point[];

  constructor(nargs: {
    points: Point[],
  }) {
    this._points = [...nargs.points];
  }

  static analyze({image, predicate}: {
    image: Image,
    predicate: (pixel: number[]) => boolean,
  }): PixelCrowdModel {
    let points = [] as Point[];

    for (let x = 0; x < image.width; x++) {
      for (let y = 0; y < image.height; y++) {
        if (predicate(image.get(x, y))) {
          points.push(Point.of({x, y}));
        }
      }
    }

    return new PixelCrowdModel({points});
  }

  sample(): Point {
    return this._points.sample();
  }

  also(mutate: (shape: PixelCrowdModel) => void): PixelCrowdModel {
    mutate(this);
    return this;
  }

  removeWhere(predicate: (point: Point) => boolean) {
    this._points.removeWhere(predicate);
  }

  translate({x, y}: {
    x?: number,
    y?: number,
  }) {
    this._points.forEach(it => {
      it.plusAssign({x, y});
    });
  }

  scale({sx, sy}: {
    sx?: number,
    sy?: number,
  }) {
    this._points.forEach(it => {
      it.assign({
        x: it.x * (sx ?? 1),
        y: it.y * (sy ?? 1),
      });
    });
  }
}

export class ApplicationModel {
  public spawnChance: number = 0;
  public spawnRadius: number = 0;
  public spawnSpeed: number = 0;

  private readonly _pixelCrowd: PixelCrowdModel;
  private readonly _circleCrowd: CircleCrowdModel;

  constructor(nargs: {
    pixelCrowd: PixelCrowdModel,
    circleCrowd: CircleCrowdModel,
  }) {
    this._pixelCrowd = nargs.pixelCrowd;
    this._circleCrowd = nargs.circleCrowd;
  }

  static create({bounds, image, predicate}: {
    bounds: Size,
    image: Image,
    predicate: (pixel: number[]) => boolean,
  }): ApplicationModel {
    const scale = Math.min(
      bounds.width / image.width,
      bounds.height / image.height,
    );

    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const originX = (bounds.width - scaledWidth) / 2;
    const originY = (bounds.height - scaledHeight) / 2;

    const pixelCrowd = PixelCrowdModel.analyze({
      image: image,
      predicate: predicate,
    }).also(it => {
      it.scale({sx: scale, sy: scale});
      it.translate({x: originX, y: originY});
    });

    const circleCrowd = new CircleCrowdModel({
      frame: Rect.of({
        origin: Point.zero(),
        size: bounds,
      }),
      circles: [],
    });

    return new ApplicationModel({pixelCrowd, circleCrowd});
  }

  also(mutate: (world: ApplicationModel) => void): ApplicationModel {
    mutate(this);
    return this;
  }

  get circleCrowd(): CircleCrowdModel {
    return this._circleCrowd;
  }

  get pixelCrowd(): PixelCrowdModel {
    return this._pixelCrowd;
  }

  update(): boolean {
    let count = 0;
    let chance = this.spawnChance;

    while (chance > 0) {
      const success = this._circleCrowd.trySpawn({
        radius: this.spawnRadius,
        center: this._pixelCrowd.sample(),
      });

      if (success) {
        count += 1;
      }
      if (count >= this.spawnSpeed) {
        break;
      }

      chance -= 1;
    }

    if (chance == 0) {
      return false;
    }

    this._circleCrowd.update();
    this._pixelCrowd.removeWhere(point => this._circleCrowd.includes(point));
    return true;
  }
}
