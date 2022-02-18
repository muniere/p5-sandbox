import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { Point as Point3D } from '../../lib/graphics3d';
import { CubeModel, SpongeModel } from './model';

class CubeWidget {
  constructor(
    public readonly context: p5,
    public readonly state: CubeModel,
  ) {
    // no-op
  }

  private get center(): Point3D {
    return this.state.center;
  }

  private get size(): number {
    return this.state.size;
  }

  private get color(): string {
    return this.state.color;
  }

  draw() {
    Context.scope(this.context, $ => {
      $.translate(this.center.x, this.center.y, this.center.z);
      $.fill(this.color);
      $.box(this.size);
    });
  }
}

export class SpongeWidget {
  constructor(
    private readonly context: p5,
    private readonly state: SpongeModel,
  ) {
    // no-op
  }

  private get strokeColor(): string {
    return this.state.strokeColor;
  }

  private get rotation(): number {
    return this.state.rotation;
  }

  draw() {
    Context.scope(this.context, $ => {
      $.rotateX(this.rotation);
      $.rotateY(this.rotation * 0.5)
      $.rotateZ(this.rotation * 0.2)

      $.stroke(this.strokeColor)

      this.state.cubes.forEach(
        it => new CubeWidget($, it).draw(),
      );
    });
  }
}
