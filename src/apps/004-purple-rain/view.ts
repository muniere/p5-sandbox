import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { Point as Point3D } from '../../lib/graphics3d';
import { DropModel, ApplicationModel } from './model';

export class DropWidget {
  constructor(
    public readonly context: p5,
    public readonly state: DropModel,
  ) {
    // no-op
  }

  private get point(): Point3D {
    return this.state.point;
  }

  private get length(): number {
    return this.state.length;
  }

  draw() {
    Context.scope(this.context, $ => {
      $.stroke(this.state.color);
      $.line(
        this.point.x, this.point.y,
        this.point.x, this.point.y + this.length,
      );
    });
  }
}

export class RainWidget {
  private children: DropWidget[];

  constructor(
    public readonly context: p5,
    public readonly state: ApplicationModel,
  ) {
    this.children = state.drops.map(
      it => new DropWidget(context, it),
    );
  }

  draw() {
    this.children.forEach(
      it => it.draw()
    );
  }
}
