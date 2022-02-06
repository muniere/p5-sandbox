import * as p5 from 'p5';
import { Point, Size, Rect } from '../../lib/graphics2d';

const Params = Object.freeze({
  CANVAS_COLOR: '#222222',
  STROKE_COLOR: '#FFFFFF',
  SPAWN_SPEED: 10,
  SPAWN_RADIUS: 5,
  SHAPE_ALPHA: 0.05,
  CHANCE_LIMIT: 1000,
});

class Circle {
  public strokeWeight: number = 1;
  public strokeColor?: string = '#FFFFFF';
  public fillColor?: string;

  private _growing: boolean = false;

  constructor(
    public context: p5,
    public center: Point,
    public radius: number,
  ) {
    // no-op
  }

  static create({context, center, radius}: {
    context: p5,
    center: Point,
    radius: number,
  }): Circle {
    return new Circle(context, center, radius);
  }

  static dist(a: Circle, b: Circle): number {
    return Math.sqrt(
      Math.pow(a.center.x - b.center.x, 2.0) + Math.pow(a.center.y - b.center.y, 2.0)
    )
  }

  get top(): number {
    return this.center.y - this.radius;
  }

  get left(): number {
    return this.center.x - this.radius;
  }

  get right(): number {
    return this.center.x + this.radius;
  }

  get bottom(): number {
    return this.center.y + this.radius;
  }

  also(mutate: (circle: Circle) => void): Circle {
    mutate(this);
    return this;
  }

  update() {
    if (this._growing) {
      this.radius += 1;
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
    return dist < this.radius;
  }

  testOverlap(circle: Circle) {
    return Circle.dist(this, circle) < this.radius + circle.radius;
  }

  testOverflow(rect: Rect): boolean {
    return this.top < rect.top || rect.bottom < this.bottom || this.left < rect.left || rect.right < this.right;
  }

  draw() {
    this.context.push();

    this.context.strokeWeight(this.strokeWeight);

    if (this.strokeColor) {
      this.context.stroke(this.strokeColor);
    } else {
      this.context.noStroke();
    }

    if (this.fillColor) {
      this.context.fill(this.fillColor);
    } else {
      this.context.noFill();
    }

    this.context.circle(this.center.x, this.center.y, this.radius * 2);

    this.context.pop();
  }
}

class Crowd {
  private readonly box: Rect;

  constructor(
    public context: p5,
    public circles: Circle[],
  ) {
    this.box = Rect.of({
      origin: Point.zero(),
      size: Size.of({
        width: this.context.width,
        height: this.context.height,
      })
    });
  }

  static create({context}: {
    context: p5
  }): Crowd {
    return new Crowd(context, []);
  }

  testCover(point: Point): boolean {
    return this.circles.some(it => it.testCover(point));
  }

  testOverlap(circle: Circle) {
    return this.circles.some(it => it.testOverlap(circle));
  }

  spawn({shape, radius}: {
    shape: Shape,
    radius: number,
  }): boolean {
    const circle = Circle.create({
      context: this.context,
      center: shape.sample(),
      radius: radius,
    }).also(it => {
      it.startGrow();
    });

    if (this.circles.some(it => it.testOverlap(circle))) {
      return false;
    }

    this.circles.push(circle);
    return true;
  }

  update() {
    this.circles
      .filter(it => it.growing)
      .filter(it => it.testOverflow(this.box))
      .forEach(it => it.stopGrow());

    this.circles
      .filter(it => it.growing)
      .filter(it => this.circles.some(other => it != other && it.testOverlap(other)))
      .forEach(it => it.stopGrow());

    this.circles.forEach(
      it => it.update()
    );
  }

  draw() {
    this.circles.forEach(it => it.draw());
  }
}

class Shape {
  constructor(
    public context: p5,
    public points: Point[],
  ) {
    // no-op
  }

  static analyze({context, image, predicate}: {
    context: p5,
    image: p5.Image,
    predicate: (pixel: number[]) => boolean,
  }): Shape {
    let points = [] as Point[];

    for (let x = 0; x < image.width; x++) {
      for (let y = 0; y < image.height; y++) {
        if (predicate(image.get(x, y))) {
          points.push(Point.of({x, y}));
        }
      }
    }

    return new Shape(context, points);
  }

  sample(): Point {
    return this.points[Math.floor(Math.random() * this.points.length)];
  }

  also(mutate: (shape: Shape) => void): Shape {
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

function sketch(context: p5) {
  let image: p5.Image;
  let frame: Rect;
  let crowd: Crowd;
  let shape: Shape;

  context.preload = function () {
    image = context.loadImage('shape.png');
  }

  context.setup = function () {
    context.createCanvas(context.windowWidth, context.windowHeight);

    image.loadPixels();

    crowd = Crowd.create({
      context: context,
    });

    const scale = Math.min(
      context.width / image.width,
      context.height / image.height,
    );

    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const originX = (context.width - scaledWidth) / 2;
    const originY = (context.height - scaledHeight) / 2;

    shape = Shape.analyze({
      context: context,
      image: image,
      predicate: (pixel: number[]) => context.brightness(pixel) > 1
    }).also(it => {
      it.scale({sx: scale, sy: scale});
      it.translate({x: originX, y: originY});
    });

    frame = Rect.of({
      origin: Point.of({
        x: originX,
        y: originY,
      }),
      size: Size.of({
        width: scaledWidth,
        height: scaledHeight,
      })
    });
  }

  context.draw = function () {
    context.background(Params.CANVAS_COLOR);

    context.tint(255, 255 * Params.SHAPE_ALPHA);
    context.image(image, frame.left, frame.top, frame.width, frame.height);
    context.noTint();

    crowd.draw();

    let count = 0;
    let chance = Params.CHANCE_LIMIT;

    while (chance > 0) {
      const result = crowd.spawn({
        shape: shape,
        radius: Params.SPAWN_RADIUS,
      });

      if (result) {
        count += 1;
      }
      if (count >= Params.SPAWN_SPEED) {
        break;
      }

      chance -= 1;
    }

    if (chance == 0) {
      context.noLoop();
      return;
    }

    crowd.update();
    shape.filter(point => !crowd.testCover(point));
  }
}

export { sketch };
