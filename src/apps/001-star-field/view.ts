import * as p5 from 'p5';
import { Point as Point3D } from '../../lib/graphics3d';
import { StarFieldState, StarState } from './model';

class StarWidget {
  constructor(
    public readonly context: p5,
    public readonly state: StarState,
  ) {
    // no-op
  }

  private get origin(): Point3D {
    return this.state.origin;
  }

  private get radius(): number {
    return this.state.radius;
  }

  private get center(): Point3D {
    return this.state.center;
  }

  draw(): void {
    const currentX = this.context.map(
      /* value */ this.center.x / this.center.z,
      /* from  */ 0, 1,
      /* to    */ 0, this.context.width,
    );
    const currentY = this.context.map(
      /* value */ this.center.y / this.center.z,
      /* from  */ 0, 1,
      /* to    */ 0, this.context.height,
    );
    const currentRadius = this.context.map(
      /* value */ this.center.z,
      /* from  */ this.context.width, 0,
      /* to    */ 0, this.radius,
    );
    const originX = this.context.map(
      /* value */ this.center.x / this.origin.z,
      /* from  */ 0, 1,
      /* to    */ 0, this.context.width,
    );
    const originY = this.context.map(
      /* value */ this.center.y / this.origin.z,
      /* from  */ 0, 1,
      /* to    */ 0, this.context.height,
    );

    this.context.push();

    this.context.fill(255);
    this.context.noStroke();
    this.context.ellipse(currentX, currentY, currentRadius, currentRadius);

    this.context.stroke(255, 64);
    this.context.line(originX, originY, currentX, currentY);

    this.context.pop();
  }
}

export class StarFieldWidget {
  private children: StarWidget[];

  constructor(
    public readonly context: p5,
    public readonly state: StarFieldState,
  ) {
    this.children = state.stars.map(
      it => new StarWidget(context, it),
    );
  }

  draw() {
    this.context.translate(
      this.context.width / 2,
      this.context.height / 2,
    );

    this.children.forEach(
      it => it.draw()
    );
  }
}
