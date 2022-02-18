import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { Numeric } from '../../lib/stdlib';
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
    const currentX = Numeric.map({
      value: this.center.x / this.center.z,
      domain: Numeric.range(0, 1),
      target: Numeric.range(0, this.context.width)
    });

    const currentY = Numeric.map({
      value: this.center.y / this.center.z,
      domain: Numeric.range(0, 1),
      target: Numeric.range(0, this.context.height)
    });

    const currentRadius = Numeric.map({
      value: this.center.z,
      domain: Numeric.range(this.context.width, 0),
      target: Numeric.range(0, this.radius)
    });

    const originX = Numeric.map({
      value: this.center.x / this.origin.z,
      domain: Numeric.range(0, 1),
      target: Numeric.range(0, this.context.width),
    });

    const originY = Numeric.map({
      value: this.center.y / this.origin.z,
      domain: Numeric.range(0, 1),
      target: Numeric.range(0, this.context.height)
    });

    Context.scope(this.context, $ => {
      $.fill(255);
      $.noStroke();
      $.ellipse(currentX, currentY, currentRadius, currentRadius);

      $.stroke(255, 64);
      $.line(originX, originY, currentX, currentY);
    })
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
