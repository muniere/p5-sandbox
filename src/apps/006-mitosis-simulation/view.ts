import * as p5 from 'p5';
import { Context } from '../../lib/process';
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
    Context.scope(this.context, $ => {
      $.fill(this.state.fillColor);
      $.stroke(this.state.strokeColor);
      $.ellipse(this.center.x, this.center.y, this.radius * 2);
    });
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
