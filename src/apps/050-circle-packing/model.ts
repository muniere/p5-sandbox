import { Image } from 'p5';
import { Point, Rect, Size } from '../../lib/graphics2d';

export class CircleState {
  public strokeWeight: number = 1;
  public strokeColor?: string = '#FFFFFF';
  public fillColor?: string;

  public readonly center: Point;

  private _radius: number;
  private _growing: boolean = false;

  constructor(
    center: Point,
    radius: number,
  ) {
    this.center = center;
    this._radius = radius;
  }

  static create({center, radius}: {
    center: Point,
    radius: number,
  }): CircleState {
    return new CircleState(center, radius);
  }

  static dist(a: CircleState, b: CircleState): number {
    return Math.sqrt(
      Math.pow(a.center.x - b.center.x, 2.0) + Math.pow(a.center.y - b.center.y, 2.0)
    )
  }

  get radius(): number {
    return this._radius;
  }

  get top(): number {
    return this.center.y - this._radius;
  }

  get left(): number {
    return this.center.x - this._radius;
  }

  get right(): number {
    return this.center.x + this._radius;
  }

  get bottom(): number {
    return this.center.y + this._radius;
  }

  also(mutate: (circle: CircleState) => void): CircleState {
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

  testCover(point: Point): boolean {
    const dist = Math.sqrt(
      Math.pow(this.center.x - point.x, 2.0) + Math.pow(this.center.y - point.y, 2.0)
    );
    return dist < this._radius;
  }

  testOverlap(circle: CircleState) {
    return CircleState.dist(this, circle) < this._radius + circle._radius;
  }

  testOverflow(rect: Rect): boolean {
    return this.top < rect.top || rect.bottom < this.bottom || this.left < rect.left || rect.right < this.right;
  }
}

export class CrowdState {
  private readonly _box: Rect;
  private readonly _circles: CircleState[];

  constructor(
    frame: Rect,
    circles: CircleState[],
  ) {
    this._box = frame;
    this._circles = [...circles];
  }

  static create({frame}: {
    frame: Rect,
  }): CrowdState {
    return new CrowdState(frame, []);
  }

  get circles(): CircleState[] {
    return [...this._circles];
  }

  testCover(point: Point): boolean {
    return this._circles.some(it => it.testCover(point));
  }

  testOverlap(circle: CircleState) {
    return this._circles.some(it => it.testOverlap(circle));
  }

  spawn({shape, radius}: {
    shape: ShapeState,
    radius: number,
  }): boolean {
    const circle = CircleState.create({
      center: shape.sample(),
      radius: radius,
    }).also(it => {
      it.startGrow();
    });

    if (this._circles.some(it => it.testOverlap(circle))) {
      return false;
    }

    this._circles.push(circle);
    return true;
  }

  update() {
    this._circles
      .filter(it => it.growing)
      .filter(it => it.testOverflow(this._box))
      .forEach(it => it.stopGrow());

    this._circles
      .filter(it => it.growing)
      .filter(it => this._circles.some(other => it != other && it.testOverlap(other)))
      .forEach(it => it.stopGrow());

    this._circles.forEach(
      it => it.update()
    );
  }
}

export class ShapeState {
  constructor(
    public points: Point[],
  ) {
    // no-op
  }

  static analyze({image, predicate}: {
    image: Image,
    predicate: (pixel: number[]) => boolean,
  }): ShapeState {
    let points = [] as Point[];

    for (let x = 0; x < image.width; x++) {
      for (let y = 0; y < image.height; y++) {
        if (predicate(image.get(x, y))) {
          points.push(Point.of({x, y}));
        }
      }
    }

    return new ShapeState(points);
  }

  sample(): Point {
    return this.points.sample();
  }

  also(mutate: (shape: ShapeState) => void): ShapeState {
    mutate(this);
    return this;
  }

  filter(predicate: (point: Point) => boolean) {
    this.points = this.points.filter(predicate);
  }

  translate({x, y}: {
    x?: number,
    y?: number,
  }) {
    this.points = this.points.map(
      it => Point.of({
        x: it.x + (x ?? 0),
        y: it.y + (y ?? 0),
      })
    );
  }

  scale({sx, sy}: {
    sx?: number,
    sy?: number,
  }) {
    this.points = this.points.map(
      it => Point.of({
        x: it.x * (sx ?? 1),
        y: it.y * (sy ?? 1),
      })
    );
  }
}

export class WorldState {
  public spawnChance: number = 0;
  public spawnRadius: number = 0;
  public spawnSpeed: number = 0;

  constructor(
    public readonly shape: ShapeState,
    public readonly crowd: CrowdState,
  ) {
    // no-op
  }

  static create({bounds, image, predicate}: {
    bounds: Size,
    image: Image,
    predicate: (pixel: number[]) => boolean,
  }): WorldState {
    const scale = Math.min(
      bounds.width / image.width,
      bounds.height / image.height,
    );

    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const originX = (bounds.width - scaledWidth) / 2;
    const originY = (bounds.height - scaledHeight) / 2;

    const shape = ShapeState.analyze({
      image: image,
      predicate: predicate,
    }).also(it => {
      it.scale({sx: scale, sy: scale});
      it.translate({x: originX, y: originY});
    });

    const crowd = CrowdState.create({
      frame: Rect.of({
        origin: Point.zero(),
        size: bounds,
      }),
    });

    return new WorldState(shape, crowd);
  }

  also(mutate: (world: WorldState) => void): WorldState {
    mutate(this);
    return this;
  }

  update(): boolean {
    let count = 0;
    let chance = this.spawnChance;

    while (chance > 0) {
      const result = this.crowd.spawn({
        shape: this.shape,
        radius: this.spawnRadius,
      });

      if (result) {
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

    this.crowd.update();
    this.shape.filter(point => !this.crowd.testCover(point));
    return true;
  }
}
