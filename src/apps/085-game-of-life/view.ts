import { Widget } from '../../lib/process';
import { Spot } from '../../lib/dmath';
import { Point, Rect, Size } from '../../lib/graphics2d';
import { ApplicationModel, State } from './model';

export class ApplicationWidget extends Widget<ApplicationModel> {
  public frame = Rect.zero();
  public aliveColor: string = '#000000';
  public deadColor: string = '#FFFFFF';
  public borderColor: string = '#000000';

  protected doDraw(model: ApplicationModel) {
    const cellSize = Size.of({
      width: this.frame.width / model.grid.width,
      height: this.frame.height / model.grid.height,
    });

    this.scope($ => {
      model.grid.walk((state: State, spot: Spot) => {
        const origin = Point.of({
          x: this.frame.origin.x + spot.column * cellSize.width,
          y: this.frame.origin.y + spot.row * cellSize.height,
        });

        const strokeColor = this.borderColor;

        const fillColor = (() => {
          switch (state) {
            case State.alive:
              return this.aliveColor;
            case State.dead:
              return this.deadColor;
          }
        })();

        $.stroke(strokeColor);
        $.fill(fillColor);
        $.rect(origin.x, origin.y, cellSize.width, cellSize.height);
      });
    });
  }
}
