import * as p5 from 'p5';
import { Point } from '../../lib/graphics2d';
import { CellState, WorldState } from './model';

export class CellWidget {
  constructor(
    public readonly context: p5,
    public readonly state: CellState,
  ) {
    // no-op
  }

  private get center(): Point {
    return this.state.center;
  }

  private get radius(): number {
    return this.state.radius;
  }

  draw() {
    this.context.push();

    this.context.fill(this.state.fillColor);
    this.context.stroke(this.state.strokeColor);
    this.context.ellipse(this.center.x, this.center.y, this.radius * 2);

    this.context.pop();
  }
}

export class WorldWidget {
  constructor(
    public readonly context: p5,
    public readonly state: WorldState,
  ) {
    // no-op
  }

  draw() {
    const children = [...this.state.cells].reverse().map(
      it => new CellWidget(this.context, it)
    );

    children.forEach(
      it => it.draw()
    );
  }
}
