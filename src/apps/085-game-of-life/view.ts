import * as p5 from 'p5';
import { Spot } from '../../lib/dmath';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { CellState, WorldState } from './model';

export class WorldWidget {
  public aliveColor: string = '#000000';
  public deadColor: string = '#FFFFFF';
  public borderColor: string = '#000000';
  public state?: WorldState;

  constructor(
    public context: p5,
    public frame: Rect,
  ) {
    // no-op
  }

  static create({context, origin, size}: {
    context: p5,
    origin: Point,
    size: Size,
  }): WorldWidget {
    return new WorldWidget(context, Rect.of({origin, size}));
  }

  draw() {
    if (!this.state) {
      return;
    }

    const cellSize = Size.of({
      width: this.frame.width / this.state.grid.width,
      height: this.frame.height / this.state.grid.height,
    });

    this.context.push();

    this.state.grid.walk((state: CellState, spot: Spot) => {
      const origin = Point.of({
        x: this.frame.origin.x + spot.column * cellSize.width,
        y: this.frame.origin.y + spot.row * cellSize.height,
      });

      const strokeColor = this.borderColor;

      const fillColor = (() => {
        switch (state) {
          case CellState.alive:
            return this.aliveColor;
          case CellState.dead:
            return this.deadColor;
        }
      })();

      this.context.stroke(strokeColor);
      this.context.fill(fillColor);
      this.context.rect(origin.x, origin.y, cellSize.width, cellSize.height);
    })

    this.context.pop();
  }
}
