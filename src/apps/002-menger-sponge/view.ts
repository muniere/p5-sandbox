import * as p5 from 'p5';
import { Point as Point3D } from '../../lib/graphics3d';
import { CubeState, SpongeState } from './model';

class CubeWidget {
  constructor(
    public readonly context: p5,
    public readonly state: CubeState,
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
    this.context.push();
    this.context.translate(this.center.x, this.center.y, this.center.z);
    this.context.fill(this.color);
    this.context.box(this.size);
    this.context.pop();
  }
}

export class SpongeWidget {
  constructor(
    private readonly context: p5,
    private readonly state: SpongeState,
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
    this.context.rotateX(this.rotation);
    this.context.rotateY(this.rotation * 0.5)
    this.context.rotateZ(this.rotation * 0.2)

    this.context.stroke(this.strokeColor)

    this.state.cubes.forEach(
      it => new CubeWidget(this.context, it).draw(),
    );
  }
}
