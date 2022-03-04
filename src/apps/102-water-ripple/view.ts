import p5 from 'p5';
import { Widget } from '../../lib/process';
import { AnyComparator } from '../../lib/dmath';
import { Rect, Size } from '../../lib/graphics2d';
import { ApplicationModel, WaterModel } from './model';

class WaterWidget extends Widget<WaterModel> {
  public frame = Rect.zero();

  protected doDraw(model: WaterModel) {
    const state = model.state;

    const origin = this.frame.origin;

    const size = new Size({
      width: this.frame.width / state.width,
      height: this.frame.height / state.height,
    });

    const comparator = new AnyComparator<number>(
      (a: number, b: number) => a > b ? -1 : 1
    );

    this.scope($ => {
      state.forEachSorted(comparator, (value, spot) => {
        if (value < 1) {
          return;
        }

        const x = origin.x + spot.column * size.width;
        const y = origin.y + spot.row * size.height;
        const w = size.width;
        const h = size.height;

        $.noStroke();
        $.fill(value);
        $.rect(x, y, w, h);
      });
    })
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  private readonly _water: WaterWidget;

  constructor(context: p5) {
    super(context);
    this._water = new WaterWidget(context);
  }

  set frame(value: Rect) {
    this._water.frame = value;
  }

  protected doDraw(model: ApplicationModel) {
    this._water.model = model.water;
    this._water.draw();
  }
}
