import * as p5 from 'p5';
import { WorldState } from './model';

export class WorldWidget {
  public color: string = '#FFFFFF';

  constructor(
    public readonly context: p5,
    public readonly state: WorldState,
  ) {
    // no-op
  }

  draw() {
    const path = this.state.path();

    this.context.push();
    this.context.beginShape();

    this.context.noFill();
    this.context.stroke(this.color);

    path.points.forEach(it => {
      this.context.vertex(it.x, it.y);
    });

    this.context.endShape(this.context.CLOSE);
    this.context.pop();
  }
}
