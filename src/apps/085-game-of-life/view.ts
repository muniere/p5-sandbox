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
    const cellSize = new Size({
      width: this.frame.width / model.grid.width,
      height: this.frame.height / model.grid.height,
    });

    this.scope($ => {
      $.fill(this.deadColor);
      $.rect(this.frame.left, this.frame.top, this.frame.width, this.frame.height);
    });

    this.scope($ => {
      $.fill(this.aliveColor);
      $.noStroke();

      model.grid.walk((state: State, spot: Spot) => {
        if (state == State.dead) {
          return;
        }

        const origin = Point.of({
          x: this.frame.origin.x + spot.column * cellSize.width,
          y: this.frame.origin.y + spot.row * cellSize.height,
        });

        $.rect(origin.x, origin.y, cellSize.width, cellSize.height);
      });
    });

    this.scope($ => {
      $.stroke(this.borderColor);
      $.noFill();

      for (let x = cellSize.width; x < this.frame.width; x += cellSize.width) {
        $.line(x, 0, x, this.frame.height);
      }
      for (let y = cellSize.height; y < this.frame.height; y += cellSize.height) {
        $.line(0, y, this.frame.width, y);
      }
    })
  }
}
