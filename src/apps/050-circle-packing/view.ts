import * as p5 from 'p5';
import { Image } from 'p5';
import { Context } from '../../lib/process';
import { Point, Rect } from '../../lib/graphics2d';
import { CircleState, CrowdState, WorldState } from './model';

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
    Context.scope(this.context, $ => {
      $.strokeWeight(this.strokeWeight);

      if (this.strokeColor) {
        $.stroke(this.strokeColor);
      } else {
        $.noStroke();
      }

      if (this.fillColor) {
        $.fill(this.fillColor);
      } else {
        $.noFill();
      }

      $.circle(this.center.x, this.center.y, this.radius * 2);
    });
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
    Context.scope(this.context, $ => {
      $.tint(255, 255 * this.alpha);
      $.image(this.image, this.frame.left, this.frame.top, this.frame.width, this.frame.height);
      $.noTint();
    });
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
