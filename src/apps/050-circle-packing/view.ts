import * as p5 from 'p5';
import { Image } from 'p5';
import { CircleState, CrowdState, WorldState } from './model';
import { Point, Rect } from '../../lib/graphics2d';

export class CircleWidget {
  constructor(
    public readonly context: p5,
    public readonly state: CircleState
  ) {
    // no-op
  }

  private get strokeWeight(): number {
    return this.state.strokeWeight;
  }

  private get strokeColor(): string | undefined {
    return this.state.strokeColor;
  }

  private get fillColor(): string | undefined {
    return this.state.fillColor;
  }

  private get center(): Point {
    return this.state.center;
  }

  private get radius(): number {
    return this.state.radius;
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

export class CrowdWidget {
  constructor(
    public readonly context: p5,
    public readonly state: CrowdState,
  ) {
    // no-op
  }

  draw() {
    this.state.circles.forEach(it => {
      new CircleWidget(this.context, it).draw();
    });
  }
}

export class ImageWidget {
  public alpha: number = 1.0

  constructor(
    public readonly context: p5,
    public readonly frame: Rect,
    public readonly image: Image,
  ) {
    // no-op
  }

  static create({context, frame, image}: {
    context: p5,
    frame: Rect,
    image: Image,
  }): ImageWidget {
    return new ImageWidget(context, frame, image);
  }

  draw() {
    this.context.tint(255, 255 * this.alpha);
    this.context.image(this.image, this.frame.left, this.frame.top, this.frame.width, this.frame.height);
    this.context.noTint();
  }
}

export class WorldWidget {
  private crowd: CrowdWidget;

  constructor(
    public readonly context: p5,
    public readonly state: WorldState,
  ) {
    this.crowd = new CrowdWidget(context, state.crowd);
  }

  draw() {
    this.crowd.draw();
  }
}